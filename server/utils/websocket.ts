import { WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { Server } from "http";

interface WebSocketClient {
  id: string;
  ws: WebSocket;
  userId?: string;
  subscriptions: Set<string>;
  lastPing: number;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private pingInterval: NodeJS.Timeout;

  constructor(server: Server) {
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
    });

    this.wss.on("connection", this.handleConnection.bind(this));

    // Ping clients every 30 seconds to keep connections alive
    this.pingInterval = setInterval(() => {
      this.pingClients();
    }, 30000);

    console.log("🔌 WebSocket server initialized");
  }

  private handleConnection(ws: WebSocket, request: IncomingMessage) {
    const clientId = this.generateClientId();
    const client: WebSocketClient = {
      id: clientId,
      ws,
      subscriptions: new Set(),
      lastPing: Date.now(),
    };

    this.clients.set(clientId, client);
    console.log(`🔗 Client connected: ${clientId}`);

    // Send welcome message
    this.sendToClient(clientId, {
      type: "connection_established",
      data: { clientId, timestamp: new Date().toISOString() },
    });

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(clientId, message);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      this.clients.delete(clientId);
      console.log(`🔌 Client disconnected: ${clientId}`);
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.clients.delete(clientId);
    });

    ws.on("pong", () => {
      const client = this.clients.get(clientId);
      if (client) {
        client.lastPing = Date.now();
      }
    });
  }

  private handleMessage(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case "subscribe":
        client.subscriptions.add(message.channel);
        console.log(`📡 Client ${clientId} subscribed to ${message.channel}`);
        break;

      case "unsubscribe":
        client.subscriptions.delete(message.channel);
        console.log(
          `📡 Client ${clientId} unsubscribed from ${message.channel}`,
        );
        break;

      case "user_identification":
        client.userId = message.userId;
        console.log(
          `👤 Client ${clientId} identified as user ${message.userId}`,
        );
        break;

      case "vital_signs_update":
        this.broadcastToSubscribers("vital_signs", {
          type: "vital_signs",
          data: message.data,
          timestamp: new Date().toISOString(),
        });
        break;

      case "chat_message":
        this.handleChatMessage(clientId, message.data);
        break;

      case "ping":
        this.sendToClient(clientId, { type: "pong", timestamp: Date.now() });
        break;

      default:
        console.log(`❓ Unknown message type: ${message.type}`);
    }
  }

  private async handleChatMessage(clientId: string, messageData: any) {
    // Echo the message back to confirm receipt
    this.sendToClient(clientId, {
      type: "chat_message_received",
      data: messageData,
    });

    // Simulate AI processing delay
    setTimeout(
      () => {
        const aiResponse = this.generateAIResponse(messageData.content);
        this.sendToClient(clientId, {
          type: "chat_message",
          data: {
            id: Date.now().toString(),
            content: aiResponse,
            timestamp: new Date().toISOString(),
            sender: "ai",
            confidence: 0.92,
          },
        });
      },
      1000 + Math.random() * 2000,
    );
  }

  private generateAIResponse(userMessage: string): string {
    const responses = [
      "Based on your recent lab results, I can see your glucose levels are excellent. Your cholesterol has improved significantly since starting the statin therapy.",
      "I've analyzed your medication list for potential interactions. Everything looks safe, but I recommend taking your statin in the evening for optimal effectiveness.",
      "Your vital signs show a positive trend. The combination of lifestyle changes and medication is working well for your cardiovascular health.",
      "I notice your blood pressure has been consistently in the optimal range. This is excellent progress from your baseline measurements.",
      "Your pharmacogenomic profile suggests you're responding well to your current medications. No dosage adjustments needed at this time.",
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  public sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error(`Error sending message to client ${clientId}:`, error);
        return false;
      }
    }
    return false;
  }

  public broadcastToAll(message: any) {
    let sentCount = 0;
    this.clients.forEach((client) => {
      if (this.sendToClient(client.id, message)) {
        sentCount++;
      }
    });
    return sentCount;
  }

  public broadcastToSubscribers(channel: string, message: any) {
    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.subscriptions.has(channel)) {
        if (this.sendToClient(client.id, message)) {
          sentCount++;
        }
      }
    });
    return sentCount;
  }

  public broadcastToUser(userId: string, message: any) {
    let sentCount = 0;
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        if (this.sendToClient(client.id, message)) {
          sentCount++;
        }
      }
    });
    return sentCount;
  }

  public sendHealthAlert(userId: string, alert: any) {
    const message = {
      type: "health_alert",
      data: {
        id: Date.now().toString(),
        ...alert,
        timestamp: new Date().toISOString(),
      },
    };

    if (userId) {
      return this.broadcastToUser(userId, message);
    } else {
      return this.broadcastToAll(message);
    }
  }

  public sendVitalSigns(userId: string, vitals: any) {
    const message = {
      type: "vital_signs",
      data: {
        ...vitals,
        timestamp: new Date().toISOString(),
      },
    };

    if (userId) {
      return this.broadcastToUser(userId, message);
    } else {
      return this.broadcastToSubscribers("vital_signs", message);
    }
  }

  private pingClients() {
    const now = Date.now();
    this.clients.forEach((client, clientId) => {
      if (now - client.lastPing > 60000) {
        // 60 seconds timeout
        console.log(`⏰ Client ${clientId} timed out, removing`);
        client.ws.terminate();
        this.clients.delete(clientId);
      } else if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.ping();
      }
    });
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public getClientsByUser(userId: string): WebSocketClient[] {
    return Array.from(this.clients.values()).filter(
      (client) => client.userId === userId,
    );
  }

  public close() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.clients.forEach((client) => {
      client.ws.close();
    });

    this.wss.close();
    console.log("🔌 WebSocket server closed");
  }
}

// Singleton instance
let wsService: WebSocketService | null = null;

export function initializeWebSocketService(server: Server): WebSocketService {
  if (!wsService) {
    wsService = new WebSocketService(server);
  }
  return wsService;
}

export function getWebSocketService(): WebSocketService | null {
  return wsService;
}
