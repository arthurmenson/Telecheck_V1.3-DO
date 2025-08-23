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
  ClipboardList,
  Users,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
  Target,
  CheckCircle,
  AlertTriangle,
  Star,
  Activity,
  Heart,
  Brain,
  Pill,
  Dumbbell,
  Apple,
  Timer,
  TrendingUp,
  FileText,
} from "lucide-react";

// Mock care plan data
const carePlanStats = [
  {
    title: "Active Care Plans",
    value: "67",
    change: "+8 this month",
    icon: ClipboardList,
    color: "#8b5cf6"
  },
  {
    title: "Goals Achieved",
    value: "234",
    change: "This quarter",
    icon: Target,
    color: "#10b981"
  },
  {
    title: "Avg. Plan Duration",
    value: "45 days",
    change: "Typical completion",
    icon: Timer,
    color: "#3b82f6"
  },
  {
    title: "Patient Adherence",
    value: "87%",
    change: "+5% improvement",
    icon: TrendingUp,
    color: "#f59e0b"
  }
];

const activeCarePlans = [
  {
    id: "CP001",
    patientName: "Sarah Johnson",
    patientId: "PAT001",
    planTitle: "Diabetes Management Plan",
    condition: "Type 2 Diabetes",
    status: "active",
    progress: 75,
    startDate: "2024-01-15",
    targetDate: "2024-04-15",
    provider: "Dr. Smith",
    goals: [
      { id: 1, text: "Maintain HbA1c below 7%", status: "in-progress", progress: 80 },
      { id: 2, text: "Lose 10 pounds", status: "completed", progress: 100 },
      { id: 3, text: "Exercise 150 min/week", status: "in-progress", progress: 65 }
    ],
    priority: "high"
  },
  {
    id: "CP002", 
    patientName: "Michael Brown",
    patientId: "PAT002",
    planTitle: "Hypertension Control Plan",
    condition: "Hypertension",
    status: "active",
    progress: 60,
    startDate: "2024-02-01", 
    targetDate: "2024-05-01",
    provider: "Dr. Johnson",
    goals: [
      { id: 1, text: "BP below 130/80", status: "in-progress", progress: 70 },
      { id: 2, text: "Reduce sodium intake", status: "in-progress", progress: 55 },
      { id: 3, text: "Daily medication compliance", status: "completed", progress: 100 }
    ],
    priority: "medium"
  },
  {
    id: "CP003",
    patientName: "Emily Davis",
    patientId: "PAT003",
    planTitle: "Weight Management Program",
    condition: "Obesity",
    status: "active",
    progress: 45,
    startDate: "2024-01-30",
    targetDate: "2024-07-30",
    provider: "Dr. Wilson",
    goals: [
      { id: 1, text: "Lose 25 pounds", status: "in-progress", progress: 40 },
      { id: 2, text: "Meal prep 5 days/week", status: "in-progress", progress: 60 },
      { id: 3, text: "Join fitness program", status: "completed", progress: 100 }
    ],
    priority: "medium"
  },
  {
    id: "CP004",
    patientName: "Robert Taylor", 
    patientId: "PAT004",
    planTitle: "Post-Surgery Recovery Plan",
    condition: "Post-operative",
    status: "active",
    progress: 90,
    startDate: "2024-02-10",
    targetDate: "2024-03-10",
    provider: "Dr. Davis",
    goals: [
      { id: 1, text: "Complete physical therapy", status: "in-progress", progress: 85 },
      { id: 2, text: "Pain management", status: "completed", progress: 100 },
      { id: 3, text: "Return to normal activities", status: "in-progress", progress: 75 }
    ],
    priority: "high"
  }
];

const planTemplates = [
  { id: "template1", name: "Diabetes Management", category: "Chronic Care", uses: 156 },
  { id: "template2", name: "Hypertension Control", category: "Chronic Care", uses: 142 },
  { id: "template3", name: "Weight Management", category: "Lifestyle", uses: 98 },
  { id: "template4", name: "Post-Surgery Recovery", category: "Recovery", uses: 76 },
  { id: "template5", name: "Mental Health Support", category: "Behavioral", uses: 64 },
  { id: "template6", name: "Cardiac Rehabilitation", category: "Rehabilitation", uses: 45 }
];

