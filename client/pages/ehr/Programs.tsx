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
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  HeartPulse,
  Users,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Settings,
  Eye,
  Edit,
  Copy,
  Archive,
  Play,
  Pause,
  Target,
  Activity,
  Pill,
  Apple,
  Dumbbell,
  Brain,
  Heart,
  Stethoscope,
  FileText,
  CheckCircle,
  AlertTriangle,
  Star,
  TrendingUp,
  BarChart3,
  Download,
  Upload,
  Mail,
  Phone,
  MessageCircle,
  Video,
  BookOpen,
  ClipboardList,
  Calendar as CalendarIcon,
  UserPlus,
  UserMinus,
  MoreHorizontal,
  X,
  Save,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";

// Comprehensive programs data with enhanced structure
const allPrograms = [
  {
    id: "PROG001",
    title: "Diabetes Management Program",
    description: "Comprehensive diabetes care with nutrition counseling and medication management",
    type: "rolling-start",
    duration: "90 Days",
    enrolledParticipants: 24,
    status: "active",
    category: "chronic-care",
    image: "https://images.pexels.com/photos/6823493/pexels-photo-6823493.jpeg",
    completionRate: 87,
    rating: 4.8,
    modules: 12,
    lastUpdated: "2024-02-15",
    price: 299,
    maxParticipants: 50,
    coach: "Dr. Sarah Johnson",
    nextStartDate: "2024-03-01",
    objectives: [
      "Maintain HbA1c levels below 7%",
      "Establish consistent meal planning",
      "Develop medication adherence habits",
      "Monitor blood glucose regularly"
    ],
    curriculum: [
      "Understanding Diabetes",
      "Nutrition Planning",
      "Exercise Guidelines",
      "Medication Management",
      "Monitoring & Testing",
      "Complications Prevention"
    ]
  },
  {
    id: "PROG002", 
    title: "Heart Healthy Lifestyle",
    description: "Cardiovascular wellness program focusing on diet, exercise, and stress management",
    type: "rolling-start",
    duration: "60 Days",
    enrolledParticipants: 18,
    status: "active",
    category: "wellness",
    image: "https://images.pexels.com/photos/8567597/pexels-photo-8567597.jpeg",
    completionRate: 92,
    rating: 4.9,
    modules: 8,
    lastUpdated: "2024-02-14",
    price: 199,
    maxParticipants: 30,
    coach: "Dr. Michael Chen",
    nextStartDate: "2024-02-28",
    objectives: [
      "Reduce cardiovascular risk factors",
      "Establish regular exercise routine",
      "Implement heart-healthy diet",
      "Learn stress management techniques"
    ],
    curriculum: [
      "Heart Health Basics",
      "Cardio Exercise Plans",
      "Heart-Healthy Nutrition",
      "Stress Reduction",
      "Blood Pressure Management",
      "Lifestyle Modifications"
    ]
  },
  {
    id: "PROG003",
    title: "Weight Management Success",
    description: "Evidence-based weight loss program with personalized meal plans and coaching",
    type: "rolling-start", 
    duration: "120 Days",
    enrolledParticipants: 31,
    status: "active",
    category: "weight-management",
    image: "https://images.pexels.com/photos/31144000/pexels-photo-31144000.jpeg",
    completionRate: 78,
    rating: 4.6,
    modules: 16,
    lastUpdated: "2024-02-13",
    price: 399,
    maxParticipants: 25,
    coach: "Sarah Williams, RD",
    nextStartDate: "2024-03-05",
    objectives: [
      "Achieve 5-10% weight reduction",
      "Develop sustainable eating habits",
      "Create consistent exercise routine",
      "Build long-term lifestyle changes"
    ],
    curriculum: [
      "Nutrition Fundamentals",
      "Meal Planning & Prep",
      "Exercise & Movement",
      "Behavioral Changes",
      "Portion Control",
      "Maintenance Strategies"
    ]
  },
  {
    id: "PROG004",
    title: "Mental Health & Mindfulness",
    description: "Comprehensive mental wellness program with therapy sessions and mindfulness practices",
    type: "fixed-start",
    duration: "45 Days",
    enrolledParticipants: 15,
    status: "active", 
    category: "mental-health",
    image: "https://images.pexels.com/photos/6933132/pexels-photo-6933132.jpeg",
    completionRate: 94,
    rating: 4.7,
    modules: 6,
    lastUpdated: "2024-02-12",
    price: 249,
    maxParticipants: 20,
    coach: "Dr. Emma Rodriguez",
    nextStartDate: "2024-03-10",
    objectives: [
      "Reduce anxiety and stress levels",
      "Develop mindfulness practices",
      "Improve emotional regulation",
      "Build coping strategies"
    ],
    curriculum: [
      "Mental Health Awareness",
      "Mindfulness Meditation",
      "Stress Management",
      "Cognitive Behavioral Techniques",
      "Self-Care Practices",
      "Relapse Prevention"
    ]
  },
  {
    id: "PROG005",
    title: "Medication Adherence Coach",
    description: "Improve medication compliance through education and reminder systems",
    type: "rolling-start",
    duration: "30 Days", 
    enrolledParticipants: 42,
    status: "active",
    category: "medication",
    image: "https://images.pexels.com/photos/159211/headache-pain-pills-medication-159211.jpeg",
    completionRate: 89,
    rating: 4.5,
    modules: 4,
    lastUpdated: "2024-02-11",
    price: 149,
    maxParticipants: 100,
    coach: "PharmD Jennifer Lee",
    nextStartDate: "2024-02-25",
    objectives: [
      "Achieve 95%+ medication adherence",
      "Understand medication purposes",
      "Establish daily routines",
      "Recognize side effects"
    ],
    curriculum: [
      "Medication Education",
      "Adherence Strategies",
      "Side Effect Management",
      "Pharmacy Communication"
    ]
  },
  {
    id: "PROG006",
    title: "Senior Wellness Program",
    description: "Tailored health program for seniors focusing on mobility, nutrition, and social connection",
    type: "rolling-start",
    duration: "75 Days",
    enrolledParticipants: 28,
    status: "active",
    category: "senior-care",
    image: "https://images.pexels.com/photos/7551611/pexels-photo-7551611.jpeg",
    completionRate: 85,
    rating: 4.8,
    modules: 10,
    lastUpdated: "2024-02-10",
    price: 279,
    maxParticipants: 35,
    coach: "Dr. Robert Kim",
    nextStartDate: "2024-03-03",
    objectives: [
      "Improve mobility and balance",
      "Maintain cognitive health",
      "Enhance social connections",
      "Optimize nutrition intake"
    ],
    curriculum: [
      "Healthy Aging",
      "Balance & Mobility",
      "Cognitive Health",
      "Social Wellness",
      "Senior Nutrition",
      "Safety & Fall Prevention"
    ]
  }
];

