/**
 * Appointments API Routes
 *
 * Handles CRUD operations for appointments with integrated notifications
 */

import { Router, Request, Response } from "express";
import prisma from "../config/prisma";
import { AppointmentStatus, AppointmentType, UserRole } from "@prisma/client";
import {
  appointmentNotificationService,
  AppointmentData,
} from "../utils/appointmentNotificationService";
import { v4 as uuidv4 } from "uuid";

const router = Router();

/**
 * POST /api/appointments
 *
 * Create a new appointment
 */
router.post("/", async (req: Request, res: Response) => {
  const {
    patientId,
    doctorId,
    scheduledTime,
    type = "video",
    reason,
    notes,
  } = req.body;

  try {
    // Validate required fields
    if (!patientId || !doctorId || !scheduledTime) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "patientId, doctorId, and scheduledTime are required",
      });
    }

    // Verify patient exists and is a patient
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return res.status(404).json({
        error: "Patient not found",
        message: `No user found with ID: ${patientId}`,
      });
    }

    if (patient.role !== UserRole.PATIENT) {
      return res.status(400).json({
        error: "Invalid patient",
        message: "User must have PATIENT role",
      });
    }

    // Verify doctor exists and is a doctor
    const doctor = await prisma.user.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return res.status(404).json({
        error: "Doctor not found",
        message: `No user found with ID: ${doctorId}`,
      });
    }

    if (doctor.role !== UserRole.DOCTOR) {
      return res.status(400).json({
        error: "Invalid doctor",
        message: "User must have DOCTOR role",
      });
    }

    // Generate confirmation number
    const confirmationNumber = `APPT-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Generate meeting link for video appointments
    let meetingLink: string | undefined;
    if (type === "video") {
      meetingLink = `${process.env.APP_URL || "https://telecheck.com"}/consultation/${confirmationNumber}`;
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        scheduledTime: new Date(scheduledTime),
        type: type as AppointmentType,
        status: AppointmentStatus.pending,
        reason,
        notes,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Send notifications asynchronously (non-blocking)
    // This ensures appointment creation succeeds even if notifications fail
    const appointmentData: AppointmentData = {
      id: appointment.id,
      patientId: appointment.patientId,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientEmail: patient.email,
      patientPhone: patient.phone || "",
      doctorId: appointment.doctorId,
      doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
      doctorEmail: doctor.email,
      doctorPhone: doctor.phone || undefined,
      scheduledTime: appointment.scheduledTime,
      type: appointment.type as "video" | "phone" | "in_person",
      reason: appointment.reason || undefined,
      notes: appointment.notes || undefined,
      meetingLink,
      confirmationNumber,
    };

    // Send notifications in background (don't await)
    appointmentNotificationService
      .sendAppointmentCreatedNotifications(appointmentData)
      .then((result) => {
        console.log(
          `📧 Notifications sent for appointment ${appointment.id}:`,
          result,
        );
      })
      .catch((error) => {
        console.error(
          `❌ Error sending notifications for appointment ${appointment.id}:`,
          error,
        );
      });

    // Return appointment with additional metadata
    res.status(201).json({
      ...appointment,
      confirmationNumber,
      meetingLink,
      notificationStatus: "pending", // Notifications are being sent asynchronously
    });
  } catch (error) {
    console.error("Failed to create appointment:", error);
    res.status(500).json({
      error: "Failed to create appointment",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

/**
 * GET /api/appointments/:id
 *
 * Get appointment by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        doctor: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        videoConsultation: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        error: "Appointment not found",
        message: `No appointment found with ID: ${id}`,
      });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Failed to get appointment:", error);
    res.status(500).json({
      error: "Failed to get appointment",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

/**
 * GET /api/appointments
 *
 * List appointments with optional filters
 */
router.get("/", async (req: Request, res: Response) => {
  const {
    patientId,
    doctorId,
    status,
    type,
    startDate,
    endDate,
    limit = "50",
    offset = "0",
  } = req.query;

  try {
    const where: any = {};

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.scheduledTime = {};
      if (startDate) {
        where.scheduledTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.scheduledTime.lte = new Date(endDate as string);
      }
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          doctor: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          videoConsultation: {
            select: {
              id: true,
              status: true,
              startedAt: true,
              endedAt: true,
              duration: true,
            },
          },
        },
        orderBy: {
          scheduledTime: "asc",
        },
        take: parseInt(limit as string),
        skip: parseInt(offset as string),
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      appointments,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    console.error("Failed to list appointments:", error);
    res.status(500).json({
      error: "Failed to list appointments",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

/**
 * PATCH /api/appointments/:id
 *
 * Update appointment
 */
router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { scheduledTime, type, status, reason, notes } = req.body;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      return res.status(404).json({
        error: "Appointment not found",
        message: `No appointment found with ID: ${id}`,
      });
    }

    const updateData: any = {};

    if (scheduledTime) {
      updateData.scheduledTime = new Date(scheduledTime);
    }

    if (type) {
      updateData.type = type;
    }

    if (status) {
      updateData.status = status;
    }

    if (reason !== undefined) {
      updateData.reason = reason;
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        patient: true,
        doctor: true,
        videoConsultation: true,
      },
    });

    res.json(updatedAppointment);
  } catch (error) {
    console.error("Failed to update appointment:", error);
    res.status(500).json({
      error: "Failed to update appointment",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

/**
 * DELETE /api/appointments/:id
 *
 * Cancel/delete appointment
 */
router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        videoConsultation: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        error: "Appointment not found",
        message: `No appointment found with ID: ${id}`,
      });
    }

    // If appointment is active or completed, only allow cancellation
    if (
      appointment.status === AppointmentStatus.active ||
      appointment.status === AppointmentStatus.completed
    ) {
      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          status: AppointmentStatus.cancelled,
        },
        include: {
          patient: true,
          doctor: true,
        },
      });

      // Send cancellation notifications asynchronously
      const patient = updated.patient;
      const doctor = updated.doctor;

      const appointmentData: AppointmentData = {
        id: updated.id,
        patientId: updated.patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientEmail: patient.email,
        patientPhone: patient.phone || "",
        doctorId: updated.doctorId,
        doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        doctorEmail: doctor.email,
        doctorPhone: doctor.phone || undefined,
        scheduledTime: updated.scheduledTime,
        type: updated.type as "video" | "phone" | "in_person",
        reason: updated.reason || undefined,
        notes: updated.notes || undefined,
      };

      appointmentNotificationService
        .sendAppointmentCancelledNotifications(appointmentData)
        .then((result) => {
          console.log(
            `📧 Cancellation notifications sent for appointment ${updated.id}:`,
            result,
          );
        })
        .catch((error) => {
          console.error(
            `❌ Error sending cancellation notifications for appointment ${updated.id}:`,
            error,
          );
        });

      return res.json({
        success: true,
        message: "Appointment cancelled",
        appointment: updated,
      });
    }

    // Get patient and doctor data before deleting
    const patientForNotification = await prisma.user.findUnique({
      where: { id: appointment.patientId },
    });
    const doctorForNotification = await prisma.user.findUnique({
      where: { id: appointment.doctorId },
    });

    // Otherwise delete the appointment
    await prisma.appointment.delete({
      where: { id },
    });

    // Send cancellation notifications for deleted appointments too
    if (patientForNotification && doctorForNotification) {
      const appointmentData: AppointmentData = {
        id: appointment.id,
        patientId: appointment.patientId,
        patientName: `${patientForNotification.firstName} ${patientForNotification.lastName}`,
        patientEmail: patientForNotification.email,
        patientPhone: patientForNotification.phone || "",
        doctorId: appointment.doctorId,
        doctorName: `Dr. ${doctorForNotification.firstName} ${doctorForNotification.lastName}`,
        doctorEmail: doctorForNotification.email,
        doctorPhone: doctorForNotification.phone || undefined,
        scheduledTime: appointment.scheduledTime,
        type: appointment.type as "video" | "phone" | "in_person",
        reason: appointment.reason || undefined,
        notes: appointment.notes || undefined,
      };

      appointmentNotificationService
        .sendAppointmentCancelledNotifications(appointmentData)
        .catch((error) => {
          console.error(
            `❌ Error sending cancellation notifications for deleted appointment ${appointment.id}:`,
            error,
          );
        });
    }

    res.json({
      success: true,
      message: "Appointment deleted",
    });
  } catch (error) {
    console.error("Failed to delete appointment:", error);
    res.status(500).json({
      error: "Failed to delete appointment",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

/**
 * POST /api/appointments/:id/start
 *
 * Mark appointment as active/started
 */
router.post("/:id/start", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        videoConsultation: true,
      },
    });

    if (!appointment) {
      return res.status(404).json({
        error: "Appointment not found",
        message: `No appointment found with ID: ${id}`,
      });
    }

    // Update appointment status
    await prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.active,
      },
    });

    // Update video consultation if exists
    if (appointment.videoConsultation) {
      await prisma.videoConsultation.update({
        where: { id: appointment.videoConsultation.id },
        data: {
          status: "active",
          startedAt: new Date(),
        },
      });
    }

    res.json({
      success: true,
      message: "Appointment started",
    });
  } catch (error) {
    console.error("Failed to start appointment:", error);
    res.status(500).json({
      error: "Failed to start appointment",
      message:
        error instanceof Error ? error.message : "Unknown error occurred",
    });
  }
});

export default router;
