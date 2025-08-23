import fetch from 'node-fetch';

interface TwilioSMSRequest {
  To: string;
  From: string;
  Body: string;
  StatusCallback?: string;
}

interface TwilioCallRequest {
  To: string;
  From: string;
  Url: string;
  StatusCallback?: string;
  Timeout?: number;
  Record?: boolean;
}

interface TwilioSMSResponse {
  sid: string;
  account_sid: string;
  from: string;
  to: string;
  body: string;
  status: string;
  direction: string;
  date_created: string;
  date_sent: string;
  date_updated: string;
  price: string;
  price_unit: string;
  uri: string;
}

interface TwilioCallResponse {
  sid: string;
  account_sid: string;
  from: string;
  to: string;
  status: string;
  start_time: string;
  end_time: string;
  duration: string;
  price: string;
  direction: string;
  uri: string;
}

export class TwilioService {
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;
  private readonly baseUrl: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}`;
    
    if (!this.accountSid || !this.authToken) {
      console.warn('⚠️ Twilio credentials not configured. Backup SMS and call services will be disabled.');
    }
  }

  private async makeRequest<T>(endpoint: string, method: string, data?: any): Promise<T> {
    if (!this.accountSid || !this.authToken) {
      throw new Error('Twilio credentials not configured');
    }

    try {
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const body = data ? new URLSearchParams(data).toString() : undefined;

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body,
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || 'Unknown Twilio API error';
        throw new Error(`Twilio API Error: ${errorMessage}`);
      }

      return responseData as T;
    } catch (error) {
      console.error('🚨 Twilio API request failed:', error);
      throw error;
    }
  }

  /**
   * Send SMS message via Twilio (backup service)
   */
  async sendSMS(to: string, message: string, options?: {
    statusCallback?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.fromNumber) {
        throw new Error('Twilio phone number not configured');
      }

      // Clean phone number format
      const cleanTo = to.replace(/\D/g, '');
      const formattedTo = cleanTo.startsWith('1') ? `+${cleanTo}` : `+1${cleanTo}`;

      const smsData: TwilioSMSRequest = {
        To: formattedTo,
        From: this.fromNumber,
        Body: message,
        StatusCallback: options?.statusCallback || `${process.env.BASE_URL || 'http://localhost:3000'}/api/webhooks/twilio/sms`,
      };

      console.log(`📱 Sending SMS via Twilio (backup) to ${formattedTo}:`, message.substring(0, 50) + '...');

      const response = await this.makeRequest<TwilioSMSResponse>('/Messages.json', 'POST', smsData);

      console.log('✅ SMS sent successfully via Twilio:', response.sid);

      return {
        success: true,
        messageId: response.sid,
      };
    } catch (error) {
      console.error('❌ Failed to send SMS via Twilio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Initiate voice call via Twilio (backup service)
   */
  async makeCall(to: string, twimlUrl: string, options?: {
    statusCallback?: string;
    timeout?: number;
    record?: boolean;
  }): Promise<{ success: boolean; callId?: string; error?: string }> {
    try {
      if (!this.fromNumber) {
        throw new Error('Twilio phone number not configured');
      }

      // Clean phone number format
      const cleanTo = to.replace(/\D/g, '');
      const formattedTo = cleanTo.startsWith('1') ? `+${cleanTo}` : `+1${cleanTo}`;

      const callData: TwilioCallRequest = {
        To: formattedTo,
        From: this.fromNumber,
        Url: twimlUrl,
        StatusCallback: options?.statusCallback || `${process.env.BASE_URL || 'http://localhost:3000'}/api/webhooks/twilio/call`,
        Timeout: options?.timeout || 30,
        Record: options?.record || false,
      };

      console.log(`📞 Initiating call via Twilio (backup) to ${formattedTo}`);

      const response = await this.makeRequest<TwilioCallResponse>('/Calls.json', 'POST', callData);

      console.log('✅ Call initiated successfully via Twilio:', response.sid);

      return {
        success: true,
        callId: response.sid,
      };
    } catch (error) {
      console.error('❌ Failed to initiate call via Twilio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate TwiML for voice message
   */
  generateTwiML(message: string, voice?: 'alice' | 'man' | 'woman'): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="${voice || 'alice'}">${message}</Say>
    <Hangup/>
</Response>`;
  }

  /**
   * Send voice message via Twilio (backup service)
   */
  async sendVoiceMessage(to: string, message: string, options?: {
    voice?: 'alice' | 'man' | 'woman';
  }): Promise<{ success: boolean; callId?: string; error?: string }> {
    try {
      // Create TwiML for the message
      const twiml = this.generateTwiML(message, options?.voice);
      
      // We'll need to serve this TwiML via an endpoint
      const twimlUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/twiml/voice?message=${encodeURIComponent(message)}&voice=${options?.voice || 'alice'}`;

      const callResult = await this.makeCall(to, twimlUrl);

      if (callResult.success) {
        console.log(`🔊 Voice message queued via Twilio for call ${callResult.callId}:`, message.substring(0, 50) + '...');
      }

      return callResult;
    } catch (error) {
      console.error('❌ Failed to send voice message via Twilio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get message status from Twilio
   */
  async getMessageStatus(messageId: string): Promise<{ 
    success: boolean; 
    status?: string; 
    error?: string; 
  }> {
    try {
      const response = await this.makeRequest<TwilioSMSResponse>(`/Messages/${messageId}.json`, 'GET');

      return {
        success: true,
        status: response.status,
      };
    } catch (error) {
      console.error('❌ Failed to get message status from Twilio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get call status from Twilio
   */
  async getCallStatus(callId: string): Promise<{ 
    success: boolean; 
    status?: string; 
    duration?: string;
    error?: string; 
  }> {
    try {
      const response = await this.makeRequest<TwilioCallResponse>(`/Calls/${callId}.json`, 'GET');

      return {
        success: true,
        status: response.status,
        duration: response.duration,
      };
    } catch (error) {
      console.error('❌ Failed to get call status from Twilio:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Format phone number for Twilio
   */
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    return cleaned.startsWith('1') ? `+${cleaned}` : `+1${cleaned}`;
  }
}

// Export singleton instance
export const twilioService = new TwilioService();
