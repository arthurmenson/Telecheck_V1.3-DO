export type FeatureFlagRecord = {
  key: string;
  value: boolean;
};

export type FeatureFlagSnapshot = {
  flags: Record<string, boolean>;
  metadata: {
    loadedAt: string | null;
    totalFlags: number;
  };
  updated?: string[];
  invalid?: string[];
};

const BASE_URL = "/api/feature-flags";

const handleResponse = async (response: Response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    (error as any).details = data;
    throw error;
  }
  return data as FeatureFlagSnapshot;
};

class FeatureFlagService {
  async list(token: string): Promise<FeatureFlagSnapshot> {
    const response = await fetch(BASE_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return handleResponse(response);
  }

  async update(
    token: string,
    updates: Record<string, boolean>,
  ): Promise<FeatureFlagSnapshot> {
    const response = await fetch(BASE_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ flags: updates }),
    });

    return handleResponse(response);
  }
}

export const featureFlagService = new FeatureFlagService();
