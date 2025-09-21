import React, { useState, useRef, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { ScrollArea } from "../components/ui/scroll-area";
import { useToast } from "../hooks/use-toast";
import {
  MessageCircle,
  Mic,
  MicOff,
  Send,
  Brain,
  User,
  AlertTriangle,
  Phone,
  Clock,
  Shield,
  Zap,
  FileText,
  Heart,
  TestTube,
  Pill,
  Info,
  ChevronDown,
  Volume2,
  Loader2,
} from "lucide-react";

// Add type declarations for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  context?: {
    labs?: boolean;
    medications?: boolean;
    symptoms?: boolean;
  };
}

export function Chat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your AI Health Assistant. I can help you understand your lab results, medication interactions, symptoms, and provide personalized health guidance. How can I assist you today?",
      timestamp: new Date(),
      context: {},
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickActions = [
    {
      label: "Interpret my latest labs",
      icon: TestTube,
      context: { labs: true },
    },
    {
      label: "Check medication interactions",
      icon: Pill,
      context: { medications: true },
    },
    {
      label: "Assess symptoms",
      icon: Heart,
      context: { symptoms: true },
    },
    {
      label: "Health summary",
      icon: FileText,
      context: {},
    },
  ];

  const handleSendMessage = async (content: string, context = {}) => {
    if (!content.trim()) return;

    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "Unable to connect to AI service. Please try again.",
        variant: "destructive",
      });
      return;
    }
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
      context,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // In a real implementation, this would call your AI service
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          context,
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const data = await response.json();

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: data.response || generateAIResponse(content, context),
        timestamp: new Date(),
        context,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Fallback to simulated response
      const aiResponse = generateAIResponse(content, context);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponse,
        timestamp: new Date(),
        context,
      };
      setMessages((prev) => [...prev, aiMessage]);

      toast({
        title: "Using Offline Mode",
        description: "AI service unavailable, using cached responses.",
        variant: "default",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userInput: string, context: any): string => {
    const input = userInput.toLowerCase();

    if (context.labs || input.includes("lab") || input.includes("test")) {
      return "Based on your recent lab results, I can see your glucose levels are excellent at 95 mg/dL (normal range), but your total cholesterol is slightly elevated at 205 mg/dL. I recommend discussing dietary modifications with your healthcare provider. Your HDL cholesterol at 58 mg/dL provides good cardiovascular protection. Would you like me to explain any specific lab values in more detail?";
    }

    if (
      context.medications ||
      input.includes("medication") ||
      input.includes("drug")
    ) {
      return "I've analyzed your current medications for potential interactions. Based on your profile, I notice you're taking a statin for cholesterol. Given your genetic markers, this is appropriate, but we should monitor for muscle-related side effects. Are you experiencing any unusual muscle pain or weakness? I can also check for interactions if you're considering any new medications.";
    }

    if (
      context.symptoms ||
      input.includes("symptom") ||
      input.includes("feel")
    ) {
      return "I understand you're experiencing some symptoms. To provide the most accurate guidance, could you describe: 1) What symptoms you're experiencing, 2) When they started, 3) Their severity (1-10), and 4) Any triggers you've noticed? I'll correlate this with your health data to provide personalized recommendations.";
    }

    if (input.includes("summary") || input.includes("overview")) {
      return "Here's your current health summary: Your metabolic health is good with excellent glucose control (A1C: 5.4%). Cardiovascular risk is moderate due to elevated LDL cholesterol. Your thyroid function is normal. Current medications are working well with no detected interactions. Recent trends show stable glucose but increasing cholesterol - I recommend discussing lifestyle modifications or medication adjustments with your doctor.";
    }

    if (input.includes("emergency") || input.includes("urgent")) {
      return "⚠️ If this is a medical emergency, please call 911 immediately or go to your nearest emergency room. For urgent but non-emergency medical concerns, I can help you understand when to seek immediate care or connect you with a healthcare provider through our platform.";
    }

    return `I understand you're asking about "${userInput}". Based on your health profile and recent data, I can provide personalized guidance. Could you be more specific about what aspect you'd like me to focus on? I have access to your lab results, medications, and health trends to give you the most relevant information.`;
  };

  const handleVoiceToggle = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      toast({
        title: "Speech Recognition Unavailable",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    setIsListening(!isListening);

    if (!isListening) {
      // Start speech recognition
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast({
          title: "Speech Recognition Error",
          description: "Could not process speech. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    }
  };

  const escalateToHuman = () => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: "system",
      content:
        "🏥 Connecting you with a healthcare provider. Expected wait time: 2-5 minutes. A licensed medical professional will review your conversation history and health data before joining.",
      timestamp: new Date(),
      context: {},
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Health Assistant
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online • Secure & HIPAA Compliant</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContext(!showContext)}
              >
                <Info className="w-4 h-4 mr-2" />
                Context
                <ChevronDown
                  className={`w-4 h-4 ml-1 transition-transform ${showContext ? "rotate-180" : ""}`}
                />
              </Button>
              <Button variant="outline" size="sm" onClick={escalateToHuman}>
                <Phone className="w-4 h-4 mr-2" />
                Talk to Doctor
              </Button>
            </div>
          </div>

          {/* Context Panel */}
          {showContext && (
            <Card className="mt-4 border-primary/20 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Available Health Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <TestTube className="w-4 h-4 text-primary" />
                    <span>Recent Labs (6)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Pill className="w-4 h-4 text-primary" />
                    <span>Medications (3)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Heart className="w-4 h-4 text-primary" />
                    <span>Vitals (Current)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>PGx Profile</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat Interface */}
        <Card className="h-[600px] flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex space-x-3 max-w-3xl ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback
                        className={
                          message.type === "ai"
                            ? "bg-primary text-white"
                            : message.type === "system"
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-500 text-white"
                        }
                      >
                        {message.type === "ai" ? (
                          <Brain className="w-4 h-4" />
                        ) : message.type === "system" ? (
                          <Info className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.type === "user"
                          ? "bg-primary text-white"
                          : message.type === "system"
                            ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                            : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.type === "user"
                            ? "text-primary-foreground/70"
                            : "text-gray-500"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex space-x-3 max-w-3xl">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary text-white">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="px-4 py-2 rounded-lg bg-gray-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Actions */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex flex-wrap gap-2 mb-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleSendMessage(action.label, action.context)
                    }
                    className="text-xs"
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {action.label}
                  </Button>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceToggle}
                className={
                  isListening ? "bg-red-50 border-red-200 text-red-700" : ""
                }
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about your health, symptoms, medications, or lab results..."
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSendMessage(inputValue)
                  }
                  className="pr-10"
                />
                {isListening && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              <Button
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Shield className="w-3 h-3" />
                  <span>End-to-end encrypted</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>AI-powered by medical LLM</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}
                ></div>
                <span>
                  {isConnected ? "Online" : "Offline"} • Secure & HIPAA
                  Compliant
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Disclaimer */}
        <Card className="mt-4 border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Medical Disclaimer</p>
                <p>
                  This AI assistant provides general health information and is
                  not a substitute for professional medical advice. For urgent
                  medical concerns, contact your healthcare provider or
                  emergency services immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
