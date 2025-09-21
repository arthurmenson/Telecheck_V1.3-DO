import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  HeartPulse,
  Users,
  Activity,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  MessageCircle,
  Calendar,
  Bell,
  Stethoscope,
  UserCheck,
} from "lucide-react";

export function NurseDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Nurse Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, Nurse Jennifer Smith
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            <UserCheck className="w-4 h-4 mr-1" />
            On Duty
          </Badge>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Patients
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+2 from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Critical Alerts
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">
              Immediate attention needed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasks Complete
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18/22</div>
            <Progress value={82} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RPM Readings</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Today's submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Critical Patient Alerts
            </CardTitle>
            <CardDescription>
              Patients requiring immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                name: "Mary Johnson",
                condition: "Blood Pressure Spike",
                time: "5 min ago",
                severity: "high",
                value: "185/95 mmHg",
              },
              {
                name: "Robert Chen",
                condition: "Blood Glucose Critical",
                time: "12 min ago",
                severity: "high",
                value: "45 mg/dL",
              },
              {
                name: "Lisa Williams",
                condition: "Heart Rate Abnormal",
                time: "18 min ago",
                severity: "medium",
                value: "125 BPM",
              },
            ].map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      alert.severity === "high" ? "bg-red-500" : "bg-yellow-500"
                    }`}
                  />
                  <div>
                    <p className="font-medium">{alert.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {alert.condition} - {alert.value}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{alert.time}</p>
                  <Button size="sm" variant="outline">
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Today's Schedule
            </CardTitle>
            <CardDescription>Upcoming patient care activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                time: "09:00 AM",
                patient: "John Martinez",
                task: "Medication Administration",
                type: "routine",
              },
              {
                time: "10:30 AM",
                patient: "Sarah Thompson",
                task: "Wound Care Assessment",
                type: "assessment",
              },
              {
                time: "11:45 AM",
                patient: "David Wilson",
                task: "Telehealth Consultation",
                type: "telehealth",
              },
              {
                time: "02:00 PM",
                patient: "Emma Davis",
                task: "Patient Education Session",
                type: "education",
              },
              {
                time: "03:30 PM",
                patient: "Michael Brown",
                task: "Vital Signs Monitoring",
                type: "monitoring",
              },
            ].map((appointment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium w-16">
                    {appointment.time}
                  </div>
                  <div>
                    <p className="font-medium">{appointment.patient}</p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.task}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {appointment.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-purple-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Patient Care", href: "/ehr/intake", icon: Users },
              {
                name: "RPM Center",
                href: "/rpm-command-center",
                icon: Activity,
              },
              { name: "CCM Workflow", href: "/ccm-workflow", icon: HeartPulse },
              {
                name: "Vital Entry",
                href: "/vital-submission",
                icon: Activity,
              },
              { name: "Messages", href: "/ehr/messaging", icon: MessageCircle },
              {
                name: "Clinical Tools",
                href: "/ehr/clinical-tools",
                icon: Stethoscope,
              },
            ].map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => (window.location.href = action.href)}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-xs">{action.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
