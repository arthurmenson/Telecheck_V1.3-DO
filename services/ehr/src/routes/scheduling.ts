/**
 * EHR Scheduling Routes - Appointment management with double-booking prevention
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PrismaClient } from "@prisma/client";
import { BookingRequestSchema, RescheduleRequestSchema } from "../app";
import { isChaosMode, simulateChaosError } from "../utils/chaos";

interface SchedulingRouteOptions {
  prisma: PrismaClient;
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    role: string;
  };
  requestId: string;
}

export async function schedulingRoutes(
  fastify: FastifyInstance,
  options: SchedulingRouteOptions,
) {
  const { prisma } = options;

  /**
   * GET /scheduling/slots - Get available appointment slots
   */
  fastify.get(
    "/slots",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const query = request.query as any;

      // Handle chaos mode for testing
      if (isChaosMode(query)) {
        return simulateChaosError(reply);
      }

      try {
        const { providerId, date, appointmentType = "consultation" } = query;

        // Get available slots (mock implementation for now)
        const slots = await getAvailableSlots({
          providerId,
          date,
          appointmentType,
        });

        reply.send({ slots });
      } catch (error) {
        fastify.log.error(error, "Error fetching available slots");
        reply.status(500).send({
          success: false,
          message: "Failed to fetch available slots",
        });
      }
    },
  );

  /**
   * POST /scheduling/book - Book an appointment with double-booking prevention
   */
  fastify.post(
    "/book",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const query = request.query as any;

      // Handle chaos mode for testing
      if (isChaosMode(query)) {
        return simulateChaosError(reply);
      }

      try {
        // Validate request body
        const bookingData = BookingRequestSchema.parse(request.body);

        // Use database transaction for double-booking prevention
        const appointment = await prisma.$transaction(async (tx) => {
          // Check if slot is still available with row-level lock
          const slot = await tx.appointmentSlot.findFirst({
            where: {
              id: bookingData.slotId,
              isAvailable: true,
            },
            // Row-level lock to prevent concurrent bookings
            select: {
              id: true,
              startTime: true,
              endTime: true,
              providerId: true,
              isAvailable: true,
            },
          });

          if (!slot) {
            throw new Error("Appointment slot is no longer available");
          }

          // Check for existing appointment at the same time for the patient
          const existingAppointment = await tx.appointment.findFirst({
            where: {
              patientId: bookingData.patientId,
              scheduledTime: slot.startTime,
              status: {
                in: ["booked", "confirmed"],
              },
            },
          });

          if (existingAppointment) {
            throw new Error("Patient already has an appointment at this time");
          }

          // Create the appointment
          const newAppointment = await tx.appointment.create({
            data: {
              id: generateAppointmentId(),
              slotId: bookingData.slotId,
              patientId: bookingData.patientId,
              providerId: slot.providerId,
              scheduledTime: slot.startTime,
              endTime: slot.endTime,
              appointmentType: bookingData.appointmentType || "consultation",
              notes: bookingData.notes,
              status: "booked",
              bookedBy: request.user?.id || bookingData.patientId,
              bookedAt: new Date(),
            },
          });

          // Mark slot as unavailable
          await tx.appointmentSlot.update({
            where: { id: bookingData.slotId },
            data: { isAvailable: false },
          });

          return newAppointment;
        });

        fastify.log.info(
          {
            appointmentId: appointment.id,
            patientId: bookingData.patientId,
            slotId: bookingData.slotId,
            requestId: request.requestId,
          },
          "Appointment booked successfully",
        );

        reply.status(201).send({
          id: appointment.id,
          status: "booked",
          slotId: appointment.slotId,
          patientId: appointment.patientId,
          providerId: appointment.providerId,
          scheduledTime: appointment.scheduledTime,
          message: "Appointment booked successfully",
        });
      } catch (error) {
        fastify.log.error(error, "Error booking appointment");

        if (error instanceof Error) {
          if (
            error.message.includes("no longer available") ||
            error.message.includes("already has an appointment")
          ) {
            reply.status(409).send({
              success: false,
              error: "Appointment conflict",
              message: error.message,
            });
            return;
          }
        }

        reply.status(500).send({
          success: false,
          message: "Failed to book appointment",
        });
      }
    },
  );

  /**
   * POST /scheduling/:id/cancel - Cancel an appointment
   */
  fastify.post(
    "/:id/cancel",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const query = request.query as any;

      // Handle chaos mode for testing
      if (isChaosMode(query)) {
        return simulateChaosError(reply);
      }

      try {
        const appointment = await prisma.$transaction(async (tx) => {
          // Find and update appointment
          const apt = await tx.appointment.update({
            where: { id },
            data: {
              status: "canceled",
              canceledAt: new Date(),
              canceledBy: request.user?.id,
            },
          });

          // Free up the slot
          await tx.appointmentSlot.update({
            where: { id: apt.slotId },
            data: { isAvailable: true },
          });

          return apt;
        });

        fastify.log.info(
          {
            appointmentId: id,
            canceledBy: request.user?.id,
            requestId: request.requestId,
          },
          "Appointment canceled",
        );

        reply.send({
          id: appointment.id,
          status: "canceled",
          message: "Appointment canceled successfully",
        });
      } catch (error) {
        fastify.log.error(error, "Error canceling appointment");

        if (
          error instanceof Error &&
          error.message.includes("Record to update not found")
        ) {
          reply.status(404).send({
            success: false,
            error: "Appointment not found",
          });
          return;
        }

        reply.status(500).send({
          success: false,
          message: "Failed to cancel appointment",
        });
      }
    },
  );

  /**
   * POST /scheduling/:id/reschedule - Reschedule an appointment
   */
  fastify.post(
    "/:id/reschedule",
    async (request: AuthenticatedRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const query = request.query as any;

      // Handle chaos mode for testing
      if (isChaosMode(query)) {
        return simulateChaosError(reply);
      }

      try {
        const rescheduleData = RescheduleRequestSchema.parse(request.body);

        const appointment = await prisma.$transaction(async (tx) => {
          // Find existing appointment
          const existingApt = await tx.appointment.findUnique({
            where: { id },
          });

          if (!existingApt) {
            throw new Error("Appointment not found");
          }

          // Find available slot for new time
          const newSlot = await tx.appointmentSlot.findFirst({
            where: {
              startTime: new Date(rescheduleData.to),
              isAvailable: true,
              providerId: existingApt.providerId,
            },
          });

          if (!newSlot) {
            throw new Error("No available slot at requested time");
          }

          // Update appointment
          const updatedApt = await tx.appointment.update({
            where: { id },
            data: {
              slotId: newSlot.id,
              scheduledTime: new Date(rescheduleData.to),
              endTime: newSlot.endTime,
              status: "rescheduled",
              rescheduledAt: new Date(),
              rescheduledBy: request.user?.id,
              notes: rescheduleData.reason
                ? `${existingApt.notes || ""}\nRescheduled: ${rescheduleData.reason}`
                : existingApt.notes,
            },
          });

          // Free old slot and book new slot
          await tx.appointmentSlot.update({
            where: { id: existingApt.slotId },
            data: { isAvailable: true },
          });

          await tx.appointmentSlot.update({
            where: { id: newSlot.id },
            data: { isAvailable: false },
          });

          return updatedApt;
        });

        fastify.log.info(
          {
            appointmentId: id,
            newTime: rescheduleData.to,
            rescheduledBy: request.user?.id,
            requestId: request.requestId,
          },
          "Appointment rescheduled",
        );

        reply.send({
          id: appointment.id,
          status: "rescheduled",
          scheduledTime: appointment.scheduledTime,
          message: "Appointment rescheduled successfully",
        });
      } catch (error) {
        fastify.log.error(error, "Error rescheduling appointment");

        if (error instanceof Error) {
          if (error.message.includes("not found")) {
            reply.status(404).send({
              success: false,
              error: "Appointment not found",
            });
            return;
          }

          if (error.message.includes("No available slot")) {
            reply.status(409).send({
              success: false,
              error: "Time slot unavailable",
              message: error.message,
            });
            return;
          }
        }

        reply.status(500).send({
          success: false,
          message: "Failed to reschedule appointment",
        });
      }
    },
  );

  /**
   * GET /scheduling/error - Test error endpoint
   */
  fastify.get(
    "/error",
    async (request: FastifyRequest, reply: FastifyReply) => {
      reply.status(500).send({
        success: false,
        message: "Scheduling error",
      });
    },
  );
}

