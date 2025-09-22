import crypto from "crypto";
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
  "aws://",
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

const AWS_PROVIDER_ALIASES = ["aws-sm", "aws-secretsmanager", "aws"];

const parseAwsCacheTtl = () => {
  const raw = process.env.AWS_SECRETS_MANAGER_CACHE_TTL_MS;
  if (!raw) {
    return 60000;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    console.warn(
      `⚠️  Invalid AWS_SECRETS_MANAGER_CACHE_TTL_MS value "${raw}". Falling back to 60000ms.`,
    );
    return 60000;
  }

  return parsed;
};

const AWS_SECRETS_MANAGER_CACHE_TTL_MS = parseAwsCacheTtl();

const awsSecretsCache = new Map<string, { value: string; expiresAt: number }>();
const awsWarningKeys = new Set<string>();

const getDefaultAwsRegion = () =>
  process.env.AWS_SECRETS_MANAGER_REGION ||
  process.env.AWS_REGION ||
  process.env.AWS_DEFAULT_REGION;

const getAwsCacheKey = (
  secretId: string,
  region: string,
  endpoint?: string,
  versionId?: string,
  versionStage?: string,
) =>
  `${region}::${endpoint || ""}::${secretId}::${versionId || ""}::${
    versionStage || ""
  }`;

const extractAwsSecretValue = (
  rawValue: string | undefined,
  propertySegments: string[],
) => {
  if (!rawValue) {
    return undefined;
  }

  if (!propertySegments.length) {
    return rawValue;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    const resolved = getFromSegments(parsed, propertySegments);
    return toStringValue(resolved as Primitive);
  } catch (error) {
    console.warn(
      `⚠️  Failed to parse JSON payload for AWS Secrets Manager secret: ${
        (error as Error).message
      }`,
    );
    return undefined;
  }
};

