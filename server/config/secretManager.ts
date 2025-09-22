import fs from "fs";
import path from "path";

type Primitive = string | number | boolean | null | undefined;

export type SecretReferenceInput =
  | string
  | {
      provider?: string;
      engine?: string;
      type?: string;
      key?: string;
      name?: string;
      id?: string;
      path?: string;
      secret?: string;
      property?: string;
      field?: string;
      target?: string;
      version?: string;
      [key: string]: unknown;
    };

export interface ResolveSecretOptions {
  reference?: SecretReferenceInput | null;
  fallback?: string;
  description?: string;
  required?: boolean;
}

interface NormalizedSecretReference {
  raw: string;
  key: string;
  keySegments: string[];
  propertySegments: string[];
  metadata: Record<string, string>;
  providerCandidates: string[];
}

interface ProviderRequest extends NormalizedSecretReference {
  provider: string;
}

interface SecretProvider {
  name: string;
  supportsSync: boolean;
  resolve?: (request: ProviderRequest) => Promise<Primitive>;
  resolveSync?: (request: ProviderRequest) => Primitive;
}

const SECRET_REFERENCE_PREFIXES = [
  "secret://",
  "secret:",
  "secrets://",
  "secrets:",
  "sm://",
  "vault://",
  "vault:",
  "aws-sm://",
  "aws-secretsmanager://",
  "doppler://",
  "doppler:",
  "gcp-sm://",
  "azure-kv://",
  "file://",
  "env://",
];

const providerRegistry = new Map<string, SecretProvider>();
const missingProviderWarnings = new Set<string>();

let cachedPriority: string[] | null = null;

const getConfiguredProviderPriority = () => {
  if (cachedPriority) {
    return cachedPriority;
  }

  const configured =
    process.env.SECRETS_PROVIDER || process.env.SECRETS_PROVIDERS || "env,file";

  const priority = configured
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  cachedPriority = priority.length ? priority : ["env", "file"];
  return cachedPriority;
};

const splitSegments = (raw: string | undefined) => {
  if (!raw) {
    return [] as string[];
  }

  return raw
    .split(/[/.]/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

const parseQuery = (query: string | undefined) => {
  if (!query) {
    return {} as Record<string, string>;
  }

  return query.split("&").reduce<Record<string, string>>((acc, pair) => {
    if (!pair) {
      return acc;
    }

    const [rawKey, rawValue] = pair.split("=");
    if (!rawKey) {
      return acc;
    }

    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawValue || "");
    acc[key] = value;
    return acc;
  }, {});
};

const isSecretReferenceString = (value: string) => {
  const lowerValue = value.toLowerCase();
  return SECRET_REFERENCE_PREFIXES.some((prefix) =>
    lowerValue.startsWith(prefix),
  );
};

const normalizeReference = (
  reference: SecretReferenceInput | undefined | null,
): NormalizedSecretReference | null => {
  if (!reference) {
    return null;
  }

  if (typeof reference === "object" && !Array.isArray(reference)) {
    const providerValue = (
      reference.provider ||
      reference.engine ||
      reference.type ||
      ""
    )
      .toString()
      .trim()
      .toLowerCase();

    const keyValue = (
      reference.key ||
      reference.name ||
      reference.id ||
      reference.path ||
      reference.secret ||
      reference.target ||
      ""
    )
      .toString()
      .trim();

    if (!providerValue && !keyValue) {
      return null;
    }

    const providerCandidates = providerValue
      ? providerValue === "secret" || providerValue === "secrets"
        ? getConfiguredProviderPriority()
        : [providerValue]
      : getConfiguredProviderPriority();

    const propertyValue = (reference.property || reference.field || "")
      .toString()
      .trim();

    const metadata: Record<string, string> = {};

    if (reference.version) {
      metadata.version = String(reference.version);
    }

    return {
      raw: JSON.stringify(reference),
      key: keyValue,
      keySegments: splitSegments(keyValue),
      propertySegments: splitSegments(propertyValue),
      metadata,
      providerCandidates,
    };
  }

  if (typeof reference !== "string") {
    return null;
  }

  const trimmed = reference.trim();
  if (!trimmed || !isSecretReferenceString(trimmed)) {
    return null;
  }

  let normalized = trimmed;
  if (!trimmed.includes("://")) {
    const colonIndex = trimmed.indexOf(":");
    if (colonIndex === -1) {
      return null;
    }

    const scheme = trimmed.slice(0, colonIndex);
    const remainder = trimmed.slice(colonIndex + 1);
    normalized = `${scheme}://${remainder}`;
  }

  const schemeEndIndex = normalized.indexOf("://");
  const scheme = normalized.slice(0, schemeEndIndex).toLowerCase();
  let remainder = normalized.slice(schemeEndIndex + 3);

  remainder = remainder.replace(/^\/+/, "");

  let fragment: string | undefined;
  const fragmentIndex = remainder.indexOf("#");
  if (fragmentIndex >= 0) {
    fragment = remainder.slice(fragmentIndex + 1);
    remainder = remainder.slice(0, fragmentIndex);
  }

  let query: string | undefined;
  const queryIndex = remainder.indexOf("?");
  if (queryIndex >= 0) {
    query = remainder.slice(queryIndex + 1);
    remainder = remainder.slice(0, queryIndex);
  }

  const providerCandidates =
    scheme === "secret" || scheme === "secrets" || scheme === "sm"
      ? getConfiguredProviderPriority()
      : [scheme];

  return {
    raw: trimmed,
    key: remainder,
    keySegments: splitSegments(remainder),
    propertySegments: splitSegments(fragment),
    metadata: parseQuery(query),
    providerCandidates,
  };
};

const normalizeOptions = (
  options: ResolveSecretOptions | SecretReferenceInput | undefined | null,
): {
  reference: NormalizedSecretReference | null;
  fallback?: string;
  description?: string;
  required?: boolean;
} => {
  if (
    options &&
    typeof options === "object" &&
    !Array.isArray(options) &&
    "reference" in options
  ) {
    const typed = options as ResolveSecretOptions;
    return {
      reference: normalizeReference(typed.reference),
      fallback: typed.fallback,
      description: typed.description,
      required: typed.required,
    };
  }

  return {
    reference: normalizeReference(options as SecretReferenceInput),
    fallback: undefined,
    description: undefined,
    required: false,
  };
};

const buildProviderRequest = (
  reference: NormalizedSecretReference,
  provider: string,
): ProviderRequest => ({
  ...reference,
  provider,
});

const toStringValue = (value: Primitive) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  return String(value);
};