export function CarePlans() {
  const [activeTab, setActiveTab] = useState("active-plans");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const filteredPlans = activeCarePlans.filter(plan => {
    const matchesSearch = plan.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.planTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "on-hold": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getGoalStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in-progress": return <Clock className="w-4 h-4 text-blue-600" />;
      case "not-started": return <AlertTriangle className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <ClipboardList className="w-8 h-8 text-primary" />
              Care Plans
            </h1>
            <p className="text-muted-foreground">Personalized care plan management and goal tracking</p>
          </div>
          
          <Dialog open={showNewPlan} onOpenChange={setShowNewPlan}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Care Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Care Plan</DialogTitle>
                <DialogDescription>
                  Start a new personalized care plan for a patient
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientSearch">Patient</Label>
                    <Input id="patientSearch" placeholder="Search patient..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="planTemplate">Care Plan Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {planTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name} - {template.category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="planTitle">Plan Title</Label>
                  <Input id="planTitle" placeholder="Enter care plan title..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition">Primary Condition</Label>
                  <Input id="condition" placeholder="e.g., Type 2 Diabetes" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input id="startDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetDate">Target Completion</Label>
                    <Input id="targetDate" type="date" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewPlan(false)}>
                  Cancel
                </Button>
                <Button>Create Care Plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {carePlanStats.map((stat, idx) => {
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
            <TabsTrigger value="active-plans">Active Care Plans</TabsTrigger>
            <TabsTrigger value="templates">Plan Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="active-plans" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search care plans, patients, or conditions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Care Plans List */}
            <div className="space-y-6">
              {filteredPlans.map((plan) => (
                <Card key={plan.id} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Plan Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{plan.planTitle}</h3>
                            <p className="text-sm text-muted-foreground">
                              {plan.patientName} • {plan.condition}
                            </p>
                          </div>
                          <Badge className={getStatusBadgeColor(plan.status)}>
                            {plan.status}
                          </Badge>
                          <Badge className={getPriorityBadgeColor(plan.priority)}>
                            {plan.priority} priority
                          </Badge>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          <Button size="sm" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {/* Plan Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Progress</span>
                          <span className="font-medium">{plan.progress}%</span>
                        </div>
                        <Progress value={plan.progress} className="h-2" />
                      </div>

                      {/* Plan Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Provider:</span>
                          <p className="text-muted-foreground">{plan.provider}</p>
                        </div>
                        <div>
                          <span className="font-medium">Start Date:</span>
                          <p className="text-muted-foreground">{plan.startDate}</p>
                        </div>
                        <div>
                          <span className="font-medium">Target Date:</span>
                          <p className="text-muted-foreground">{plan.targetDate}</p>
                        </div>
                      </div>

                      {/* Goals */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Care Goals</h4>
                        <div className="space-y-2">
                          {plan.goals.map((goal) => (
                            <div key={goal.id} className="flex items-center gap-3 p-3 border rounded-lg">
                              {getGoalStatusIcon(goal.status)}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium">{goal.text}</span>
                                  <span className="text-xs text-muted-foreground">{goal.progress}%</span>
                                </div>
                                <Progress value={goal.progress} className="h-1" />
                              </div>
                            </div>
                          ))}
                        </div>
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
                  Care Plan Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {planTemplates.map((template) => (
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
                    Plan Completion Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Diabetes Management</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Hypertension Control</span>
                      <span className="font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Weight Management</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Post-Surgery Recovery</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Goal Achievement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">87%</div>
                      <p className="text-sm text-muted-foreground">Average Goal Completion</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Goals Completed This Month</span>
                        <span className="font-medium">234</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Goals In Progress</span>
                        <span className="font-medium">89</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Overdue Goals</span>
                        <span className="font-medium text-red-600">12</span>
                      </div>
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
