/**
 * Patient Summary Service
 *
 * Generates and sends patient consultation summaries via email and in-app.
 *
 * @module services/summaryService
 */

import prisma from "../config/prisma";
import { sendConsultationSummary } from "./emailService";

/**
 * Generate patient consultation summary HTML
 *
 * @param appointmentId - Appointment ID
 * @returns Promise resolving to summary HTML and plain text
 */
export async function generateConsultationSummary(
  appointmentId: string,
): Promise<{
  html: string;
  text: string;
}> {
  // Get appointment with all related data
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      doctor: true,
      videoConsultation: true,
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // Get consultation note
  const note = await prisma.consultationNote.findFirst({
    where: { appointmentId },
  });

  if (!note) {
    throw new Error("Consultation note not found");
  }

  // Parse diagnosis codes
  const diagnosisCodes = (note.diagnosisCodes as any) || [];
  const prescriptionIds = (note.prescriptionIds as any) || [];

  // Generate HTML summary
  const html = generateSummaryHtml(appointment, note, diagnosisCodes);

  // Generate plain text summary
  const text = generateSummaryText(appointment, note, diagnosisCodes);

  return { html, text };
}

/**
 * Create and send patient consultation summary
 *
 * @param appointmentId - Appointment ID
 * @returns Promise resolving to summary record
 */
export async function createAndSendSummary(
  appointmentId: string,
): Promise<any> {
  // Check if summary already exists
  const existingSummary = await prisma.patientConsultationSummary.findUnique({
    where: { appointmentId },
  });

  if (existingSummary && existingSummary.emailSent) {
    throw new Error("Summary has already been sent to patient");
  }

  // Get appointment details
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      patient: true,
      doctor: true,
    },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  // Generate summary
  const { html, text } = await generateConsultationSummary(appointmentId);

  // Save summary to database
  const summary = await prisma.patientConsultationSummary.upsert({
    where: { appointmentId },
    create: {
      appointmentId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      summaryHtml: html,
      summaryPlainText: text,
      emailSent: false,
    },
    update: {
      summaryHtml: html,
      summaryPlainText: text,
    },
  });

  // Send email to patient
  try {
    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
    await sendConsultationSummary(
      appointment.patient.email,
      patientName,
      html,
      text,
      appointmentId,
    );

    // Update summary record to mark as sent
    await prisma.patientConsultationSummary.update({
      where: { id: summary.id },
      data: {
        emailSent: true,
        emailSentAt: new Date(),
      },
    });
  } catch (error) {
    console.error("[SUMMARY] Failed to send email:", error);
    // Don't throw - summary is saved even if email fails
  }

  return summary;
}

/**
 * Get patient consultation summary
 *
 * @param appointmentId - Appointment ID
 * @param patientId - Patient ID (for authorization)
 * @returns Promise resolving to summary
 */
export async function getPatientSummary(
  appointmentId: string,
  patientId: string,
): Promise<any> {
  const summary = await prisma.patientConsultationSummary.findUnique({
    where: { appointmentId },
  });

  if (!summary) {
    throw new Error("Summary not found");
  }

  // Verify patient authorization
  if (summary.patientId !== patientId) {
    throw new Error("Unauthorized to view this summary");
  }

  // Mark as viewed if not already
  if (!summary.viewedByPatient) {
    await prisma.patientConsultationSummary.update({
      where: { id: summary.id },
      data: {
        viewedByPatient: true,
        viewedAt: new Date(),
      },
    });
  }

  return summary;
}

/**
 * Generate summary HTML template
 */