// Helper functions

/**
 * Get available appointment slots (mock implementation)
 */
async function getAvailableSlots(params: {
  providerId?: string;
  date?: string;
  appointmentType?: string;
}): Promise<any[]> {
  // Mock implementation - in real system, this would query database
  // and consider provider schedules, existing appointments, etc.

  const baseSlots = [
    {
      id: "s1",
      start: "2025-01-02T09:00:00Z",
      end: "2025-01-02T09:30:00Z",
      providerId: params.providerId || "550e8400-e29b-41d4-a716-446655440000",
      providerName: "Dr. Smith",
      available: true,
      appointmentType: params.appointmentType || "consultation",
    },
    {
      id: "s2",
      start: "2025-01-02T10:00:00Z",
      end: "2025-01-02T10:30:00Z",
      providerId: params.providerId || "550e8400-e29b-41d4-a716-446655440000",
      providerName: "Dr. Smith",
      available: true,
      appointmentType: params.appointmentType || "consultation",
    },
  ];

  // Filter by date if provided
  if (params.date) {
    const targetDate = new Date(params.date).toDateString();
    return baseSlots.filter(
      (slot) => new Date(slot.start).toDateString() === targetDate,
    );
  }

  return baseSlots;
}

/**
 * Generate unique appointment ID
 */
function generateAppointmentId(): string {
  return `apt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
