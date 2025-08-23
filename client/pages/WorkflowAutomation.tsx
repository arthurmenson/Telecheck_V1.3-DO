import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
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
import { Progress } from "../components/ui/progress";
import {
  Workflow,
  Settings,
  Calendar,
  Users,
  MessageSquare,
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  ArrowRight,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Copy,
  Brain,
  Zap,
  Target,
  Bell,
  Mail,
  Phone,
  UserPlus,
  Activity,
  BarChart3,
  Filter,
  Search,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Info,
  Star,
  Heart,
  Shield,
  Sparkles,
  Timer,
  Database,
  Link,
  Eye,
  Stethoscope,
  Pill,
  TestTube
} from "lucide-react";

// Mock data for workflows
const activeWorkflows = [
  {
    id: "WF001",
    name: "Patient Onboarding",
    description: "Automated intake, documents, and portal setup",
    status: "active",
    trigger: "Appointment Scheduled",
    patients: 847,
    completion: 94,
    lastUpdated: "2024-02-15",
    category: "onboarding",
    steps: 8,
    automatedSteps: 6
  },
  {
    id: "WF002", 
    name: "Appointment Reminders",
    description: "SMS and email reminders 24h and 2h before",
    status: "active",
    trigger: "Appointment Created",
    patients: 1203,
    completion: 98,
    lastUpdated: "2024-02-14",
    category: "scheduling",
    steps: 4,
    automatedSteps: 4
  },
  {
    id: "WF003",
    name: "Care Plan Follow-up",
    description: "Weekly check-ins and progress tracking",
    status: "active", 
    trigger: "Care Plan Assigned",
    patients: 356,
    completion: 87,
    lastUpdated: "2024-02-13",
    category: "care",
    steps: 12,
    automatedSteps: 9
  },
  {
    id: "WF004",
    name: "Lab Results Processing",
    description: "Auto-process, notify, and schedule follow-ups",
    status: "active",
    trigger: "Lab Results Received",
    patients: 452,
    completion: 91,
    lastUpdated: "2024-02-12",
    category: "clinical",
    steps: 6,
    automatedSteps: 5
  },
  {
    id: "WF005",
    name: "Payment Collection",
    description: "Automated billing and payment reminders",
    status: "paused",
    trigger: "Service Completed",
    patients: 289,
    completion: 76,
    lastUpdated: "2024-02-10",
    category: "billing",
    steps: 7,
    automatedSteps: 4
  }
];

const workflowTemplates = [
  {
    id: "TPL001",
    name: "New Patient Complete Onboarding",
    description: "Full onboarding with intake forms, insurance verification, and portal setup",
    category: "onboarding",
    steps: 12,
    estimatedTime: "3-5 days",
    popularity: 95,
    icon: UserPlus
  },
  {
    id: "TPL002", 
    name: "Chronic Care Management",
    description: "Ongoing monitoring and check-ins for chronic conditions",
    category: "care",
    steps: 15,
    estimatedTime: "Ongoing",
    popularity: 88,
    icon: Heart
  },
  {
    id: "TPL003",
    name: "Preventive Care Reminders",
    description: "Annual screenings, vaccinations, and wellness checks",
    category: "preventive",
    steps: 8,
    estimatedTime: "Monthly",
    popularity: 92,
    icon: Shield
  },
  {
    id: "TPL004",
    name: "Medication Management",
    description: "Prescription refills, interaction checks, and adherence tracking",
    category: "medication",
    steps: 10,
    estimatedTime: "Weekly",
    popularity: 85,
    icon: Pill
  },
  {
    id: "TPL005",
    name: "Lab Work Coordination",
    description: "Order labs, process results, and coordinate follow-ups",
    category: "clinical",
    steps: 9,
    estimatedTime: "1-2 weeks",
    popularity: 90,
    icon: TestTube
  },
  {
    id: "TPL006",
    name: "Telehealth Visit Workflow",
    description: "Pre-visit prep, virtual consultation, and post-visit follow-up",
    category: "telehealth",
    steps: 7,
    estimatedTime: "2-3 days",
    popularity: 94,
    icon: Stethoscope
  }
];

const workflowStats = [
  { title: "Active Workflows", value: "24", change: "+3 this month", icon: Workflow, color: "#10b981" },
  { title: "Patients Enrolled", value: "3,247", change: "+18% this month", icon: Users, color: "#3b82f6" },
  { title: "Automation Rate", value: "89%", change: "+5% this month", icon: Zap, color: "#8b5cf6" },
  { title: "Time Saved", value: "340hrs", change: "This month", icon: Clock, color: "#f59e0b" }
];

