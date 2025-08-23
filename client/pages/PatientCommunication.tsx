import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  MessageSquare,
  Send,
  Phone,
  Video,
  Mail,
  Bell,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Paperclip,
  Smile,
  Calendar,
  Clock,
  User,
  Users,
  Check,
  CheckCheck,
  AlertCircle,
  Info,
  Star,
  Archive,
  Trash2,
  Forward,
  Reply,
  Download,
  Image,
  FileText,
  Mic,
  Camera,
  Settings,
  Shield,
  Lock,
  Edit,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { usePatient } from "../hooks/api/usePatients";
import { PatientService } from "../services/patient.service";

interface PatientCommunicationProps {
  patientId?: string;
}

// Mock data for conversations
const mockConversations = [
  {
    id: "1",
    patientId: "PAT001",
    patientName: "Sarah Johnson",
    lastMessage: "Thank you for the medication instructions. I'll start taking them tomorrow morning.",
    lastMessageTime: "2024-02-15T14:30:00Z",
    unreadCount: 0,
    priority: "normal",
    type: "secure_message",
    status: "active",
    participants: ["Dr. Smith", "Sarah Johnson"]
  },
  {
    id: "2",
    patientId: "PAT002", 
    patientName: "Michael Brown",
    lastMessage: "I'm experiencing some side effects from the new medication. Can we discuss alternatives?",
    lastMessageTime: "2024-02-15T16:45:00Z",
    unreadCount: 2,
    priority: "high",
    type: "secure_message",
    status: "urgent",
    participants: ["Dr. Smith", "Michael Brown"]
  },
  {
    id: "3",
    patientId: "PAT003",
    patientName: "Emily Davis",
    lastMessage: "Appointment confirmation for next Tuesday at 2 PM",
    lastMessageTime: "2024-02-15T10:15:00Z",
    unreadCount: 0,
    priority: "normal",
    type: "appointment_reminder",
    status: "active",
    participants: ["Clinic", "Emily Davis"]
  },
  {
    id: "4",
    patientId: "PAT004",
    patientName: "Robert Taylor",
    lastMessage: "Lab results are ready for review",
    lastMessageTime: "2024-02-14T18:20:00Z",
    unreadCount: 1,
    priority: "medium",
    type: "lab_results",
    status: "active",
    participants: ["Lab Department", "Robert Taylor"]
  }
];

const mockMessages = [
  {
    id: "1",
    conversationId: "1",
    senderId: "PAT001",
    senderName: "Sarah Johnson",
    senderType: "patient",
    content: "Hi Dr. Smith, I wanted to follow up on my recent lab results. Are they within normal ranges?",
    timestamp: "2024-02-15T12:00:00Z",
    messageType: "text",
    status: "read",
    attachments: []
  },
  {
    id: "2",
    conversationId: "1",
    senderId: "DOC001",
    senderName: "Dr. Smith",
    senderType: "provider",
    content: "Hello Sarah! I've reviewed your lab results and I'm pleased to say they look much better than last time. Your HbA1c has improved from 8.2% to 7.4%. We're moving in the right direction with your diabetes management.",
    timestamp: "2024-02-15T12:15:00Z",
    messageType: "text",
    status: "read",
    attachments: []
  },
  {
    id: "3",
    conversationId: "1",
    senderId: "PAT001",
    senderName: "Sarah Johnson",
    senderType: "patient",
    content: "That's wonderful news! Thank you for the update. Should I continue with the same medication dosage?",
    timestamp: "2024-02-15T12:30:00Z",
    messageType: "text",
    status: "read",
    attachments: []
  },
  {
    id: "4",
    conversationId: "1",
    senderId: "DOC001",
    senderName: "Dr. Smith",
    senderType: "provider",
    content: "Yes, please continue with the current Metformin dosage of 500mg twice daily. I'm also attaching a dietary guide that might help you maintain these improvements.",
    timestamp: "2024-02-15T14:00:00Z",
    messageType: "text",
    status: "read",
    attachments: [
      {
        id: "1",
        name: "Diabetes_Dietary_Guide.pdf",
        type: "application/pdf",
        size: "2.4 MB",
        url: "#"
      }
    ]
  },
  {
    id: "5",
    conversationId: "1",
    senderId: "PAT001",
    senderName: "Sarah Johnson",
    senderType: "patient",
    content: "Thank you for the medication instructions. I'll start taking them tomorrow morning.",
    timestamp: "2024-02-15T14:30:00Z",
    messageType: "text",
    status: "delivered",
    attachments: []
  }
];

