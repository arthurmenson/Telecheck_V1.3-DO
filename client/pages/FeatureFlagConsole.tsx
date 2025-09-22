import React, { useEffect, useMemo, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import {
  featureFlagService,
  FeatureFlagSnapshot,
} from "../services/featureFlag.service";

const formatDate = (value: string | null) => {
  if (!value) return "Not loaded";
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return value;
  }
};

export const FeatureFlagConsole: React.FC = () => {
  const { user } = useAuth();
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [metadata, setMetadata] = useState<
    FeatureFlagSnapshot["metadata"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newFlagKey, setNewFlagKey] = useState("");
  const [newFlagValue, setNewFlagValue] = useState(true);

  const authToken = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem("auth_token");
  }, []);

  const isAdmin = user?.role === "admin";

  const refreshFlags = async () => {
    if (!authToken) {
      setError("Missing authentication token. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const snapshot = await featureFlagService.list(authToken);
      setFlags(snapshot.flags);
      setMetadata(snapshot.metadata);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load feature flags";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);

  const sortedFlags = useMemo(() => {
    return Object.entries(flags)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [flags]);

  const handleToggle = async (flag: string, value: boolean) => {
    if (!authToken) {
      setError("Missing authentication token. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      const snapshot = await featureFlagService.update(authToken, {
        [flag]: !value,
      });
      setFlags(snapshot.flags);
      setMetadata(snapshot.metadata);
      setError(null);
      setSuccessMessage(
        `Flag "${flag}" ${!value ? "enabled" : "disabled"} successfully.`,
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update feature flag";
      setError(message);
      setSuccessMessage(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFlag = async (event: React.FormEvent) => {
    event.preventDefault();
    const key = newFlagKey.trim();
    if (!key) {
      setError("Feature flag key is required.");
      return;
    }

    if (!authToken) {
      setError("Missing authentication token. Please log in again.");
      return;
    }

    try {
      setSaving(true);
      const snapshot = await featureFlagService.update(authToken, {
        [key]: newFlagValue,
      });
      setFlags(snapshot.flags);
      setMetadata(snapshot.metadata);
      setError(null);
      setSuccessMessage(`Flag "${key}" saved successfully.`);
      setNewFlagKey("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create feature flag";
      setError(message);
      setSuccessMessage(null);
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-red-200 bg-red-50 p-8 text-red-700">
        <h1 className="text-2xl font-semibold">Restricted Access</h1>
        <p className="mt-4">
          Feature flag management is limited to administrator accounts. If you
          believe you should have access, please contact the platform owner.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Feature Flag Console</h1>
        <p className="text-muted-foreground">
          Toggle experimentation and operational safeguards without redeploying
          services. All changes are logged for auditability.
        </p>
        {metadata && (
          <p className="text-sm text-muted-foreground">
            Loaded at: {formatDate(metadata.loadedAt)} · Total flags:{" "}
            {Object.keys(flags).length}
          </p>
        )}
      </header>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Create or Update Flag</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Add new flags or override existing ones. Use descriptive keys such as
          <code className="mx-1 rounded bg-slate-100 px-1 py-0.5">
            beta-new-dashboard
          </code>{" "}
          or
          <code className="mx-1 rounded bg-slate-100 px-1 py-0.5">
            emergency-read-only-mode
          </code>
          .
        </p>
        <form
          className="flex flex-col gap-4 md:flex-row md:items-end"
          onSubmit={handleCreateFlag}
        >
          <label className="flex-1 text-sm font-medium">
            Flag key
            <input
              type="text"
              value={newFlagKey}
              onChange={(event) => setNewFlagKey(event.target.value)}
              placeholder="e.g. beta-new-dashboard"
              className="mt-1 w-full rounded-md border px-3 py-2"
              required
            />
          </label>
          <label className="text-sm font-medium">
            Default state
            <select
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={newFlagValue ? "true" : "false"}
              onChange={(event) =>
                setNewFlagValue(event.target.value === "true")
              }
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-white"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save flag"}
          </button>
        </form>
      </section>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active Flags</h2>
          <button
            type="button"
            className="rounded-md border px-3 py-2 text-sm"
            onClick={refreshFlags}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">
            Loading feature flags…
          </p>
        ) : sortedFlags.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No feature flags are currently defined. Create one above to get
            started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">
                    Flag
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">
                    State
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedFlags.map((flag) => (
                  <tr key={flag.key}>
                    <td className="px-4 py-2 font-mono text-sm">{flag.key}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          flag.value
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {flag.value ? "Enabled" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        className="rounded-md border px-3 py-1 text-xs"
                        onClick={() => handleToggle(flag.key, flag.value)}
                        disabled={saving}
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default FeatureFlagConsole;
