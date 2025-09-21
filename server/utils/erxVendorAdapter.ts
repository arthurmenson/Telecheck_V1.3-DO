export type ErxPrescription = {
  id: string;
  patientId: string;
  medication: any;
  status: string;
};

/**
 * eRx Vendor Adapter (stub)
 * Replace with integration to Surescripts/NewCrop.
 */
export class ErxVendorAdapter {
  static async submitPrescription(payload: any): Promise<{ externalId: string; status: string }> {
    return { externalId: `ext_${Date.now()}`, status: "queued" };
  }

  static async cancelPrescription(id: string): Promise<{ status: string }> {
    return { status: "canceled" };
  }

  static async requestRefill(id: string): Promise<{ status: string }> {
    return { status: "refill_requested" };
  }

  static async getPrescriptionStatus(id: string): Promise<{ status: string }> {
    // Simulate progression
    return { status: "sent" };
  }
}