const mockTemplates = [
  {
    id: "1",
    name: "Appointment Reminder",
    category: "appointments",
    content: "Hi {patientName}, this is a reminder for your upcoming appointment on {date} at {time} with {provider}. Please arrive 15 minutes early. If you need to reschedule, please call us at least 24 hours in advance."
  },
  {
    id: "2",
    name: "Lab Results Available",
    category: "results", 
    content: "Hello {patientName}, your lab results from {date} are now available. Please log into your patient portal to review them, or we can discuss them during your next appointment."
  },
  {
    id: "3",
    name: "Medication Reminder",
    category: "medication",
    content: "Hi {patientName}, this is a reminder to take your {medicationName} as prescribed. If you have any questions or concerns about your medication, please don't hesitate to reach out."
  },
  {
    id: "4",
    name: "Follow-up Required",
    category: "follow-up",
    content: "Hello {patientName}, we need to schedule a follow-up appointment to discuss your recent {condition} treatment. Please call our office at your earliest convenience to schedule."
  }
];

export function PatientCommunication({ patientId: propPatientId }: PatientCommunicationProps) {
  const { patientId: urlPatientId } = useParams<{ patientId?: string }>();
  const patientId = propPatientId || urlPatientId;

  const [activeTab, setActiveTab] = useState("messages");
  const [selectedConversation, setSelectedConversation] = useState<string | null>("1");
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewMessageDialog, setShowNewMessageDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // New message state
  const [newMessage, setNewMessage] = useState({
    recipient: '',
    subject: '',
    content: '',
    priority: 'normal',
    type: 'secure_message'
  });

  // Hooks - only fetch patient if patientId is provided and valid
  const { data: patient, isLoading: patientLoading } = usePatient(
    patientId && patientId !== 'default' ? patientId : '',
    !!(patientId && patientId !== 'default')
  );

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation]);

  // Filter conversations based on search
  const filteredConversations = useMemo(() => {
    return mockConversations.filter(conv =>
      conv.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // Get messages for selected conversation
  const conversationMessages = useMemo(() => {
    if (!selectedConversation) return [];
    return mockMessages.filter(msg => msg.conversationId === selectedConversation);
  }, [selectedConversation]);

  // Get conversation stats
  const conversationStats = useMemo(() => {
    const total = mockConversations.length;
    const unread = mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
    const urgent = mockConversations.filter(conv => conv.priority === 'high').length;
    const active = mockConversations.filter(conv => conv.status === 'active').length;

    return { total, unread, urgent, active };
  }, []);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    // Mock sending message
    console.log('Sending message:', messageText);
    setMessageText("");
  };

  const handleNewMessage = () => {
    // Mock creating new message
    console.log('Creating new message:', newMessage);
    setShowNewMessageDialog(false);
    setNewMessage({
      recipient: '',
      subject: '',
      content: '',
      priority: 'normal',
      type: 'secure_message'
    });
  };

  const handleUseTemplate = () => {
    const template = mockTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      setMessageText(template.content);
      setShowTemplateDialog(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'normal':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'secure_message':
        return <MessageSquare className="w-4 h-4" />;
      case 'appointment_reminder':
        return <Calendar className="w-4 h-4" />;
      case 'lab_results':
        return <FileText className="w-4 h-4" />;
      case 'medication':
        return <Info className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              Patient Communication
            </h1>
            <p className="text-muted-foreground">Secure messaging and communication hub</p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button onClick={() => setShowNewMessageDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Message
            </Button>
          </div>
        </div>

        {/* Communication Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Conversations</p>
                  <p className="text-2xl font-bold text-foreground">{conversationStats.total}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Unread Messages</p>
                  <p className="text-2xl font-bold text-foreground">{conversationStats.unread}</p>
                  <p className="text-xs text-muted-foreground">Require attention</p>
                </div>
                <Bell className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Urgent Messages</p>
                  <p className="text-2xl font-bold text-foreground">{conversationStats.urgent}</p>
                  <p className="text-xs text-muted-foreground">High priority</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Conversations</p>
                  <p className="text-2xl font-bold text-foreground">{conversationStats.active}</p>
                  <p className="text-xs text-muted-foreground">Ongoing discussions</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[700px]">
              
              {/* Conversations List */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Conversations</CardTitle>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 border-b cursor-pointer hover:bg-muted/50 ${
                          selectedConversation === conversation.id ? 'bg-muted' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {conversation.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm truncate">{conversation.patientName}</h4>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(conversation.type)}
                                {conversation.unreadCount > 0 && (
                                  <Badge className="bg-red-500 text-white text-xs px-1 min-w-[16px] h-4">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground truncate mb-2">
                              {conversation.lastMessage}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTime(conversation.lastMessageTime)}
                              </span>
                              <Badge className={getPriorityColor(conversation.priority)} variant="outline">
                                {conversation.priority}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Message Thread */}
              <Card className="lg:col-span-2">
                {selectedConversation ? (
                  <>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {mockConversations.find(c => c.id === selectedConversation)?.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">
                              {mockConversations.find(c => c.id === selectedConversation)?.patientName}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {mockConversations.find(c => c.id === selectedConversation)?.participants.join(', ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Phone className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Video className="w-4 h-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Star className="w-4 h-4 mr-2" />
                                Star
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Forward className="w-4 h-4 mr-2" />
                                Forward
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex flex-col h-[500px]">
                      {/* Messages */}
                      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                        {conversationMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.senderType === 'provider' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.senderType === 'provider'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium">
                                  {message.senderName}
                                </span>
                                <span className="text-xs opacity-70">
                                  {formatTime(message.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm">{message.content}</p>
                              
                              {message.attachments.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {message.attachments.map((attachment) => (
                                    <div
                                      key={attachment.id}
                                      className="flex items-center gap-2 p-2 bg-black/10 rounded text-xs"
                                    >
                                      <FileText className="w-4 h-4" />
                                      <span className="flex-1">{attachment.name}</span>
                                      <span>{attachment.size}</span>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                        <Download className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              <div className="flex items-center justify-end mt-1">
                                {message.status === 'read' && <CheckCheck className="w-3 h-3 opacity-70" />}
                                {message.status === 'delivered' && <Check className="w-3 h-3 opacity-70" />}
                              </div>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Message Input */}
                      <div className="border-t pt-4">
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Textarea
                              placeholder="Type your message..."
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              className="min-h-[60px] pr-20"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                            />
                            <div className="absolute bottom-2 right-2 flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowTemplateDialog(true)}
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Paperclip className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Smile className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <Button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim()}
                            className="self-end"
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
                      <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                      <p>Choose a conversation from the list to start messaging</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Message Templates</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                          {template.content}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" className="flex-1">
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="broadcast" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Broadcast Messages</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Send messages to multiple patients at once
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="broadcast-recipients">Recipients</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select patient group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Patients</SelectItem>
                        <SelectItem value="diabetes">Diabetes Patients</SelectItem>
                        <SelectItem value="hypertension">Hypertension Patients</SelectItem>
                        <SelectItem value="recent">Recent Appointments</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="broadcast-subject">Subject</Label>
                    <Input
                      id="broadcast-subject"
                      placeholder="Enter message subject"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="broadcast-message">Message</Label>
                    <Textarea
                      id="broadcast-message"
                      placeholder="Enter your message..."
                      rows={6}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Send
                    </Button>
                    <Button>
                      <Send className="w-4 h-4 mr-2" />
                      Send Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Communication Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Message encryption</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable end-to-end encryption for all messages
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-green-600" />
                      <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Auto-reply for urgent messages</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically acknowledge urgent messages
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Message retention policy</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically archive messages after 1 year
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notification preferences</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure how you receive message notifications
                      </p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Message Dialog */}
        <Dialog open={showNewMessageDialog} onOpenChange={setShowNewMessageDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
              <DialogDescription>
                Send a secure message to a patient
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient</Label>
                <Select 
                  value={newMessage.recipient} 
                  onValueChange={(value) => setNewMessage({ ...newMessage, recipient: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockConversations.map((conv) => (
                      <SelectItem key={conv.id} value={conv.patientName}>
                        {conv.patientName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder="Enter message subject"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newMessage.priority} 
                    onValueChange={(value) => setNewMessage({ ...newMessage, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="type">Message Type</Label>
                  <Select 
                    value={newMessage.type} 
                    onValueChange={(value) => setNewMessage({ ...newMessage, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="secure_message">Secure Message</SelectItem>
                      <SelectItem value="appointment_reminder">Appointment Reminder</SelectItem>
                      <SelectItem value="lab_results">Lab Results</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  placeholder="Enter your message..."
                  rows={6}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewMessageDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleNewMessage}>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Template Dialog */}
        <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Use Template</DialogTitle>
              <DialogDescription>
                Select a template to insert into your message
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {mockTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTemplate && (
                <div className="p-3 bg-muted rounded border">
                  <h4 className="font-medium mb-2">
                    {mockTemplates.find(t => t.id === selectedTemplate)?.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {mockTemplates.find(t => t.id === selectedTemplate)?.content}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUseTemplate} disabled={!selectedTemplate}>
                Use Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
