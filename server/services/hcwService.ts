/**
 * HCW@Home Integration Service
 *
 * This service handles integration with HCW@Home teleconsultation platform.
 * HCW@Home provides WebRTC video/audio via Mediasoup (NOT Jitsi/Twilio).
 *
 * Architecture:
 * Telecheck API ← JWT Auth → HCW Backend API → Mediasoup WebRTC Server
 *
 * HCW@Home Features:
 * - Secure video consultations with WebRTC
 * - Secure chat with file attachments
 * - HL7 FHIR integration
 * - OpenID/SAML authentication
 * - MongoDB for consultation data
 * - ClamAV antivirus scanning
 *
 * References:
 * - Docs: https://docs.hcw-at-home.com/
 * - API: https://github.com/HCW-home/backend
 */

import axios, { AxiosInstance } from "axios";

// Environment configuration
// Updated to use new HCW@Home deployment (October 26, 2025)
const HCW_API_URL = process.env.HCW_API_URL || "http://143.198.2.224:1337";
const HCW_USER_EMAIL = process.env.HCW_USER_EMAIL || "";
const HCW_USER_PASSWORD = process.env.HCW_USER_PASSWORD || "";
const HCW_PATIENT_URL =
  process.env.HCW_PATIENT_URL || "http://143.198.2.224:4200";
const HCW_DOCTOR_URL =
  process.env.HCW_DOCTOR_URL || "http://143.198.2.224:4201";

// Session management
let sessionCookie: string | null = null;
let sessionExpiry: Date | null = null;

