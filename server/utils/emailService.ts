/**
 * Email Service for sending HTML emails using Nodemailer
 */

import nodemailer, { Transporter } from "nodemailer";
import { AuditLogger } from "./auditLogger";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryable?: boolean;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize email transporter
   */
  private initialize(): void {
    const emailProvider = process.env.EMAIL_PROVIDER || "smtp";

    try {
      if (emailProvider === "smtp") {
        // SMTP Configuration
        const host = process.env.SMTP_HOST;
        const port = parseInt(process.env.SMTP_PORT || "587");
        const secure = process.env.SMTP_SECURE === "true";
        const user = process.env.SMTP_USER;
        const pass = process.env.SMTP_PASS;

        if (!host || !user || !pass) {
          console.log(
            "⚠️ Email service not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.",
          );
          return;
        }

        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass,
          },
        });

        this.isConfigured = true;
        console.log(`✅ Email service initialized with SMTP: ${host}:${port}`);
      } else if (emailProvider === "sendgrid") {
        // SendGrid Configuration
        const apiKey = process.env.SENDGRID_API_KEY;

        if (!apiKey) {
          console.log(
            "⚠️ SendGrid not configured. Set SENDGRID_API_KEY environment variable.",
          );
          return;
        }

        // Using SMTP for SendGrid
        this.transporter = nodemailer.createTransport({
          host: "smtp.sendgrid.net",
          port: 587,
          auth: {
            user: "apikey",
            pass: apiKey,
          },
        });

        this.isConfigured = true;
        console.log("✅ Email service initialized with SendGrid");
      } else if (emailProvider === "ses") {
        // AWS SES Configuration
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
        const region = process.env.AWS_REGION || "us-east-1";

        if (!accessKeyId || !secretAccessKey) {
          console.log(
            "⚠️ AWS SES not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.",
          );
          return;
        }

        // Using SMTP for AWS SES
        this.transporter = nodemailer.createTransport({
          host: `email-smtp.${region}.amazonaws.com`,
          port: 587,
          secure: false,
          auth: {
            user: accessKeyId,
            pass: secretAccessKey,
          },
        });

        this.isConfigured = true;
        console.log("✅ Email service initialized with AWS SES");
      }
    } catch (error) {
      console.error("❌ Failed to initialize email service:", error);
    }
  }

  /**
   * Send an email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this.isConfigured || !this.transporter) {
      console.log("⚠️ Email service not configured. Email not sent:", {
        to: options.to,
        subject: options.subject,
      });

      // Return success in development to avoid blocking
      if (process.env.NODE_ENV === "development") {
        return {
          success: true,
          messageId: `dev_email_${Date.now()}`,
        };
      }

      return {
        success: false,
        error: "Email service not configured",
        retryable: false,
      };
    }

    try {
      const from =
        options.from || process.env.EMAIL_FROM || "noreply@telecheck.com";

      const mailOptions: any = {
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      if (options.cc) {
        mailOptions.cc = Array.isArray(options.cc)
          ? options.cc.join(", ")
          : options.cc;
      }

      if (options.bcc) {
        mailOptions.bcc = Array.isArray(options.bcc)
          ? options.bcc.join(", ")
          : options.bcc;
      }

      if (options.attachments) {
        mailOptions.attachments = options.attachments;
      }

      const info = await this.transporter.sendMail(mailOptions);

      AuditLogger.logSystemEvent("email_service", "email_sent", {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
        success: true,
      });

      console.log(
        `📧 Email sent successfully to ${options.to}:`,
        info.messageId,
      );

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("❌ Failed to send email:", error);

      AuditLogger.logSystemEvent("email_service", "email_failed", {
        to: options.to,
        subject: options.subject,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        retryable: true,
      };
    }
  }

  /**
   * Verify email service connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      console.log("✅ Email service connection verified");
      return true;
    } catch (error) {
      console.error("❌ Email service verification failed:", error);
      return false;
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    configured: boolean;
    provider: string;
    ready: boolean;
  } {
    return {
      configured: this.isConfigured,
      provider: process.env.EMAIL_PROVIDER || "smtp",
      ready: this.isConfigured && this.transporter !== null,
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();
