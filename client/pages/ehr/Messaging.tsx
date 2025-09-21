import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  MessageCircle,
  Send,
  Search,
  Filter,
  Paperclip,
  Phone,
  Video,
  MoreVertical,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Archive,
  Trash2,
  Plus,
  Bell,
  Users,
  User,
  Stethoscope,
  Heart,
  Calendar,
  FileText,
  Image,
  Mic,
  Settings,
} from "lucide-react";

export function Messaging() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const conversations = [
    {
      id: "1",
      participant: "Dr. Sarah Johnson",
      role: "Cardiologist",
      avatar: "/avatars/dr-johnson.jpg",
      lastMessage:
        "Lab results look good. Let's schedule a follow-up next week.",
      timestamp: "2 min ago",
      unread: 2,
      priority: "normal",
      status: "online",
    },
    {
      id: "2",
      participant: "Emma Wilson",
      role: "Patient",
      avatar: "/avatars/emma-wilson.jpg",
      lastMessage:
        "Thank you for the medication adjustment. I'm feeling much better.",
      timestamp: "15 min ago",
      unread: 0,
      priority: "normal",
      status: "offline",
    },
    {
      id: "3",
      participant: "Dr. Michael Chen",
      role: "Emergency Medicine",
      avatar: "/avatars/dr-chen.jpg",
      lastMessage: "URGENT: Need consultation on trauma case in ER bed 3",
      timestamp: "1 hour ago",
      unread: 1,
      priority: "urgent",
      status: "busy",
    },
    {
      id: "4",
      participant: "James Rodriguez",
      role: "Patient",
      avatar: "/avatars/james-rodriguez.jpg",
      lastMessage: "Can we reschedule my appointment for tomorrow?",
      timestamp: "2 hours ago",
      unread: 0,
      priority: "normal",
      status: "offline",
    },
    {
      id: "5",
      participant: "Nurse Lisa Thompson",
      role: "ICU Nurse",
      avatar: "/avatars/nurse-thompson.jpg",
      lastMessage: "Patient in room 204 is asking about discharge instructions",
      timestamp: "3 hours ago",
      unread: 1,
      priority: "normal",
      status: "online",
    },
  ];

  const messages = [
    {
      id: "1",
      senderId: "dr-johnson",
      senderName: "Dr. Sarah Johnson",
      content:
        "I've reviewed your latest test results. Overall, they look very encouraging.",
      timestamp: "10:30 AM",
      type: "text",
      isOwn: false,
    },
    {
      id: "2",
      senderId: "current-user",
      senderName: "You",
      content: "That's great to hear! What about the cholesterol levels?",
      timestamp: "10:32 AM",
      type: "text",
      isOwn: true,
    },
    {
      id: "3",
      senderId: "dr-johnson",
      senderName: "Dr. Sarah Johnson",
      content:
        "Your cholesterol has improved significantly since starting the new medication. We should continue with the current treatment plan.",
      timestamp: "10:35 AM",
      type: "text",
      isOwn: false,
    },
    {
      id: "4",
      senderId: "dr-johnson",
      senderName: "Dr. Sarah Johnson",
      content: "Lab results look good. Let's schedule a follow-up next week.",
      timestamp: "10:45 AM",
      type: "text",
      isOwn: false,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500 bg-red-50 dark:bg-red-900/20";
      case "high":
        return "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20";
      default:
        return "border-l-blue-500 bg-white dark:bg-gray-800";
    }
  };

  const sendMessage = () => {
    if (messageText.trim()) {
      // Handle sending message
      console.log("Sending message:", messageText);
      setMessageText("");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Secure Messaging
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            HIPAA-compliant communication between care team members and patients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Encrypted
          </Badge>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Conversations
                </span>
                <Badge variant="outline">
                  {conversations.filter((c) => c.unread > 0).length} unread
                </Badge>
              </CardTitle>
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 cursor-pointer transition-colors border-l-4 ${
                      selectedConversation === conversation.id
                        ? "bg-blue-50 dark:bg-blue-900/20 border-l-blue-500"
                        : getPriorityColor(conversation.priority)
                    } hover:bg-gray-50 dark:hover:bg-gray-700`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={conversation.avatar} />
                          <AvatarFallback>
                            {conversation.participant
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(conversation.status)}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {conversation.participant}
                          </h4>
                          <div className="flex items-center gap-1">
                            {conversation.priority === "urgent" && (
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            )}
                            {conversation.unread > 0 && (
                              <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                                {conversation.unread}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          {conversation.role}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                          {conversation.lastMessage}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {conversation.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>DJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">Dr. Sarah Johnson</h3>
                        <p className="text-sm text-gray-600">
                          Cardiologist • Online
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.isOwn ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Image className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mic className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 flex gap-2">
                      <Textarea
                        placeholder="Type a secure message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        rows={1}
                        className="resize-none"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!messageText.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    Select a Conversation
                  </h3>
                  <p className="text-sm">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Bell className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              5
            </div>
            <div className="text-sm text-gray-600">Urgent Messages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              23
            </div>
            <div className="text-sm text-gray-600">Active Conversations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              2.3h
            </div>
            <div className="text-sm text-gray-600">Avg Response Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              98%
            </div>
            <div className="text-sm text-gray-600">Message Delivery</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
