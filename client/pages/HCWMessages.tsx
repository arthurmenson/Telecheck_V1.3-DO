import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Paperclip,
  Search,
  ArrowLeft,
  CheckCheck,
} from "lucide-react";
import { HCW } from "@/lib/api-endpoints";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  messageType: string;
  createdAt: Date;
  sender: {
    firstName: string;
    lastName: string;
    role: string;
  };
}

interface Thread {
  caregiverId: string;
  caregiverName: string;
  caregiverSpecialty: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export default function HCWMessages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<string | null>(
    searchParams.get("caregiver"),
  );
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchThreads();
  }, []);

  useEffect(() => {
    if (selectedCaregiver) {
      fetchMessages(selectedCaregiver);
    }
  }, [selectedCaregiver]);

  const fetchThreads = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(HCW.MESSAGES.LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setThreads(data.threads || []);
    } catch (error) {
      console.error("Error fetching threads:", error);
      toast({
        title: "Error",
        description: "Failed to load messages. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (caregiverId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(HCW.MESSAGES.THREAD(caregiverId), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data.messages || []);

      // Mark messages as read
      data.messages
        .filter((msg: Message) => !msg.isRead)
        .forEach((msg: Message) => markAsRead(msg.id));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      await fetch(HCW.MESSAGES.MARK_READ(messageId), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCaregiver) return;

    setSending(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(HCW.MESSAGES.SEND, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipientId: selectedCaregiver,
          content: newMessage,
          messageType: "text",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setMessages([...messages, data.message]);
      setNewMessage("");
      fetchThreads(); // Refresh threads to update last message
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const filteredThreads = threads.filter((thread) =>
    thread.caregiverName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedThread = threads.find(
    (t) => t.caregiverId === selectedCaregiver,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/care-team")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <MessageCircle className="w-8 h-8 text-primary" />
              Messages
            </h1>
            <p className="text-muted-foreground mt-1">
              Communicate with your care team
            </p>
          </div>
        </div>

        {/* Messages Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Threads List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-350px)]">
                {filteredThreads.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">
                      Message your care team to start a conversation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredThreads.map((thread) => (
                      <button
                        key={thread.caregiverId}
                        onClick={() => setSelectedCaregiver(thread.caregiverId)}
                        className={`w-full text-left p-4 rounded-lg transition-colors ${
                          selectedCaregiver === thread.caregiverId
                            ? "bg-primary/10"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>
                                {thread.caregiverName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">
                                  {thread.caregiverName}
                                </p>
                                {thread.unreadCount > 0 && (
                                  <Badge className="h-5 px-2" variant="default">
                                    {thread.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {thread.caregiverSpecialty}
                              </p>
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {thread.lastMessage}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatDistanceToNow(
                              new Date(thread.lastMessageTime),
                              {
                                addSuffix: true,
                              },
                            )}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Thread */}
          <Card className="lg:col-span-2">
            {selectedCaregiver && selectedThread ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {selectedThread.caregiverName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedThread.caregiverName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {selectedThread.caregiverSpecialty}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[calc(100vh-350px)]">
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isFromMe = message.sender.role === "PATIENT";
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isFromMe
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <div
                                className={`flex items-center gap-2 mt-1 text-xs ${
                                  isFromMe
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <span>
                                  {formatDistanceToNow(
                                    new Date(message.createdAt),
                                    {
                                      addSuffix: true,
                                    },
                                  )}
                                </span>
                                {isFromMe && message.isRead && (
                                  <CheckCheck className="w-3 h-3" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={sending || !newMessage.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
