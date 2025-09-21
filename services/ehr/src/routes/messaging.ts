/**
 * EHR Messaging Routes - Patient-provider communication
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

interface MessagingRouteOptions {
  prisma: PrismaClient;
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    role: string;
  };
  requestId: string;
}

const MessageRequestSchema = z.object({
  recipientId: z.string().uuid(),
  content: z.string().min(1),
  subject: z.string().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  attachments: z.array(z.string()).optional()
});

export async function messagingRoutes(
  fastify: FastifyInstance,
  options: MessagingRouteOptions
) {
  const { prisma } = options;

  /**
   * POST /messaging/send - Send a message
   */
  fastify.post('/send', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const messageData = MessageRequestSchema.parse(request.body);

      const message = await sendMessage({
        ...messageData,
        senderId: request.user?.id || 'anonymous',
        sentAt: new Date()
      });

      fastify.log.info({
        messageId: message.id,
        senderId: request.user?.id,
        recipientId: messageData.recipientId,
        requestId: request.requestId
      }, 'Message sent');

      reply.status(201).send({
        id: message.id,
        status: 'sent',
        message: 'Message sent successfully'
      });

    } catch (error) {
      fastify.log.error(error, 'Error sending message');
      
      if (error instanceof Error && error.name === 'ZodError') {
        reply.status(400).send({
          success: false,
          error: 'Validation error',
          message: 'Invalid message data',
          details: error.message
        });
        return;
      }

      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to send message'
      });
    }
  });

  /**
   * GET /messaging/conversations - Get user conversations
   */
  fastify.get('/conversations', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const query = request.query as any;

    try {
      const {
        page = 1,
        limit = 20,
        status = 'active'
      } = query;

      const conversations = await getConversations({
        userId: request.user?.id || '',
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });

      reply.send(conversations);

    } catch (error) {
      fastify.log.error(error, 'Error fetching conversations');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch conversations'
      });
    }
  });

  /**
   * GET /messaging/conversations/:id - Get specific conversation
   */
  fastify.get('/conversations/:id', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const conversation = await getConversationById(id);

      if (!conversation) {
        reply.status(404).send({
          success: false,
          error: 'Conversation not found'
        });
        return;
      }

      // Check access permissions
      const hasAccess = conversation.participants.includes(request.user?.id || '');
      if (!hasAccess && request.user?.role !== 'admin') {
        reply.status(403).send({
          success: false,
          error: 'Access denied',
          message: 'You do not have access to this conversation'
        });
        return;
      }

      reply.send(conversation);

    } catch (error) {
      fastify.log.error(error, 'Error fetching conversation');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch conversation'
      });
    }
  });

  /**
   * GET /messaging/conversations/:id/messages - Get messages in conversation
   */
  fastify.get('/conversations/:id/messages', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const query = request.query as any;

    try {
      const {
        page = 1,
        limit = 50,
        since
      } = query;

      const messages = await getConversationMessages({
        conversationId: id,
        userId: request.user?.id || '',
        page: parseInt(page),
        limit: parseInt(limit),
        since: since ? new Date(since) : undefined
      });

      reply.send(messages);

    } catch (error) {
      fastify.log.error(error, 'Error fetching conversation messages');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch messages'
      });
    }
  });

  /**
   * POST /messaging/:id/read - Mark message as read
   */
  fastify.post('/:id/read', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    try {
      const result = await markMessageAsRead({
        messageId: id,
        userId: request.user?.id || '',
        readAt: new Date()
      });

      if (!result) {
        reply.status(404).send({
          success: false,
          error: 'Message not found'
        });
        return;
      }

      reply.send({
        id,
        status: 'read',
        message: 'Message marked as read'
      });

    } catch (error) {
      fastify.log.error(error, 'Error marking message as read');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to mark message as read'
      });
    }
  });

  /**
   * POST /messaging/attachments - Upload message attachment
   */
  fastify.post('/attachments', async (request: AuthenticatedRequest, reply: FastifyReply) => {
    try {
      const data = await request.file();
      
      if (!data) {
        reply.status(400).send({
          success: false,
          error: 'No file provided'
        });
        return;
      }

      const attachment = await uploadAttachment({
        file: data,
        uploadedBy: request.user?.id || 'anonymous',
        uploadedAt: new Date()
      });

      reply.status(201).send({
        id: attachment.id,
        filename: attachment.filename,
        url: attachment.url,
        status: 'uploaded'
      });

    } catch (error) {
      fastify.log.error(error, 'Error uploading attachment');
      reply.status(500).send({
        success: false,
        error: 'Internal server error',
        message: 'Failed to upload attachment'
      });
    }
  });
}

