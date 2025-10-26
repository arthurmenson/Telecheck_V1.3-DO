/**
 * Test Script for Appointment Notification System
 *
 * This script tests the complete appointment notification flow including:
 * - Email service connectivity
 * - SMS service connectivity
 * - Appointment creation with notifications
 * - Scheduled reminders
 * - Cancellation notifications
 *
 * Usage:
 *   npm run test:notifications
 *   or
 *   tsx scripts/test-appointment-notifications.ts
 */

import { emailService } from "../server/utils/emailService";
import { messagingService } from "../server/utils/messagingService";
import {
  appointmentNotificationService,
  AppointmentData,
} from "../server/utils/appointmentNotificationService";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log("\n" + "=".repeat(60));
  log(title, "cyan");
  console.log("=".repeat(60) + "\n");
}

function logSuccess(message: string) {
  log(`✓ ${message}`, "green");
}

function logError(message: string) {
  log(`✗ ${message}`, "red");
}

function logWarning(message: string) {
  log(`⚠ ${message}`, "yellow");
}

function logInfo(message: string) {
  log(`ℹ ${message}`, "blue");
}

/**
 * Test email service connectivity
 */
async function testEmailService(): Promise<boolean> {
  logSection("Testing Email Service");

  const status = emailService.getStatus();
  logInfo(`Provider: ${status.provider}`);
  logInfo(`Configured: ${status.configured}`);
  logInfo(`Ready: ${status.ready}`);

  if (!status.configured) {
    logWarning("Email service not configured");
    logInfo("Set SMTP_HOST, SMTP_USER, and SMTP_PASS in .env");
    return false;
  }

  try {
    logInfo("Verifying email connection...");
    const isConnected = await emailService.verifyConnection();

    if (isConnected) {
      logSuccess("Email service connected successfully");
      return true;
    } else {
      logError("Email service connection failed");
      return false;
    }
  } catch (error) {
    logError(
      `Email service error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return false;
  }
}

/**
 * Test SMS service connectivity
 */
async function testSMSService(): Promise<boolean> {
  logSection("Testing SMS Service");

  const telnyxConfigured = !!process.env.TELNYX_API_KEY;
  const twilioConfigured = !!(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  );

  logInfo(`Telnyx configured: ${telnyxConfigured}`);
  logInfo(`Twilio configured: ${twilioConfigured}`);

  if (!telnyxConfigured && !twilioConfigured) {
    logWarning("No SMS service configured");
    logInfo(
      "Set TELNYX_API_KEY or TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN in .env",
    );
    return false;
  }

  logSuccess("SMS service configured");
  return true;
}

/**
 * Test sending a confirmation email
 */
async function testConfirmationEmail(testEmail: string): Promise<boolean> {
  logSection("Testing Confirmation Email");

  const mockAppointment: AppointmentData = {
    id: "test-appointment-1",
    patientId: "test-patient-1",
    patientName: "John Doe",
    patientEmail: testEmail,
    patientPhone: "+15551234567",
    doctorId: "test-doctor-1",
    doctorName: "Dr. Sarah Chen",
    doctorEmail: "doctor@telecheck.com",
    scheduledTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
    type: "video",
    reason: "Test appointment - please disregard",
    notes: "This is a test notification",
    meetingLink: "https://telecheck.com/consultation/TEST123",
    confirmationNumber: "TEST-12345678",
  };

  try {
    logInfo(`Sending test confirmation email to ${testEmail}...`);

    const result =
      await appointmentNotificationService.sendAppointmentCreatedNotifications(
        mockAppointment,
      );

    if (result.success) {
      logSuccess("Confirmation notifications sent successfully");

      if (result.email?.sent) {
        logSuccess(`Email sent: ${result.email.messageId || "N/A"}`);
      } else {
        logError(`Email failed: ${result.email?.error || "Unknown error"}`);
      }

      if (result.sms?.sent) {
        logSuccess(`SMS sent: ${result.sms.messageId || "N/A"}`);
      } else {
        logWarning(`SMS failed: ${result.sms?.error || "Unknown error"}`);
      }

      if (result.errors && result.errors.length > 0) {
        logWarning("Errors encountered:");
        result.errors.forEach((error) => logWarning(`  - ${error}`));
      }

      return true;
    } else {
      logError("Failed to send confirmation notifications");
      if (result.errors) {
        result.errors.forEach((error) => logError(`  - ${error}`));
      }
      return false;
    }
  } catch (error) {
    logError(
      `Error sending confirmation: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return false;
  }
}

/**
 * Test scheduled reminders
 */
async function testScheduledReminders(): Promise<boolean> {
  logSection("Testing Scheduled Reminders");

  try {
    const reminders =
      appointmentNotificationService.getScheduledRemindersStatus();

    if (reminders.length === 0) {
      logWarning("No reminders currently scheduled");
      logInfo(
        "Reminders will be scheduled when you create an appointment in the future",
      );
      return true;
    }

    logSuccess(`Found ${reminders.length} scheduled reminder(s)`);

    reminders.forEach((reminder, index) => {
      logInfo(`\nReminder ${index + 1}:`);
      logInfo(`  Appointment ID: ${reminder.appointmentId}`);
      logInfo(`  Type: ${reminder.type}`);
      logInfo(`  Scheduled for: ${reminder.scheduledTime.toLocaleString()}`);
    });

    return true;
  } catch (error) {
    logError(
      `Error checking reminders: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return false;
  }
}

/**
 * Test cancellation notifications
 */
async function testCancellationNotifications(
  testEmail: string,
): Promise<boolean> {
  logSection("Testing Cancellation Notifications");

  const mockAppointment: AppointmentData = {
    id: "test-appointment-cancel-1",
    patientId: "test-patient-1",
    patientName: "Jane Smith",
    patientEmail: testEmail,
    patientPhone: "+15551234567",
    doctorId: "test-doctor-1",
    doctorName: "Dr. Michael Rodriguez",
    doctorEmail: "doctor@telecheck.com",
    scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    type: "video",
    reason: "Test cancellation - please disregard",
  };

  try {
    logInfo(`Sending test cancellation notification to ${testEmail}...`);

    const result =
      await appointmentNotificationService.sendAppointmentCancelledNotifications(
        mockAppointment,
      );

    if (result.success) {
      logSuccess("Cancellation notifications sent successfully");

      if (result.email?.sent) {
        logSuccess("Email sent");
      }

      if (result.sms?.sent) {
        logSuccess("SMS sent");
      }

      return true;
    } else {
      logError("Failed to send cancellation notifications");
      if (result.errors) {
        result.errors.forEach((error) => logError(`  - ${error}`));
      }
      return false;
    }
  } catch (error) {
    logError(
      `Error sending cancellation: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return false;
  }
}

/**
 * Display configuration guide
 */
function displayConfigurationGuide() {
  logSection("Configuration Guide");

  console.log("To test the notification system, configure your .env file:\n");

  log("Email Service (choose one):", "yellow");
  console.log(`
SMTP:
  EMAIL_PROVIDER=smtp
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_SECURE=false
  SMTP_USER=your-email@gmail.com
  SMTP_PASS=your-app-password
  EMAIL_FROM=noreply@telecheck.com

SendGrid:
  EMAIL_PROVIDER=sendgrid
  SENDGRID_API_KEY=your-sendgrid-api-key
  EMAIL_FROM=noreply@telecheck.com

AWS SES:
  EMAIL_PROVIDER=ses
  AWS_ACCESS_KEY_ID=your-aws-access-key
  AWS_SECRET_ACCESS_KEY=your-aws-secret-key
  AWS_REGION=us-east-1
  EMAIL_FROM=noreply@telecheck.com
`);

  log("SMS Service:", "yellow");
  console.log(`
Telnyx:
  TELNYX_API_KEY=your-telnyx-api-key
  TELNYX_PHONE_NUMBER=+1234567890

Twilio:
  TWILIO_ACCOUNT_SID=your-twilio-account-sid
  TWILIO_AUTH_TOKEN=your-twilio-auth-token
  TWILIO_PHONE_NUMBER=+1234567890
`);

  log("Application Settings:", "yellow");
  console.log(`
  APP_URL=https://yourdomain.com
  CLINIC_PHONE=(555) 123-4567
`);
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("\n");
  log("╔════════════════════════════════════════════════════════════╗", "cyan");
  log("║    Appointment Notification System - Test Suite           ║", "cyan");
  log("╚════════════════════════════════════════════════════════════╝", "cyan");
  console.log("\n");

  // Check for test email argument
  const testEmail = process.argv[2];

  if (!testEmail) {
    logWarning("No test email provided");
    logInfo("Usage: tsx scripts/test-appointment-notifications.ts <email>");
    logInfo(
      "Example: tsx scripts/test-appointment-notifications.ts test@example.com",
    );
    console.log("\n");
    displayConfigurationGuide();
    process.exit(1);
  }

  logInfo(`Using test email: ${testEmail}\n`);

  const results = {
    emailService: false,
    smsService: false,
    confirmationEmail: false,
    scheduledReminders: false,
    cancellationNotifications: false,
  };

  // Run tests
  results.emailService = await testEmailService();
  results.smsService = await testSMSService();

  if (results.emailService || results.smsService) {
    results.confirmationEmail = await testConfirmationEmail(testEmail);
    results.scheduledReminders = await testScheduledReminders();
    results.cancellationNotifications =
      await testCancellationNotifications(testEmail);
  } else {
    logWarning("\nSkipping notification tests - services not configured");
    displayConfigurationGuide();
  }

  // Summary
  logSection("Test Summary");

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter((r) => r).length;
  const failedTests = totalTests - passedTests;

  console.log(`Total Tests: ${totalTests}`);
  logSuccess(`Passed: ${passedTests}`);
  if (failedTests > 0) {
    logError(`Failed: ${failedTests}`);
  }

  console.log("\nDetailed Results:");
  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? "✓" : "✗";
    const color = passed ? "green" : "red";
    log(`  ${icon} ${test}`, color);
  });

  console.log("\n");

  if (passedTests === totalTests) {
    logSuccess("All tests passed! 🎉");
    process.exit(0);
  } else {
    logError("Some tests failed. Please check the configuration.");
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError(
    `\nFatal error: ${error instanceof Error ? error.message : "Unknown error"}`,
  );
  console.error(error);
  process.exit(1);
});
