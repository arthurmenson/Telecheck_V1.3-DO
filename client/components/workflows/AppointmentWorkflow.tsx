import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  Calendar,
  Clock,
  Bell,
  Phone,
  Mail,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  UserCheck,
  Settings,
  BarChart3,
  Zap,
  Timer,
  Users,
} from "lucide-react";

const appointmentWorkflowSteps = [
  {
    id: 1,
    title: "Appointment Requested",
    description: "Patient requests appointment through portal or phone",
    automated: false,
    averageTime: "1 min",
    triggers: ["Online booking", "Phone call", "Provider referral"],
  },
  {
    id: 2,
    title: "Availability Check",
    description: "System checks provider availability and suggests times",
    automated: true,
    averageTime: "5 sec",
    triggers: ["Appointment request received"],
  },
  {
    id: 3,
    title: "Appointment Confirmed",
    description: "Patient confirms selected time slot",
    automated: false,
    averageTime: "2 min",
    triggers: ["Time slot selected"],
  },
  {
    id: 4,
    title: "Confirmation Sent",
    description: "Automated confirmation email and SMS sent",
    automated: true,
    averageTime: "10 sec",
    triggers: ["Appointment confirmed"],
  },
  {
    id: 5,
    title: "Pre-visit Preparation",
    description: "Send forms, instructions, and preparation materials",
    automated: true,
    averageTime: "1 min",
    triggers: ["24 hours before appointment"],
  },
  {
    id: 6,
    title: "Reminder Notifications",
    description: "24h and 2h reminder notifications via SMS/email",
    automated: true,
    averageTime: "5 sec each",
    triggers: ["24h before", "2h before"],
  },
  {
    id: 7,
    title: "Check-in Process",
    description: "Patient checks in via app or kiosk",
    automated: false,
    averageTime: "3 min",
    triggers: ["Patient arrival"],
  },
  {
    id: 8,
    title: "Post-visit Follow-up",
    description: "Send summary, next steps, and satisfaction survey",
    automated: true,
    averageTime: "2 min",
    triggers: ["Appointment completed"],
  },
];

const reminderStats = [
  {
    type: "24h Email Reminder",
    sent: 1247,
    opened: 1089,
    clicked: 892,
    rate: "87.3%",
  },
  {
    type: "24h SMS Reminder",
    sent: 1203,
    delivered: 1189,
    clicked: 734,
    rate: "98.8%",
  },
  {
    type: "2h Email Reminder",
    sent: 1156,
    opened: 967,
    clicked: 743,
    rate: "83.7%",
  },
  {
    type: "2h SMS Reminder",
    sent: 1134,
    delivered: 1127,
    clicked: 656,
    rate: "99.4%",
  },
];

export function AppointmentWorkflow() {
  const [selectedMetric, setSelectedMetric] = useState("reminders");

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-xl">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Appointment Scheduling Workflow
                </CardTitle>
                <CardDescription>
                  Automated appointment management and reminders
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  No-Show Rate
                </p>
                <p className="text-2xl font-bold text-green-600">3.2%</p>
                <p className="text-xs text-muted-foreground">
                  -67% from baseline
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Reminders Sent
                </p>
                <p className="text-2xl font-bold text-blue-600">4,740</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Response Rate
                </p>
                <p className="text-2xl font-bold text-purple-600">92.1%</p>
                <p className="text-xs text-muted-foreground">+15% this month</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Time Saved
                </p>
                <p className="text-2xl font-bold text-orange-600">28hrs</p>
                <p className="text-xs text-muted-foreground">Weekly average</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Timer className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Appointment Workflow Process
          </CardTitle>
          <CardDescription>
            End-to-end automated appointment management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {appointmentWorkflowSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      step.automated
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {step.id}
                  </div>
                  {index < appointmentWorkflowSteps.length - 1 && (
                    <div className="w-px h-16 bg-border mt-2" />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <div className="flex gap-2">
                      <Badge
                        variant={step.automated ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {step.automated ? "Automated" : "Manual"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {step.averageTime}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {step.triggers.map((trigger, triggerIndex) => (
                      <span
                        key={triggerIndex}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-xs rounded-md"
                      >
                        <Clock className="w-3 h-3" />
                        {trigger}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reminder Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Reminder Performance Analysis
          </CardTitle>
          <CardDescription>
            Effectiveness of automated appointment reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reminderStats.map((stat, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        stat.type.includes("Email")
                          ? "bg-blue-100"
                          : "bg-green-100"
                      }`}
                    >
                      {stat.type.includes("Email") ? (
                        <Mail
                          className={`w-4 h-4 ${
                            stat.type.includes("Email")
                              ? "text-blue-600"
                              : "text-green-600"
                          }`}
                        />
                      ) : (
                        <Phone
                          className={`w-4 h-4 ${
                            stat.type.includes("Email")
                              ? "text-blue-600"
                              : "text-green-600"
                          }`}
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{stat.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        Delivery rate: {stat.rate}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      {stat.sent}
                    </div>
                    <div className="text-sm text-muted-foreground">sent</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Delivered</p>
                    <p className="font-medium">
                      {stat.type.includes("Email")
                        ? stat.opened
                        : stat.delivered}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Engaged</p>
                    <p className="font-medium">{stat.clicked}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Success Rate</p>
                    <p className="font-medium text-green-600">{stat.rate}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <Progress value={parseFloat(stat.rate)} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Appointment Activity
            </CardTitle>
            <CardDescription>Latest scheduling events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  patient: "John Doe",
                  action: "Appointment confirmed",
                  time: "2 min ago",
                  type: "success",
                },
                {
                  patient: "Jane Smith",
                  action: "24h reminder sent",
                  time: "5 min ago",
                  type: "info",
                },
                {
                  patient: "Bob Johnson",
                  action: "Reschedule requested",
                  time: "8 min ago",
                  type: "warning",
                },
                {
                  patient: "Alice Brown",
                  action: "Check-in completed",
                  time: "12 min ago",
                  type: "success",
                },
                {
                  patient: "Charlie Wilson",
                  action: "No-show recorded",
                  time: "15 min ago",
                  type: "error",
                },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "success"
                        ? "bg-green-500"
                        : activity.type === "warning"
                          ? "bg-yellow-500"
                          : activity.type === "error"
                            ? "bg-red-500"
                            : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.patient}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.action}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Attention Required
            </CardTitle>
            <CardDescription>Items needing manual intervention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  issue: "Double booking detected",
                  patient: "Dr. Smith - 2:00 PM",
                  priority: "high",
                  action: "Resolve conflict",
                },
                {
                  issue: "Insurance verification failed",
                  patient: "Emma Davis",
                  priority: "medium",
                  action: "Manual verification",
                },
                {
                  issue: "Cancelled appointment needs rebooking",
                  patient: "Michael Chen",
                  priority: "low",
                  action: "Contact patient",
                },
                {
                  issue: "Provider running late",
                  patient: "Affects 3 appointments",
                  priority: "high",
                  action: "Notify patients",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-3 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle
                          className={`w-4 h-4 ${
                            item.priority === "high"
                              ? "text-red-600"
                              : item.priority === "medium"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        />
                        <p className="text-sm font-medium">{item.issue}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.patient}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-2">
                      {item.action}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