// HTTP client for HCW API
const hcwClient: AxiosInstance = axios.create({
  baseURL: HCW_API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

/**
 * Get authenticated session cookie for HCW API
 * Reuses existing session if not expired, otherwise logs in
 */
async function getHcwSession(): Promise<string> {
  // Reuse existing session if valid
  if (sessionCookie && sessionExpiry && sessionExpiry > new Date()) {
    console.log("🔄 Reusing existing HCW session");
    return sessionCookie;
  }

  if (!HCW_USER_EMAIL || !HCW_USER_PASSWORD) {
    throw new Error(
      "HCW_USER_EMAIL and HCW_USER_PASSWORD environment variables must be set",
    );
  }

  console.log(`🔐 Logging into HCW as ${HCW_USER_EMAIL}...`);

  try {
    // Login to HCW
    const response = await axios.post(
      `${HCW_API_URL}/api/v1/login-local`,
      {
        email: HCW_USER_EMAIL,
        password: HCW_USER_PASSWORD,
      },
      {
        withCredentials: true,
        maxRedirects: 0,
        validateStatus: (status) => status < 400,
      },
    );

    // Extract session cookie from Set-Cookie header
    const cookies = response.headers["set-cookie"];
    if (!cookies || !cookies.length) {
      throw new Error("No session cookie received from HCW login");
    }

    // Find the sails.sid session cookie
    const sailsCookie = cookies.find((c) => c.startsWith("sails.sid="));
    if (!sailsCookie) {
      throw new Error("No sails.sid session cookie found in response");
    }

    sessionCookie = sailsCookie.split(";")[0]; // Get just the cookie value
    sessionExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    console.log("✅ HCW session established");
    return sessionCookie;
  } catch (error: any) {
    console.error(
      "❌ HCW login failed:",
      error.response?.data || error.message,
    );
    throw new Error(`Failed to login to HCW: ${error.message}`);
  }
}

/**
 * HCW Consultation Data
 */
export interface HcwConsultation {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledDate?: Date;
  status: "pending" | "active" | "completed" | "cancelled";
  joinUrl: string; // Patient join URL
  doctorUrl?: string; // Doctor join URL
}

/**
 * Create Patient in HCW@Home
 *
 * Creates or updates a patient record in HCW@Home MongoDB.
 *
 * @param params Patient information from Telecheck
 * @returns HCW patient ID
 */
export async function createHcwPatient(params: {
  telecheckUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthdate?: Date;
  gender?: "male" | "female" | "other";
}): Promise<string> {
  try {
    const token = generateHcwToken();

    const response = await hcwClient.post(
      "/api/patient",
      {
        externalId: params.telecheckUserId, // Link to Telecheck user
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        phone: params.phone,
        birthdate: params.birthdate?.toISOString(),
        gender: params.gender,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.id || response.data._id;
  } catch (error) {
    console.error("Failed to create HCW patient:", error);
    throw new Error("Failed to create patient in HCW@Home");
  }
}

/**
 * Create Doctor in HCW@Home
 *
 * Creates or updates a doctor record in HCW@Home MongoDB.
 *
 * @param params Doctor information from Telecheck
 * @returns HCW doctor ID
 */
export async function createHcwDoctor(params: {
  telecheckUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
}): Promise<string> {
  try {
    const token = generateHcwToken();

    const response = await hcwClient.post(
      "/api/doctor",
      {
        externalId: params.telecheckUserId,
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        phone: params.phone,
        specialty: params.specialty,
        licenseNumber: params.licenseNumber,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.id || response.data._id;
  } catch (error) {
    console.error("Failed to create HCW doctor:", error);
    throw new Error("Failed to create doctor in HCW@Home");
  }
}

/**
 * Create Consultation in HCW@Home
 *
 * Creates a new consultation/invite in HCW@Home and returns the join URL.
 * This consultation is linked to a Mediasoup WebRTC room.
 * Uses HCW's invite API which creates the consultation and sends notifications.
 *
 * @param params Consultation details
 * @returns Consultation data with join URL
 */
export async function createHcwConsultation(params: {
  telecheckAppointmentId: string;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone?: string;
  doctorId?: string; // HCW doctor ID or email
  scheduledTime?: Date;
  reason?: string;
}): Promise<HcwConsultation> {
  try {
    // Get authenticated session
    const cookie = await getHcwSession();

    // Use HCW's invite API endpoint (creates consultation + patient if needed)
    const response = await hcwClient.post(
      "/api/v1/invite",
      {
        firstName: params.patientFirstName,
        lastName: params.patientLastName,
        emailAddress: params.patientEmail,
        phoneNumber: params.patientPhone,
        gender: "male", // Required by HCW - can be made dynamic later
        doctorId: params.doctorId, // Can be HCW doctor ID or email
        scheduledDate:
          params.scheduledTime?.toISOString() || new Date().toISOString(),
        reason: params.reason || "Video consultation",
        // Optional: sendInvite: false to prevent auto-sending email
      },
      {
        headers: {
          Cookie: cookie,
        },
      },
    );

    const invite = response.data;
    console.log("✅ HCW consultation created:", invite.id || invite._id);

    // HCW returns invitation token for patient join URL
    const invitationToken = invite.invitationToken;
    const consultationId = invite.consultation || invite.id;

    // Generate join URLs
    const patientUrl = invitationToken
      ? `${HCW_PATIENT_URL}/invite/${invitationToken}`
      : `${HCW_PATIENT_URL}/consultation/${consultationId}`;

    const doctorUrl = consultationId
      ? `${HCW_DOCTOR_URL}/consultation/${consultationId}`
      : HCW_DOCTOR_URL;

    return {
      id: consultationId,
      patientId: invite.patient,
      doctorId: invite.doctor,
      scheduledDate: params.scheduledTime,
      status: "pending",
      joinUrl: patientUrl,
      doctorUrl: doctorUrl,
    };
  } catch (error) {
    console.error("Failed to create HCW consultation:", error);
    if (axios.isAxiosError(error)) {
      console.error("HCW API Error:", error.response?.data);
    }
    throw new Error("Failed to create consultation in HCW@Home");
  }
}

/**
 * Get Consultation Status
 *
 * Retrieves the current status of a consultation from HCW@Home.
 *
 * @param consultationId HCW consultation ID
 * @returns Consultation status
 */
export async function getHcwConsultationStatus(
  consultationId: string,
): Promise<"pending" | "active" | "completed" | "cancelled"> {
  try {
    const token = generateHcwToken();

    const response = await hcwClient.get(
      `/api/consultation/${consultationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data.status || "pending";
  } catch (error) {
    console.error("Failed to get HCW consultation status:", error);
    throw new Error("Failed to get consultation status");
  }
}

/**
 * End Consultation
 *
 * Marks a consultation as completed in HCW@Home and ends the video session.
 *
 * @param consultationId HCW consultation ID
 */
export async function endHcwConsultation(
  consultationId: string,
): Promise<void> {
  try {
    const token = generateHcwToken();

    await hcwClient.post(
      `/api/consultation/${consultationId}/end`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    console.error("Failed to end HCW consultation:", error);
    throw new Error("Failed to end consultation");
  }
}

/**
 * Check HCW@Home Service Health
 *
 * Verifies that HCW@Home backend is reachable and healthy.
 *
 * @returns Health status
 */
export async function checkHcwHealth(): Promise<{
  healthy: boolean;
  message: string;
}> {
  try {
    const response = await hcwClient.get("/api/healthcheck", {
      timeout: 5000,
    });

    return {
      healthy: response.status === 200,
      message: "HCW@Home service is healthy",
    };
  } catch (error) {
    console.error("HCW@Home health check failed:", error);
    return {
      healthy: false,
      message: "HCW@Home service is unavailable",
    };
  }
}

/**
 * Get HCW@Home Configuration
 *
 * Returns the current HCW@Home configuration for client-side use.
 */
export function getHcwConfig() {
  return {
    apiUrl: HCW_API_URL,
    patientUrl: HCW_PATIENT_URL,
    doctorUrl: HCW_DOCTOR_URL,
    enabled: !!HCW_API_URL,
  };
}

// Log HCW@Home configuration on startup
if (HCW_API_URL) {
  console.log("✅ HCW@Home integration enabled:");
  console.log(`   API: ${HCW_API_URL}`);
  console.log(`   Patient: ${HCW_PATIENT_URL}`);
  console.log(`   Doctor: ${HCW_DOCTOR_URL}`);

  // Perform initial health check
  checkHcwHealth()
    .then((health) => {
      if (health.healthy) {
        console.log(`   Status: ${health.message}`);
      } else {
        console.warn(`   ⚠️  Status: ${health.message}`);
      }
    })
    .catch(() => {
      console.warn("   ⚠️  Health check failed - service may not be ready yet");
    });
} else {
  console.warn("⚠️ HCW@Home integration disabled (HCW_API_URL not configured)");
}