const getFromSegments = (root: unknown, segments: string[]) => {
  if (!segments.length) {
    return root;
  }

  return segments.reduce<unknown>((current, segment) => {
    if (current === undefined || current === null) {
      return undefined;
    }

    if (typeof current !== "object") {
      return undefined;
    }

    if (Array.isArray(current)) {
      const index = Number(segment);
      return Number.isInteger(index) ? current[index] : undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, root);
};

const envProvider: SecretProvider = {
  name: "env",
  supportsSync: true,
  resolveSync: (request) => {
    const candidates = new Set<string>();

    if (request.key) {
      candidates.add(request.key);
      candidates.add(request.key.toUpperCase());
    }

    if (request.keySegments.length > 1) {
      candidates.add(
        request.keySegments.map((segment) => segment.toUpperCase()).join("_"),
      );
    }

    request.keySegments.forEach((segment) => {
      if (segment) {
        candidates.add(segment);
        candidates.add(segment.toUpperCase());
      }
    });

    for (const candidate of candidates) {
      const value = process.env[candidate];
      if (value !== undefined) {
        if (!request.propertySegments.length) {
          return value;
        }

        try {
          const parsed = JSON.parse(value);
          return getFromSegments(parsed, request.propertySegments) as Primitive;
        } catch (error) {
          console.warn(
            `⚠️  Failed to parse JSON secret from env provider for ${request.raw}:`,
            (error as Error).message,
          );
          return undefined;
        }
      }
    }

    return undefined;
  },
};

let fileWarningLogged = false;
let cachedFilePath: string | null = null;
let cachedFileMtime: number | null = null;
let cachedSecrets: Record<string, unknown> | null = null;

const fileProvider: SecretProvider = {
  name: "file",
  supportsSync: true,
  resolveSync: (request) => {
    const configuredPath = process.env.SECRETS_FILE || "./secrets.local.json";
    const absolutePath = path.isAbsolute(configuredPath)
      ? configuredPath
      : path.resolve(process.cwd(), configuredPath);

    try {
      const stats = fs.statSync(absolutePath);
      if (
        !cachedSecrets ||
        cachedFilePath !== absolutePath ||
        cachedFileMtime !== stats.mtimeMs
      ) {
        const contents = fs.readFileSync(absolutePath, "utf-8");
        cachedSecrets = JSON.parse(contents) as Record<string, unknown>;
        cachedFilePath = absolutePath;
        cachedFileMtime = stats.mtimeMs;
      }
    } catch (error) {
      if (!fileWarningLogged) {
        console.warn(
          `⚠️  Secrets file not found or unreadable at ${absolutePath}. Set SECRETS_FILE or ensure the file exists.`,
        );
        fileWarningLogged = true;
      }
      return undefined;
    }

    if (!cachedSecrets) {
      return undefined;
    }

    const lookupSegments = [
      ...request.keySegments,
      ...request.propertySegments,
    ].filter((segment) => segment.length > 0);

    const value = getFromSegments(cachedSecrets, lookupSegments);
    return toStringValue(value as Primitive);
  },
};

registerSecretProvider(envProvider);
registerSecretProvider(fileProvider);

const attemptResolveWithProvider = (
  provider: SecretProvider | undefined,
  request: ProviderRequest,
  mode: "sync" | "async",
): Primitive | Promise<Primitive> | undefined => {
  if (!provider) {
    return undefined;
  }

  if (mode === "sync") {
    if (provider.resolveSync) {
      return provider.resolveSync(request);
    }

    if (!missingProviderWarnings.has(provider.name)) {
      console.warn(
        `⚠️  Provider "${provider.name}" does not support synchronous secret resolution. Falling back to async or fallback values.`,
      );
      missingProviderWarnings.add(provider.name);
    }

    return undefined;
  }

  if (provider.resolve) {
    return provider.resolve(request);
  }

  if (provider.resolveSync) {
    return provider.resolveSync(request);
  }

  return undefined;
};

function registerSecretProvider(provider: SecretProvider) {
  providerRegistry.set(provider.name, provider);
}

export function resolveSecretSync(
  options: ResolveSecretOptions | SecretReferenceInput | undefined | null,
): string | undefined {
  const { reference, fallback, description, required } =
    normalizeOptions(options);

  if (!reference) {
    if (fallback !== undefined) {
      return fallback;
    }

    if (required) {
      throw new Error(
        `Secret${description ? ` for ${description}` : ""} not provided.`,
      );
    }

    return undefined;
  }

  for (const providerName of reference.providerCandidates) {
    const provider = providerRegistry.get(providerName);
    if (!provider) {
      if (!missingProviderWarnings.has(providerName)) {
        console.warn(
          `⚠️  Secret provider "${providerName}" is not registered. Configure SECRETS_PROVIDER or register a provider implementation.`,
        );
        missingProviderWarnings.add(providerName);
      }
      continue;
    }

    const request = buildProviderRequest(reference, providerName);
    const value = attemptResolveWithProvider(provider, request, "sync");

    const resolved = toStringValue(value as Primitive);
    if (resolved !== undefined) {
      return resolved;
    }
  }

  if (fallback !== undefined) {
    return fallback;
  }

  if (required) {
    throw new Error(
      `Secret${description ? ` for ${description}` : ""} could not be resolved from providers: ${reference.providerCandidates.join(", ")}.`,
    );
  }

  return undefined;
}

export async function resolveSecret(
  options: ResolveSecretOptions | SecretReferenceInput | undefined | null,
): Promise<string | undefined> {
  const { reference, fallback, description, required } =
    normalizeOptions(options);

  if (!reference) {
    if (fallback !== undefined) {
      return fallback;
    }

    if (required) {
      throw new Error(
        `Secret${description ? ` for ${description}` : ""} not provided.`,
      );
    }

    return undefined;
  }

  for (const providerName of reference.providerCandidates) {
    const provider = providerRegistry.get(providerName);
    if (!provider) {
      if (!missingProviderWarnings.has(providerName)) {
        console.warn(
          `⚠️  Secret provider "${providerName}" is not registered. Configure SECRETS_PROVIDER or register a provider implementation.`,
        );
        missingProviderWarnings.add(providerName);
      }
      continue;
    }

    const request = buildProviderRequest(reference, providerName);
    const value = await attemptResolveWithProvider(provider, request, "async");

    const resolved = toStringValue(value as Primitive);
    if (resolved !== undefined) {
      return resolved;
    }
  }

  if (fallback !== undefined) {
    return fallback;
  }

  if (required) {
    throw new Error(
      `Secret${description ? ` for ${description}` : ""} could not be resolved from providers: ${reference.providerCandidates.join(", ")}.`,
    );
  }

  return undefined;
}

export const isSecretReference = (value: unknown) => {
  if (typeof value !== "string") {
    return false;
  }

  return isSecretReferenceString(value.trim());
};

export const getRegisteredSecretProviders = () =>
  Array.from(providerRegistry.keys());

export { registerSecretProvider };
