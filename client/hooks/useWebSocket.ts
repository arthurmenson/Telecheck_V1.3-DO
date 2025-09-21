import { useState, useEffect, useRef, useCallback } from "react";

interface UseWebSocketOptions {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (message: MessageEvent) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "error"
  >("disconnected");

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>();
  const reconnectAttemptsRef = useRef(0);

  const {
    onOpen,
    onClose,
    onError,
    onMessage,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const connect = useCallback(() => {
    try {
      setConnectionStatus("connecting");
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setIsConnected(true);
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0;
        onOpen?.();
      };

      ws.current.onclose = () => {
        setIsConnected(false);
        setConnectionStatus("disconnected");
        onClose?.();

        // Attempt to reconnect
        if (reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.current.onerror = (error) => {
        setConnectionStatus("error");
        onError?.(error);
      };

      ws.current.onmessage = (message) => {
        setLastMessage(message);
        onMessage?.(message);
      };
    } catch (error) {
      setConnectionStatus("error");
      console.error("WebSocket connection error:", error);
    }
  }, [
    url,
    onOpen,
    onClose,
    onError,
    onMessage,
    reconnectAttempts,
    reconnectInterval,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setIsConnected(false);
    setConnectionStatus("disconnected");
  }, []);

  const sendMessage = useCallback((message: string | object) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const messageString =
        typeof message === "string" ? message : JSON.stringify(message);
      ws.current.send(messageString);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
  };
}

// Specialized hooks for different types of real-time data
export function useHealthAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);

  const { sendMessage } = useWebSocket("ws://localhost:8080", {
    onMessage: (message) => {
      try {
        const data = JSON.parse(message.data);
        if (data.type === "health_alert") {
          setAlerts((prev) => [data.data, ...prev.slice(0, 9)]); // Keep last 10 alerts
        }
      } catch (error) {
        console.error("Error parsing health alert:", error);
      }
    },
  });

  const dismissAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    dismissAlert,
    clearAllAlerts,
    sendMessage,
  };
}

export function useRealTimeVitals() {
  const [vitals, setVitals] = useState({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 98.6,
    oxygenSaturation: 98,
    respiratoryRate: 16,
  });

  const { isConnected, sendMessage } = useWebSocket("ws://localhost:8080", {
    onMessage: (message) => {
      try {
        const data = JSON.parse(message.data);
        if (data.type === "vital_signs") {
          setVitals(data.data);
        }
      } catch (error) {
        console.error("Error parsing vital signs:", error);
      }
    },
  });

  const updateVitals = useCallback(
    (newVitals: Partial<typeof vitals>) => {
      setVitals((prev) => ({ ...prev, ...newVitals }));
      sendMessage({
        type: "vital_signs_update",
        data: newVitals,
      });
    },
    [sendMessage],
  );

  return {
    vitals,
    updateVitals,
    isConnected,
  };
}

export function useRealTimeChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const { isConnected, sendMessage } = useWebSocket("ws://localhost:8080", {
    onMessage: (message) => {
      try {
        const data = JSON.parse(message.data);
        if (data.type === "chat_message") {
          setMessages((prev) => [...prev, data.data]);
        } else if (data.type === "typing_indicator") {
          setIsTyping(data.data.isTyping);
        }
      } catch (error) {
        console.error("Error parsing chat message:", error);
      }
    },
  });

  const sendChatMessage = useCallback(
    (content: string, context?: any) => {
      const message = {
        type: "chat_message",
        data: {
          id: Date.now().toString(),
          content,
          context,
          timestamp: new Date().toISOString(),
          sender: "user",
        },
      };

      setMessages((prev) => [...prev, message.data]);
      sendMessage(message);
    },
    [sendMessage],
  );

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      sendMessage({
        type: "typing_indicator",
        data: { isTyping },
      });
    },
    [sendMessage],
  );

  return {
    messages,
    isTyping,
    isConnected,
    sendChatMessage,
    sendTypingIndicator,
  };
}
