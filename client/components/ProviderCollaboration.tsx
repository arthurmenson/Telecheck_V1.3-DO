import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Users,
  MessageCircle,
  Phone,
  Video,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Send,
  Plus,
  Search,
  Filter,
  Eye,
  Share,
  FileText,
  Bell,
  Activity,
  Heart,
  Brain,
  Pill,
  TestTube,
  Settings,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

interface Provider {
  id: string;
  name: string;
  specialty: string;
  credentials: string;
  avatar?: string;
  status: "online" | "busy" | "away" | "offline";
  rating: number;
  responseTime: string;
  lastActive: Date;
}

interface Consultation {
  id: string;
  type:
    | "medication_review"
    | "complex_case"
    | "second_opinion"
    | "adverse_event";
  status: "pending" | "in_progress" | "completed" | "urgent";
  priority: "high" | "medium" | "low";
  requestedBy: Provider;
  assignedTo?: Provider;
  patient: {
    id: string;
    initials: string;
    age: number;
    conditions: string[];
  };
  title: string;
  description: string;
  requestedDate: Date;
  dueDate: Date;
  messages: ConsultationMessage[];
  attachments: string[];
  category: string;
}

interface ConsultationMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  type: "message" | "recommendation" | "alert" | "attachment";
  metadata?: Record<string, any>;
}