const archivedPrograms = [
  {
    id: "PROG_ARCH001",
    title: "Sleep Optimization Challenge",
    description: "30-day program to improve sleep quality and establish healthy sleep habits",
    type: "fixed-start",
    duration: "30 Days",
    enrolledParticipants: 22,
    status: "archived",
    category: "wellness",
    completionRate: 91,
    rating: 4.4,
    modules: 5,
    archivedDate: "2024-01-30",
    price: 129,
    coach: "Dr. Lisa Park"
  }
];

const programStats = [
  {
    title: "Active Programs",
    value: "6",
    change: "+2 this month",
    icon: HeartPulse,
    color: "#10b981"
  },
  {
    title: "Total Participants",
    value: "158",
    change: "+23 this week",
    icon: Users,
    color: "#3b82f6"
  },
  {
    title: "Avg. Completion Rate",
    value: "87%",
    change: "+5% improvement",
    icon: Target,
    color: "#f59e0b"
  },
  {
    title: "Average Rating",
    value: "4.7/5",
    change: "+0.3 this quarter",
    icon: Star,
    color: "#ef4444"
  }
];

const participantsList = [
  { id: 1, name: "John Smith", email: "john@email.com", program: "PROG001", progress: 85, joinDate: "2024-01-15" },
  { id: 2, name: "Mary Johnson", email: "mary@email.com", program: "PROG002", progress: 92, joinDate: "2024-01-20" },
  { id: 3, name: "Robert Davis", email: "robert@email.com", program: "PROG003", progress: 67, joinDate: "2024-02-01" },
  { id: 4, name: "Lisa Wilson", email: "lisa@email.com", program: "PROG004", progress: 78, joinDate: "2024-02-05" },
];

