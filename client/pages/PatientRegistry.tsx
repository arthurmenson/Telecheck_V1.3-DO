import React, { useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  DropdownMenuSeparator,
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
import { Checkbox } from "../components/ui/checkbox";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  MoreVertical,
  Archive,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Heart,
  Stethoscope,
  FileText,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  Trash2,
  Copy,
  ExternalLink,
  SortAsc,
  SortDesc,
  ChevronsUpDown,
  CalendarDays,
  Building,
  Shield,
  BookOpen,
  FileSpreadsheet,
  Printer,
  Share,
  Save,
  RotateCcw,
} from "lucide-react";
import {
  usePatients,
  useSearchPatients,
  usePatientStats,
  useCreatePatient,
  useUpdatePatient,
  useArchivePatient,
  useDebouncedPatientSearch,
} from "../hooks/api/usePatients";
import {
  PatientService,
  Patient,
  CreatePatientRequest,
  UpdatePatientRequest,
  PatientSearchFilters,
} from "../services/patient.service";
import { useToast } from "../hooks/use-toast";

// Types for enhanced functionality
interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "destructive" | "outline";
  requiresConfirmation?: boolean;
}

interface SortConfig {
  key: keyof Patient | string;
  direction: "asc" | "desc";
}

interface AnalyticsData {
  totalPatients: number;
  activePatients: number;
  newPatientsThisMonth: number;
  averageAge: number;
  genderDistribution: { male: number; female: number; other: number };
  insuranceDistribution: { [key: string]: number };
  appointmentMetrics: {
    scheduled: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  revenueMetrics: {
    totalRevenue: number;
    monthlyRevenue: number;
    avgRevenuePerPatient: number;
  };
}

export function PatientRegistry() {
  const [activeTab, setActiveTab] = useState("registry");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [patientToArchive, setPatientToArchive] = useState<Patient | null>(
    null,
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(
    new Set(),
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "lastName",
    direction: "asc",
  });
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Search and filter state
  const [searchFilters, setSearchFilters] = useState<PatientSearchFilters>({
    status: "active",
  });

  // Hooks
  const { data: patientStats, isLoading: statsLoading } = usePatientStats();
  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
    filters,
    setFilters,
    isSearching,
  } = useDebouncedPatientSearch(searchFilters, page, pageSize);

  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const archivePatientMutation = useArchivePatient();

