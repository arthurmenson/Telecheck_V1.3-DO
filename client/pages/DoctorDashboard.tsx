import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { CompactAIScribe } from "../components/CompactAIScribe";
import { useAuth } from "../contexts/AuthContext";
import {
  Stethoscope,
  Users,
  Calendar,
  FileText,
  Brain,
  Pill,
  AlertTriangle,
  CheckCircle,
  Clock,
  Video,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Activity,
  MessageCircle,
  Phone,
  Eye,
  Edit,
  Send,
} from "lucide-react";

export function DoctorDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [showScribeWidget, setShowScribeWidget] = useState(false);

  const todaysAppointments = [
    {
      id: "1",
      time: "09:00 AM",
      patient: "John Smith",
      type: "Telehealth Consultation",
      status: "upcoming",
      condition: "Hypertension Follow-up",
      urgency: "routine",
    },
    {
      id: "2",
      time: "10:30 AM",
      patient: "Maria Garcia",
      type: "AI-Assisted Diagnosis",
      status: "in_progress",
      condition: "Chest Pain Assessment",
      urgency: "urgent",
    },
    {
      id: "3",
      time: "02:00 PM",
      patient: "Robert Johnson",
      type: "Prescription Review",
      status: "upcoming",
      condition: "Diabetes Management",
      urgency: "routine",
    },
  ];

  const pendingReviews = [
    {
      id: "1",
      patient: "Sarah Wilson",
      type: "Lab Results",
      description: "Comprehensive Metabolic Panel - Abnormal Values",
      priority: "high",
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      patient: "David Lee",
      type: "AI Consultation",
      description: "Cardiovascular Risk Assessment Complete",
      priority: "medium",
      timestamp: "4 hours ago",
    },
    {
      id: "3",
      patient: "Emma Davis",
      type: "Prescription Request",
      description: "Medication Adjustment - Lisinopril",
      priority: "low",
      timestamp: "6 hours ago",
    },
  ];

  const recentPatients = [
    {
      id: "1",
      name: "James Brown",
      lastVisit: "2024-01-10",
      condition: "Type 2 Diabetes",
      riskLevel: "moderate",
      aiInsights: "Glucose trends improving",
    },
    {
      id: "2",
      name: "Lisa Anderson",
      lastVisit: "2024-01-08",
      condition: "Hypertension",
      riskLevel: "low",
      aiInsights: "BP well controlled",
    },
    {
      id: "3",
      name: "Michael Turner",
      lastVisit: "2024-01-05",
      condition: "High Cholesterol",
      riskLevel: "high",
      aiInsights: "Statin therapy recommended",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_progress":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
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
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "bg-red-100 text-red-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Doctor Portal
                </h1>
                <p className="text-muted-foreground">
                  Welcome back, {user?.name} • {user?.specialization}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">{user?.license}</Badge>
                  <Badge variant="outline">{user?.organization}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule
              </Button>
              <Button className="gradient-bg text-white border-0" asChild>
                <Link to="/consultation/new">
                  <Video className="w-4 h-4 mr-2" />
                  Start Consultation
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Today's Patients
                  </p>
                  <p className="text-3xl font-bold text-foreground">8</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Reviews
                  </p>
                  <p className="text-3xl font-bold text-foreground">5</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    AI Consultations
                  </p>
                  <p className="text-3xl font-bold text-foreground">12</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Prescriptions</p>
                  <p className="text-3xl font-bold text-foreground">24</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Pill className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="glass-morphism p-4 rounded-xl border border-border/10 hover-lift"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {appointment.time}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {appointment.patient}
                            </div>
                          </div>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <div className="font-medium">{appointment.type}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Condition:
                          </span>
                          <div className="font-medium">
                            {appointment.condition}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 mt-3">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="gradient-bg text-white border-0"
                          asChild
                        >
                          <Link to={`/consultation/${appointment.id}`}>
                            <Video className="w-4 h-4 mr-1" />
                            Start
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Patients */}
            <Card className="glass-morphism border border-border/20 mt-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Recent Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="glass-morphism p-4 rounded-xl border border-border/10 hover-lift"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-foreground mb-1">
                            {patient.name}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Last visit:{" "}
                            {new Date(patient.lastVisit).toLocaleDateString()}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{patient.condition}</Badge>
                            <Badge className={getRiskColor(patient.riskLevel)}>
                              {patient.riskLevel} risk
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-2">
                            AI Insights
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {patient.aiInsights}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Reviews */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground flex items-center">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                  Pending Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingReviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-3 rounded-lg border border-border/10 bg-background/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getPriorityColor(review.priority)}>
                          {review.priority} priority
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {review.timestamp}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        {review.patient}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">
                        {review.type}
                      </div>
                      <div className="text-xs text-foreground">
                        {review.description}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                      >
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/ehr/ai-scribe">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Medical Scribe
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  New Prescription
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  AI Diagnosis
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Lab Orders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Patient Messages
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Floating AI Scribe Widget Toggle */}
        {!showScribeWidget && (
          <div className="fixed bottom-4 right-4 z-40">
            <Button
              onClick={() => setShowScribeWidget(true)}
              className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 shadow-lg"
              title="Open AI Scribe"
            >
              <Brain className="w-6 h-6" />
            </Button>
          </div>
        )}

        {/* Floating AI Scribe Widget */}
        {showScribeWidget && (
          <CompactAIScribe
            patientName="Quick Recording"
            appointmentType="Dashboard Notes"
            onTranscriptionComplete={(transcript) => {
              console.log("Dashboard transcript:", transcript);
            }}
            isExpanded={false}
            onToggleExpand={() => setShowScribeWidget(false)}
            className="fixed bottom-4 right-4 z-50"
          />
        )}
      </div>
    </div>
  );
}
