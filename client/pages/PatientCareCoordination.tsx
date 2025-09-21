import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Users,
  Calendar,
  CheckSquare,
  Clock,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Bell,
  MessageSquare,
  ClipboardList,
  Target,
  TrendingUp,
  Heart,
  Stethoscope,
  FileText,
  Calendar as CalendarIcon,
  RefreshCw,
  Download,
  Upload,
  Star,
  Flag,
  Eye,
  Share,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { usePatient } from "../hooks/api/usePatients";
import { PatientService } from "../services/patient.service";

interface PatientCareCoordinationProps {
  patientId?: string;
}

// Mock data for care coordination
const mockCareTeam = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    role: "Primary Care Physician",
    specialty: "Internal Medicine",
    phone: "(555) 123-4567",
    email: "sarah.johnson@clinic.com",
    avatar: null,
    primaryContact: true,
    lastContact: "2024-02-15",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    role: "Endocrinologist",
    specialty: "Diabetes Management",
    phone: "(555) 234-5678",
    email: "michael.chen@specialist.com",
    avatar: null,
    primaryContact: false,
    lastContact: "2024-02-10",
  },
  {
    id: "3",
    name: "Mary Rodriguez, RN",
    role: "Care Coordinator",
    specialty: "Nursing",
    phone: "(555) 345-6789",
    email: "mary.rodriguez@clinic.com",
    avatar: null,
    primaryContact: false,
    lastContact: "2024-02-14",
  },
  {
    id: "4",
    name: "James Wilson",
    role: "Nutritionist",
    specialty: "Dietary Counseling",
    phone: "(555) 456-7890",
    email: "james.wilson@nutrition.com",
    avatar: null,
    primaryContact: false,
    lastContact: "2024-02-08",
  },
];

const mockCarePlans = [
  {
    id: "1",
    title: "Diabetes Management Plan",
    description:
      "Comprehensive diabetes care including medication management, lifestyle modifications, and regular monitoring",
    status: "active",
    priority: "high",
    startDate: "2024-01-15",
    endDate: "2024-07-15",
    progress: 75,
    assignedTo: "Dr. Sarah Johnson",
    goals: [
      {
        id: "1",
        description: "Maintain HbA1c below 7%",
        target: "< 7%",
        current: "7.2%",
        status: "in-progress",
        dueDate: "2024-05-01",
      },
      {
        id: "2",
        description: "Lose 10 pounds",
        target: "180 lbs",
        current: "185 lbs",
        status: "in-progress",
        dueDate: "2024-04-01",
      },
      {
        id: "3",
        description: "Exercise 150 min/week",
        target: "150 min",
        current: "120 min",
        status: "in-progress",
        dueDate: "2024-03-01",
      },
    ],
  },
  {
    id: "2",
    title: "Hypertension Control",
    description: "Blood pressure monitoring and medication adjustment plan",
    status: "active",
    priority: "medium",
    startDate: "2024-02-01",
    endDate: "2024-05-01",
    progress: 60,
    assignedTo: "Dr. Sarah Johnson",
    goals: [
      {
        id: "4",
        description: "BP below 130/80",
        target: "< 130/80 mmHg",
        current: "135/85 mmHg",
        status: "in-progress",
        dueDate: "2024-04-01",
      },
    ],
  },
];

const mockTasks = [
  {
    id: "1",
    title: "Schedule follow-up appointment",
    description: "Schedule 3-month follow-up with endocrinologist",
    assignedTo: "Mary Rodriguez, RN",
    assignedBy: "Dr. Sarah Johnson",
    dueDate: "2024-02-20",
    priority: "high",
    status: "pending",
    category: "appointment",
    patientId: "PAT001",
    carePlanId: "1",
  },
  {
    id: "2",
    title: "Order HbA1c lab test",
    description: "Order quarterly HbA1c test for diabetes monitoring",
    assignedTo: "Dr. Sarah Johnson",
    assignedBy: "Dr. Sarah Johnson",
    dueDate: "2024-02-18",
    priority: "medium",
    status: "in-progress",
    category: "lab",
    patientId: "PAT001",
    carePlanId: "1",
  },
  {
    id: "3",
    title: "Medication review",
    description: "Review current diabetes medications and adjust dosages",
    assignedTo: "Dr. Michael Chen",
    assignedBy: "Dr. Sarah Johnson",
    dueDate: "2024-02-25",
    priority: "medium",
    status: "pending",
    category: "medication",
    patientId: "PAT001",
    carePlanId: "1",
  },
  {
    id: "4",
    title: "Nutrition consultation",
    description: "Follow-up nutrition consultation for meal planning",
    assignedTo: "James Wilson",
    assignedBy: "Dr. Sarah Johnson",
    dueDate: "2024-02-22",
    priority: "low",
    status: "completed",
    category: "consultation",
    patientId: "PAT001",
    carePlanId: "1",
  },
];

