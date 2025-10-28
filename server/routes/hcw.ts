/**
 * HCW@Home Care Team Routes
 * Handles patient-caregiver interactions, visits, messages, and care plans
 * USES REAL DATABASE QUERIES - NO MOCK DATA
 */

import express, { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma";

const router = express.Router();

// Middleware to extract user from request (assuming auth middleware sets req.user)
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

// ========================================
// VALIDATION SCHEMAS
// ========================================

const sendMessageSchema = z.object({
  recipientId: z.string().min(1, "Recipient ID is required"),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(5000, "Message content is too long"),
  messageType: z
    .enum(["text", "voice", "video_request", "system"])
    .optional()
    .default("text"),
  priority: z.enum(["normal", "urgent", "high"]).optional().default("normal"),
});

const cancelVisitSchema = z.object({
  cancellationReason: z
    .string()
    .min(1, "Cancellation reason is required")
    .max(500, "Reason is too long"),
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get patient ID from user ID
 * Ensures the user is a patient and authorized
 */
async function getPatientId(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "PATIENT") {
    throw new Error("User is not a patient");
  }

  return user.id;
}

/**
 * Verify patient owns the resource
 */
async function verifyPatientOwnership(
  patientId: string,
  userId: string,
): Promise<void> {
  if (patientId !== userId) {
    throw new Error("Unauthorized access to patient data");
  }
}

// ========================================
// ROUTE HANDLERS
// ========================================

/**
 * GET /api/hcw/assigned-caregivers
 * Get all caregivers assigned to the current patient
 */
router.get("/assigned-caregivers", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Verify user is a patient
    const patientId = await getPatientId(userId);

    // Query assignments with caregiver and user details
    const assignments = await prisma.hCWAssignment.findMany({
      where: {
        patientId,
        status: "active",
      },
      include: {
        caregiver: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isPrimary: "desc" }, // Primary caregivers first
        { assignedAt: "desc" },
      ],
    });

    // Transform data to match frontend expectations
    const caregivers = assignments.map((assignment) => ({
      id: assignment.caregiver.id,
      userId: assignment.caregiver.userId,
      firstName: assignment.caregiver.user.firstName,
      lastName: assignment.caregiver.user.lastName,
      specialty: assignment.caregiver.specialty,
      credentials: assignment.caregiver.credentials,
      bio: assignment.caregiver.bio,
      phoneNumber:
        assignment.caregiver.phoneNumber || assignment.caregiver.user.phone,
      email: assignment.caregiver.email || assignment.caregiver.user.email,
      isActive: assignment.caregiver.isActive,
      isPrimary: assignment.isPrimary,
      assignmentType: assignment.assignmentType,
      assignedAt: assignment.assignedAt,
      // Note: rating and reviewCount would come from a reviews table if implemented
      rating: 0,
      reviewCount: 0,
    }));

    res.json({ caregivers });
  } catch (error: any) {
    console.error("Error fetching caregivers:", error);

    if (
      error.message === "User not found" ||
      error.message === "User is not a patient"
    ) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to fetch caregivers" });
  }
});

/**
 * GET /api/hcw/messages
 * Get all message threads for the current patient
 */