const encodeRfc3986 = (value: string) =>
  encodeURIComponent(value).replace(
    /[!*'()]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );

const getCanonicalQueryString = (url: URL) => {
  if (!url.search || url.search === "?") {
    return "";
  }

  const entries = Array.from(url.searchParams.entries()).map(
    ([key, value]) => ({
      key: encodeRfc3986(key),
      value: encodeRfc3986(value),
    }),
  );

  entries.sort((left, right) => {
    if (left.key < right.key) {
      return -1;
    }
    if (left.key > right.key) {
      return 1;
    }
    if (left.value < right.value) {
      return -1;
    }
    if (left.value > right.value) {
      return 1;
    }
    return 0;
  });

  return entries.map(({ key, value }) => `${key}=${value}`).join("&");
};

const hashSha256 = (value: string) =>
  crypto.createHash("sha256").update(value, "utf8").digest("hex");

const deriveAwsSigningKey = (
  secretAccessKey: string,
  dateStamp: string,
  region: string,
  service: string,
) => {
  const kDate = crypto
    .createHmac("sha256", `AWS4${secretAccessKey}`)
    .update(dateStamp, "utf8")
    .digest();
  const kRegion = crypto
    .createHmac("sha256", kDate)
    .update(region, "utf8")
    .digest();
  const kService = crypto
    .createHmac("sha256", kRegion)
    .update(service, "utf8")
    .digest();
  return crypto
    .createHmac("sha256", kService)
    .update("aws4_request", "utf8")
    .digest();
};

type AwsCredentials = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
};

const getAwsCredentials = (): AwsCredentials | null => {
  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY || "";
  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_KEY || "";
  const sessionToken =
    process.env.AWS_SESSION_TOKEN || process.env.AWS_SECURITY_TOKEN;

  if (!accessKeyId || !secretAccessKey) {
    const warningKey = "aws-credentials-missing";
    if (!awsWarningKeys.has(warningKey)) {
      console.warn(
        "⚠️  AWS Secrets Manager provider requires AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY. Skipping remote resolution.",
      );
      awsWarningKeys.add(warningKey);
    }
    return null;
  }

  return {
    accessKeyId,
    secretAccessKey,
    sessionToken: sessionToken || undefined,
  };
};

const fetchAwsSecretString = async (params: {
  secretId: string;
  region: string;
  endpoint?: string;
  versionId?: string;
  versionStage?: string;
}) => {
  const credentials = getAwsCredentials();
  if (!credentials) {
    return undefined;
  }

  let endpointUrl: URL;
  if (params.endpoint) {
    try {
      endpointUrl = new URL(params.endpoint);
    } catch {
      try {
        endpointUrl = new URL(`https://${params.endpoint}`);
      } catch {
        const warningKey = `aws-endpoint-${params.endpoint}`;
        if (!awsWarningKeys.has(warningKey)) {
          console.warn(
            `⚠️  Invalid AWS Secrets Manager endpoint "${params.endpoint}". Provide a full URL such as https://secretsmanager.${params.region}.amazonaws.com`,
          );
          awsWarningKeys.add(warningKey);
        }
        return undefined;
      }
    }
  } else {
    endpointUrl = new URL(
      `https://secretsmanager.${params.region}.amazonaws.com/`,
    );
  }

  const requestUrl = new URL(endpointUrl.toString());
  const canonicalQuery = getCanonicalQueryString(requestUrl);
  requestUrl.search = canonicalQuery ? `?${canonicalQuery}` : "";

  const bodyPayload = JSON.stringify({
    SecretId: params.secretId,
    ...(params.versionId ? { VersionId: params.versionId } : {}),
    ...(params.versionStage ? { VersionStage: params.versionStage } : {}),
  });

  const isoTimestamp = new Date().toISOString();
  const dateStamp = isoTimestamp.slice(0, 10).replace(/-/g, "");
  const timeStamp = isoTimestamp.slice(11, 19).replace(/:/g, "");
  const amzDate = `${dateStamp}T${timeStamp}Z`;

  const signingHeaders: Record<string, string> = {
    "content-type": "application/x-amz-json-1.1",
    host: requestUrl.host,
    "x-amz-date": amzDate,
    "x-amz-target": "secretsmanager.GetSecretValue",
  };

  if (credentials.sessionToken) {
    signingHeaders["x-amz-security-token"] = credentials.sessionToken;
  }

  const sortedHeaderKeys = Object.keys(signingHeaders).sort();
  const canonicalHeaders = sortedHeaderKeys
    .map((key) => `${key}:${signingHeaders[key]}`)
    .join("\n");
  const signedHeaders = sortedHeaderKeys.join(";");

  const canonicalRequest = [
    "POST",
    requestUrl.pathname || "/",
    canonicalQuery,
    `${canonicalHeaders}\n`,
    signedHeaders,
    hashSha256(bodyPayload),
  ].join("\n");

  const credentialScope = `${dateStamp}/${params.region}/secretsmanager/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hashSha256(canonicalRequest),
  ].join("\n");

  const signingKey = deriveAwsSigningKey(
    credentials.secretAccessKey,
    dateStamp,
    params.region,
    "secretsmanager",
  );
  const signature = crypto
    .createHmac("sha256", signingKey)
    .update(stringToSign, "utf8")
    .digest("hex");

  const authorizationHeader =
    `AWS4-HMAC-SHA256 Credential=${credentials.accessKeyId}/${credentialScope}, ` +
    `SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/x-amz-json-1.1",
    "X-Amz-Date": amzDate,
    "X-Amz-Target": "secretsmanager.GetSecretValue",
    Authorization: authorizationHeader,
  };

  if (credentials.sessionToken) {
    requestHeaders["X-Amz-Security-Token"] = credentials.sessionToken;
  }

  const response = await fetch(requestUrl.toString(), {
    method: "POST",
    headers: requestHeaders,
    body: bodyPayload,
  });

  if (!response.ok) {
    const warningKey = `aws-http-${params.secretId}-${response.status}`;
    if (!awsWarningKeys.has(warningKey)) {
      const errorBody = await response.text();
      console.warn(
        `⚠️  AWS Secrets Manager request for "${params.secretId}" failed with ${response.status} ${response.statusText}: ${errorBody.slice(0, 200)}`,
      );
      awsWarningKeys.add(warningKey);
    }
    return undefined;
  }

  const payload = (await response.json()) as {
    SecretString?: string;
    SecretBinary?: string;
  };

  if (payload.SecretString !== undefined) {
    return payload.SecretString;
  }

  if (payload.SecretBinary !== undefined) {
    try {
      return Buffer.from(payload.SecretBinary, "base64").toString("utf8");
    } catch (error) {
      const warningKey = `aws-binary-${params.secretId}`;
      if (!awsWarningKeys.has(warningKey)) {
        console.warn(
          `⚠️  Failed to decode binary secret for "${params.secretId}": ${(error as Error).message}`,
        );
        awsWarningKeys.add(warningKey);
      }
    }
  }

  return undefined;
};