const mockAppointments = [
  {
    id: "1",
    date: "2024-02-25",
    time: "10:00 AM",
    duration: 30,
    provider: "Dr. Michael Chen",
    type: "Follow-up",
    location: "Endocrinology Clinic",
    status: "scheduled",
    notes: "Review diabetes management and adjust medications",
  },
  {
    id: "2",
    date: "2024-03-15",
    time: "2:00 PM",
    duration: 60,
    provider: "Dr. Sarah Johnson",
    type: "Routine Check-up",
    location: "Primary Care",
    status: "scheduled",
    notes: "Annual physical examination",
  },
  {
    id: "3",
    date: "2024-02-10",
    time: "9:00 AM",
    duration: 45,
    provider: "James Wilson",
    type: "Nutrition Consultation",
    location: "Nutrition Center",
    status: "completed",
    notes: "Discussed meal planning and portion control",
  },
];

export function PatientCareCoordination({
  patientId: propPatientId,
}: PatientCareCoordinationProps) {
  const { patientId: urlPatientId } = useParams<{ patientId?: string }>();
  const patientId = propPatientId || urlPatientId;

  const [activeTab, setActiveTab] = useState("overview");
  const [showAddTaskDialog, setShowAddTaskDialog] = useState(false);
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form states
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: "medium",
    category: "general",
  });

  const [newPlan, setNewPlan] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "medium",
    assignedTo: "",
  });

  // Hooks - only fetch patient if patientId is provided and valid
  const { data: patient, isLoading: patientLoading } = usePatient(
    patientId || "",
    !!patientId,
  );

  // Task filtering and stats
  const taskStats = useMemo(() => {
    const total = mockTasks.length;
    const completed = mockTasks.filter((t) => t.status === "completed").length;
    const overdue = mockTasks.filter((t) => {
      const dueDate = new Date(t.dueDate);
      const today = new Date();
      return dueDate < today && t.status !== "completed";
    }).length;
    const pending = mockTasks.filter((t) => t.status === "pending").length;

    return { total, completed, overdue, pending };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateTask = () => {
    // Implement task creation logic
    console.log("Creating task:", newTask);
    setShowAddTaskDialog(false);
    setNewTask({
      title: "",
      description: "",
      assignedTo: "",
      dueDate: "",
      priority: "medium",
      category: "general",
    });
  };

  const handleCreatePlan = () => {
    // Implement care plan creation logic
    console.log("Creating care plan:", newPlan);
    setShowAddPlanDialog(false);
    setNewPlan({
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      priority: "medium",
      assignedTo: "",
    });
  };

  const handleDeleteTask = () => {
    // Implement task deletion logic
    console.log("Deleting task:", selectedTask?.id);
    setShowDeleteDialog(false);
    setSelectedTask(null);
  };

  if (patientLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Care Coordination
            </h1>
            <p className="text-muted-foreground">
              Coordinate patient care across providers and manage care plans
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button
              onClick={() => setShowAddTaskDialog(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Tasks
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {taskStats.total}
                  </p>
                </div>
                <CheckSquare className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {taskStats.completed}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((taskStats.completed / taskStats.total) * 100)}%
                    complete
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {taskStats.pending}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Need attention
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Overdue
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {taskStats.overdue}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Require immediate action
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="care-team">Care Team</TabsTrigger>
            <TabsTrigger value="care-plans">Care Plans</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Active Care Plans */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-primary" />
                      Active Care Plans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockCarePlans
                        .filter((plan) => plan.status === "active")
                        .map((plan) => (
                          <div key={plan.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-semibold">{plan.title}</h3>
                              <div className="flex gap-2">
                                <Badge
                                  className={getPriorityColor(plan.priority)}
                                >
                                  {plan.priority} priority
                                </Badge>
                                <Badge className={getStatusColor(plan.status)}>
                                  {plan.status}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mb-3">
                              {plan.description}
                            </p>

                            <div className="space-y-2 mb-3">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{plan.progress}%</span>
                              </div>
                              <Progress value={plan.progress} className="h-2" />
                            </div>

                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                              <span>Assigned to: {plan.assignedTo}</span>
                              <span>
                                {new Date(plan.startDate).toLocaleDateString()}{" "}
                                - {new Date(plan.endDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Tasks */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5 text-primary" />
                      Recent Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">
                                {task.title}
                              </h4>
                              <Badge
                                className={getPriorityColor(task.priority)}
                                variant="outline"
                              >
                                {task.priority}
                              </Badge>
                              <Badge className={getStatusColor(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-1">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>
                                Due:{" "}
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                              <span>Assigned to: {task.assignedTo}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Care Team Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Care Team
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockCareTeam.slice(0, 4).map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-3"
                        >
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {member.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.role}
                            </p>
                          </div>
                          {member.primaryContact && (
                            <Star className="w-4 h-4 text-yellow-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Upcoming Appointments */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Upcoming Appointments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockAppointments
                        .filter((apt) => apt.status === "scheduled")
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="p-3 border rounded-lg"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">
                                {appointment.type}
                              </h4>
                              <Badge variant="outline">
                                {appointment.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {new Date(
                                  appointment.date,
                                ).toLocaleDateString()}{" "}
                                at {appointment.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {appointment.provider}
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {appointment.location}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Appointment
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Create Note
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        size="sm"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Set Reminder
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="care-team" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Care Team Members
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockCareTeam.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{member.name}</h3>
                              {member.primaryContact && (
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  Primary Contact
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {member.role}
                            </p>
                            <p className="text-sm text-muted-foreground mb-3">
                              {member.specialty}
                            </p>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{member.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span>{member.email}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Last contact:{" "}
                                {new Date(
                                  member.lastContact,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share className="w-4 h-4 mr-2" />
                                Share Contact
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="care-plans" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    Care Plans
                  </CardTitle>
                  <Button onClick={() => setShowAddPlanDialog(true)} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Plan
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {mockCarePlans.map((plan) => (
                    <Card key={plan.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-2">
                              {plan.title}
                            </h3>
                            <p className="text-muted-foreground mb-3">
                              {plan.description}
                            </p>
                            <div className="flex gap-2">
                              <Badge className={getStatusColor(plan.status)}>
                                {plan.status}
                              </Badge>
                              <Badge
                                className={getPriorityColor(plan.priority)}
                              >
                                {plan.priority} priority
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Plan
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share className="w-4 h-4 mr-2" />
                                Share Plan
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Overall Progress</span>
                              <span>{plan.progress}%</span>
                            </div>
                            <Progress value={plan.progress} className="h-2" />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Assigned to:</span>
                              <p className="text-muted-foreground">
                                {plan.assignedTo}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">Start Date:</span>
                              <p className="text-muted-foreground">
                                {new Date(plan.startDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <span className="font-medium">End Date:</span>
                              <p className="text-muted-foreground">
                                {new Date(plan.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Goals</h4>
                            <div className="space-y-2">
                              {plan.goals.map((goal) => (
                                <div
                                  key={goal.id}
                                  className="flex items-center gap-3 p-3 border rounded-lg"
                                >
                                  <Target className="w-4 h-4 text-primary" />
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium">
                                        {goal.description}
                                      </span>
                                      <Badge
                                        className={getStatusColor(goal.status)}
                                        variant="outline"
                                      >
                                        {goal.status}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      Target: {goal.target} • Current:{" "}
                                      {goal.current} • Due:{" "}
                                      {new Date(
                                        goal.dueDate,
                                      ).toLocaleDateString()}
                                    </div>
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-primary" />
                    Care Coordination Tasks
                  </CardTitle>
                  <div className="flex gap-2">
                    <Select defaultValue="all">
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => setShowAddTaskDialog(true)}
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {task.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>
                          {new Date(task.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(task.status)}>
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{task.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Appointments
                  </CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <CalendarIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">
                                {appointment.type}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {appointment.provider}
                              </p>
                              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                                <div>
                                  <span className="font-medium">
                                    Date & Time:
                                  </span>
                                  <p>
                                    {new Date(
                                      appointment.date,
                                    ).toLocaleDateString()}{" "}
                                    at {appointment.time}
                                  </p>
                                </div>
                                <div>
                                  <span className="font-medium">Location:</span>
                                  <p>{appointment.location}</p>
                                </div>
                              </div>
                              {appointment.notes && (
                                <div className="mt-2">
                                  <span className="font-medium text-sm">
                                    Notes:
                                  </span>
                                  <p className="text-sm text-muted-foreground">
                                    {appointment.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={getStatusColor(appointment.status)}
                            >
                              {appointment.status}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Task Dialog */}
        <Dialog open={showAddTaskDialog} onOpenChange={setShowAddTaskDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new care coordination task
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="taskTitle">Task Title</Label>
                <Input
                  id="taskTitle"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <Label htmlFor="taskDescription">Description</Label>
                <Textarea
                  id="taskDescription"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Select
                    value={newTask.assignedTo}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, assignedTo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCareTeam.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="lab">Lab Work</SelectItem>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddTaskDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Care Plan Dialog */}
        <Dialog open={showAddPlanDialog} onOpenChange={setShowAddPlanDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Care Plan</DialogTitle>
              <DialogDescription>
                Create a new care plan for the patient
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="planTitle">Plan Title</Label>
                <Input
                  id="planTitle"
                  value={newPlan.title}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, title: e.target.value })
                  }
                  placeholder="Enter care plan title"
                />
              </div>
              <div>
                <Label htmlFor="planDescription">Description</Label>
                <Textarea
                  id="planDescription"
                  value={newPlan.description}
                  onChange={(e) =>
                    setNewPlan({ ...newPlan, description: e.target.value })
                  }
                  placeholder="Enter care plan description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newPlan.startDate}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newPlan.endDate}
                    onChange={(e) =>
                      setNewPlan({ ...newPlan, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="planPriority">Priority</Label>
                  <Select
                    value={newPlan.priority}
                    onValueChange={(value) =>
                      setNewPlan({ ...newPlan, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="planAssignedTo">Assign To</Label>
                  <Select
                    value={newPlan.assignedTo}
                    onValueChange={(value) =>
                      setNewPlan({ ...newPlan, assignedTo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCareTeam.map((member) => (
                        <SelectItem key={member.id} value={member.name}>
                          {member.name} - {member.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddPlanDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePlan}>Create Plan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Task Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{selectedTask?.title}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteTask}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
