import { Request, Response } from 'express';
import { AuditLogger } from '../utils/auditLogger';
import { telnyxService } from '../utils/telnyxService';

/**
 * Telnyx SMS webhook handler
 */
export async function handleTelnyxSMSWebhook(req: Request, res: Response) {
  try {
    const { data, event_type } = req.body;

    console.log(`📱 Telnyx SMS webhook received: ${event_type}`);

    switch (event_type) {
      case 'message.sent':
        console.log(`✅ Telnyx SMS sent: ${data.id} to ${data.to}`);
        AuditLogger.logSystemEvent('telnyx_webhook', 'sms_sent', {
          messageId: data.id,
          to: data.to,
          from: data.from
        });
        break;

      case 'message.delivered':
        console.log(`📬 Telnyx SMS delivered: ${data.id} to ${data.to}`);
        AuditLogger.logSystemEvent('telnyx_webhook', 'sms_delivered', {
          messageId: data.id,
          to: data.to,
          deliveredAt: data.completed_at
        });
        break;

      case 'message.delivery_failed':
        console.log(`❌ Telnyx SMS delivery failed: ${data.id} to ${data.to}`);
        AuditLogger.logSystemEvent('telnyx_webhook', 'sms_failed', {
          messageId: data.id,
          to: data.to,
          errorCode: data.errors?.[0]?.code,
          errorDetail: data.errors?.[0]?.detail
        });
        break;

      case 'message.received':
        console.log(`📨 Telnyx SMS received: ${data.id} from ${data.from}`);
        await handleIncomingSMS(data);
        break;

      default:
        console.log(`🔔 Unhandled Telnyx SMS event: ${event_type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Telnyx SMS webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Telnyx voice call webhook handler
 */
export async function handleTelnyxCallWebhook(req: Request, res: Response) {
  try {
    const { data, event_type } = req.body;

    console.log(`📞 Telnyx call webhook received: ${event_type}`);

    switch (event_type) {
      case 'call.initiated':
        console.log(`📞 Telnyx call initiated: ${data.call_control_id} to ${data.to}`);
        AuditLogger.logSystemEvent('telnyx_webhook', 'call_initiated', {
          callId: data.call_control_id,
          to: data.to,
          from: data.from
        });
        break;

      case 'call.answered':
        console.log(`📞 Telnyx call answered: ${data.call_control_id}`);
        AuditLogger.logSystemEvent('telnyx_webhook', 'call_answered', {
          callId: data.call_control_id,
          answeredAt: data.occurred_at
        });

        // Send TTS message when call is answered
        const voiceMessage = getVoiceMessageFromCallId(data.call_control_id);
        if (voiceMessage) {
          await telnyxService.speakToCall(data.call_control_id, voiceMessage);
        }
        break;

      case 'call.hangup':
        console.log(`📞 Telnyx call ended: ${data.call_control_id}`);
        AuditLogger.logSystemEvent('telnyx_webhook', 'call_ended', {
          callId: data.call_control_id,
          duration: data.call_duration_secs,
          hangupCause: data.hangup_cause
        });
        break;

      case 'call.machine.detection.ended':
        console.log(`🤖 Telnyx answering machine detected: ${data.call_control_id}`);
        if (data.result === 'machine') {
          // Leave voicemail
          const voiceMessage = getVoiceMessageFromCallId(data.call_control_id);
          if (voiceMessage) {
            await telnyxService.speakToCall(data.call_control_id, `This is an important healthcare message. ${voiceMessage}`);
          }
        }
        break;

      case 'call.speak.ended':
        console.log(`🔊 Telnyx TTS completed: ${data.call_control_id}`);
        // Hangup after message is complete
        setTimeout(() => {
          telnyxService.hangupCall(data.call_control_id);
        }, 2000); // Wait 2 seconds then hangup
        break;

      default:
        console.log(`🔔 Unhandled Telnyx call event: ${event_type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Telnyx call webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Twilio SMS webhook handler
 */
export async function handleTwilioSMSWebhook(req: Request, res: Response) {
  try {
    const { MessageStatus, MessageSid, To, From, Body } = req.body;

    console.log(`📱 Twilio SMS webhook received: ${MessageStatus} for ${MessageSid}`);

    switch (MessageStatus) {
      case 'sent':
        console.log(`✅ Twilio SMS sent: ${MessageSid} to ${To}`);
        AuditLogger.logSystemEvent('twilio_webhook', 'sms_sent', {
          messageId: MessageSid,
          to: To,
          from: From
        });
        break;

      case 'delivered':
        console.log(`📬 Twilio SMS delivered: ${MessageSid} to ${To}`);
        AuditLogger.logSystemEvent('twilio_webhook', 'sms_delivered', {
          messageId: MessageSid,
          to: To
        });
        break;

      case 'failed':
        console.log(`❌ Twilio SMS failed: ${MessageSid} to ${To}`);
        AuditLogger.logSystemEvent('twilio_webhook', 'sms_failed', {
          messageId: MessageSid,
          to: To,
          errorCode: req.body.ErrorCode,
          errorMessage: req.body.ErrorMessage
        });
        break;

      case 'received':
        console.log(`📨 Twilio SMS received: ${MessageSid} from ${From}`);
        await handleIncomingSMS({
          id: MessageSid,
          from: From,
          to: To,
          text: Body
        });
        break;

      default:
        console.log(`🔔 Unhandled Twilio SMS status: ${MessageStatus}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Twilio SMS webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Twilio voice call webhook handler
 */
export async function handleTwilioCallWebhook(req: Request, res: Response) {
  try {
    const { CallStatus, CallSid, To, From, CallDuration } = req.body;

    console.log(`📞 Twilio call webhook received: ${CallStatus} for ${CallSid}`);

    switch (CallStatus) {
      case 'initiated':
        console.log(`📞 Twilio call initiated: ${CallSid} to ${To}`);
        AuditLogger.logSystemEvent('twilio_webhook', 'call_initiated', {
          callId: CallSid,
          to: To,
          from: From
        });
        break;

      case 'answered':
        console.log(`📞 Twilio call answered: ${CallSid}`);
        AuditLogger.logSystemEvent('twilio_webhook', 'call_answered', {
          callId: CallSid
        });
        break;

      case 'completed':
        console.log(`📞 Twilio call completed: ${CallSid}`);
        AuditLogger.logSystemEvent('twilio_webhook', 'call_completed', {
          callId: CallSid,
          duration: CallDuration
        });
        break;

      case 'failed':
        console.log(`❌ Twilio call failed: ${CallSid}`);
        AuditLogger.logSystemEvent('twilio_webhook', 'call_failed', {
          callId: CallSid,
          errorCode: req.body.ErrorCode,
          errorMessage: req.body.ErrorMessage
        });
        break;

      default:
        console.log(`🔔 Unhandled Twilio call status: ${CallStatus}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Twilio call webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

/**
 * Generate TwiML for voice messages
 */
export function generateTwiMLVoice(req: Request, res: Response) {
  try {
    const { message, voice = 'alice' } = req.query;

    if (!message) {
      return res.status(400).send('Message parameter is required');
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="${voice}">${message}</Say>
    <Hangup/>
</Response>`;

    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('❌ TwiML generation error:', error);
    res.status(500).send('TwiML generation failed');
  }
}

/**
 * Handle incoming SMS messages from patients
 */
async function handleIncomingSMS(data: any) {
  try {
    const { id, from, to, text } = data;
    const phoneNumber = from;
    const message = text.trim().toUpperCase();

    console.log(`📨 Processing incoming SMS from ${phoneNumber}: ${text}`);

    // Log incoming message
    AuditLogger.logCommunication(
      'unknown', // We'd need to look up patient ID by phone number
      'sms',
      'inbound',
      {
        messageId: id,
        from: phoneNumber,
        to,
        message: text
      }
    );

    // Handle common responses
    switch (message) {
      case 'TAKEN':
      case 'DONE':
      case 'YES':
        await handleMedicationConfirmation(phoneNumber);
        break;

      case 'HELP':
      case 'INFO':
        await sendHelpMessage(phoneNumber);
        break;

      case 'STOP':
      case 'UNSUBSCRIBE':
        await handleOptOut(phoneNumber);
        break;

      case 'EMERGENCY':
      case 'URGENT':
      case '911':
        await handleEmergencyResponse(phoneNumber);
        break;

      default:
        // Check if it's a glucose reading (number)
        const glucoseValue = parseFloat(message);
        if (!isNaN(glucoseValue) && glucoseValue > 20 && glucoseValue < 600) {
          await handleGlucoseReading(phoneNumber, glucoseValue);
        } else {
          await sendUnknownCommandMessage(phoneNumber);
        }
    }
  } catch (error) {
    console.error('❌ Failed to process incoming SMS:', error);
  }
}

/**
 * Handle medication taken confirmation
 */
async function handleMedicationConfirmation(phoneNumber: string) {
  const response = "✅ Thank you for confirming your medication was taken. Your care team has been notified.";
  
  // In production, you'd update the medication adherence record
  console.log(`💊 Medication confirmation received from ${phoneNumber}`);
  
  // Send confirmation back to patient
  await telnyxService.sendSMS(phoneNumber, response);
}

/**
 * Send help message
 */
async function sendHelpMessage(phoneNumber: string) {
  const helpMessage = `🆘 Healthcare Help:
• Reply TAKEN after taking medication
• Send your glucose number (e.g., 120)
• Reply EMERGENCY for urgent help
• Reply STOP to unsubscribe
Need immediate help? Call (555) 123-4567`;

  await telnyxService.sendSMS(phoneNumber, helpMessage);
}

/**
 * Handle opt-out requests
 */
async function handleOptOut(phoneNumber: string) {
  const confirmMessage = "You have been unsubscribed from automated messages. You can still receive emergency alerts. To re-subscribe, contact your care team.";
  
  // In production, you'd update the patient's communication preferences
  console.log(`🚫 Opt-out request from ${phoneNumber}`);
  
  await telnyxService.sendSMS(phoneNumber, confirmMessage);
  
  // Log opt-out
  AuditLogger.logSystemEvent('patient_communication', 'opt_out', {
    phoneNumber,
    timestamp: new Date().toISOString()
  });
}

/**
 * Handle emergency responses
 */
async function handleEmergencyResponse(phoneNumber: string) {
  const emergencyMessage = "🚨 Emergency response activated. Your care team has been notified and will contact you immediately. If this is a life-threatening emergency, call 911 now.";
  
  console.log(`🚨 EMERGENCY response from ${phoneNumber}`);
  
  // Send immediate response
  await telnyxService.sendSMS(phoneNumber, emergencyMessage);
  
  // Log emergency
  AuditLogger.logSystemEvent('patient_communication', 'emergency_response', {
    phoneNumber,
    timestamp: new Date().toISOString(),
    priority: 'critical'
  });
  
  // In production, this would trigger care team alerts
  console.log(`🚨 Would notify care team about emergency from ${phoneNumber}`);
}

/**
 * Handle glucose reading submissions
 */
async function handleGlucoseReading(phoneNumber: string, value: number) {
  let responseMessage = "";
  
  if (value < 70) {
    responseMessage = `🚨 Your glucose is low (${value}). Take 15g fast-acting carbs immediately. Recheck in 15 minutes. Call 911 if you feel worse.`;
  } else if (value > 250) {
    responseMessage = `⚠️ Your glucose is high (${value}). Check ketones if possible and contact your care team. Drink water and take prescribed medication.`;
  } else {
    responseMessage = `✅ Glucose reading recorded: ${value} mg/dL. Keep up the good work! Your care team can see this reading.`;
  }
  
  console.log(`🩸 Glucose reading received from ${phoneNumber}: ${value} mg/dL`);
  
  // Send response
  await telnyxService.sendSMS(phoneNumber, responseMessage);
  
  // Log glucose reading
  AuditLogger.logMedicalEvent('unknown', 'glucose_reading_sms', {
    phoneNumber,
    value,
    timestamp: new Date().toISOString(),
    source: 'sms'
  });
}

/**
 * Handle unknown commands
 */
async function sendUnknownCommandMessage(phoneNumber: string) {
  const message = "I didn't understand that. Reply HELP for options, send your glucose number, or reply TAKEN after taking medication.";
  await telnyxService.sendSMS(phoneNumber, message);
}

/**
 * Get voice message for call ID (mock function)
 */
function getVoiceMessageFromCallId(callId: string): string | null {
  // In production, this would look up the message associated with the call
  // For now, return a default emergency message
  return "This is an urgent healthcare alert. Please contact your healthcare provider immediately or call 911 if this is a medical emergency.";
}

/**
 * Webhook signature verification for Telnyx
 */
export function verifyTelnyxSignature(req: Request, res: Response, next: any) {
  // In production, implement Telnyx webhook signature verification
  // For now, we'll skip verification in development
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement signature verification
    console.log('⚠️ TODO: Implement Telnyx webhook signature verification');
  }
  next();
}

/**
 * Webhook signature verification for Twilio
 */
export function verifyTwilioSignature(req: Request, res: Response, next: any) {
  // In production, implement Twilio webhook signature verification
  // For now, we'll skip verification in development
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement signature verification
    console.log('⚠️ TODO: Implement Twilio webhook signature verification');
  }
  next();
}
