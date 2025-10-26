/**
 * Email Service
 *
 * Provides email sending functionality for patient notifications,
 * consultation summaries, and system notifications.
 *
 * @module services/emailService
 */

import nodemailer from "nodemailer";
import { auditLog, AuditAction } from "./auditService";

// Email configuration from environment variables
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  from: process.env.SMTP_FROM || "noreply@telecheck.health",
};

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize email transporter
 */
function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    if (!EMAIL_CONFIG.auth.user || !EMAIL_CONFIG.auth.pass) {
      console.warn(
        "[EMAIL] SMTP credentials not configured. Emails will be logged to console only.",
      );
      // Return a mock transporter for development
      return {
        sendMail: async (mailOptions: any) => {
          console.log("[EMAIL - DEV MODE]", mailOptions);
          return { messageId: `dev-${Date.now()}` };
        },
      } as any;
    }

    transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }
  return transporter;
}

/**
 * Email options interface
 */
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Send an email
 *
 * @param options - Email options
 * @returns Promise resolving to message ID
 */
export async function sendEmail(options: EmailOptions): Promise<string> {
  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: EMAIL_CONFIG.from,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || stripHtml(options.html),
      cc: options.cc
        ? Array.isArray(options.cc)
          ? options.cc.join(", ")
          : options.cc
        : undefined,
      bcc: options.bcc
        ? Array.isArray(options.bcc)
          ? options.bcc.join(", ")
          : options.bcc
        : undefined,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log successful email send
    console.log("[EMAIL] Message sent: %s", info.messageId);

    return info.messageId;
  } catch (error) {
    console.error("[EMAIL ERROR] Failed to send email:", error);
    throw new Error(
      `Failed to send email: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Send consultation summary to patient
 *
 * @param patientEmail - Patient's email address
 * @param patientName - Patient's name
 * @param summaryHtml - HTML content of summary
 * @param summaryText - Plain text content of summary
 * @param appointmentId - Appointment ID for tracking
 * @returns Promise resolving to message ID
 */
export async function sendConsultationSummary(
  patientEmail: string,
  patientName: string,
  summaryHtml: string,
  summaryText: string,
  appointmentId: string,
): Promise<string> {
  try {
    const messageId = await sendEmail({
      to: patientEmail,
      subject: "Your Consultation Summary - Telecheck",
      html: summaryHtml,
      text: summaryText,
    });

    // Audit log
    await auditLog({
      action: "CONSULTATION_SUMMARY_SENT",
      description: `Consultation summary sent to ${patientEmail}`,
      category: "data_access",
      severity: "info",
      details: {
        appointmentId,
        patientEmail,
        messageId,
      },
    });

    return messageId;
  } catch (error) {
    // Audit failed attempt
    await auditLog({
      action: "CONSULTATION_SUMMARY_SEND_FAILED",
      description: `Failed to send consultation summary to ${patientEmail}`,
      category: "system",
      severity: "error",
      details: {
        appointmentId,
        patientEmail,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    throw error;
  }
}

/**
 * Send appointment reminder
 *
 * @param patientEmail - Patient's email
 * @param patientName - Patient's name
 * @param appointmentDate - Appointment date/time
 * @param doctorName - Doctor's name
 * @returns Promise resolving to message ID
 */
export async function sendAppointmentReminder(
  patientEmail: string,
  patientName: string,
  appointmentDate: Date,
  doctorName: string,
): Promise<string> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Appointment Reminder</h1>
        </div>
        <div class="content">
          <p>Dear ${patientName},</p>
          <p>This is a reminder about your upcoming telehealth appointment:</p>
          <p><strong>Date & Time:</strong> ${appointmentDate.toLocaleString()}</p>
          <p><strong>Provider:</strong> Dr. ${doctorName}</p>
          <p>Please ensure you have a stable internet connection and a quiet place for your consultation.</p>
          <p style="text-align: center;">
            <a href="${process.env.APP_URL || "https://telecheck.health"}/appointments" class="button">View Appointment</a>
          </p>
        </div>
        <div class="footer">
          <p>This is an automated message from Telecheck. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: patientEmail,
    subject: "Upcoming Appointment Reminder - Telecheck",
    html,
  });
}

/**
 * Send prescription notification
 *
 * @param patientEmail - Patient's email
 * @param patientName - Patient's name
 * @param medicationName - Name of prescribed medication
 * @param pharmacyInfo - Pharmacy information
 * @returns Promise resolving to message ID
 */
export async function sendPrescriptionNotification(
  patientEmail: string,
  patientName: string,
  medicationName: string,
  pharmacyInfo?: string,
): Promise<string> {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #059669; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9fafb; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
        .alert { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Prescription</h1>
        </div>
        <div class="content">
          <p>Dear ${patientName},</p>
          <p>A new prescription has been sent electronically:</p>
          <p><strong>Medication:</strong> ${medicationName}</p>
          ${pharmacyInfo ? `<p><strong>Pharmacy:</strong> ${pharmacyInfo}</p>` : ""}
          <div class="alert">
            <strong>Important:</strong> Please contact your pharmacy to confirm they have received your prescription and to arrange pickup or delivery.
          </div>
          <p>If you have any questions about your prescription, please contact your healthcare provider.</p>
        </div>
        <div class="footer">
          <p>This is an automated message from Telecheck. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: patientEmail,
    subject: "New Prescription - Telecheck",
    html,
  });
}

/**
 * Strip HTML tags from string (simple implementation)
 *
 * @param html - HTML string
 * @returns Plain text string
 */
function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*<\/style>/gm, "")
    .replace(/<script[^>]*>.*<\/script>/gm, "")
    .replace(/<[^>]+>/gm, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Verify email configuration
 *
 * @returns Promise resolving to boolean indicating if email is configured
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    if (
      transporter.sendMail.toString().includes("DEV MODE") ||
      !EMAIL_CONFIG.auth.user
    ) {
      console.log("[EMAIL] Running in development mode (no SMTP configured)");
      return false;
    }
    await transporter.verify();
    console.log("[EMAIL] Email service is ready");
    return true;
  } catch (error) {
    console.error("[EMAIL] Email configuration verification failed:", error);
    return false;
  }
}

export default {
  sendEmail,
  sendConsultationSummary,
  sendAppointmentReminder,
  sendPrescriptionNotification,
  verifyEmailConfig,
};
