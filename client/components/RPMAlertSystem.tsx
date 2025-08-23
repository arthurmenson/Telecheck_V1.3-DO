import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import {
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Smartphone,
  Users,
  Settings,
  Volume2,
  VolumeX,
  Calendar,
  Timer,
  Target,
  Heart,
  Pill,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  X,
  ChevronRight,
  Star,
  Flag,
  Siren,
  Gauge,
  Thermometer,
  Droplets,
  Scale,
  BatteryLow
} from "lucide-react";

interface AlertRule {
  id: string;
  name: string;
  category: "clinical" | "device" | "medication" | "appointment" | "system";
  type: "threshold" | "trend" | "missing_data" | "device_status" | "schedule";
  priority: "low" | "medium" | "high" | "critical";
  isActive: boolean;
  conditions: {
    parameter: string;
    operator: ">" | "<" | "=" | ">=" | "<=" | "between" | "absent";
    value: number | string;
    duration?: string;
  }[];
  actions: {
    type: "notification" | "call" | "sms" | "email" | "escalation";
    recipient: string;
    delay?: number;
    template: string;
  }[];
  escalationRules: {
    delay: number;
    recipient: string;
    method: "call" | "sms" | "email";
  }[];
  suppressionRules: {
    samePeriod: number; // minutes
    maxPerDay: number;
  };
  createdBy: string;
  createdDate: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface ActiveAlert {
  id: string;
  ruleId: string;
  ruleName: string;
  patientId: string;
  patientName: string;
  priority: "low" | "medium" | "high" | "critical";
  category: string;
  message: string;
  timestamp: string;
  status: "active" | "acknowledged" | "resolved" | "escalated";
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  escalationLevel: number;
  context: {
    currentValue?: number | string;
    threshold?: number | string;
    trend?: "rising" | "falling" | "stable";
    deviceId?: string;
    lastReading?: string;
  };
  actions: {
    type: string;
    status: "pending" | "sent" | "delivered" | "failed";
    timestamp: string;
    recipient: string;
  }[];
}

interface NotificationTemplate {
  id: string;
  name: string;
  category: string;
  channel: "sms" | "email" | "push" | "call";
  subject: string;
  message: string;
  variables: string[];
  isDefault: boolean;
}

const mockAlertRules: AlertRule[] = [
  {
    id: "rule_001",
    name: "Critical Hypoglycemia",
    category: "clinical",
    type: "threshold",
    priority: "critical",
    isActive: true,
    conditions: [
      { parameter: "glucose", operator: "<", value: 54 }
    ],
    actions: [
      { type: "call", recipient: "primary_care_team", delay: 0, template: "critical_hypo" },
      { type: "sms", recipient: "patient", delay: 0, template: "patient_hypo_alert" },
      { type: "notification", recipient: "care_coordinator", delay: 0, template: "care_team_alert" }
    ],
    escalationRules: [
      { delay: 5, recipient: "on_call_physician", method: "call" },
      { delay: 15, recipient: "emergency_contact", method: "call" }
    ],
    suppressionRules: { samePeriod: 30, maxPerDay: 10 },
    createdBy: "Dr. Sarah Chen",
    createdDate: "2024-01-01T10:00:00",
    lastTriggered: "2024-01-15T14:30:00",
    triggerCount: 3
  },
  {
    id: "rule_002",
    name: "Persistent Hyperglycemia",
    category: "clinical",
    type: "threshold",
    priority: "high",
    isActive: true,
    conditions: [
      { parameter: "glucose", operator: ">", value: 250, duration: "2 hours" }
    ],
    actions: [
      { type: "notification", recipient: "diabetes_educator", delay: 0, template: "hyperglycemia_alert" },
      { type: "sms", recipient: "patient", delay: 5, template: "patient_high_glucose" }
    ],
    escalationRules: [
      { delay: 30, recipient: "physician", method: "call" }
    ],
    suppressionRules: { samePeriod: 60, maxPerDay: 5 },
    createdBy: "Maria Rodriguez, RN",
    createdDate: "2024-01-01T10:00:00",
    triggerCount: 12
  },
  {
    id: "rule_003",
    name: "Device Battery Low",
    category: "device",
    type: "threshold",
    priority: "medium",
    isActive: true,
    conditions: [
      { parameter: "battery_level", operator: "<", value: 20 }
    ],
    actions: [
      { type: "notification", recipient: "patient", delay: 0, template: "battery_low" },
      { type: "email", recipient: "care_coordinator", delay: 0, template: "device_maintenance" }
    ],
    escalationRules: [],
    suppressionRules: { samePeriod: 720, maxPerDay: 2 },
    createdBy: "System",
    createdDate: "2024-01-01T10:00:00",
    triggerCount: 8
  },
  {
    id: "rule_004",
    name: "Missed Medication Reminder",
    category: "medication",
    type: "schedule",
    priority: "medium",
    isActive: true,
    conditions: [
      { parameter: "medication_taken", operator: "absent", value: "30 minutes" }
    ],
    actions: [
      { type: "sms", recipient: "patient", delay: 0, template: "medication_reminder" },
      { type: "notification", recipient: "care_coordinator", delay: 60, template: "medication_missed" }
    ],
    escalationRules: [
      { delay: 120, recipient: "emergency_contact", method: "call" }
    ],
    suppressionRules: { samePeriod: 60, maxPerDay: 8 },
    createdBy: "Pharmacy Team",
    createdDate: "2024-01-01T10:00:00",
    triggerCount: 25
  }
];

const mockActiveAlerts: ActiveAlert[] = [
  {
    id: "alert_001",
    ruleId: "rule_001",
    ruleName: "Critical Hypoglycemia",
    patientId: "rpm_001",
    patientName: "Margaret Thompson",
    priority: "critical",
    category: "clinical",
    message: "Blood glucose critically low at 48 mg/dL. Immediate intervention required.",
    timestamp: "2024-01-16T14:30:00",
    status: "active",
    escalationLevel: 1,
    context: {
      currentValue: 48,
      threshold: 54,
      trend: "falling",
      deviceId: "dexcom_g7_001",
      lastReading: "2024-01-16T14:28:00"
    },
    actions: [
      { type: "call", status: "pending", timestamp: "2024-01-16T14:30:00", recipient: "primary_care_team" },
      { type: "sms", status: "sent", timestamp: "2024-01-16T14:30:05", recipient: "patient" }
    ]
  },
  {
    id: "alert_002",
    ruleId: "rule_002",
    ruleName: "Persistent Hyperglycemia",
    patientId: "rpm_002",
    patientName: "Robert Chen",
    priority: "high",
    category: "clinical",
    message: "Blood glucose elevated above 250 mg/dL for over 2 hours.",
    timestamp: "2024-01-16T13:00:00",
    status: "acknowledged",
    acknowledgedBy: "Dr. Sarah Chen",
    acknowledgedAt: "2024-01-16T13:15:00",
    escalationLevel: 0,
    context: {
      currentValue: 268,
      threshold: 250,
      trend: "stable",
      deviceId: "freestyle_libre_001"
    },
    actions: [
      { type: "notification", status: "delivered", timestamp: "2024-01-16T13:00:00", recipient: "diabetes_educator" },
      { type: "sms", status: "delivered", timestamp: "2024-01-16T13:05:00", recipient: "patient" }
    ]
  }
];

const notificationTemplates: NotificationTemplate[] = [
  {
    id: "critical_hypo",
    name: "Critical Hypoglycemia Alert",
    category: "clinical",
    channel: "call",
    subject: "URGENT: Critical Low Blood Sugar",
    message: "Patient {{patientName}} has critical hypoglycemia at {{currentValue}} mg/dL. Immediate intervention required. Current trend: {{trend}}.",
    variables: ["patientName", "currentValue", "trend"],
    isDefault: true
  },
  {
    id: "patient_hypo_alert",
    name: "Patient Hypoglycemia SMS",
    category: "clinical",
    channel: "sms",
    subject: "",
    message: "🚨 URGENT: Your blood sugar is critically low at {{currentValue}} mg/dL. Take 15g fast-acting carbs immediately. If symptoms persist, call 911.",
    variables: ["currentValue"],
    isDefault: true
  },
  {
    id: "medication_reminder",
    name: "Medication Reminder",
    category: "medication",
    channel: "sms",
    subject: "",
    message: "💊 Reminder: Time to take your {{medicationName}} ({{dosage}}). Reply TAKEN when complete.",
    variables: ["medicationName", "dosage"],
    isDefault: true
  }
];

export function RPMAlertSystem() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [alertRules, setAlertRules] = useState<AlertRule[]>(mockAlertRules);
  const [activeAlerts, setActiveAlerts] = useState<ActiveAlert[]>(mockActiveAlerts);
  const [selectedAlert, setSelectedAlert] = useState<ActiveAlert | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("active");