export function WorkflowAutomation() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredWorkflows = activeWorkflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || workflow.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "paused": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "onboarding": return UserPlus;
      case "scheduling": return Calendar;
      case "care": return Heart;
      case "clinical": return Stethoscope;
      case "billing": return CreditCard;
      case "medication": return Pill;
      case "preventive": return Shield;
      case "telehealth": return Activity;
      default: return Workflow;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <Workflow className="w-8 h-8 text-primary" />
            </div>
            Workflow Automation
          </h1>
          <p className="text-muted-foreground mt-2">
            Streamline your practice with intelligent automation workflows
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Workflows
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-bg text-white border-0 shadow-lg hover:shadow-xl">
                <Plus className="w-4 h-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
                <DialogDescription>
                  Choose a template or start from scratch to create your automated workflow
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                {workflowTemplates.slice(0, 4).map((template) => {
                  const Icon = template.icon;
                  return (
                    <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{template.name}</h4>
                            <p className="text-xs text-muted-foreground">{template.steps} steps</p>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button className="gradient-bg text-white border-0">
                  Start Building
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workflowStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Workflow Activity
                </CardTitle>
                <CardDescription>Latest automation events and completions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { patient: "Sarah Johnson", workflow: "Patient Onboarding", status: "completed", time: "2 min ago" },
                    { patient: "Michael Chen", workflow: "Lab Results Processing", status: "in-progress", time: "5 min ago" },
                    { patient: "Emma Davis", workflow: "Appointment Reminders", status: "completed", time: "8 min ago" },
                    { patient: "David Wilson", workflow: "Care Plan Follow-up", status: "pending", time: "12 min ago" },
                    { patient: "Lisa Rodriguez", workflow: "Payment Collection", status: "completed", time: "15 min ago" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-500' :
                          activity.status === 'in-progress' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{activity.patient}</p>
                          <p className="text-xs text-muted-foreground">{activity.workflow}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={activity.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Popular Workflow Templates
                </CardTitle>
                <CardDescription>Most used automation templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowTemplates.slice(0, 5).map((template) => {
                    const Icon = template.icon;
                    return (
                      <div key={template.id} className="flex items-center justify-between p-3 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground">{template.steps} steps</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-muted-foreground">{template.popularity}%</span>
                          </div>
                          <Button variant="ghost" size="sm" className="mt-1">
                            Use Template
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common workflow automation tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Setup Patient Onboarding", icon: UserPlus, desc: "Create automated intake flow" },
                  { title: "Configure Reminders", icon: Bell, desc: "Set up appointment alerts" },
                  { title: "Build Care Protocol", icon: Heart, desc: "Design treatment workflows" },
                  { title: "Automate Billing", icon: CreditCard, desc: "Streamline payment collection" }
                ].map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow group">
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold text-sm mb-2">{action.title}</h4>
                        <p className="text-xs text-muted-foreground">{action.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Workflows Tab */}
        <TabsContent value="active" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="scheduling">Scheduling</SelectItem>
                    <SelectItem value="care">Care Management</SelectItem>
                    <SelectItem value="clinical">Clinical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Workflow List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredWorkflows.map((workflow) => {
              const CategoryIcon = getCategoryIcon(workflow.category);
              return (
                <Card key={workflow.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <CategoryIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                          <p className="text-sm text-muted-foreground">{workflow.description}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completion Rate</span>
                        <span className="font-medium">{workflow.completion}%</span>
                      </div>
                      <Progress value={workflow.completion} className="h-2" />
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Patients</p>
                          <p className="font-medium">{workflow.patients.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Steps</p>
                          <p className="font-medium">{workflow.automatedSteps}/{workflow.steps}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Updated</p>
                          <p className="font-medium">{workflow.lastUpdated}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={workflow.status === 'active' ? 'text-yellow-600' : 'text-green-600'}
                        >
                          {workflow.status === 'active' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{template.name}</h3>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {template.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{template.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-muted-foreground">Steps</p>
                        <p className="font-medium">{template.steps}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Timeline</p>
                        <p className="font-medium">{template.estimatedTime}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{template.popularity}%</span>
                        <span className="text-xs text-muted-foreground">popularity</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1 gradient-bg text-white border-0">
                        <Plus className="w-3 h-3 mr-1" />
                        Use Template
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Workflow Performance
                </CardTitle>
                <CardDescription>Success rates and completion metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeWorkflows.map((workflow) => (
                    <div key={workflow.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{workflow.name}</span>
                        <span className="text-muted-foreground">{workflow.completion}%</span>
                      </div>
                      <Progress value={workflow.completion} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Savings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="w-5 h-5" />
                  Time Savings Analysis
                </CardTitle>
                <CardDescription>Hours saved through automation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { task: "Patient Intake Processing", manual: "45 min", automated: "5 min", saved: "40 min" },
                    { task: "Appointment Reminders", manual: "30 min", automated: "2 min", saved: "28 min" },
                    { task: "Follow-up Scheduling", manual: "25 min", automated: "3 min", saved: "22 min" },
                    { task: "Insurance Verification", manual: "20 min", automated: "1 min", saved: "19 min" },
                    { task: "Lab Result Processing", manual: "35 min", automated: "5 min", saved: "30 min" }
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{item.task}</h4>
                        <Badge className="bg-green-100 text-green-800">
                          -{item.saved}
                        </Badge>
                      </div>
                      <div className="flex text-xs text-muted-foreground gap-4">
                        <span>Manual: {item.manual}</span>
                        <span>Auto: {item.automated}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ROI Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  ROI Calculator
                </CardTitle>
                <CardDescription>Return on automation investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <h3 className="text-2xl font-bold text-green-600">$45,380</h3>
                      <p className="text-sm text-muted-foreground">Monthly Savings</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                      <h3 className="text-2xl font-bold text-blue-600">340hrs</h3>
                      <p className="text-sm text-muted-foreground">Time Saved</p>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <h3 className="text-3xl font-bold text-purple-600">387%</h3>
                    <p className="text-sm text-muted-foreground">ROI Increase</p>
                    <p className="text-xs text-muted-foreground mt-1">Compared to manual processes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Patient Satisfaction Impact
                </CardTitle>
                <CardDescription>How automation affects patient experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Satisfaction</span>
                    <span className="text-2xl font-bold text-green-600">4.8/5</span>
                  </div>
                  <Progress value={96} className="h-3" />
                  
                  <div className="space-y-3 mt-4">
                    {[
                      { metric: "Appointment Scheduling", score: 4.9, improvement: "+12%" },
                      { metric: "Communication Clarity", score: 4.7, improvement: "+8%" },
                      { metric: "Wait Time Experience", score: 4.6, improvement: "+15%" },
                      { metric: "Follow-up Process", score: 4.8, improvement: "+10%" }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{item.metric}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.score}/5</span>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            {item.improvement}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Configure default workflow behaviors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoStart">Auto-start workflows</Label>
                  <Switch id="autoStart" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="smartScheduling">Smart scheduling</Label>
                  <Switch id="smartScheduling" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="failureRetry">Auto-retry on failure</Label>
                  <Switch id="failureRetry" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Real-time notifications</Label>
                  <Switch id="notifications" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultTimeout">Default timeout (minutes)</Label>
                  <Input id="defaultTimeout" type="number" defaultValue="30" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retryAttempts">Max retry attempts</Label>
                  <Input id="retryAttempts" type="number" defaultValue="3" />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Configure how you receive workflow alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifs">Email notifications</Label>
                  <Switch id="emailNotifs" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="smsNotifs">SMS notifications</Label>
                  <Switch id="smsNotifs" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="slackNotifs">Slack integration</Label>
                  <Switch id="slackNotifs" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifs">Push notifications</Label>
                  <Switch id="pushNotifs" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label>Notification frequency</Label>
                  <Select defaultValue="immediate">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly digest</SelectItem>
                      <SelectItem value="daily">Daily summary</SelectItem>
                      <SelectItem value="weekly">Weekly report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Integration Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5" />
                  Integration Settings
                </CardTitle>
                <CardDescription>Connect with external systems and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "EHR System", status: "connected", type: "FHIR" },
                  { name: "Payment Gateway", status: "connected", type: "Stripe" },
                  { name: "SMS Service", status: "connected", type: "Twilio" },
                  { name: "Email Service", status: "connected", type: "SendGrid" },
                  { name: "Calendar Sync", status: "disconnected", type: "Google" },
                  { name: "Analytics", status: "connected", type: "Mixpanel" }
                ].map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <div>
                        <p className="font-medium text-sm">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">{integration.type}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      {integration.status === 'connected' ? 'Configure' : 'Connect'}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Compliance
                </CardTitle>
                <CardDescription>Ensure workflows meet security requirements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auditLogging">Audit logging</Label>
                  <Switch id="auditLogging" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dataEncryption">Data encryption</Label>
                  <Switch id="dataEncryption" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="accessControl">Role-based access</Label>
                  <Switch id="accessControl" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hipaaMode">HIPAA compliance mode</Label>
                  <Switch id="hipaaMode" defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label>Data retention period</Label>
                  <Select defaultValue="7years">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="3years">3 Years</SelectItem>
                      <SelectItem value="7years">7 Years</SelectItem>
                      <SelectItem value="permanent">Permanent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Compliance Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
