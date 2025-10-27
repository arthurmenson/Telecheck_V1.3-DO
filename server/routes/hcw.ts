/**
 * HCW@Home Care Team Routes
 * Handles patient-caregiver interactions, visits, messages, and care plans
 */

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to extract user from request (assuming auth middleware sets req.user)
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email: string;
  };
}

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

    // Mock data for now - replace with actual database query
    const caregivers = [
      {
        id: "cg-1",
        userId: "user-1",
        firstName: "Sarah",
        lastName: "Johnson",
        specialty: "Primary Care",
        credentials: "MD, FACP",
        bio: "Board-certified internist with 15 years of experience in primary care and chronic disease management.",
        phoneNumber: "(555) 123-4567",
        email: "dr.johnson@telecheck.com",
        isActive: true,
        isPrimary: true,
        assignmentType: "primary_care",
        rating: 4.8,
        reviewCount: 127,
      },
      {
        id: "cg-2",
        userId: "user-2",
        firstName: "Michael",
        lastName: "Chen",
        specialty: "Cardiology",
        credentials: "MD, FACC",
        bio: "Cardiologist specializing in heart failure and preventive cardiology.",
        phoneNumber: "(555) 234-5678",
        email: "dr.chen@telecheck.com",
        isActive: true,
        isPrimary: false,
        assignmentType: "specialist",
        rating: 4.9,
        reviewCount: 85,
      },
    ];

    res.json({ caregivers });
  } catch (error) {
    console.error("Error fetching caregivers:", error);
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

    // Mock threads data
    const threads = [
      {
        caregiverId: "cg-1",
        caregiverName: "Dr. Sarah Johnson",
        caregiverSpecialty: "Primary Care",
        lastMessage: "I've reviewed your lab results. Everything looks good!",
        lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        unreadCount: 0,
      },
      {
        caregiverId: "cg-2",
        caregiverName: "Dr. Michael Chen",
        caregiverSpecialty: "Cardiology",
        lastMessage: "Please schedule a follow-up for next month",
        lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        unreadCount: 1,
      },
    ];

    res.json({ threads });
  } catch (error) {
    console.error("Error fetching messages:", error);
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

      // Mock messages
      const messages = [
        {
          id: "msg-1",
          senderId: caregiverId,
          recipientId: userId,
          content: "Hello! I've reviewed your recent lab results.",
          isRead: true,
          messageType: "text",
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          sender: {
            firstName: "Sarah",
            lastName: "Johnson",
            role: "DOCTOR",
          },
        },
        {
          id: "msg-2",
          senderId: userId,
          recipientId: caregiverId,
          content: "Thank you! Do I need to make any changes to my medication?",
          isRead: true,
          messageType: "text",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          sender: {
            firstName: "Patient",
            lastName: "User",
            role: "PATIENT",
          },
        },
        {
          id: "msg-3",
          senderId: caregiverId,
          recipientId: userId,
          content:
            "No changes needed. Everything looks good! Keep up the great work.",
          isRead: true,
          messageType: "text",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          sender: {
            firstName: "Sarah",
            lastName: "Johnson",
            role: "DOCTOR",
          },
        },
      ];

      res.json({ messages });
    } catch (error) {
      console.error("Error fetching thread:", error);
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
    const { recipientId, content, messageType = "text" } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!recipientId || !content) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Mock response
    const message = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      recipientId,
      content,
      isRead: false,
      messageType,
      createdAt: new Date(),
      sender: {
        firstName: "Patient",
        lastName: "User",
        role: "PATIENT",
      },
    };

    res.status(201).json({ message });
  } catch (error) {
    console.error("Error sending message:", error);
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
      const { messageId } = req.params;

      // Mock response
      res.json({ success: true, messageId, readAt: new Date() });
    } catch (error) {
      console.error("Error marking message as read:", error);
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

    // Mock upcoming visits
    const visits = [
      {
        id: "visit-1",
        scheduledTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        visitType: "routine",
        purpose: "Quarterly check-up and blood pressure monitoring",
        location: "Home Visit",
        status: "scheduled",
        caregiver: {
          firstName: "Sarah",
          lastName: "Johnson",
          specialty: "Primary Care",
          credentials: "MD, FACP",
        },
      },
      {
        id: "visit-2",
        scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        visitType: "follow_up",
        purpose: "Cardiology follow-up after recent tests",
        location: "Telecheck Clinic - 123 Main St",
        status: "scheduled",
        caregiver: {
          firstName: "Michael",
          lastName: "Chen",
          specialty: "Cardiology",
          credentials: "MD, FACC",
        },
      },
    ];

    res.json({ visits });
  } catch (error) {
    console.error("Error fetching upcoming visits:", error);
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

    // Mock visit history
    const visits = [
      {
        id: "visit-past-1",
        scheduledTime: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        actualStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        actualEnd: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000,
        ),
        visitType: "routine",
        purpose: "Annual physical exam",
        location: "Home Visit",
        status: "completed",
        rating: 5,
        feedback:
          "Great visit! Dr. Johnson was very thorough and answered all my questions.",
        notes:
          "Patient is in good health. Continue current medications. Follow up in 3 months.",
        caregiver: {
          firstName: "Sarah",
          lastName: "Johnson",
          specialty: "Primary Care",
          credentials: "MD, FACP",
        },
      },
    ];

    res.json({ visits });
  } catch (error) {
    console.error("Error fetching visit history:", error);
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
      const { cancellationReason } = req.body;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Mock cancellation
      res.json({
        success: true,
        visitId,
        status: "cancelled",
        cancellationReason,
        cancelledAt: new Date(),
      });
    } catch (error) {
      console.error("Error cancelling visit:", error);
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
      const { id } = req.params;

      // Mock caregiver profile
      const profile = {
        id,
        firstName: "Sarah",
        lastName: "Johnson",
        specialty: "Primary Care",
        credentials: "MD, FACP",
        bio: "Board-certified internist with over 15 years of experience...",
        phoneNumber: "(555) 123-4567",
        email: "dr.johnson@telecheck.com",
        education: "Harvard Medical School",
        experience: 15,
        languages: ["English", "Spanish"],
        rating: 4.8,
        reviewCount: 127,
      };

      res.json(profile);
    } catch (error) {
      console.error("Error fetching caregiver profile:", error);
      res.status(500).json({ error: "Failed to fetch caregiver profile" });
    }
  },
);

export default router;