// Helper functions

/**
 * Send a message
 */
async function sendMessage(data: any): Promise<any> {
  // Mock implementation
  const message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...data,
    status: 'sent',
    deliveredAt: null,
    readAt: null,
    createdAt: new Date().toISOString()
  };

  // In real implementation, also create/update conversation
  await createOrUpdateConversation({
    participants: [data.senderId, data.recipientId],
    lastMessage: data.content,
    lastMessageAt: new Date()
  });

  return message;
}

/**
 * Get conversations for a user
 */
async function getConversations(params: {
  userId: string;
  page: number;
  limit: number;
  status?: string;
}): Promise<any> {
  // Mock implementation
  const conversations = [
    {
      id: 'conv_123',
      participants: [params.userId, 'provider_456'],
      subject: 'Prescription inquiry',
      lastMessage: 'Thank you for your response',
      lastMessageAt: '2025-01-01T12:00:00Z',
      unreadCount: 2,
      status: 'active',
      participantDetails: [
        {
          id: params.userId,
          name: 'Patient Name',
          role: 'patient'
        },
        {
          id: 'provider_456',
          name: 'Dr. Smith',
          role: 'doctor'
        }
      ]
    }
  ];

  return {
    conversations: conversations.filter(c => c.participants.includes(params.userId)),
    pagination: {
      page: params.page,
      limit: params.limit,
      total: conversations.length,
      totalPages: Math.ceil(conversations.length / params.limit)
    }
  };
}

/**
 * Get conversation by ID
 */
async function getConversationById(id: string): Promise<any> {
  // Mock implementation
  if (id === 'conv_123') {
    return {
      id,
      participants: ['patient_123', 'provider_456'],
      subject: 'Prescription inquiry',
      lastMessage: 'Thank you for your response',
      lastMessageAt: '2025-01-01T12:00:00Z',
      unreadCount: 2,
      status: 'active',
      createdAt: '2024-12-15T10:00:00Z',
      participantDetails: [
        {
          id: 'patient_123',
          name: 'Patient Name',
          role: 'patient'
        },
        {
          id: 'provider_456',
          name: 'Dr. Smith',
          role: 'doctor'
        }
      ]
    };
  }

  return null;
}

/**
 * Get messages in a conversation
 */
async function getConversationMessages(params: {
  conversationId: string;
  userId: string;
  page: number;
  limit: number;
  since?: Date;
}): Promise<any> {
  // Mock implementation
  const messages = [
    {
      id: 'msg_1',
      conversationId: params.conversationId,
      senderId: 'patient_123',
      recipientId: 'provider_456',
      content: 'Hello, I have a question about my prescription',
      sentAt: '2025-01-01T10:00:00Z',
      deliveredAt: '2025-01-01T10:00:01Z',
      readAt: '2025-01-01T10:05:00Z',
      priority: 'normal'
    },
    {
      id: 'msg_2',
      conversationId: params.conversationId,
      senderId: 'provider_456',
      recipientId: 'patient_123',
      content: 'Of course! What would you like to know?',
      sentAt: '2025-01-01T10:30:00Z',
      deliveredAt: '2025-01-01T10:30:01Z',
      readAt: null,
      priority: 'normal'
    }
  ];

  return {
    messages,
    pagination: {
      page: params.page,
      limit: params.limit,
      total: messages.length,
      totalPages: Math.ceil(messages.length / params.limit)
    }
  };
}

/**
 * Mark message as read
 */
async function markMessageAsRead(params: {
  messageId: string;
  userId: string;
  readAt: Date;
}): Promise<boolean> {
  // Mock implementation - would update database
  return true;
}

/**
 * Upload message attachment
 */
async function uploadAttachment(data: any): Promise<any> {
  // Mock implementation
  const attachment = {
    id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    filename: data.file.filename,
    originalName: data.file.filename,
    mimeType: data.file.mimetype,
    size: data.file.size || 0,
    url: `/files/attachments/${Date.now()}_${data.file.filename}`,
    uploadedBy: data.uploadedBy,
    uploadedAt: data.uploadedAt.toISOString()
  };

  return attachment;
}

/**
 * Create or update conversation
 */
async function createOrUpdateConversation(data: any): Promise<any> {
  // Mock implementation - would create/update conversation in database
  return {
    id: `conv_${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
