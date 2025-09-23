type ClearinghouseConfig = {
  baseUrl: string;
  apiKey?: string;
};

type SubmissionResult = {
  claimId: string;
  trackingId: string;
  status: "queued" | "submitted" | "accepted" | "rejected";
};

export class ClearinghouseAdapter {
  private static config: ClearinghouseConfig = {
    baseUrl:
      process.env.CLEARINGHOUSE_URL || "https://mock-clearinghouse.local",
    apiKey: process.env.CLEARINGHOUSE_API_KEY,
  };

  private static tracking: Map<string, SubmissionResult> = new Map();

  static getConfig(): ClearinghouseConfig {
    return { ...this.config };
  }

  static setConfig(cfg: Partial<ClearinghouseConfig>): ClearinghouseConfig {
    this.config = { ...this.config, ...cfg } as ClearinghouseConfig;
    return this.getConfig();
  }

  static async submitClaimX12(
    claimId: string,
    x12: string,
  ): Promise<SubmissionResult> {
    // In real implementation, POST to clearinghouse endpoint with auth headers
    const trackingId = `trk_${Date.now()}`;
    const result: SubmissionResult = {
      claimId,
      trackingId,
      status: "submitted",
    };
    this.tracking.set(claimId, result);
    return result;
  }

  static async getClaimStatus(
    claimId: string,
  ): Promise<SubmissionResult | undefined> {
    const current = this.tracking.get(claimId);
    if (!current) return undefined;
    // Simulate progression
    if (current.status === "submitted") current.status = "accepted";
    return current;
  }
}