export function ProviderCollaboration() {
  const [activeTab, setActiveTab] = useState<
    "consultations" | "providers" | "messages"
  >("consultations");
  const [selectedConsultation, setSelectedConsultation] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState("");

  const providers: Provider[] = [
    {
      id: "1",
      name: "Dr. Sarah Chen",
      specialty: "Clinical Pharmacist",
      credentials: "PharmD, BCPS",
      status: "online",
      rating: 4.9,
      responseTime: "< 15 min",
      lastActive: new Date(),
    },
    {
      id: "2",
      name: "Dr. Michael Rodriguez",
      specialty: "Cardiologist",
      credentials: "MD, FACC",
      status: "busy",
      rating: 4.8,
      responseTime: "< 30 min",
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
    },
    {
      id: "3",
      name: "Dr. Emily Johnson",
      specialty: "Geriatrician",
      credentials: "MD, CMD",
      status: "online",
      rating: 4.9,
      responseTime: "< 20 min",
      lastActive: new Date(Date.now() - 5 * 60 * 1000),
    },
  ];

  const consultations: Consultation[] = [
    {
      id: "1",
      type: "medication_review",
      status: "urgent",
      priority: "high",
      requestedBy: providers[0],
      assignedTo: providers[1],
      patient: {
        id: "P001",
        initials: "J.D.",
        age: 72,
        conditions: ["Atrial Fibrillation", "Diabetes", "Hypertension"],
      },
      title: "Complex Polypharmacy Review",
      description:
        "Patient on 12 medications with potential drug interactions. Recent fall episode, concerned about sedating medications.",
      requestedDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
      messages: [
        {
          id: "1",
          senderId: "1",
          senderName: "Dr. Sarah Chen",
          content:
            "Patient J.D. (72 y/o) has concerning polypharmacy. Current medications include warfarin, metformin, amlodipine, and 9 others. Recent fall with no clear cause.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: "message",
        },
        {
          id: "2",
          senderId: "2",
          senderName: "Dr. Michael Rodriguez",
          content:
            "Reviewing the medication list now. I see several potentially inappropriate medications per Beers criteria. Let me analyze the cardiovascular aspects.",
          timestamp: new Date(Date.now() - 90 * 60 * 1000),
          type: "message",
        },
      ],
      attachments: ["medication_list.pdf", "recent_labs.pdf"],
      category: "Polypharmacy",
    },
    {
      id: "2",
      type: "adverse_event",
      status: "in_progress",
      priority: "high",
      requestedBy: providers[2],
      assignedTo: providers[0],
      patient: {
        id: "P002",
        initials: "M.S.",
        age: 65,
        conditions: ["Rheumatoid Arthritis", "GERD"],
      },
      title: "Suspected Methotrexate Hepatotoxicity",
      description:
        "Patient reports fatigue and nausea. Recent ALT elevation to 120 U/L. Currently on methotrexate 15mg weekly.",
      requestedDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
      messages: [],
      attachments: ["liver_function_tests.pdf"],
      category: "Adverse Event",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProviderStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "busy":
        return "bg-yellow-500";
      case "away":
        return "bg-orange-500";
      case "offline":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "medication_review":
        return <Pill className="w-4 h-4" />;
      case "complex_case":
        return <Brain className="w-4 h-4" />;
      case "second_opinion":
        return <Eye className="w-4 h-4" />;
      case "adverse_event":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${diffHours}h ago`;
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConsultation) return;

    // Add message logic here
    setNewMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-morphism border border-border/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground flex items-center">
              <Users className="w-6 h-6 mr-2 text-primary" />
              Provider Collaboration
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                New Consultation
              </Button>
              <Button size="sm" className="gradient-bg text-white border-0">
                <Video className="w-4 h-4 mr-2" />
                Video Call
              </Button>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            {["consultations", "providers", "messages"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab as any)}
                className={
                  activeTab === tab ? "gradient-bg text-white border-0" : ""
                }
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Tab Content */}
      {activeTab === "consultations" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consultations List */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  Active Consultations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consultations.map((consultation) => (
                    <div
                      key={consultation.id}
                      className={`glass-morphism p-6 rounded-xl border border-border/10 hover-lift cursor-pointer ${
                        selectedConsultation === consultation.id
                          ? "border-primary/50 bg-primary/5"
                          : ""
                      }`}
                      onClick={() => setSelectedConsultation(consultation.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {getTypeIcon(consultation.type)}
                          <div>
                            <h3 className="font-semibold text-foreground">
                              {consultation.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                className={getStatusColor(consultation.status)}
                              >
                                {consultation.status.replace("_", " ")}
                              </Badge>
                              <Badge
                                className={getPriorityColor(
                                  consultation.priority,
                                )}
                              >
                                {consultation.priority} priority
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {consultation.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <div>
                            Due: {consultation.dueDate.toLocaleDateString()}
                          </div>
                          <div>{formatTimeAgo(consultation.requestedDate)}</div>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        {consultation.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="glass-morphism p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">
                            Patient
                          </div>
                          <div className="font-medium text-foreground">
                            {consultation.patient.initials} (
                            {consultation.patient.age}y)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {consultation.patient.conditions
                              .slice(0, 2)
                              .join(", ")}
                            {consultation.patient.conditions.length > 2 &&
                              "..."}
                          </div>
                        </div>

                        <div className="glass-morphism p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">
                            Requested By
                          </div>
                          <div className="font-medium text-foreground">
                            {consultation.requestedBy.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {consultation.requestedBy.specialty}
                          </div>
                        </div>

                        <div className="glass-morphism p-3 rounded-lg">
                          <div className="text-xs text-muted-foreground mb-1">
                            Assigned To
                          </div>
                          <div className="font-medium text-foreground">
                            {consultation.assignedTo?.name || "Unassigned"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {consultation.assignedTo?.specialty ||
                              "Pending assignment"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{consultation.messages.length} messages</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{consultation.attachments.length} files</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Consultation Details */}
          <div>
            {selectedConsultation ? (
              <Card className="glass-morphism border border-border/20">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Consultation Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const consultation = consultations.find(
                      (c) => c.id === selectedConsultation,
                    );
                    if (!consultation) return null;

                    return (
                      <div className="space-y-4">
                        <div className="space-y-4 max-h-64 overflow-y-auto">
                          {consultation.messages.map((message) => (
                            <div
                              key={message.id}
                              className="glass-morphism p-3 rounded-lg"
                            >
                              <div className="flex items-center space-x-2 mb-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {message.senderName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-foreground">
                                  {message.senderName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatTimeAgo(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {message.content}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="flex space-x-2">
                          <Input
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) =>
                              e.key === "Enter" && sendMessage()
                            }
                          />
                          <Button
                            size="sm"
                            onClick={sendMessage}
                            className="gradient-bg text-white border-0"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Button variant="outline" className="w-full">
                            <Phone className="w-4 h-4 mr-2" />
                            Call Provider
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Video className="w-4 h-4 mr-2" />
                            Video Consultation
                          </Button>
                          <Button variant="outline" className="w-full">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Meeting
                          </Button>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-morphism border border-border/20">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Select a consultation to view details
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === "providers" && (
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">
              Available Providers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="glass-morphism p-6 rounded-xl border border-border/10 hover-lift"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback>
                          {provider.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${getProviderStatusColor(provider.status)} rounded-full border-2 border-background`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {provider.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {provider.credentials}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {provider.specialty}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Rating
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">
                          {provider.rating}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Response Time
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {provider.responseTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status
                      </span>
                      <Badge className={getStatusColor(provider.status)}>
                        {provider.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      className="gradient-bg text-white border-0 flex-1"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      Consult
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