export function Programs() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedView, setSelectedView] = useState("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newProgram, setNewProgram] = useState({
    title: "",
    description: "",
    type: "rolling-start",
    duration: "",
    category: "wellness",
    price: "",
    maxParticipants: "",
    coach: ""
  });

  const programs = selectedView === "active" ? allPrograms : archivedPrograms;
  
  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || program.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || program.category === categoryFilter;
    return matchesSearch && matchesType && matchesCategory;
  });

  const getCategoryBadgeColor = (category) => {
    switch (category) {
      case "chronic-care": return "bg-red-100 text-red-800";
      case "wellness": return "bg-green-100 text-green-800";
      case "weight-management": return "bg-purple-100 text-purple-800";
      case "mental-health": return "bg-blue-100 text-blue-800";
      case "medication": return "bg-orange-100 text-orange-800";
      case "senior-care": return "bg-teal-100 text-teal-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "archived": return "bg-gray-100 text-gray-800";
      case "draft": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const handleCreateProgram = () => {
    // Implementation for creating new program
    console.log("Creating program:", newProgram);
    setIsCreateDialogOpen(false);
    setNewProgram({
      title: "",
      description: "",
      type: "rolling-start",
      duration: "",
      category: "wellness",
      price: "",
      maxParticipants: "",
      coach: ""
    });
  };

  const handleEditProgram = () => {
    // Implementation for editing program
    console.log("Editing program:", selectedProgram);
    setIsEditDialogOpen(false);
  };

  const handleEnrollParticipant = (programId) => {
    // Implementation for enrolling participant
    console.log("Enrolling participant in program:", programId);
  };

  const handleArchiveProgram = (programId) => {
    // Implementation for archiving program
    console.log("Archiving program:", programId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <HeartPulse className="w-10 h-10 text-primary" />
              Programs Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage health and wellness programs for participants and health coaches
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Program</DialogTitle>
                  <DialogDescription>
                    Set up a new health program for participants and coaches.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Program Title</Label>
                    <Input
                      id="title"
                      value={newProgram.title}
                      onChange={(e) => setNewProgram({...newProgram, title: e.target.value})}
                      placeholder="Enter program title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={newProgram.duration}
                      onChange={(e) => setNewProgram({...newProgram, duration: e.target.value})}
                      placeholder="e.g., 30 Days"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newProgram.description}
                      onChange={(e) => setNewProgram({...newProgram, description: e.target.value})}
                      placeholder="Describe the program objectives and benefits"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Program Type</Label>
                    <Select value={newProgram.type} onValueChange={(value) => setNewProgram({...newProgram, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rolling-start">Rolling Start</SelectItem>
                        <SelectItem value="fixed-start">Fixed Start</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newProgram.category} onValueChange={(value) => setNewProgram({...newProgram, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wellness">Wellness</SelectItem>
                        <SelectItem value="chronic-care">Chronic Care</SelectItem>
                        <SelectItem value="weight-management">Weight Management</SelectItem>
                        <SelectItem value="mental-health">Mental Health</SelectItem>
                        <SelectItem value="medication">Medication</SelectItem>
                        <SelectItem value="senior-care">Senior Care</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProgram.price}
                      onChange={(e) => setNewProgram({...newProgram, price: e.target.value})}
                      placeholder="299"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={newProgram.maxParticipants}
                      onChange={(e) => setNewProgram({...newProgram, maxParticipants: e.target.value})}
                      placeholder="50"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="coach">Program Coach</Label>
                    <Input
                      id="coach"
                      value={newProgram.coach}
                      onChange={(e) => setNewProgram({...newProgram, coach: e.target.value})}
                      placeholder="Dr. Sarah Johnson"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateProgram}>
                    Create Program
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {programStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <Card key={idx} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                          <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                          <div className="flex items-center gap-1 text-sm mt-1 text-green-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>{stat.change}</span>
                          </div>
                        </div>
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}15` }}
                        >
                          <Icon className="w-6 h-6" style={{ color: stat.color }} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setActiveTab("programs")}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <HeartPulse className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Manage Programs</h3>
                      <p className="text-sm text-muted-foreground">Create and edit health programs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setActiveTab("participants")}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Participant Management</h3>
                      <p className="text-sm text-muted-foreground">Enroll and track participants</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => setActiveTab("analytics")}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Analytics & Reports</h3>
                      <p className="text-sm text-muted-foreground">Track program performance</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <UserPlus className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">New Enrollment</p>
                      <p className="text-sm text-muted-foreground">John Smith joined Diabetes Management Program</p>
                    </div>
                    <span className="text-xs text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <div className="flex-1">
                      <p className="font-medium">Program Completed</p>
                      <p className="text-sm text-muted-foreground">Mary Johnson completed Heart Healthy Lifestyle program</p>
                    </div>
                    <span className="text-xs text-muted-foreground">1 day ago</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Plus className="w-5 h-5 text-purple-600" />
                    <div className="flex-1">
                      <p className="font-medium">New Program Created</p>
                      <p className="text-sm text-muted-foreground">Sleep Optimization Challenge was created</p>
                    </div>
                    <span className="text-xs text-muted-foreground">3 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search programs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="rolling-start">Rolling Start</SelectItem>
                          <SelectItem value="fixed-start">Fixed Start</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="wellness">Wellness</SelectItem>
                          <SelectItem value="chronic-care">Chronic Care</SelectItem>
                          <SelectItem value="weight-management">Weight Management</SelectItem>
                          <SelectItem value="mental-health">Mental Health</SelectItem>
                          <SelectItem value="medication">Medication</SelectItem>
                          <SelectItem value="senior-care">Senior Care</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedView === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedView("active")}
                    >
                      Active Programs ({allPrograms.length})
                    </Button>
                    <Button
                      variant={selectedView === "archived" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedView("archived")}
                    >
                      Archived Programs ({archivedPrograms.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={program.image} 
                      alt={program.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Badge className={getCategoryBadgeColor(program.category)}>
                        {program.category.replace("-", " ")}
                      </Badge>
                      <Badge className={getStatusBadgeColor(program.status)}>
                        {program.status}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{program.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{program.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <p className="font-medium">{program.duration}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Coach:</span>
                          <p className="font-medium">{program.coach}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Participants</span>
                          <span>{program.enrolledParticipants}/{program.maxParticipants || "∞"}</span>
                        </div>
                        <Progress 
                          value={(program.enrolledParticipants / (program.maxParticipants || 100)) * 100} 
                          className="h-2"
                        />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{program.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-green-600" />
                          <span className="font-medium">{program.completionRate}%</span>
                        </div>
                        <div className="font-semibold text-primary">
                          ${program.price}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => {
                          setSelectedProgram(program);
                          setIsEditDialogOpen(true);
                        }}>
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button size="sm" className="flex-1" onClick={() => handleEnrollParticipant(program.id)}>
                          <UserPlus className="w-3 h-3 mr-1" />
                          Enroll
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedProgram(program)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            {/* Participants Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Participant Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search participants..." className="pl-10" />
                    </div>
                    <Button className="gap-2">
                      <UserPlus className="w-4 h-4" />
                      Add Participant
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg">
                    <div className="grid grid-cols-5 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                      <span>Name</span>
                      <span>Email</span>
                      <span>Program</span>
                      <span>Progress</span>
                      <span>Actions</span>
                    </div>
                    {participantsList.map((participant) => (
                      <div key={participant.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0 items-center">
                        <span className="font-medium">{participant.name}</span>
                        <span className="text-muted-foreground">{participant.email}</span>
                        <span className="text-sm">
                          {allPrograms.find(p => p.id === participant.program)?.title || "Unknown"}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{participant.progress}%</span>
                          </div>
                          <Progress value={participant.progress} className="h-2" />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MessageCircle className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Program Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allPrograms.slice(0, 4).map((program) => (
                      <div key={program.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{program.title}</span>
                          <span>{program.completionRate}%</span>
                        </div>
                        <Progress value={program.completionRate} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Enrollment Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">+23</p>
                        <p className="text-sm text-muted-foreground">This Week</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">158</p>
                        <p className="text-sm text-muted-foreground">Total Active</p>
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-600">+18% Growth</p>
                      <p className="text-sm text-muted-foreground">vs last month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Revenue Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold">$47,256</p>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <div className="flex items-center justify-center gap-1 text-green-600 text-sm mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+12.5%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">$299</p>
                    <p className="text-sm text-muted-foreground">Avg. Program Price</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">$6,890</p>
                    <p className="text-sm text-muted-foreground">This Month</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">87%</p>
                    <p className="text-sm text-muted-foreground">Collection Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Program Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogDescription>
              Update program details and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedProgram && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Program Title</Label>
                <Input defaultValue={selectedProgram.title} />
              </div>
              <div className="space-y-2">
                <Label>Duration</Label>
                <Input defaultValue={selectedProgram.duration} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Textarea defaultValue={selectedProgram.description} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Price ($)</Label>
                <Input type="number" defaultValue={selectedProgram.price} />
              </div>
              <div className="space-y-2">
                <Label>Max Participants</Label>
                <Input type="number" defaultValue={selectedProgram.maxParticipants} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditProgram}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
