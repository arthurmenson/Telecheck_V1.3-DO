export type Interaction = {
  drugs: string[];
  severity: "minor" | "moderate" | "major" | "contraindicated";
  mechanism?: string;
  recommendation?: string;
  references?: string[];
};

/**
 * DrugDbAdapter
 * Stub adapter that simulates checking drug-drug interactions.
 * In production, integrate with vendor DB (e.g., First Databank, Lexicomp, Micromedex).
 */
export class DrugDbAdapter {
  static async checkInteractions(
    medicationNames: string[],
  ): Promise<Interaction[]> {
    const uniq = Array.from(
      new Set(medicationNames.map((n) => (n || "").toLowerCase())),
    );
    // Simple heuristic: if warfarin + nsaid present, warn major interaction
    const interactions: Interaction[] = [];
    if (
      uniq.includes("warfarin") &&
      (uniq.includes("ibuprofen") ||
        uniq.includes("naproxen") ||
        uniq.includes("diclofenac"))
    ) {
      interactions.push({
        drugs: ["Warfarin", "NSAID"],
        severity: "major",
        mechanism:
          "Additive anticoagulant/platelet inhibition leading to increased bleeding risk",
        recommendation:
          "Avoid combination or use gastroprotection; monitor INR closely.",
        references: ["Lexicomp", "Micromedex"],
      });
    }
    if (uniq.includes("sildenafil") && uniq.includes("nitroglycerin")) {
      interactions.push({
        drugs: ["Sildenafil", "Nitroglycerin"],
        severity: "contraindicated",
        mechanism: "Excessive vasodilation causing severe hypotension",
        recommendation:
          "Do not coadminister. Separate by at least 24-48 hours depending on agent.",
        references: ["FDA Label"],
      });
    }
    return interactions;
  }
}
