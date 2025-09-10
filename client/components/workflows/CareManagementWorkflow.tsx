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
  Heart,
  Calendar,
  Bell,
  CheckCircle,
  Clock,
  Users,
  Pill,
  Activity,
  Target,
  TrendingUp,
  AlertTriangle,
  Settings,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  Stethoscope,
} from "lucide-react";

const careWorkflowSteps = [
  {
    id: 1,
    title: "Care Plan Creation",
    description: "AI-assisted care plan development based on condition",
    automated: true,
    duration: "5 min",
    triggers: ["Diagnosis confirmed", "Provider assessment"],
    interventions: [
      "Evidence-based protocols",
      "Personalized goals",
      "Risk stratification",
    ],
  },
  {
    id: 2,
    title: "Patient Education",
    description:
      "Automated delivery of condition-specific educational materials",
    automated: true,
    duration: "2 min",
    triggers: ["Care plan created"],
    interventions: [
      "Educational videos",
      "Written materials",
      "Interactive modules",
    ],
  },
  {
    id: 3,
    title: "Medication Management",
    description:
      "Prescription setup, interaction checks, and adherence monitoring",
    automated: true,
    duration: "3 min",
    triggers: ["Medications prescribed"],
    interventions: [
      "Drug interaction alerts",
      "Dosing reminders",
      "Refill automation",
    ],
  },
  {
    id: 4,
    title: "Monitoring Schedule",
    description: "Set up regular check-ins and vital sign monitoring",
    automated: true,
    duration: "2 min",
    triggers: ["Care plan activated"],
    interventions: ["Vital tracking", "Symptom monitoring", "Lab scheduling"],
  },
  {
    id: 5,
    title: "Follow-up Appointments",
    description: "Automated scheduling of progression check appointments",
    automated: true,
    duration: "1 min",
    triggers: ["Care plan milestones"],
    interventions: ["Auto-scheduling", "Provider alerts", "Patient reminders"],
  },
  {
    id: 6,
    title: "Progress Tracking",
    description:
      "Continuous monitoring of patient progress and goal achievement",
    automated: true,
    duration: "Ongoing",
    triggers: ["Patient data updates"],
    interventions: ["Goal tracking", "Outcome measurement", "Progress reports"],
  },
  {
    id: 7,
    title: "Care Team Coordination",
    description: "Communication and task coordination among care team members",
    automated: true,
    duration: "Ongoing",
    triggers: ["Care team updates"],
    interventions: ["Team notifications", "Task assignments", "Status updates"],
  },
  {
    id: 8,
    title: "Outcome Assessment",
    description: "Regular evaluation and care plan adjustments",
    automated: false,
    duration: "15 min",
    triggers: ["Scheduled assessments"],
    interventions: [
      "Clinical review",
      "Plan modifications",
      "Goal adjustments",
    ],
  },
];

const conditionPrograms = [
  {
    condition: "Diabetes Management",
    patients: 234,
    averageHbA1c: "7.2%",
    improvement: "-0.8%",
    completionRate: 87,
    color: "blue",
  },
  {
    condition: "Hypertension Control",
    patients: 189,
    averageBP: "138/85",
    improvement: "-12/8 mmHg",
    completionRate: 92,
    color: "green",
  },
  {
    condition: "Heart Failure",
    patients: 67,
    averageEF: "45%",
    improvement: "+5%",
    completionRate: 78,
    color: "red",
  },
  {
    condition: "COPD Management",
    patients: 43,
    averageFEV1: "62%",
    improvement: "+3%",
    completionRate: 81,
    color: "orange",
  },
];

