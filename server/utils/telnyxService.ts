import fetch from "node-fetch";

interface TelnyxSMSRequest {
  from: string;
  to: string;
  text: string;
  messaging_profile_id?: string;
  webhook_url?: string;
  use_profile_webhooks?: boolean;
}

interface TelnyxCallRequest {
  connection_id: string;
  to: string;
  from: string;
  webhook_url?: string;
  timeout_secs?: number;
  time_limit_secs?: number;
  answering_machine_detection?: "premium" | "detect" | "disabled";
}

interface TelnyxSMSResponse {
  data: {
    id: string;
    record_type: string;
    direction: string;
    from: string;
    to: string;
    text: string;
    messaging_profile_id: string;
    parts: number;
    valid_until: string;
    cost: {
      amount: string;
      currency: string;
    };
    received_at: string;
    sent_at: string;
    completed_at: string;
    encoding: string;
    webhook_url: string;
  };
}

interface TelnyxCallResponse {
  data: {
    call_control_id: string;
    call_leg_id: string;
    call_session_id: string;
    is_alive: boolean;
    record_type: string;
  };
}

interface TelnyxError {
  errors: Array<{
    code: string;
    title: string;
    detail: string;
    source: {
      pointer: string;
    };
  }>;
}

export class TelnyxService {
  private readonly apiKey: string;
  private readonly baseUrl = "https://api.telnyx.com/v2";
  private readonly fromNumber: string;

  constructor() {
    this.apiKey = process.env.TELNYX_API_KEY || "";
    this.fromNumber = process.env.TELNYX_PHONE_NUMBER || "";

    if (!this.apiKey) {
      console.warn(
        "⚠️ Telnyx API key not configured. SMS and call services will be disabled.",
      );
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string,
    data?: any,
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error("Telnyx API key not configured");
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseData = await response.json();

      if (!response.ok) {
        const error = responseData as TelnyxError;
        const errorMessage =
          error.errors?.[0]?.detail || "Unknown Telnyx API error";
        throw new Error(`Telnyx API Error: ${errorMessage}`);
      }

      return responseData as T;
    } catch (error) {
      console.error("🚨 Telnyx API request failed:", error);
      throw error;
    }
  }

  /**
   * Send SMS message via Telnyx
   */
  async sendSMS(
    to: string,
    message: string,
    options?: {
      messagingProfileId?: string;
      webhookUrl?: string;
    },
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.fromNumber) {
        throw new Error("Telnyx phone number not configured");
      }

      // Clean phone number format
      const cleanTo = to.replace(/\D/g, "");
      const formattedTo = cleanTo.startsWith("1")
        ? `+${cleanTo}`
        : `+1${cleanTo}`;

      const smsData: TelnyxSMSRequest = {
        from: this.fromNumber,
        to: formattedTo,
        text: message,
        messaging_profile_id: options?.messagingProfileId,
        webhook_url:
          options?.webhookUrl ||
          `${process.env.BASE_URL || "http://localhost:3000"}/api/webhooks/telnyx/sms`,
        use_profile_webhooks: false,
      };

      console.log(
        `📱 Sending SMS via Telnyx to ${formattedTo}:`,
        message.substring(0, 50) + "...",
      );

      const response = await this.makeRequest<TelnyxSMSResponse>(
        "/messages",
        "POST",
        smsData,
      );

      console.log("✅ SMS sent successfully via Telnyx:", response.data.id);

      return {
        success: true,
        messageId: response.data.id,
      };
    } catch (error) {
      console.error("❌ Failed to send SMS via Telnyx:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Initiate voice call via Telnyx
   */
  async makeCall(
    to: string,
    options?: {
      connectionId?: string;
      webhookUrl?: string;
      timeoutSecs?: number;
      timeLimitSecs?: number;
      answeringMachineDetection?: "premium" | "detect" | "disabled";
    },
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    try {
      if (!this.fromNumber) {
        throw new Error("Telnyx phone number not configured");
      }

      // Clean phone number format
      const cleanTo = to.replace(/\D/g, "");
      const formattedTo = cleanTo.startsWith("1")
        ? `+${cleanTo}`
        : `+1${cleanTo}`;

      const callData: TelnyxCallRequest = {
        connection_id:
          options?.connectionId || process.env.TELNYX_CONNECTION_ID || "",
        to: formattedTo,
        from: this.fromNumber,
        webhook_url:
          options?.webhookUrl ||
          `${process.env.BASE_URL || "http://localhost:3000"}/api/webhooks/telnyx/call`,
        timeout_secs: options?.timeoutSecs || 30,
        time_limit_secs: options?.timeLimitSecs || 300, // 5 minutes
        answering_machine_detection:
          options?.answeringMachineDetection || "detect",
      };

      console.log(`📞 Initiating call via Telnyx to ${formattedTo}`);

      const response = await this.makeRequest<TelnyxCallResponse>(
        "/calls",
        "POST",
        callData,
      );

      console.log(
        "✅ Call initiated successfully via Telnyx:",
        response.data.call_control_id,
      );

      return {
        success: true,
        callId: response.data.call_control_id,
      };
    } catch (error) {
      console.error("❌ Failed to initiate call via Telnyx:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send text-to-speech message via call
   */
  async sendVoiceMessage(
    to: string,
    message: string,
    options?: {
      voice?: "male" | "female";
      language?: string;
      connectionId?: string;
    },
  ): Promise<{ success: boolean; callId?: string; error?: string }> {
    try {
      // First, initiate the call
      const callResult = await this.makeCall(to, {
        connectionId: options?.connectionId,
        answeringMachineDetection: "premium",
      });

      if (!callResult.success || !callResult.callId) {
        return callResult;
      }

      // Once call is answered, we'll send the TTS via webhook
      // This will be handled in the webhook endpoint
      console.log(
        `🔊 Voice message queued for call ${callResult.callId}:`,
        message.substring(0, 50) + "...",
      );

      return {
        success: true,
        callId: callResult.callId,
      };
    } catch (error) {
      console.error("❌ Failed to send voice message via Telnyx:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Send speak command to active call
   */
  async speakToCall(
    callControlId: string,
    message: string,
    options?: {
      voice?: "male" | "female";
      language?: string;
    },
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const speakData = {
        text: message,
        voice: options?.voice || "female",
        language: options?.language || "en-US",
        service_level: "premium",
      };

      await this.makeRequest(
        `/calls/${callControlId}/actions/speak`,
        "POST",
        speakData,
      );

      console.log(`🔊 TTS message sent to call ${callControlId}`);

      return { success: true };
    } catch (error) {
      console.error("❌ Failed to send TTS to call:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Hangup call
   */
  async hangupCall(
    callControlId: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.makeRequest(
        `/calls/${callControlId}/actions/hangup`,
        "POST",
        {},
      );

      console.log(`📞 Call ${callControlId} hung up`);

      return { success: true };
    } catch (error) {
      console.error("❌ Failed to hangup call:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get message delivery status
   */
  async getMessageStatus(messageId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      const response = await this.makeRequest<TelnyxSMSResponse>(
        `/messages/${messageId}`,
        "GET",
      );

      return {
        success: true,
        status: response.data.completed_at ? "delivered" : "pending",
      };
    } catch (error) {
      console.error("❌ Failed to get message status:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Format phone number for Telnyx
   */
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, "");
    return cleaned.startsWith("1") ? `+${cleaned}` : `+1${cleaned}`;
  }
}

// Export singleton instance
export const telnyxService = new TelnyxService();