  const totalAlerts = activeAlerts.length;
  const criticalAlerts = activeAlerts.filter(a => a.priority === "critical").length;
  const unacknowledgedAlerts = activeAlerts.filter(a => a.status === "active").length;
  const avgResponseTime = 8; // Mock data in minutes

  const handleAcknowledgeAlert = (alertId: string) => {
    setActiveAlerts(activeAlerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: "acknowledged", acknowledgedBy: "Current User", acknowledgedAt: new Date().toISOString() }
        : alert
    ));
  };

  const handleResolveAlert = (alertId: string) => {
    setActiveAlerts(activeAlerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: "resolved", resolvedBy: "Current User", resolvedAt: new Date().toISOString() }
        : alert
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "text-red-600 bg-red-50 border-red-200";
      case "high": return "text-orange-600 bg-orange-50 border-orange-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-blue-600 bg-blue-50 border-blue-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return <Siren className="w-5 h-5" />;
      case "high": return <AlertTriangle className="w-5 h-5" />;
      case "medium": return <AlertCircle className="w-5 h-5" />;
      case "low": return <Info className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const filteredAlerts = activeAlerts.filter(alert => {
    const priorityMatch = filterPriority === "all" || alert.priority === filterPriority;
    const statusMatch = filterStatus === "all" || alert.status === filterStatus;
    return priorityMatch && statusMatch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            RPM Alert System
          </h1>
          <p className="text-muted-foreground">
            Intelligent monitoring and notification management for patient safety
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            {unacknowledgedAlerts} Active
          </Badge>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Rule
          </Button>
        </div>
      </div>

      {/* Critical Alerts Banner */}
      {criticalAlerts > 0 && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <Siren className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>{criticalAlerts} CRITICAL ALERT{criticalAlerts > 1 ? 'S' : ''}</strong> - Immediate attention required
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                <div className="text-2xl font-bold">{totalAlerts}</div>
                <p className="text-sm text-muted-foreground">Last 24 hours</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical</p>
                <div className="text-2xl font-bold text-red-600">{criticalAlerts}</div>
                <p className="text-sm text-red-600">Needs immediate action</p>
              </div>
              <Siren className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unacknowledged</p>
                <div className="text-2xl font-bold text-orange-600">{unacknowledgedAlerts}</div>
                <p className="text-sm text-muted-foreground">Awaiting response</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                <div className="text-2xl font-bold text-green-600">{avgResponseTime}m</div>
                <p className="text-sm text-green-600">Response time</p>
              </div>
              <Timer className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Real-time Alert Feed</CardTitle>
                <CardDescription>Live monitoring of patient alerts and system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeAlerts.slice(0, 5).map((alert) => (
                  <Card key={alert.id} className={`p-4 border-l-4 ${
                    alert.priority === "critical" ? "border-l-red-500" :
                    alert.priority === "high" ? "border-l-orange-500" :
                    alert.priority === "medium" ? "border-l-yellow-500" : "border-l-blue-500"
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${getPriorityColor(alert.priority)}`}>
                          {getPriorityIcon(alert.priority)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{alert.patientName}</h4>
                            <Badge variant={alert.priority === "critical" ? "destructive" : "outline"}>
                              {alert.priority}
                            </Badge>
                            <Badge variant={
                              alert.status === "active" ? "destructive" :
                              alert.status === "acknowledged" ? "secondary" : "default"
                            }>
                              {alert.status}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-2">{alert.ruleName}</p>
                          <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                            <span>Rule: {alert.ruleId}</span>
                            {alert.context.deviceId && <span>Device: {alert.context.deviceId}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {alert.status === "active" && (
                          <Button size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Acknowledge
                          </Button>
                        )}
                        {alert.status === "acknowledged" && (
                          <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)}>
                            Resolve
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setSelectedAlert(alert)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Alert Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-green-600">95%</div>
                      <div className="text-sm text-muted-foreground">Resolution Rate</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold">3.2m</div>
                      <div className="text-sm text-muted-foreground">Avg Response</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-blue-600">24</div>
                      <div className="text-sm text-muted-foreground">Today's Alerts</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-2xl font-bold text-purple-600">8</div>
                      <div className="text-sm text-muted-foreground">Active Rules</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Alert Engine</span>
                    <Badge variant="default">Online</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">SMS Gateway</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Email Service</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Call Service</span>
                    <Badge variant="secondary">Maintenance</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Device Monitoring</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">Active Alerts</h3>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="acknowledged">Acknowledged</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.priority === "critical" ? "border-l-red-500" :
                alert.priority === "high" ? "border-l-orange-500" :
                alert.priority === "medium" ? "border-l-yellow-500" : "border-l-blue-500"
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getPriorityColor(alert.priority)}`}>
                        {getPriorityIcon(alert.priority)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{alert.patientName}</h4>
                          <Badge variant={alert.priority === "critical" ? "destructive" : "outline"}>
                            {alert.priority}
                          </Badge>
                          <Badge variant={
                            alert.status === "active" ? "destructive" :
                            alert.status === "acknowledged" ? "secondary" : "default"
                          }>
                            {alert.status}
                          </Badge>
                        </div>
                        <h5 className="font-medium text-sm mb-1">{alert.ruleName}</h5>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {alert.context && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t text-sm">
                      {alert.context.currentValue && (
                        <div>
                          <span className="text-muted-foreground">Current: </span>
                          <span className="font-medium">{alert.context.currentValue}</span>
                        </div>
                      )}
                      {alert.context.threshold && (
                        <div>
                          <span className="text-muted-foreground">Threshold: </span>
                          <span className="font-medium">{alert.context.threshold}</span>
                        </div>
                      )}
                      {alert.context.trend && (
                        <div>
                          <span className="text-muted-foreground">Trend: </span>
                          <span className="font-medium flex items-center">
                            {alert.context.trend === "rising" && <TrendingUp className="w-3 h-3 mr-1 text-red-500" />}
                            {alert.context.trend === "falling" && <TrendingDown className="w-3 h-3 mr-1 text-blue-500" />}
                            {alert.context.trend}
                          </span>
                        </div>
                      )}
                      {alert.escalationLevel > 0 && (
                        <div>
                          <span className="text-muted-foreground">Escalation: </span>
                          <Badge variant="destructive">Level {alert.escalationLevel}</Badge>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-4 pt-3 border-t">
                    <div className="flex space-x-2">
                      {alert.status === "active" && (
                        <Button size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Acknowledge
                        </Button>
                      )}
                      {alert.status === "acknowledged" && (
                        <Button size="sm" variant="outline" onClick={() => handleResolveAlert(alert.id)}>
                          Resolve
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Call Patient
                      </Button>
                    </div>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline" onClick={() => setSelectedAlert(alert)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Alert Rules</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Rule
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{rule.name}</CardTitle>
                      <CardDescription>
                        {rule.category} • {rule.type} • Created by {rule.createdBy}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={rule.priority === "critical" ? "destructive" : "outline"}>
                        {rule.priority}
                      </Badge>
                      <Switch checked={rule.isActive} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Conditions</Label>
                    <div className="space-y-1">
                      {rule.conditions.map((condition, idx) => (
                        <p key={idx} className="text-sm font-medium">
                          {condition.parameter} {condition.operator} {condition.value}
                          {condition.duration && ` for ${condition.duration}`}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Actions</Label>
                    <div className="flex flex-wrap gap-1">
                      {rule.actions.map((action, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {action.type} → {action.recipient}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Triggered</Label>
                      <p className="font-medium">{rule.triggerCount} times</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Last Triggered</Label>
                      <p className="font-medium">
                        {rule.lastTriggered ? new Date(rule.lastTriggered).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Test
                      </Button>
                    </div>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Notification Templates</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {notificationTemplates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription>
                        {template.channel} • {template.category}
                      </CardDescription>
                    </div>
                    <Badge variant={template.isDefault ? "default" : "outline"}>
                      {template.isDefault ? "Default" : "Custom"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {template.subject && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Subject</Label>
                      <p className="text-sm font-medium">{template.subject}</p>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm text-muted-foreground">Message</Label>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                      {template.message}
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Variables</Label>
                    <div className="flex flex-wrap gap-1">
                      {template.variables.map((variable, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                    {!template.isDefault && (
                      <Button size="sm" variant="outline">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure how alerts are delivered</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>SMS Notifications</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Email Notifications</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Push Notifications</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Voice Calls</Label>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div>
                  <Label>Default Escalation Delay</Label>
                  <Select defaultValue="15">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Quiet Hours</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="time" defaultValue="22:00" />
                    <Input type="time" defaultValue="07:00" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Non-critical alerts will be suppressed during these hours
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure alert engine behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Alert Retention Period</Label>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">6 months</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Maximum Alerts per Patient per Day</Label>
                  <Input type="number" defaultValue="20" />
                </div>

                <div>
                  <Label>Auto-resolve Timeout</Label>
                  <Select defaultValue="24">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                      <SelectItem value="48">48 hours</SelectItem>
                      <SelectItem value="168">1 week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Enable Machine Learning</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Adaptive Thresholds</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Predictive Alerts</Label>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ children, className, htmlFor, ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  htmlFor?: string;
  [key: string]: any;
}) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
      {children}
    </label>
  );
}
