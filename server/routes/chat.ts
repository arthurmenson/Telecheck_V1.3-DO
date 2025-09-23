import { RequestHandler } from "express";
import { db } from "../utils/databaseAdapter";
import { AIService } from "../utils/aiService";
import { ApiResponse, ChatMessage } from "@shared/types";

interface ChatRequest {
  message: string;
  userId?: string;
  context?: any;
  conversationHistory?: any[];
}

interface ChatResponse {
  response: string;
  confidence?: number;
  suggestions?: string[];
  messageId?: string;
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const {
      message,
      userId = "user-1",
      context,
      conversationHistory,
    }: ChatRequest = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Save user message
    const userMessage = await db.addChatMessage({
      userId,
      type: "user",
      content: message,
      context,
      timestamp: new Date().toISOString(),
    });

    // Get user's health data for context
    const userLabResults = await db.getLabResults(userId);
    const userMedications = await db.getMedications(userId);
    const recentMessages = (await db.getChatMessages(userId)).slice(-10); // Last 10 messages

    // Generate AI response
    const aiResponse = await AIService.generateChatResponse(
      message,
      context,
      userLabResults,
      userMedications,
      recentMessages,
    );

    // Save AI response
    const aiMessage = await db.addChatMessage({
      userId,
      type: "ai",
      content: aiResponse.response,
      context,
      timestamp: new Date().toISOString(),
      confidence: aiResponse.confidence,
      suggestions: aiResponse.suggestions,
    });

    const chatResponse: ChatResponse = {
      response: aiResponse.response,
      confidence: aiResponse.confidence,
      suggestions: aiResponse.suggestions,
      messageId: aiMessage.id,
    };

    res.json(chatResponse);
  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get chat history for a user
export const getChatHistory: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || "user-1";
    const messages = await db.getChatMessages(userId);

    const response: ApiResponse<ChatMessage[]> = {
      success: true,
      data: messages,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch chat history",
    });
  }
};