router.get("/messages", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const patientId = await getPatientId(userId);

    // Get all messages where patient is sender or recipient
    const messages = await prisma.hCWMessage.findMany({
      where: {
        OR: [
          { senderId: patientId, senderType: "patient" },
          { recipientId: patientId, recipientType: "patient" },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            caregiverProfile: {
              select: {
                specialty: true,
              },
            },
          },
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            caregiverProfile: {
              select: {
                specialty: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Group messages by caregiver to create threads
    const threadsMap = new Map<string, any>();

    for (const message of messages) {
      // Determine the caregiver ID (the other person in the conversation)
      const caregiverId =
        message.senderId === patientId ? message.recipientId : message.senderId;
      const caregiver =
        message.senderId === patientId ? message.recipient : message.sender;

      if (!threadsMap.has(caregiverId)) {
        threadsMap.set(caregiverId, {
          caregiverId,
          caregiverName: `${caregiver.firstName} ${caregiver.lastName}`,
          caregiverSpecialty:
            caregiver.caregiverProfile?.specialty || "Healthcare Provider",
          lastMessage: message.content,
          lastMessageTime: message.createdAt,
          unreadCount: 0,
        });
      }

      // Count unread messages from caregiver to patient
      if (message.recipientId === patientId && !message.isRead) {
        threadsMap.get(caregiverId)!.unreadCount++;
      }
    }

    const threads = Array.from(threadsMap.values()).sort(
      (a, b) =>
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime(),
    );

    res.json({ threads });
  } catch (error: any) {
    console.error("Error fetching messages:", error);

    if (
      error.message === "User not found" ||
      error.message === "User is not a patient"
    ) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/**
 * GET /api/hcw/messages/thread/:caregiverId
 * Get all messages in a thread with a specific caregiver
 */
router.get(
  "/messages/thread/:caregiverId",
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { caregiverId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const patientId = await getPatientId(userId);

      // Verify caregiver exists
      const caregiver = await prisma.user.findUnique({
        where: { id: caregiverId },
        select: { id: true, role: true },
      });

      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver not found" });
      }

      // Get all messages between patient and caregiver
      const messages = await prisma.hCWMessage.findMany({
        where: {
          OR: [
            { senderId: patientId, recipientId: caregiverId },
            { senderId: caregiverId, recipientId: patientId },
          ],
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Mark unread messages from caregiver as read
      await prisma.hCWMessage.updateMany({
        where: {
          senderId: caregiverId,
          recipientId: patientId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      res.json({ messages });
    } catch (error: any) {
      console.error("Error fetching thread:", error);

      if (
        error.message === "User not found" ||
        error.message === "User is not a patient"
      ) {
        return res.status(403).json({ error: error.message });
      }

      res.status(500).json({ error: "Failed to fetch messages" });
    }
  },
);

/**
 * POST /api/hcw/messages/send
 * Send a new message to a caregiver
 */
router.post("/messages/send", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate request body
    const validationResult = sendMessageSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: validationResult.error.errors,
      });
    }

    const { recipientId, content, messageType, priority } =
      validationResult.data;
    const patientId = await getPatientId(userId);

    // Verify recipient exists and is a caregiver
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, role: true },
    });

    if (!recipient) {
      return res.status(404).json({ error: "Recipient not found" });
    }

    // Verify there's an active assignment between patient and caregiver
    const assignment = await prisma.hCWAssignment.findFirst({
      where: {
        patientId,
        caregiver: {
          userId: recipientId,
        },
        status: "active",
      },
    });

    if (!assignment) {
      return res
        .status(403)
        .json({ error: "No active assignment with this caregiver" });
    }

    // Create the message
    const message = await prisma.hCWMessage.create({
      data: {
        senderId: patientId,
        senderType: "patient",
        recipientId,
        recipientType: "caregiver",
        content,
        messageType: messageType || "text",
        priority: priority || "normal",
        isRead: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({ message });
  } catch (error: any) {
    console.error("Error sending message:", error);

    if (
      error.message === "User not found" ||
      error.message === "User is not a patient"
    ) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to send message" });
  }
});

/**
 * PUT /api/hcw/messages/:messageId/read
 * Mark a message as read
 */
router.put(
  "/messages/:messageId/read",
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { messageId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const patientId = await getPatientId(userId);

      // Verify message exists and user is the recipient
      const message = await prisma.hCWMessage.findUnique({
        where: { id: messageId },
        select: { id: true, recipientId: true, isRead: true },
      });

      if (!message) {
        return res.status(404).json({ error: "Message not found" });
      }

      if (message.recipientId !== patientId) {
        return res
          .status(403)
          .json({ error: "Unauthorized to mark this message as read" });
      }

      if (message.isRead) {
        return res.json({
          success: true,
          messageId,
          readAt: new Date(),
          alreadyRead: true,
        });
      }

      // Mark as read
      const updatedMessage = await prisma.hCWMessage.update({
        where: { id: messageId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
        select: {
          id: true,
          readAt: true,
        },
      });

      res.json({ success: true, messageId, readAt: updatedMessage.readAt });
    } catch (error: any) {
      console.error("Error marking message as read:", error);

      if (
        error.message === "User not found" ||
        error.message === "User is not a patient"
      ) {
        return res.status(403).json({ error: error.message });
      }

      res.status(500).json({ error: "Failed to mark message as read" });
    }
  },
);

/**
 * GET /api/hcw/visits/upcoming
 * Get all upcoming visits for the current patient
 */
router.get("/visits/upcoming", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const patientId = await getPatientId(userId);

    // Query upcoming visits
    const visits = await prisma.hCWVisit.findMany({
      where: {
        patientId,
        scheduledTime: {
          gte: new Date(),
        },
        status: "scheduled",
      },
      include: {
        caregiver: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledTime: "asc",
      },
    });

    // Transform data
    const transformedVisits = visits.map((visit) => ({
      id: visit.id,
      scheduledTime: visit.scheduledTime,
      visitType: visit.visitType,
      purpose: visit.purpose,
      location: visit.location || "Home Visit",
      status: visit.status,
      caregiver: {
        firstName: visit.caregiver.user.firstName,
        lastName: visit.caregiver.user.lastName,
        specialty: visit.caregiver.specialty,
        credentials: visit.caregiver.credentials,
      },
    }));

    res.json({ visits: transformedVisits });
  } catch (error: any) {
    console.error("Error fetching upcoming visits:", error);

    if (
      error.message === "User not found" ||
      error.message === "User is not a patient"
    ) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to fetch visits" });
  }
});

/**
 * GET /api/hcw/visits/history
 * Get visit history for the current patient
 */
router.get("/visits/history", async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const patientId = await getPatientId(userId);

    // Query past visits
    const visits = await prisma.hCWVisit.findMany({
      where: {
        patientId,
        OR: [
          {
            scheduledTime: {
              lt: new Date(),
            },
          },
          {
            status: {
              in: ["completed", "cancelled", "no_show"],
            },
          },
        ],
      },
      include: {
        caregiver: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        scheduledTime: "desc",
      },
      take: 50, // Limit to recent 50 visits
    });

    // Transform data
    const transformedVisits = visits.map((visit) => ({
      id: visit.id,
      scheduledTime: visit.scheduledTime,
      actualStart: visit.actualStart,
      actualEnd: visit.actualEnd,
      visitType: visit.visitType,
      purpose: visit.purpose,
      location: visit.location || "Home Visit",
      status: visit.status,
      rating: visit.rating,
      feedback: visit.feedback,
      notes: visit.notes,
      cancellationReason: visit.cancellationReason,
      caregiver: {
        firstName: visit.caregiver.user.firstName,
        lastName: visit.caregiver.user.lastName,
        specialty: visit.caregiver.specialty,
        credentials: visit.caregiver.credentials,
      },
    }));

    res.json({ visits: transformedVisits });
  } catch (error: any) {
    console.error("Error fetching visit history:", error);

    if (
      error.message === "User not found" ||
      error.message === "User is not a patient"
    ) {
      return res.status(403).json({ error: error.message });
    }

    res.status(500).json({ error: "Failed to fetch visit history" });
  }
});

/**
 * DELETE /api/hcw/visits/:visitId/cancel
 * Cancel a scheduled visit
 */
router.delete(
  "/visits/:visitId/cancel",
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { visitId } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Validate request body
      const validationResult = cancelVisitSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.errors,
        });
      }

      const { cancellationReason } = validationResult.data;
      const patientId = await getPatientId(userId);

      // Verify visit exists and belongs to patient
      const visit = await prisma.hCWVisit.findUnique({
        where: { id: visitId },
        select: {
          id: true,
          patientId: true,
          status: true,
          scheduledTime: true,
        },
      });

      if (!visit) {
        return res.status(404).json({ error: "Visit not found" });
      }

      if (visit.patientId !== patientId) {
        return res
          .status(403)
          .json({ error: "Unauthorized to cancel this visit" });
      }

      if (visit.status !== "scheduled") {
        return res
          .status(400)
          .json({ error: `Cannot cancel visit with status: ${visit.status}` });
      }

      // Check if visit is in the past
      if (new Date(visit.scheduledTime) < new Date()) {
        return res
          .status(400)
          .json({ error: "Cannot cancel a visit that has already passed" });
      }

      // Cancel the visit
      const updatedVisit = await prisma.hCWVisit.update({
        where: { id: visitId },
        data: {
          status: "cancelled",
          cancellationReason,
        },
        select: {
          id: true,
          status: true,
          cancellationReason: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        visitId: updatedVisit.id,
        status: updatedVisit.status,
        cancellationReason: updatedVisit.cancellationReason,
        cancelledAt: updatedVisit.updatedAt,
      });
    } catch (error: any) {
      console.error("Error cancelling visit:", error);

      if (
        error.message === "User not found" ||
        error.message === "User is not a patient"
      ) {
        return res.status(403).json({ error: error.message });
      }

      res.status(500).json({ error: "Failed to cancel visit" });
    }
  },
);

