import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Progress } from "../components/ui/progress";
import { useAuth } from "../contexts/AuthContext";
import {
  Pill,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Search,
  Filter,
  Scan,
  Shield,
  FileText,
  MessageCircle,
  Phone,
  Eye,
  Truck,
  TrendingUp,
  Activity,
  Brain,
  Zap,
} from "lucide-react";

export function PharmacistDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const pendingPrescriptions = [
    {
      id: "RX001",
      patient: "John Smith",
      medication: "Lisinopril 10mg",
      prescriber: "Dr. Wilson",
      quantity: 30,
      status: "pending_verification",
      priority: "routine",
      timestamp: "10 minutes ago",
      interactions: 0,
      insurance: "Verified",
    },
    {
      id: "RX002",
      patient: "Maria Garcia",
      medication: "Metformin 500mg",
      prescriber: "Dr. Johnson",
      quantity: 60,
      status: "interaction_alert",
      priority: "review_needed",
      timestamp: "25 minutes ago",
      interactions: 2,
      insurance: "Pending",
    },
    {
      id: "RX003",
      patient: "Robert Lee",
      medication: "Atorvastatin 20mg",
      prescriber: "Dr. Smith",
      quantity: 30,
      status: "ready_to_dispense",
      priority: "routine",
      timestamp: "1 hour ago",
      interactions: 0,
      insurance: "Verified",
    },
  ];

  const inventoryAlerts = [
    {
      medication: "Lisinopril 10mg",
      currentStock: 45,
      reorderLevel: 50,
      status: "low_stock",
      supplier: "Cardinal Health",
      lastOrdered: "2024-01-08",
    },
    {
      medication: "Metformin 500mg",
      currentStock: 12,
      reorderLevel: 25,
      status: "critical",
      supplier: "McKesson",
      lastOrdered: "2024-01-05",
    },
    {
      medication: "Amoxicillin 250mg",
      currentStock: 5,
      reorderLevel: 20,
      status: "out_of_stock",
      supplier: "AmerisourceBergen",
      lastOrdered: "2024-01-03",
    },
  ];

  const recentDispensing = [
    {
      id: "D001",
      patient: "Sarah Wilson",
      medication: "Atorvastatin 20mg",
      quantity: 30,
      dispensedBy: "You",
      timestamp: "2 hours ago",
      counselingProvided: true,
    },
    {
      id: "D002",
      patient: "David Brown",
      medication: "Lisinopril 5mg",
      quantity: 30,
      dispensedBy: "You",
      timestamp: "3 hours ago",
      counselingProvided: true,
    },
    {
      id: "D003",
      patient: "Emma Davis",
      medication: "Metformin 1000mg",
      quantity: 60,
      dispensedBy: "Colleague",
      timestamp: "4 hours ago",
      counselingProvided: false,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "interaction_alert":
        return "bg-red-100 text-red-800 border-red-200";
      case "ready_to_dispense":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStockColor = (status: string) => {
    switch (status) {
      case "low_stock":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-orange-100 text-orange-800";
      case "out_of_stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "review_needed":
        return "bg-red-100 text-red-800";
      case "routine":
        return "bg-blue-100 text-blue-800";
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
              <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Pharmacist Portal
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
                <BarChart3 className="w-4 h-4 mr-2" />
                Reports
              </Button>
              <Button className="gradient-bg text-white border-0">
                <Scan className="w-4 h-4 mr-2" />
                Scan Prescription
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
                    Pending Prescriptions
                  </p>
                  <p className="text-3xl font-bold text-foreground">15</p>
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
                    Dispensed Today
                  </p>
                  <p className="text-3xl font-bold text-foreground">42</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Low Stock Items
                  </p>
                  <p className="text-3xl font-bold text-foreground">7</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Patient Counseling
                  </p>
                  <p className="text-3xl font-bold text-foreground">28</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Prescriptions */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-foreground flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Pending Prescriptions
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search prescriptions..."
                        className="pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="glass-morphism p-4 rounded-xl border border-border/10 hover-lift"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Pill className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-foreground">
                              {prescription.medication}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {prescription.patient} • Qty:{" "}
                              {prescription.quantity}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={getPriorityColor(prescription.priority)}
                          >
                            {prescription.priority.replace("_", " ")}
                          </Badge>
                          <Badge
                            className={getStatusColor(prescription.status)}
                          >
                            {prescription.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-muted-foreground">
                            Prescriber:
                          </span>
                          <div className="font-medium">
                            {prescription.prescriber}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Insurance:
                          </span>
                          <div className="font-medium">
                            {prescription.insurance}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Interactions:
                          </span>
                          <div
                            className={`font-medium ${prescription.interactions > 0 ? "text-red-600" : "text-green-600"}`}
                          >
                            {prescription.interactions} detected
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Received:
                          </span>
                          <div className="font-medium">
                            {prescription.timestamp}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button variant="outline" size="sm">
                          <Shield className="w-4 h-4 mr-1" />
                          Verify
                        </Button>
                        <Button
                          size="sm"
                          className="gradient-bg text-white border-0"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Dispense
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Dispensing Activity */}
            <Card className="glass-morphism border border-border/20 mt-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Dispensing Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDispensing.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/10"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {item.medication}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.patient} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          {item.timestamp}
                        </div>
                        <div className="flex items-center space-x-1">
                          {item.counselingProvided ? (
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-50 text-green-700"
                            >
                              Counseled
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs bg-orange-50 text-orange-700"
                            >
                              No Counseling
                            </Badge>
                          )}
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
            {/* Inventory Alerts */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground flex items-center">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
                  Inventory Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventoryAlerts.map((alert, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border border-border/10 bg-background/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStockColor(alert.status)}>
                          {alert.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        {alert.medication}
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>Current: {alert.currentStock} units</div>
                        <div>Reorder at: {alert.reorderLevel} units</div>
                        <div>Supplier: {alert.supplier}</div>
                      </div>
                      <Progress
                        value={(alert.currentStock / alert.reorderLevel) * 100}
                        className="mt-2 h-2"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                      >
                        <Package className="w-3 h-3 mr-1" />
                        Reorder
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
                <Button variant="outline" className="w-full justify-start">
                  <Scan className="w-4 h-4 mr-2" />
                  Scan Prescription
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Brain className="w-4 h-4 mr-2" />
                  Drug Interaction Check
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Package className="w-4 h-4 mr-2" />
                  Inventory Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Patient Counseling
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dispensing Reports
                </Button>
              </CardContent>
            </Card>

            {/* Today's Performance */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  Today's Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Prescriptions Processed
                    </span>
                    <span className="font-bold text-foreground">42/50</span>
                  </div>
                  <Progress value={84} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Patient Interactions
                    </span>
                    <span className="font-bold text-foreground">28/35</span>
                  </div>
                  <Progress value={80} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Quality Score
                    </span>
                    <span className="font-bold text-green-600">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
