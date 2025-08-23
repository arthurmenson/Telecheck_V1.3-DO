import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  FileText,
  Users,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Save,
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  Star,
  Activity,
  Stethoscope,
  Heart,
  Brain,
  Pill,
  Thermometer,
  Scale,
  Timer,
} from "lucide-react";

// Mock chart data
const chartStats = [
  {
    title: "Charts Today",
    value: "23",
    change: "+5 from yesterday",
    icon: FileText,
    color: "#3b82f6"
  },
  {
    title: "Pending Reviews",
    value: "8",
    change: "Requires attention",
    icon: AlertTriangle,
    color: "#f59e0b"
  },
  {
    title: "Completed Charts",
    value: "156",
    change: "This week",
    icon: CheckCircle,
    color: "#10b981"
  },
  {
    title: "Average Chart Time",
    value: "12 min",
    change: "-2 min improvement",
    icon: Timer,
    color: "#8b5cf6"
  }
];

const recentCharts = [
  {
    id: "CHART001",
    patientName: "Sarah Johnson",
    patientId: "PAT001",
    chartType: "Progress Note",
    status: "completed",
    lastModified: "2024-02-15 14:30",
    provider: "Dr. Smith",
    diagnoses: ["Type 2 Diabetes", "Hypertension"],
    priority: "routine"
  },
  {
    id: "CHART002", 
    patientName: "Michael Brown",
    patientId: "PAT002",
    chartType: "Initial Assessment",
    status: "in-progress",
    lastModified: "2024-02-15 13:45",
    provider: "Dr. Johnson",
    diagnoses: ["Chest Pain", "Anxiety"],
    priority: "urgent"
  },
  {
    id: "CHART003",
    patientName: "Emily Davis",
    patientId: "PAT003", 
    chartType: "Follow-up Note",
    status: "pending-review",
    lastModified: "2024-02-15 12:20",
    provider: "Dr. Wilson",
    diagnoses: ["Migraine", "Sleep Disorder"],
    priority: "routine"
  },
  {
    id: "CHART004",
    patientName: "Robert Taylor",
    patientId: "PAT004",
    chartType: "Discharge Summary",
    status: "draft",
    lastModified: "2024-02-15 11:15",
    provider: "Dr. Davis",
    diagnoses: ["Post-operative", "Pain Management"],
    priority: "high"
  }
];

const chartTemplates = [
  { id: "template1", name: "Progress Note", category: "General", uses: 245 },
  { id: "template2", name: "Initial Assessment", category: "Assessment", uses: 189 },
  { id: "template3", name: "Follow-up Note", category: "General", uses: 167 },
  { id: "template4", name: "Discharge Summary", category: "Discharge", uses: 134 },
  { id: "template5", name: "Consultation Note", category: "Specialty", uses: 98 },
  { id: "template6", name: "Procedure Note", category: "Procedure", uses: 76 }
];

export function ClinicalCharting() {
  const [activeTab, setActiveTab] = useState("active-charts");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewChart, setShowNewChart] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const filteredCharts = recentCharts.filter(chart => {
    const matchesSearch = chart.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chart.chartType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || chart.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending-review": return "bg-yellow-100 text-yellow-800";
      case "draft": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "routine": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              Clinical Charting
            </h1>
            <p className="text-muted-foreground">Comprehensive patient charting and clinical documentation</p>
          </div>
          
          <Dialog open={showNewChart} onOpenChange={setShowNewChart}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Chart
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Chart</DialogTitle>
                <DialogDescription>
                  Start a new clinical chart for a patient
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientSearch">Patient</Label>
                    <Input id="patientSearch" placeholder="Search patient..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chartTemplate">Chart Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {chartTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} - {template.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chiefComplaint">Chief Complaint</Label>
                  <Textarea id="chiefComplaint" placeholder="Patient's primary concern..." rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewChart(false)}>
                  Cancel
                </Button>
                <Button>Create Chart</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {chartStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <Icon className="w-8 h-8" style={{ color: stat.color }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active-charts">Active Charts</TabsTrigger>
            <TabsTrigger value="templates">Chart Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="active-charts" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search charts or patients..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="pending-review">Pending Review</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts List */}
            <div className="space-y-4">
              {filteredCharts.map((chart) => (
                <Card key={chart.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{chart.patientName}</h3>
                            <p className="text-sm text-muted-foreground">ID: {chart.patientId}</p>
                          </div>
                          <Badge className={getStatusBadgeColor(chart.status)}>
                            {chart.status.replace("-", " ")}
                          </Badge>
                          <Badge className={getPriorityBadgeColor(chart.priority)}>
                            {chart.priority}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Chart Type:</span>
                            <p className="text-muted-foreground">{chart.chartType}</p>
                          </div>
                          <div>
                            <span className="font-medium">Provider:</span>
                            <p className="text-muted-foreground">{chart.provider}</p>
                          </div>
                          <div>
                            <span className="font-medium">Last Modified:</span>
                            <p className="text-muted-foreground">{chart.lastModified}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <span className="font-medium text-sm">Diagnoses:</span>
                          <div className="flex gap-2 mt-1">
                            {chart.diagnoses.map((diagnosis, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {diagnosis}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-6">
                        <Button size="sm" className="gap-2">
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Chart Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {chartTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-all duration-200 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{template.name}</h4>
                          <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Used {template.uses} times
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-3 h-3 mr-1" />
                            Preview
                          </Button>
                          <Button size="sm" className="flex-1">
                            <Plus className="w-3 h-3 mr-1" />
                            Use
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Charting Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Chart Completion Time</span>
                      <span className="font-medium">12 minutes</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Charts Completed On Time</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Template Utilization</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Provider Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dr. Smith</span>
                      <span className="font-medium">45 charts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dr. Johnson</span>
                      <span className="font-medium">38 charts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dr. Wilson</span>
                      <span className="font-medium">32 charts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dr. Davis</span>
                      <span className="font-medium">28 charts</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