/**
 * GET /api/hcw/caregiver/:id/profile
 * Get detailed profile for a specific caregiver
 */
router.get(
  "/caregiver/:id/profile",
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const patientId = await getPatientId(userId);

      // Verify patient has an assignment with this caregiver
      const assignment = await prisma.hCWAssignment.findFirst({
        where: {
          patientId,
          caregiverId: id,
          status: "active",
        },
      });

      if (!assignment) {
        return res
          .status(403)
          .json({ error: "No active assignment with this caregiver" });
      }

      // Get caregiver profile
      const caregiver = await prisma.hCWCaregiver.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
      });

      if (!caregiver) {
        return res.status(404).json({ error: "Caregiver not found" });
      }

      // Transform data
      const profile = {
        id: caregiver.id,
        firstName: caregiver.user.firstName,
        lastName: caregiver.user.lastName,
        specialty: caregiver.specialty,
        credentials: caregiver.credentials,
        bio: caregiver.bio,
        phoneNumber: caregiver.phoneNumber || caregiver.user.phone,
        email: caregiver.email || caregiver.user.email,
        isActive: caregiver.isActive,
        // Note: These fields would come from additional tables if implemented
        education: null,
        experience: null,
        languages: ["English"],
        rating: 0,
        reviewCount: 0,
      };

      res.json(profile);
    } catch (error: any) {
      console.error("Error fetching caregiver profile:", error);

      if (
        error.message === "User not found" ||
        error.message === "User is not a patient"
      ) {
        return res.status(403).json({ error: error.message });
      }

      res.status(500).json({ error: "Failed to fetch caregiver profile" });
    }
  },
);

export default router;