export function CareManagementWorkflow() {
  const [selectedCondition, setSelectedCondition] = useState(
    "Diabetes Management",
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  Care Management Workflow
                </CardTitle>
                <CardDescription>
                  Automated chronic disease management and care coordination
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

      {/* Care Program Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {conditionPrograms.map((program, index) => (
          <Card
            key={index}
            className={`cursor-pointer transition-all ${
              selectedCondition === program.condition
                ? "ring-2 ring-primary shadow-lg"
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedCondition(program.condition)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">{program.condition}</h3>
                <div
                  className={`w-3 h-3 rounded-full bg-${program.color}-500`}
                />
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      Patients Enrolled
                    </span>
                    <span className="font-medium">{program.patients}</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Avg. Outcome</span>
                    <span className="font-medium">
                      {program.averageHbA1c ||
                        program.averageBP ||
                        program.averageEF ||
                        program.averageFEV1}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Improvement</span>
                    <span className="font-medium text-green-600">
                      {program.improvement}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Completion</span>
                    <span className="font-medium">
                      {program.completionRate}%
                    </span>
                  </div>
                  <Progress value={program.completionRate} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {selectedCondition} Workflow Process
          </CardTitle>
          <CardDescription>
            Automated care coordination and monitoring workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {careWorkflowSteps.map((step, index) => (
              <div key={step.id} className="flex gap-4">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      step.automated
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {step.id}
                  </div>
                  {index < careWorkflowSteps.length - 1 && (
                    <div className="w-px h-20 bg-border mt-2" />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 pb-8">
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
                        {step.duration}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {step.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {step.triggers.map((trigger, triggerIndex) => (
                        <span
                          key={triggerIndex}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950/20 text-xs rounded-md text-blue-700 dark:text-blue-300"
                        >
                          <Clock className="w-3 h-3" />
                          {trigger}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1">
                      {step.interventions.map(
                        (intervention, interventionIndex) => (
                          <div
                            key={interventionIndex}
                            className="flex items-center gap-2 text-xs"
                          >
                            <CheckCircle className="w-3 h-3 text-green-600" />
                            <span className="text-muted-foreground">
                              {intervention}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Patient Progress Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Goal Achievement Tracking
            </CardTitle>
            <CardDescription>
              Real-time monitoring of patient care goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  goal: "HbA1c < 7%",
                  current: "7.2%",
                  target: "7.0%",
                  progress: 85,
                  trend: "improving",
                },
                {
                  goal: "Weight Loss 10lbs",
                  current: "6lbs",
                  target: "10lbs",
                  progress: 60,
                  trend: "stable",
                },
                {
                  goal: "Exercise 150min/week",
                  current: "120min",
                  target: "150min",
                  progress: 80,
                  trend: "improving",
                },
                {
                  goal: "Med Adherence 95%",
                  current: "92%",
                  target: "95%",
                  progress: 97,
                  trend: "declining",
                },
              ].map((goal, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{goal.goal}</h4>
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        className={`w-4 h-4 ${
                          goal.trend === "improving"
                            ? "text-green-600"
                            : goal.trend === "stable"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      />
                      <Badge variant="outline" className="text-xs">
                        {goal.current}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={goal.progress} className="h-2 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Current: {goal.current}</span>
                    <span>Target: {goal.target}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Care Alerts & Interventions
            </CardTitle>
            <CardDescription>Active alerts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  patient: "John Doe",
                  alert: "Missed medication dose",
                  priority: "high",
                  time: "2 hours ago",
                  action: "Contact patient",
                },
                {
                  patient: "Jane Smith",
                  alert: "Blood pressure spike",
                  priority: "high",
                  time: "4 hours ago",
                  action: "Schedule follow-up",
                },
                {
                  patient: "Bob Johnson",
                  alert: "Overdue lab work",
                  priority: "medium",
                  time: "1 day ago",
                  action: "Send reminder",
                },
                {
                  patient: "Alice Brown",
                  alert: "Care plan goal not met",
                  priority: "low",
                  time: "2 days ago",
                  action: "Adjust goals",
                },
              ].map((alert, index) => (
                <div
                  key={index}
                  className={`p-3 border rounded-lg ${
                    alert.priority === "high"
                      ? "border-red-200 bg-red-50 dark:bg-red-950/20"
                      : alert.priority === "medium"
                        ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20"
                        : "border-blue-200 bg-blue-50 dark:bg-blue-950/20"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle
                          className={`w-4 h-4 ${
                            alert.priority === "high"
                              ? "text-red-600"
                              : alert.priority === "medium"
                                ? "text-yellow-600"
                                : "text-blue-600"
                          }`}
                        />
                        <p className="text-sm font-medium">{alert.patient}</p>
                        <Badge
                          className={`text-xs ${
                            alert.priority === "high"
                              ? "bg-red-100 text-red-800"
                              : alert.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {alert.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {alert.alert}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {alert.time}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-2">
                      {alert.action}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Care Team Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Care Team Activity
          </CardTitle>
          <CardDescription>
            Recent care coordination and team communications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                member: "Dr. Sarah Wilson",
                role: "Endocrinologist",
                action: "Updated medication protocol",
                patient: "John Doe",
                time: "15 min ago",
                type: "update",
              },
              {
                member: "Nurse Amy Johnson",
                role: "Care Coordinator",
                action: "Completed wellness check",
                patient: "Jane Smith",
                time: "1 hour ago",
                type: "completed",
              },
              {
                member: "Dr. Michael Brown",
                role: "Primary Care",
                action: "Reviewed lab results",
                patient: "Bob Johnson",
                time: "2 hours ago",
                type: "review",
              },
              {
                member: "Pharmacist Lisa Davis",
                role: "Clinical Pharmacist",
                action: "Drug interaction alert resolved",
                patient: "Alice Brown",
                time: "3 hours ago",
                type: "alert",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === "update"
                      ? "bg-blue-100"
                      : activity.type === "completed"
                        ? "bg-green-100"
                        : activity.type === "review"
                          ? "bg-purple-100"
                          : "bg-orange-100"
                  }`}
                >
                  {activity.type === "update" ? (
                    <FileText className="w-5 h-5 text-blue-600" />
                  ) : activity.type === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : activity.type === "review" ? (
                    <Stethoscope className="w-5 h-5 text-purple-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{activity.member}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.role}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Patient: {activity.patient}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                  <Button variant="ghost" size="sm" className="mt-1">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
