/**
 * Appointment Notification Service
 *
 * Handles all appointment-related notifications including:
 * - Patient confirmation emails
 * - Patient SMS reminders (24h and 2h before)
 * - Doctor notifications
 * - Cancellation notifications
 */

import { messagingService, MessageRequest } from "./messagingService";
import { emailService, EmailOptions } from "./emailService";
import { AuditLogger } from "./auditLogger";
import schedule from "node-schedule";

export interface AppointmentData {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  doctorPhone?: string;
  scheduledTime: Date;
  type: "video" | "phone" | "in_person";
  reason?: string;
  notes?: string;
  meetingLink?: string;
  confirmationNumber?: string;
}

export interface NotificationResult {
  success: boolean;
  email?: {
    sent: boolean;
    messageId?: string;
    error?: string;
  };
  sms?: {
    sent: boolean;
    messageId?: string;
    error?: string;
  };
  errors?: string[];
}

class AppointmentNotificationService {
  private scheduledJobs: Map<string, schedule.Job> = new Map();

  /**
   * Send all notifications for a new appointment
   * This is non-blocking - errors won't prevent appointment creation
   */
  async sendAppointmentCreatedNotifications(
    appointment: AppointmentData,
  ): Promise<NotificationResult> {
    const errors: string[] = [];
    let emailSent = false;
    let emailMessageId: string | undefined;
    let emailError: string | undefined;
    let smsSent = false;
    let smsMessageId: string | undefined;
    let smsError: string | undefined;

    try {
      // Send patient confirmation email (non-blocking)
      try {
        const emailResult =
          await this.sendPatientConfirmationEmail(appointment);
        emailSent = emailResult.success;
        emailMessageId = emailResult.messageId;
        if (!emailResult.success) {
          emailError = emailResult.error;
          errors.push(`Email failed: ${emailResult.error}`);
        }
      } catch (error) {
        emailError = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Email error: ${emailError}`);
        console.error("Error sending confirmation email:", error);
      }

      // Send patient confirmation SMS (non-blocking)
      try {
        const smsResult = await this.sendPatientConfirmationSMS(appointment);
        smsSent = smsResult.success;
        smsMessageId = smsResult.messageId;
        if (!smsResult.success) {
          smsError = smsResult.error;
          errors.push(`SMS failed: ${smsResult.error}`);
        }
      } catch (error) {
        smsError = error instanceof Error ? error.message : "Unknown error";
        errors.push(`SMS error: ${smsError}`);
        console.error("Error sending confirmation SMS:", error);
      }

      // Send doctor notification (non-blocking)
      try {
        await this.sendDoctorNotification(appointment);
      } catch (error) {
        errors.push(
          `Doctor notification error: ${error instanceof Error ? error.message : "Unknown"}`,
        );
        console.error("Error sending doctor notification:", error);
      }

      // Schedule reminder notifications
      try {
        this.scheduleAppointmentReminders(appointment);
      } catch (error) {
        errors.push(
          `Reminder scheduling error: ${error instanceof Error ? error.message : "Unknown"}`,
        );
        console.error("Error scheduling reminders:", error);
      }

      // Log the notification attempt
      AuditLogger.logSystemEvent(
        "appointment_notifications",
        "appointment_created",
        {
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          emailSent,
          smsSent,
          errorsCount: errors.length,
        },
      );

      return {
        success: emailSent || smsSent,
        email: {
          sent: emailSent,
          messageId: emailMessageId,
          error: emailError,
        },
        sms: {
          sent: smsSent,
          messageId: smsMessageId,
          error: smsError,
        },
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error(
        "❌ Critical error in appointment notification service:",
        error,
      );

      return {
        success: false,
        email: {
          sent: false,
          error: "Critical error",
        },
        sms: {
          sent: false,
          error: "Critical error",
        },
        errors: [
          error instanceof Error ? error.message : "Unknown critical error",
        ],
      };
    }
  }

  /**
   * Send patient confirmation email
   */
  private async sendPatientConfirmationEmail(
    appointment: AppointmentData,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const appointmentDate = new Date(appointment.scheduledTime);
    const formattedDate = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const html = this.generateConfirmationEmailHTML(
      appointment,
      formattedDate,
      formattedTime,
    );

    const text = this.generateConfirmationEmailText(
      appointment,
      formattedDate,
      formattedTime,
    );

    const emailOptions: EmailOptions = {
      to: appointment.patientEmail,
      subject: `Appointment Confirmed - ${formattedDate} at ${formattedTime}`,
      html,
      text,
    };

    return await emailService.sendEmail(emailOptions);
  }

  /**
   * Generate HTML for confirmation email
   */
  private generateConfirmationEmailHTML(
    appointment: AppointmentData,
    formattedDate: string,
    formattedTime: string,
  ): string {
    const appointmentTypeText =
      appointment.type === "video"
        ? "Video Consultation"
        : appointment.type === "phone"
          ? "Phone Consultation"
          : "In-Person Visit";

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Appointment Confirmation</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
    .header { background-color: #2563eb; color: #ffffff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; }
    .appointment-details { background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .detail-row { display: flex; margin-bottom: 12px; }
    .detail-label { font-weight: 600; width: 140px; color: #64748b; }
    .detail-value { flex: 1; color: #1e293b; }
    .meeting-link { background-color: #2563eb; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: 600; }
    .instructions { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; border-radius: 0 0 8px 8px; margin-top: 30px; }
    .button-container { text-align: center; margin: 30px 0; }
    @media only screen and (max-width: 600px) {
      .detail-row { flex-direction: column; }
      .detail-label { width: 100%; margin-bottom: 4px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✓ Appointment Confirmed</h1>
    </div>
    <div class="content">
      <p>Dear ${appointment.patientName},</p>
      <p>Your appointment has been successfully scheduled. We look forward to seeing you!</p>

      <div class="appointment-details">
        <h2 style="margin-top: 0; color: #1e293b; font-size: 18px;">Appointment Details</h2>
        <div class="detail-row">
          <span class="detail-label">Type:</span>
          <span class="detail-value">${appointmentTypeText}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${formattedTime}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Doctor:</span>
          <span class="detail-value">${appointment.doctorName}</span>
        </div>
        ${
          appointment.confirmationNumber
            ? `
        <div class="detail-row">
          <span class="detail-label">Confirmation #:</span>
          <span class="detail-value">${appointment.confirmationNumber}</span>
        </div>
        `
            : ""
        }
        ${
          appointment.reason
            ? `
        <div class="detail-row">
          <span class="detail-label">Reason:</span>
          <span class="detail-value">${appointment.reason}</span>
        </div>
        `
            : ""
        }
      </div>

      ${
        appointment.type === "video" && appointment.meetingLink
          ? `
      <div class="button-container">
        <a href="${appointment.meetingLink}" class="meeting-link">Join Video Consultation</a>
      </div>
      <div class="instructions">
        <strong>📹 Video Consultation Instructions:</strong>
        <ul style="margin: 10px 0 0 0; padding-left: 20px;">
          <li>Join the consultation 5 minutes before your scheduled time</li>
          <li>Ensure you have a stable internet connection</li>
          <li>Test your camera and microphone beforehand</li>
          <li>Have your current medications list ready</li>
          <li>Prepare any questions you want to discuss</li>
        </ul>
      </div>
      `
          : ""
      }

      <p><strong>Need to reschedule or cancel?</strong><br>
      Please contact us at least 24 hours in advance to avoid cancellation fees.</p>

      <p>If you have any questions, please don't hesitate to reach out to our office.</p>

      <p>Best regards,<br>
      <strong>TeleCheck Healthcare Team</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} TeleCheck Healthcare. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate plain text for confirmation email
   */
  private generateConfirmationEmailText(
    appointment: AppointmentData,
    formattedDate: string,
    formattedTime: string,
  ): string {
    const appointmentTypeText =
      appointment.type === "video"
        ? "Video Consultation"
        : appointment.type === "phone"
          ? "Phone Consultation"
          : "In-Person Visit";

    let text = `
APPOINTMENT CONFIRMED

Dear ${appointment.patientName},

Your appointment has been successfully scheduled. We look forward to seeing you!

APPOINTMENT DETAILS
-------------------
Type: ${appointmentTypeText}
Date: ${formattedDate}
Time: ${formattedTime}
Doctor: ${appointment.doctorName}
${appointment.confirmationNumber ? `Confirmation #: ${appointment.confirmationNumber}` : ""}
${appointment.reason ? `Reason: ${appointment.reason}` : ""}

`;

    if (appointment.type === "video" && appointment.meetingLink) {
      text += `
VIDEO CONSULTATION LINK
${appointment.meetingLink}

INSTRUCTIONS:
- Join the consultation 5 minutes before your scheduled time
- Ensure you have a stable internet connection
- Test your camera and microphone beforehand
- Have your current medications list ready
- Prepare any questions you want to discuss

`;
    }

    text += `
Need to reschedule or cancel?
Please contact us at least 24 hours in advance to avoid cancellation fees.

If you have any questions, please don't hesitate to reach out to our office.

Best regards,
TeleCheck Healthcare Team

---
This is an automated message. Please do not reply to this email.
`;

    return text;
  }

  /**
   * Send patient confirmation SMS
   */
  private async sendPatientConfirmationSMS(
    appointment: AppointmentData,
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const appointmentDate = new Date(appointment.scheduledTime);
    const formattedDate = appointmentDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    let message = `Appointment confirmed! ${formattedDate} at ${formattedTime} with ${appointment.doctorName}.`;

    if (appointment.type === "video" && appointment.meetingLink) {
      message += ` Video link: ${appointment.meetingLink}`;
    }

    if (appointment.confirmationNumber) {
      message += ` Confirmation: ${appointment.confirmationNumber}`;
    }

    const request: MessageRequest = {
      to: appointment.patientPhone,
      message,
      type: "sms",
      priority: "low",
      patientId: appointment.patientId,
      category: "appointment",
    };

    const result = await messagingService.sendMessage(request);

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    };
  }

  /**
   * Send doctor notification
   */
  private async sendDoctorNotification(
    appointment: AppointmentData,
  ): Promise<void> {
    const appointmentDate = new Date(appointment.scheduledTime);
    const formattedDate = appointmentDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const appointmentTypeText =
      appointment.type === "video"
        ? "Video Consultation"
        : appointment.type === "phone"
          ? "Phone Consultation"
          : "In-Person Visit";

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Appointment</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; }
    .header { background-color: #059669; color: #ffffff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px 20px; }
    .appointment-details { background-color: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .detail-row { display: flex; margin-bottom: 12px; }
    .detail-label { font-weight: 600; width: 140px; color: #64748b; }
    .detail-value { flex: 1; color: #1e293b; }
    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; border-radius: 0 0 8px 8px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 New Appointment Scheduled</h1>
    </div>
    <div class="content">
      <p>Dear Dr. ${appointment.doctorName},</p>
      <p>A new appointment has been scheduled with one of your patients.</p>

      <div class="appointment-details">
        <h2 style="margin-top: 0; color: #1e293b; font-size: 18px;">Appointment Details</h2>
        <div class="detail-row">
          <span class="detail-label">Patient:</span>
          <span class="detail-value">${appointment.patientName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Type:</span>
          <span class="detail-value">${appointmentTypeText}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${formattedDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Time:</span>
          <span class="detail-value">${formattedTime}</span>
        </div>
        ${
          appointment.reason
            ? `
        <div class="detail-row">
          <span class="detail-label">Reason:</span>
          <span class="detail-value">${appointment.reason}</span>
        </div>
        `
            : ""
        }
        ${
          appointment.notes
            ? `
        <div class="detail-row">
          <span class="detail-label">Notes:</span>
          <span class="detail-value">${appointment.notes}</span>
        </div>
        `
            : ""
        }
      </div>

      <p>You will receive a reminder before the appointment.</p>

      <p>Best regards,<br>
      <strong>TeleCheck Healthcare System</strong></p>
    </div>
    <div class="footer">
      <p>This is an automated notification from TeleCheck Healthcare.</p>
    </div>
  </div>
</body>
</html>
    `;

    const text = `
NEW APPOINTMENT SCHEDULED

Dear Dr. ${appointment.doctorName},

A new appointment has been scheduled with one of your patients.

APPOINTMENT DETAILS
-------------------
Patient: ${appointment.patientName}
Type: ${appointmentTypeText}
Date: ${formattedDate}
Time: ${formattedTime}
${appointment.reason ? `Reason: ${appointment.reason}` : ""}
${appointment.notes ? `Notes: ${appointment.notes}` : ""}

You will receive a reminder before the appointment.

Best regards,
TeleCheck Healthcare System
    `;

    await emailService.sendEmail({
      to: appointment.doctorEmail,
      subject: `New Appointment: ${appointment.patientName} - ${formattedDate}`,
      html,
      text,
    });
  }

  /**
   * Schedule appointment reminders (24h and 2h before)
   */
  private scheduleAppointmentReminders(appointment: AppointmentData): void {
    const appointmentDate = new Date(appointment.scheduledTime);
    const now = new Date();

    // Schedule 24-hour reminder
    const reminder24h = new Date(
      appointmentDate.getTime() - 24 * 60 * 60 * 1000,
    );
    if (reminder24h > now) {
      const job24h = schedule.scheduleJob(
        `reminder_24h_${appointment.id}`,
        reminder24h,
        () => {
          this.send24HourReminder(appointment);
        },
      );

      if (job24h) {
        this.scheduledJobs.set(`24h_${appointment.id}`, job24h);
        console.log(
          `📅 Scheduled 24-hour reminder for appointment ${appointment.id} at ${reminder24h.toISOString()}`,
        );
      }
    }

    // Schedule 2-hour reminder
    const reminder2h = new Date(appointmentDate.getTime() - 2 * 60 * 60 * 1000);
    if (reminder2h > now) {
      const job2h = schedule.scheduleJob(
        `reminder_2h_${appointment.id}`,
        reminder2h,
        () => {
          this.send2HourReminder(appointment);
        },
      );

      if (job2h) {
        this.scheduledJobs.set(`2h_${appointment.id}`, job2h);
        console.log(
          `📅 Scheduled 2-hour reminder for appointment ${appointment.id} at ${reminder2h.toISOString()}`,
        );
      }
    }
  }

  /**
   * Send 24-hour reminder
   */
  private async send24HourReminder(
    appointment: AppointmentData,
  ): Promise<void> {
    console.log(
      `⏰ Sending 24-hour reminder for appointment ${appointment.id}`,
    );

    const appointmentDate = new Date(appointment.scheduledTime);
    const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    let message = `Reminder: You have an appointment tomorrow at ${formattedTime} with ${appointment.doctorName}.`;

    if (appointment.type === "video" && appointment.meetingLink) {
      message += ` Video link: ${appointment.meetingLink}`;
    }

    message += ` Reply CONFIRM to acknowledge or call to reschedule.`;

    const request: MessageRequest = {
      to: appointment.patientPhone,
      message,
      type: "sms",
      priority: "low",
      patientId: appointment.patientId,
      category: "appointment",
      template: "appointment_24h",
      variables: {
        time: formattedTime,
        provider: appointment.doctorName,
        phone: process.env.CLINIC_PHONE || "(555) 123-4567",
      },
    };

    await messagingService.sendMessage(request);

    AuditLogger.logSystemEvent(
      "appointment_notifications",
      "24h_reminder_sent",
      {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
      },
    );

    // Clean up the job
    this.scheduledJobs.delete(`24h_${appointment.id}`);
  }

  /**
   * Send 2-hour reminder
   */
  private async send2HourReminder(appointment: AppointmentData): Promise<void> {
    console.log(`⏰ Sending 2-hour reminder for appointment ${appointment.id}`);

    const appointmentDate = new Date(appointment.scheduledTime);
    const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    let message = `Reminder: Your appointment with ${appointment.doctorName} is in 2 hours at ${formattedTime}.`;

    if (appointment.type === "video" && appointment.meetingLink) {
      message += ` Join here: ${appointment.meetingLink}`;
    } else if (appointment.type === "in_person") {
      message += ` Please arrive 15 minutes early.`;
    }

    const request: MessageRequest = {
      to: appointment.patientPhone,
      message,
      type: "sms",
      priority: "medium",
      patientId: appointment.patientId,
      category: "appointment",
      template: "appointment_2h",
      variables: {
        time: formattedTime,
        provider: appointment.doctorName,
      },
    };

    await messagingService.sendMessage(request);

    AuditLogger.logSystemEvent(
      "appointment_notifications",
      "2h_reminder_sent",
      {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
      },
    );

    // Clean up the job
    this.scheduledJobs.delete(`2h_${appointment.id}`);
  }

  /**
   * Send appointment cancellation notifications
   */
  async sendAppointmentCancelledNotifications(
    appointment: AppointmentData,
  ): Promise<NotificationResult> {
    const errors: string[] = [];
    let emailSent = false;
    let smsSent = false;

    try {
      // Cancel scheduled reminders
      this.cancelScheduledReminders(appointment.id);

      const appointmentDate = new Date(appointment.scheduledTime);
      const formattedDate = appointmentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const formattedTime = appointmentDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      // Send cancellation email to patient
      try {
        await emailService.sendEmail({
          to: appointment.patientEmail,
          subject: `Appointment Cancelled - ${formattedDate}`,
          html: `
            <h1>Appointment Cancelled</h1>
            <p>Dear ${appointment.patientName},</p>
            <p>Your appointment scheduled for <strong>${formattedDate} at ${formattedTime}</strong> with ${appointment.doctorName} has been cancelled.</p>
            <p>If you need to reschedule, please contact our office.</p>
            <p>Best regards,<br>TeleCheck Healthcare Team</p>
          `,
          text: `Appointment Cancelled\n\nDear ${appointment.patientName},\n\nYour appointment scheduled for ${formattedDate} at ${formattedTime} with ${appointment.doctorName} has been cancelled.\n\nIf you need to reschedule, please contact our office.\n\nBest regards,\nTeleCheck Healthcare Team`,
        });
        emailSent = true;
      } catch (error) {
        errors.push(
          `Email error: ${error instanceof Error ? error.message : "Unknown"}`,
        );
      }

      // Send cancellation SMS to patient
      try {
        await messagingService.sendMessage({
          to: appointment.patientPhone,
          message: `Your appointment on ${formattedDate} at ${formattedTime} with ${appointment.doctorName} has been cancelled. Contact us to reschedule.`,
          type: "sms",
          priority: "medium",
          patientId: appointment.patientId,
          category: "appointment",
        });
        smsSent = true;
      } catch (error) {
        errors.push(
          `SMS error: ${error instanceof Error ? error.message : "Unknown"}`,
        );
      }

      return {
        success: emailSent || smsSent,
        email: { sent: emailSent },
        sms: { sent: smsSent },
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error("Error sending cancellation notifications:", error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  }

  /**
   * Cancel scheduled reminders for an appointment
   */
  private cancelScheduledReminders(appointmentId: string): void {
    const job24h = this.scheduledJobs.get(`24h_${appointmentId}`);
    const job2h = this.scheduledJobs.get(`2h_${appointmentId}`);

    if (job24h) {
      job24h.cancel();
      this.scheduledJobs.delete(`24h_${appointmentId}`);
      console.log(
        `Cancelled 24-hour reminder for appointment ${appointmentId}`,
      );
    }

    if (job2h) {
      job2h.cancel();
      this.scheduledJobs.delete(`2h_${appointmentId}`);
      console.log(`Cancelled 2-hour reminder for appointment ${appointmentId}`);
    }
  }

  /**
   * Get status of scheduled reminders
   */
  getScheduledRemindersStatus(): Array<{
    appointmentId: string;
    type: "24h" | "2h";
    scheduledTime: Date;
  }> {
    const status: Array<{
      appointmentId: string;
      type: "24h" | "2h";
      scheduledTime: Date;
    }> = [];

    for (const [key, job] of this.scheduledJobs.entries()) {
      const [type, appointmentId] = key.split("_");
      status.push({
        appointmentId,
        type: type as "24h" | "2h",
        scheduledTime: job.nextInvocation()!.toDate(),
      });
    }

    return status;
  }
}

// Export singleton instance
export const appointmentNotificationService =
  new AppointmentNotificationService();