function generateSummaryHtml(
  appointment: any,
  note: any,
  diagnosisCodes: any[],
): string {
  const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  const doctorName = `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
  const consultationDate = new Date(
    appointment.scheduledTime,
  ).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const consultationTime = new Date(
    appointment.scheduledTime,
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultation Summary</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9fafb;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0;
      opacity: 0.9;
    }
    .content {
      padding: 30px;
    }
    .section {
      margin-bottom: 25px;
      padding-bottom: 20px;
      border-bottom: 1px solid #e5e7eb;
    }
    .section:last-child {
      border-bottom: none;
    }
    .section h2 {
      color: #1f2937;
      font-size: 18px;
      font-weight: 600;
      margin: 0 0 12px;
      display: flex;
      align-items: center;
    }
    .section h2::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 18px;
      background-color: #2563eb;
      margin-right: 10px;
      border-radius: 2px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-top: 15px;
    }
    .info-item {
      background-color: #f9fafb;
      padding: 12px 15px;
      border-radius: 6px;
    }
    .info-item label {
      display: block;
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 600;
      margin-bottom: 4px;
      letter-spacing: 0.5px;
    }
    .info-item value {
      display: block;
      font-size: 15px;
      color: #1f2937;
      font-weight: 500;
    }
    .diagnosis-list {
      list-style: none;
      padding: 0;
      margin: 10px 0;
    }
    .diagnosis-item {
      background-color: #eff6ff;
      border-left: 3px solid #2563eb;
      padding: 12px 15px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .diagnosis-code {
      font-weight: 600;
      color: #2563eb;
      font-family: 'Courier New', monospace;
    }
    .prescription-list {
      background-color: #f0fdf4;
      border-left: 3px solid #059669;
      padding: 15px;
      border-radius: 4px;
      margin: 10px 0;
    }
    .alert {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .alert strong {
      color: #92400e;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      font-size: 13px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
    @media print {
      body { background-color: white; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Consultation Summary</h1>
      <p>Telecheck Video Consultation</p>
    </div>

    <div class="content">
      <!-- Consultation Information -->
      <div class="section">
        <h2>Consultation Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Patient</label>
            <value>${patientName}</value>
          </div>
          <div class="info-item">
            <label>Provider</label>
            <value>${doctorName}</value>
          </div>
          <div class="info-item">
            <label>Date</label>
            <value>${consultationDate}</value>
          </div>
          <div class="info-item">
            <label>Time</label>
            <value>${consultationTime}</value>
          </div>
        </div>
      </div>

      ${
        note.chiefComplaint
          ? `
      <!-- Chief Complaint -->
      <div class="section">
        <h2>Reason for Visit</h2>
        <p>${escapeHtml(note.chiefComplaint)}</p>
      </div>
      `
          : ""
      }

      ${
        note.assessment
          ? `
      <!-- Assessment -->
      <div class="section">
        <h2>Assessment & Findings</h2>
        <p>${escapeHtml(note.assessment)}</p>
      </div>
      `
          : ""
      }

      ${
        diagnosisCodes.length > 0
          ? `
      <!-- Diagnosis -->
      <div class="section">
        <h2>Diagnosis</h2>
        <ul class="diagnosis-list">
          ${diagnosisCodes
            .map(
              (dx: any) => `
            <li class="diagnosis-item">
              <span class="diagnosis-code">${dx.code}</span> - ${escapeHtml(dx.description)}
            </li>
          `,
            )
            .join("")}
        </ul>
      </div>
      `
          : ""
      }

      ${
        note.treatmentPlan
          ? `
      <!-- Treatment Plan -->
      <div class="section">
        <h2>Treatment Plan</h2>
        <p>${escapeHtml(note.treatmentPlan)}</p>
      </div>
      `
          : ""
      }

      ${
        note.prescriptionIds && note.prescriptionIds.length > 0
          ? `
      <!-- Prescriptions -->
      <div class="section">
        <h2>Prescriptions</h2>
        <div class="prescription-list">
          <p><strong>Prescriptions have been sent electronically to your pharmacy.</strong></p>
          <p>Please contact your pharmacy to confirm receipt and arrange pickup or delivery.</p>
        </div>
      </div>
      `
          : ""
      }

      ${
        note.followUpInstructions
          ? `
      <!-- Follow-up Instructions -->
      <div class="section">
        <h2>Follow-up Instructions</h2>
        <p>${escapeHtml(note.followUpInstructions)}</p>
      </div>
      `
          : ""
      }

      ${
        note.followUpDate
          ? `
      <!-- Next Appointment -->
      <div class="section">
        <h2>Next Appointment</h2>
        <div class="info-item">
          <label>Scheduled for</label>
          <value>${new Date(note.followUpDate).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}</value>
        </div>
        ${note.followUpType ? `<p>Type: ${note.followUpType}</p>` : ""}
      </div>
      `
          : ""
      }

      <!-- Important Notice -->
      <div class="alert">
        <strong>Important:</strong> If your symptoms worsen or you experience any concerning changes, please seek immediate medical attention or call 911 for emergencies.
      </div>
    </div>

    <div class="footer">
      <p>This is a confidential medical summary. Please keep it in a secure location.</p>
      <p>For questions about your care, please contact your provider through the <a href="${process.env.APP_URL || "https://telecheck.health"}">Telecheck patient portal</a>.</p>
      <p>&copy; ${new Date().getFullYear()} Telecheck. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Generate plain text summary
 */
function generateSummaryText(
  appointment: any,
  note: any,
  diagnosisCodes: any[],
): string {
  const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`;
  const doctorName = `Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`;
  const consultationDate = new Date(appointment.scheduledTime).toLocaleString();

  let text = `
CONSULTATION SUMMARY
Telecheck Video Consultation

CONSULTATION INFORMATION
Patient: ${patientName}
Provider: ${doctorName}
Date: ${consultationDate}

`;

  if (note.chiefComplaint) {
    text += `REASON FOR VISIT\n${note.chiefComplaint}\n\n`;
  }

  if (note.assessment) {
    text += `ASSESSMENT & FINDINGS\n${note.assessment}\n\n`;
  }

  if (diagnosisCodes.length > 0) {
    text += `DIAGNOSIS\n`;
    diagnosisCodes.forEach((dx: any) => {
      text += `- ${dx.code}: ${dx.description}\n`;
    });
    text += "\n";
  }

  if (note.treatmentPlan) {
    text += `TREATMENT PLAN\n${note.treatmentPlan}\n\n`;
  }

  if (note.prescriptionIds && note.prescriptionIds.length > 0) {
    text += `PRESCRIPTIONS\nPrescriptions have been sent electronically to your pharmacy.\nPlease contact your pharmacy to confirm receipt and arrange pickup or delivery.\n\n`;
  }

  if (note.followUpInstructions) {
    text += `FOLLOW-UP INSTRUCTIONS\n${note.followUpInstructions}\n\n`;
  }

  if (note.followUpDate) {
    text += `NEXT APPOINTMENT\nScheduled for: ${new Date(note.followUpDate).toLocaleString()}\n`;
    if (note.followUpType) {
      text += `Type: ${note.followUpType}\n`;
    }
    text += "\n";
  }

  text += `IMPORTANT: If your symptoms worsen or you experience any concerning changes, please seek immediate medical attention or call 911 for emergencies.\n\n`;
  text += `This is a confidential medical summary. Please keep it in a secure location.\n`;
  text += `For questions about your care, please contact your provider through the Telecheck patient portal.\n`;

  return text.trim();
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export default {
  generateConsultationSummary,
  createAndSendSummary,
  getPatientSummary,
};