const resolveAwsSecret = async (request: ProviderRequest) => {
  const metadataRegion =
    request.metadata.region ||
    request.metadata.awsregion ||
    request.metadata["aws-region"];
  const region = metadataRegion || getDefaultAwsRegion();

  if (!region) {
    const warningKey = `aws-region-missing:${request.raw}`;
    if (!awsWarningKeys.has(warningKey)) {
      console.warn(
        `⚠️  AWS Secrets Manager provider skipped for ${request.raw} because no region was configured. Set AWS_REGION or include ?region=<value>.`,
      );
      awsWarningKeys.add(warningKey);
    }
    return undefined;
  }

  const endpoint =
    request.metadata.endpoint ||
    request.metadata.url ||
    process.env.AWS_SECRETS_MANAGER_ENDPOINT;

  const versionStage =
    request.metadata.versionstage || request.metadata.stage || undefined;
  const versionId = request.metadata.version || undefined;

  const cacheKey = getAwsCacheKey(
    request.key,
    region,
    endpoint,
    versionId,
    versionStage,
  );

  const now = Date.now();
  if (AWS_SECRETS_MANAGER_CACHE_TTL_MS > 0) {
    const cached = awsSecretsCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return extractAwsSecretValue(cached.value, request.propertySegments);
    }

    if (cached) {
      awsSecretsCache.delete(cacheKey);
    }
  }

  let secretString: string | undefined;
  try {
    secretString = await fetchAwsSecretString({
      secretId: request.key,
      region,
      endpoint,
      versionId,
      versionStage,
    });
  } catch (error) {
    const awsError = error as Error & { name?: string };
    const warningKey = `${request.key}:${awsError.name || "error"}`;
    if (!awsWarningKeys.has(warningKey)) {
      console.warn(
        `⚠️  Failed to resolve secret "${request.key}" from AWS Secrets Manager: ${awsError.message}`,
      );
      awsWarningKeys.add(warningKey);
    }
    return undefined;
  }

  if (!secretString) {
    const warningKey = `aws-secret-empty:${request.key}`;
    if (!awsWarningKeys.has(warningKey)) {
      console.warn(
        `⚠️  AWS Secrets Manager returned no data for secret "${request.key}".`,
      );
      awsWarningKeys.add(warningKey);
    }
    return undefined;
  }

  if (AWS_SECRETS_MANAGER_CACHE_TTL_MS > 0) {
    awsSecretsCache.set(cacheKey, {
      value: secretString,
      expiresAt: now + AWS_SECRETS_MANAGER_CACHE_TTL_MS,
    });
  }

  return extractAwsSecretValue(secretString, request.propertySegments);
};

AWS_PROVIDER_ALIASES.forEach((alias) => {
  registerSecretProvider({
    name: alias,
    supportsSync: false,
    resolve: (request) => resolveAwsSecret(request),
  });
});

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
