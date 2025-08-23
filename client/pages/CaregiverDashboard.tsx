import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Heart,
  Users,
  Activity,
  Clock,
  MessageCircle,
  Calendar,
  HeartPulse,
  User,
  CheckCircle2,
  AlertCircle,
  Home,
  Phone,
  Pill,
  TrendingUp,
} from "lucide-react";

export function CaregiverDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Caregiver Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Maria Rodriguez
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Home className="w-4 h-4 mr-1" />
            Active Care
          </Badge>
          <Button variant="outline" size="sm">
            <Phone className="w-4 h-4 mr-2" />
            Emergency Contact
          </Button>
        </div>
      </div>

      {/* Patient Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Care Recipients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Under your care</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8/12</div>
            <Progress value={67} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vitals Recorded</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Care Hours</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.5</div>
            <p className="text-xs text-muted-foreground">Today's hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient Care Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Current Patients
            </CardTitle>
            <CardDescription>
              People under your care today
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                name: "Eleanor Patterson",
                age: 78,
                condition: "Diabetes Management",
                status: "stable",
                lastReading: "2 hours ago",
                nextTask: "Lunch medication",
              },
              {
                name: "George Williams",
                age: 82,
                condition: "Post-Surgery Recovery",
                status: "monitoring",
                lastReading: "45 min ago",
                nextTask: "Wound check",
              },
              {
                name: "Martha Davis",
                age: 74,
                condition: "Hypertension",
                status: "attention",
                lastReading: "6 hours ago",
                nextTask: "Blood pressure check",
              },
            ].map((patient, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{patient.name}, {patient.age}</p>
                    <p className="text-sm text-muted-foreground">{patient.condition}</p>
                    <p className="text-xs text-muted-foreground">
                      Last reading: {patient.lastReading}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    variant="outline"
                    className={
                      patient.status === "stable"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : patient.status === "monitoring"
                        ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                        : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {patient.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    Next: {patient.nextTask}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Today's Care Schedule
            </CardTitle>
            <CardDescription>
              Planned activities and appointments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              {
                time: "08:30 AM",
                patient: "Eleanor Patterson",
                task: "Morning medication",
                status: "completed",
              },
              {
                time: "10:00 AM",
                patient: "George Williams",
                task: "Vital signs check",
                status: "completed",
              },
              {
                time: "12:00 PM",
                patient: "Eleanor Patterson",
                task: "Lunch & medication",
                status: "pending",
              },
              {
                time: "02:00 PM",
                patient: "Martha Davis",
                task: "Blood pressure monitoring",
                status: "pending",
              },
              {
                time: "04:00 PM",
                patient: "George Williams",
                task: "Wound care",
                status: "pending",
              },
              {
                time: "06:00 PM",
                patient: "Eleanor Patterson",
                task: "Evening medication",
                status: "pending",
              },
            ].map((task, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium w-16">{task.time}</div>
                  <div>
                    <p className="font-medium">{task.patient}</p>
                    <p className="text-sm text-muted-foreground">{task.task}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === "completed" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}
                  <Badge
                    variant="outline"
                    className={
                      task.status === "completed"
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            Quick Care Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: "Record Vitals", href: "/vital-submission", icon: HeartPulse },
              { name: "Patient RPM", href: "/patient-rpm", icon: Activity },
              { name: "Diabetes Monitor", href: "/diabetes-rpm-dashboard", icon: TrendingUp },
              { name: "Send Message", href: "/ehr/messaging", icon: MessageCircle },
              { name: "Schedule", href: "/schedule", icon: Calendar },
              { name: "Family Portal", href: "/ehr/portal", icon: Users },
            ].map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-20 flex flex-col items-center gap-2"
                onClick={() => window.location.href = action.href}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-xs">{action.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Care Notes & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Important Reminders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800">
                Eleanor's blood glucose check due in 30 minutes
              </p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-800">
                George's family visiting at 3 PM today
              </p>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-800">
                Martha missed morning medication - contact nurse
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-sm">Dr. Wilson</p>
                <span className="text-xs text-muted-foreground">10 min ago</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Please increase Eleanor's BP monitoring frequency today.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-sm">Nurse Smith</p>
                <span className="text-xs text-muted-foreground">1 hour ago</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Great work on George's wound care documentation.
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-sm">Family (Patterson)</p>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Thank you for the update on mom's condition today.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