  // Form state
  const [createForm, setCreateForm] = useState<CreatePatientRequest>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    allergies: [],
    emergencyContacts: {},
    insuranceInfo: {},
  });

  const [editForm, setEditForm] = useState<UpdatePatientRequest>({});

  // Enhanced analytics data (mock for demonstration)
  const analyticsData: AnalyticsData = useMemo(
    () => ({
      totalPatients: patientStats?.total_patients || 0,
      activePatients: patientStats?.active_patients || 0,
      newPatientsThisMonth: patientStats?.new_this_month || 0,
      averageAge: 42.5,
      genderDistribution: {
        male: Math.floor((patientStats?.total_patients || 0) * 0.45),
        female: Math.floor((patientStats?.total_patients || 0) * 0.52),
        other: Math.floor((patientStats?.total_patients || 0) * 0.03),
      },
      insuranceDistribution: {
        "Blue Cross Blue Shield": 45,
        Medicare: 38,
        Aetna: 32,
        Cigna: 28,
        "United Healthcare": 25,
        "Kaiser Permanente": 18,
        Other: 62,
      },
      appointmentMetrics: {
        scheduled: 156,
        completed: 234,
        cancelled: 23,
        noShow: 12,
      },
      revenueMetrics: {
        totalRevenue: 2456780,
        monthlyRevenue: 187650,
        avgRevenuePerPatient: 9890,
      },
    }),
    [patientStats],
  );

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      id: "export",
      label: "Export Selected",
      icon: <Download className="w-4 h-4" />,
      variant: "outline",
    },
    {
      id: "archive",
      label: "Archive Selected",
      icon: <Archive className="w-4 h-4" />,
      variant: "outline",
      requiresConfirmation: true,
    },
    {
      id: "delete",
      label: "Delete Selected",
      icon: <Trash2 className="w-4 h-4" />,
      variant: "destructive",
      requiresConfirmation: true,
    },
  ];

  // Helper functions
  const updateFilters = useCallback(
    (newFilters: Partial<PatientSearchFilters>) => {
      setSearchFilters((prev) => ({ ...prev, ...newFilters }));
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    [setFilters],
  );

  const handleSort = useCallback((key: keyof Patient | string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleSelectPatient = useCallback(
    (patientId: string, selected: boolean) => {
      setSelectedPatients((prev) => {
        const newSet = new Set(prev);
        if (selected) {
          newSet.add(patientId);
        } else {
          newSet.delete(patientId);
        }
        return newSet;
      });
    },
    [],
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected && searchResults?.patients) {
        setSelectedPatients(new Set(searchResults.patients.map((p) => p.id)));
      } else {
        setSelectedPatients(new Set());
      }
    },
    [searchResults],
  );

  const handleBulkAction = useCallback(
    async (actionId: string) => {
      const selectedCount = selectedPatients.size;
      if (selectedCount === 0) {
        toast({
          title: "No patients selected",
          description: "Please select patients to perform bulk actions",
          variant: "destructive",
        });
        return;
      }

      try {
        switch (actionId) {
          case "export":
            // Export selected patients
            const exportData = searchResults?.patients?.filter((p) =>
              selectedPatients.has(p.id),
            );
            const csvContent = PatientService.exportToCsv(exportData || []);
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `patients-export-${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);

            toast({
              title: "Export successful",
              description: `Exported ${selectedCount} patients to CSV`,
            });
            break;

          case "archive":
            // Archive selected patients
            for (const patientId of selectedPatients) {
              await archivePatientMutation.mutateAsync(patientId);
            }

            toast({
              title: "Patients archived",
              description: `Successfully archived ${selectedCount} patients`,
            });
            break;

          case "delete":
            // Delete selected patients (implementation would depend on backend)
            toast({
              title: "Feature not implemented",
              description:
                "Patient deletion requires additional confirmation workflow",
              variant: "destructive",
            });
            break;
        }

        setSelectedPatients(new Set());
      } catch (error: any) {
        toast({
          title: "Bulk action failed",
          description: error.message || "Failed to perform bulk action",
          variant: "destructive",
        });
      }
    },
    [selectedPatients, searchResults, archivePatientMutation, toast],
  );

  // Form handlers
  const handleCreatePatient = async () => {
    try {
      await createPatientMutation.mutateAsync(createForm);
      setShowCreateDialog(false);
      setCreateForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        allergies: [],
        emergencyContacts: {},
        insuranceInfo: {},
      });
      toast({
        title: "Patient created successfully",
        description: `${createForm.firstName} ${createForm.lastName} has been added to the registry`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to create patient",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleEditPatient = async () => {
    if (!selectedPatient?.id) return;

    try {
      await updatePatientMutation.mutateAsync({
        id: selectedPatient.id,
        data: editForm,
      });
      setShowEditDialog(false);
      setEditForm({});
      setSelectedPatient(null);
      toast({
        title: "Patient updated successfully",
        description: "Patient information has been saved",
      });
    } catch (error: any) {
      toast({
        title: "Failed to update patient",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleArchivePatient = async () => {
    if (!patientToArchive?.id) return;

    try {
      await archivePatientMutation.mutateAsync(patientToArchive.id);
      setShowArchiveDialog(false);
      setPatientToArchive(null);
      toast({
        title: "Patient archived",
        description: "Patient has been moved to archived status",
      });
    } catch (error: any) {
      toast({
        title: "Failed to archive patient",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  // Statistics cards
  const statsCards = useMemo(() => {
    if (!patientStats) return [];

    return [
      {
        title: "Total Patients",
        value: patientStats.total_patients.toLocaleString(),
        change: "+12% from last month",
        icon: Users,
        color: "text-blue-600",
      },
      {
        title: "Active Patients",
        value: patientStats.active_patients.toLocaleString(),
        change: "+8% from last month",
        icon: UserCheck,
        color: "text-green-600",
      },
      {
        title: "New This Month",
        value: patientStats.new_this_month.toLocaleString(),
        change: "+23% from last month",
        icon: TrendingUp,
        color: "text-purple-600",
      },
      {
        title: "Pediatric Patients",
        value: patientStats.pediatric_patients.toLocaleString(),
        change: "15% of total",
        icon: Heart,
        color: "text-pink-600",
      },
      {
        title: "Senior Patients",
        value: patientStats.senior_patients.toLocaleString(),
        change: "27% of total",
        icon: Activity,
        color: "text-orange-600",
      },
      {
        title: "Average Age",
        value: "42.5 years",
        change: "Median: 39 years",
        icon: Calendar,
        color: "text-indigo-600",
      },
    ];
  }, [patientStats]);

  // Sort patients
  const sortedPatients = useMemo(() => {
    if (!searchResults?.patients) return [];

    return [...searchResults.patients].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Patient] || "";
      const bValue = b[sortConfig.key as keyof Patient] || "";

      if (sortConfig.direction === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [searchResults?.patients, sortConfig]);

  const SortableHeader = ({
    children,
    sortKey,
  }: {
    children: React.ReactNode;
    sortKey: string;
  }) => (
    <TableHead
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortConfig.key === sortKey ? (
          sortConfig.direction === "asc" ? (
            <SortAsc className="w-4 h-4" />
          ) : (
            <SortDesc className="w-4 h-4" />
          )
        ) : (
          <ChevronsUpDown className="w-4 h-4 opacity-50" />
        )}
      </div>
    </TableHead>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Patient Registry
            </h1>
            <p className="text-muted-foreground">
              Comprehensive patient management and analytics
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(true)}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Import
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(true)}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {stat.change}
                      </p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="registry">Patient Registry</TabsTrigger>
            <TabsTrigger value="analytics">Analytics & Reports</TabsTrigger>
            <TabsTrigger value="management">Management</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Registry Tab */}
          <TabsContent value="registry" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {/* Search Bar */}
                  <div className="flex gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search patients by name, email, phone, or MRN..."
                        value={filters.query || ""}
                        onChange={(e) =>
                          updateFilters({ query: e.target.value })
                        }
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      Filters
                      {showFilters && <X className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => window.location.reload()}
                      size="sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <Label>Status</Label>
                        <Select
                          value={filters.status || "active"}
                          onValueChange={(value) =>
                            updateFilters({ status: value as any })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Gender</Label>
                        <Select
                          value={filters.gender || ""}
                          onValueChange={(value) =>
                            updateFilters({ gender: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All genders" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">All genders</SelectItem>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Age Range</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Min"
                            type="number"
                            value={filters.ageMin || ""}
                            onChange={(e) =>
                              updateFilters({
                                ageMin: parseInt(e.target.value) || undefined,
                              })
                            }
                          />
                          <Input
                            placeholder="Max"
                            type="number"
                            value={filters.ageMax || ""}
                            onChange={(e) =>
                              updateFilters({
                                ageMax: parseInt(e.target.value) || undefined,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-end">
                        <Button
                          variant="outline"
                          onClick={() => updateFilters({})}
                          className="w-full gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Clear Filters
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Bulk Actions */}
                  {selectedPatients.size > 0 && (
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            selectedPatients.size ===
                            searchResults?.patients?.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                        <span className="text-sm font-medium">
                          {selectedPatients.size} of{" "}
                          {searchResults?.patients?.length || 0} selected
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {bulkActions.map((action) => (
                          <Button
                            key={action.id}
                            variant={action.variant || "default"}
                            size="sm"
                            onClick={() => handleBulkAction(action.id)}
                            className="gap-2"
                          >
                            {action.icon}
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Patients Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Patients ({searchResults?.total || 0})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {searchResults?.totalPages || 1}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage(
                          Math.min(searchResults?.totalPages || 1, page + 1),
                        )
                      }
                      disabled={page >= (searchResults?.totalPages || 1)}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {searchLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={
                                selectedPatients.size ===
                                  searchResults?.patients?.length &&
                                searchResults?.patients?.length > 0
                              }
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <SortableHeader sortKey="mrn">MRN</SortableHeader>
                          <SortableHeader sortKey="lastName">
                            Name
                          </SortableHeader>
                          <SortableHeader sortKey="email">
                            Contact
                          </SortableHeader>
                          <SortableHeader sortKey="dateOfBirth">
                            Age
                          </SortableHeader>
                          <SortableHeader sortKey="gender">
                            Gender
                          </SortableHeader>
                          <SortableHeader sortKey="status">
                            Status
                          </SortableHeader>
                          <TableHead>Provider</TableHead>
                          <TableHead>Last Visit</TableHead>
                          <TableHead className="w-12">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedPatients.map((patient) => (
                          <TableRow
                            key={patient.id}
                            className="hover:bg-muted/50"
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedPatients.has(patient.id)}
                                onCheckedChange={(checked) =>
                                  handleSelectPatient(
                                    patient.id,
                                    checked as boolean,
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {patient.mrn}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {PatientService.formatPatientName(patient)}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ID: {patient.id.slice(-8)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="w-3 h-3" />
                                  {patient.email}
                                </div>
                                {patient.phone && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-3 h-3" />
                                    {patient.phone}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>
                                  {PatientService.calculateAge(
                                    patient.dateOfBirth,
                                  )}{" "}
                                  years
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  DOB:{" "}
                                  {new Date(
                                    patient.dateOfBirth,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {patient.gender || "Not specified"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  patient.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="capitalize"
                              >
                                {patient.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {patient.providerName || "Not assigned"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {patient.lastAppointment
                                  ? new Date(
                                      patient.lastAppointment,
                                    ).toLocaleDateString()
                                  : "No visits"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      navigate(`/patient-records/${patient.id}`)
                                    }
                                    className="gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPatient(patient);
                                      setEditForm({
                                        firstName: patient.firstName,
                                        lastName: patient.lastName,
                                        email: patient.email,
                                        phone: patient.phone,
                                        status: patient.status,
                                        gender: patient.gender,
                                      });
                                      setShowEditDialog(true);
                                    }}
                                    className="gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setPatientToArchive(patient);
                                      setShowArchiveDialog(true);
                                    }}
                                    className="gap-2 text-orange-600"
                                  >
                                    <Archive className="w-4 h-4" />
                                    Archive
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Demographics Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Demographics Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Gender Distribution</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Male</span>
                          <span className="text-sm font-medium">
                            {analyticsData.genderDistribution.male}
                          </span>
                        </div>
                        <Progress
                          value={
                            (analyticsData.genderDistribution.male /
                              analyticsData.totalPatients) *
                            100
                          }
                          className="h-2"
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Female</span>
                          <span className="text-sm font-medium">
                            {analyticsData.genderDistribution.female}
                          </span>
                        </div>
                        <Progress
                          value={
                            (analyticsData.genderDistribution.female /
                              analyticsData.totalPatients) *
                            100
                          }
                          className="h-2"
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-sm">Other</span>
                          <span className="text-sm font-medium">
                            {analyticsData.genderDistribution.other}
                          </span>
                        </div>
                        <Progress
                          value={
                            (analyticsData.genderDistribution.other /
                              analyticsData.totalPatients) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insurance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Insurance Providers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(analyticsData.insuranceDistribution).map(
                      ([provider, count]) => (
                        <div
                          key={provider}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm">{provider}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{count}</span>
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{
                                  width: `${(count / Math.max(...Object.values(analyticsData.insuranceDistribution))) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Appointment Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Appointment Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {analyticsData.appointmentMetrics.completed}
                      </div>
                      <div className="text-sm text-green-600">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {analyticsData.appointmentMetrics.scheduled}
                      </div>
                      <div className="text-sm text-blue-600">Scheduled</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {analyticsData.appointmentMetrics.cancelled}
                      </div>
                      <div className="text-sm text-yellow-600">Cancelled</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {analyticsData.appointmentMetrics.noShow}
                      </div>
                      <div className="text-sm text-red-600">No Show</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Revenue Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600">
                        $
                        {analyticsData.revenueMetrics.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly Revenue</span>
                      <span className="text-lg font-medium">
                        $
                        {analyticsData.revenueMetrics.monthlyRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Avg. per Patient</span>
                      <span className="text-lg font-medium">
                        $
                        {analyticsData.revenueMetrics.avgRevenuePerPatient.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reports Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5" />
                  Generate Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-auto p-4"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">
                          Patient Demographics
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Age, gender, location analysis
                      </span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-auto p-4"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4" />
                        <span className="font-medium">Appointment Report</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Scheduling and attendance metrics
                      </span>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-auto p-4"
                  >
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-medium">Revenue Analysis</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Financial performance metrics
                      </span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Management Tab */}
          <TabsContent value="management" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Import/Export</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" className="gap-2">
                        <Upload className="w-4 h-4" />
                        Import CSV
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export All
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Backup & Restore</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" className="gap-2">
                        <Save className="w-4 h-4" />
                        Create Backup
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database Status</span>
                      <Badge variant="default" className="bg-green-600">
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">API Status</span>
                      <Badge variant="default" className="bg-green-600">
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Last Backup</span>
                      <span className="text-sm text-muted-foreground">
                        2 hours ago
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Storage Used</span>
                      <span className="text-sm">2.3 GB / 10 GB</span>
                    </div>
                  </div>

                  <Progress value={23} className="h-2" />
                </CardContent>
              </Card>

              {/* Audit Log */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Recent Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        action: "Patient Created",
                        user: "Dr. Sarah Wilson",
                        target: "Sarah Johnson",
                        time: "2 hours ago",
                      },
                      {
                        action: "Patient Updated",
                        user: "Nurse Williams",
                        target: "Michael Chen",
                        time: "4 hours ago",
                      },
                      {
                        action: "Patient Archived",
                        user: "Admin User",
                        target: "Robert Davis",
                        time: "1 day ago",
                      },
                      {
                        action: "Bulk Export",
                        user: "Dr. Johnson",
                        target: "25 patients",
                        time: "2 days ago",
                      },
                      {
                        action: "Patient Created",
                        user: "Dr. Martinez",
                        target: "Emily Rodriguez",
                        time: "3 days ago",
                      },
                    ].map((log, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <div>
                            <div className="text-sm font-medium">
                              {log.action}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {log.user} • {log.target}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.time}
                        </div>
                      </div>
                    ))}
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Page Size</Label>
                    <Select
                      value={pageSize.toString()}
                      onValueChange={(value) => setPageSize(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 patients</SelectItem>
                        <SelectItem value="20">20 patients</SelectItem>
                        <SelectItem value="50">50 patients</SelectItem>
                        <SelectItem value="100">100 patients</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Status Filter</Label>
                    <Select value="active">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active Patients</SelectItem>
                        <SelectItem value="all">All Patients</SelectItem>
                        <SelectItem value="inactive">
                          Inactive Patients
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">New Patient Alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Get notified when new patients register
                      </div>
                    </div>
                    <Checkbox defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Appointment Reminders</div>
                      <div className="text-sm text-muted-foreground">
                        Send appointment reminders to patients
                      </div>
                    </div>
                    <Checkbox defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Data Export Alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Notify when data exports are complete
                      </div>
                    </div>
                    <Checkbox />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Data Retention Period</Label>
                    <Select defaultValue="7years">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5years">5 years</SelectItem>
                        <SelectItem value="7years">7 years</SelectItem>
                        <SelectItem value="10years">10 years</SelectItem>
                        <SelectItem value="indefinite">Indefinite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Enable Audit Logging</div>
                      <div className="text-sm text-muted-foreground">
                        Track all patient data access
                      </div>
                    </div>
                    <Checkbox defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        Require 2FA for Bulk Actions
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Additional security for sensitive operations
                      </div>
                    </div>
                    <Checkbox defaultChecked />
                  </div>
                </CardContent>
              </Card>

              {/* Integration Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Integrations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">EHR System</div>
                      <div className="text-sm text-muted-foreground">
                        Epic MyChart Integration
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      Connected
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Lab System</div>
                      <div className="text-sm text-muted-foreground">
                        LabCorp Integration
                      </div>
                    </div>
                    <Badge variant="secondary">Disconnected</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Billing System</div>
                      <div className="text-sm text-muted-foreground">
                        NextGen Integration
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-600">
                      Connected
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Create Patient Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Patient</DialogTitle>
              <DialogDescription>
                Enter patient information to create a new record in the
                registry.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={createForm.firstName}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={createForm.lastName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={createForm.dateOfBirth}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        dateOfBirth: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={createForm.gender}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={createForm.address}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, address: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={createForm.city}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, city: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={createForm.state}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, state: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={createForm.zipCode}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, zipCode: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePatient}
                disabled={createPatientMutation.isPending}
              >
                {createPatientMutation.isPending
                  ? "Creating..."
                  : "Create Patient"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Patient Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Patient</DialogTitle>
              <DialogDescription>Update patient information.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={editForm.firstName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editForm.lastName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editStatus">Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, status: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editGender">Gender</Label>
                  <Select
                    value={editForm.gender}
                    onValueChange={(value) =>
                      setEditForm({ ...editForm, gender: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">
                        Prefer not to say
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditPatient}
                disabled={updatePatientMutation.isPending}
              >
                {updatePatientMutation.isPending
                  ? "Updating..."
                  : "Update Patient"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Archive Patient Dialog */}
        <AlertDialog
          open={showArchiveDialog}
          onOpenChange={setShowArchiveDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive Patient</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to archive{" "}
                {patientToArchive &&
                  PatientService.formatPatientName(patientToArchive)}
                ? This action can be undone later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleArchivePatient}
                disabled={archivePatientMutation.isPending}
              >
                {archivePatientMutation.isPending
                  ? "Archiving..."
                  : "Archive Patient"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
