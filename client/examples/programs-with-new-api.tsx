/**
 * Example: How to use the new API architecture in your Programs component
 * This demonstrates the modern approach vs the current static data approach
 */

import React, { useEffect, useMemo, useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Activity,
  BarChart3,
  Edit,
  HeartPulse,
  Plus,
  Search,
  Star,
  Target,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";

// dYs? NEW: Import the modern API hooks
import {
  usePrograms,
  useProgramDetails,
  useProgramAnalytics,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
  useProgramParticipants,
  useEnrollParticipant,
} from "../hooks/api";

// dYs? NEW: Import type-safe services (still useful for scriptable flows)
import { ProgramService, type Program } from "../services/api.service";

// dYs? NEW: Import API endpoints (no more hardcoded URLs)
import { API_ENDPOINTS } from "../lib/api-endpoints";

export function ModernProgramsComponent() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);

  // dYs? NEW: Replace static data with real API calls
  const {
    data: programs = [],
    isLoading: programsLoading,
    error: programsError,
    refetch: refetchPrograms,
  } = usePrograms();

  // dYs? NEW: Type-safe mutations with automatic cache updates
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const deleteProgram = useDeleteProgram();

  // dYs? NEW: Real-time participant data
  const enrollParticipant = useEnrollParticipant();

  // Ensure we always have a selection once programs load
  useEffect(() => {
    if (!selectedProgramId && programs.length) {
      setSelectedProgramId(programs[0].id);
    }
  }, [programs, selectedProgramId]);

  const selectedProgramKey = selectedProgramId ?? "";
  const {
    data: selectedProgram,
    isFetching: programDetailsLoading,
  } = useProgramDetails(selectedProgramKey);
  const {
    data: programAnalytics,
    isFetching: analyticsLoading,
  } = useProgramAnalytics(selectedProgramKey);
  const {
    data: participantData,
    isFetching: participantsLoading,
  } = useProgramParticipants(selectedProgramKey);

  const participants = useMemo(
    () => (Array.isArray(participantData) ? participantData : []),
    [participantData],
  );

  const programSummary = useMemo(() => {
    if (!programs.length) {
      return {
        totalPrograms: 0,
        totalParticipants: 0,
        averageCompletion: 0,
        activePrograms: 0,
      };
    }

    const totalParticipants = programs.reduce(
      (sum, program) => sum + (program.enrolledParticipants ?? 0),
      0,
    );
    const averageCompletion = Math.round(
      programs.reduce((sum, program) => sum + (program.completionRate ?? 0), 0) /
        programs.length,
    );
    const activePrograms = programs.filter((program) => program.status === "active")
      .length;

    return {
      totalPrograms: programs.length,
      totalParticipants,
      averageCompletion,
      activePrograms,
    };
  }, [programs]);

  // Handle creating a new program
  const handleCreateProgram = async (programData: any) => {
    try {
      const response = await createProgram.mutateAsync(programData);
      const newId = response?.data?.id;
      if (newId) {
        setSelectedProgramId(newId);
        setActiveTab("overview");
      }
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Failed to create program:", error);
    }
  };

  const handleEditProgram = (program: Program) => {
    setSelectedProgramId(program.id);
    setActiveTab("overview");
  };

  const handleArchiveProgram = async () => {
    if (!selectedProgramId) return;
    try {
      await updateProgram.mutateAsync({
        id: selectedProgramId,
        program: { status: "archived" },
      });
    } catch (error) {
      console.error("Failed to archive program:", error);
    }
  };

  const handleDeleteProgram = async (programId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this program?");
    if (!confirmed) return;

    try {
      await deleteProgram.mutateAsync(programId);
      if (selectedProgramId === programId) {
        setSelectedProgramId(null);
      }
    } catch (error) {
      console.error("Failed to delete program:", error);
    }
  };

  // Handle enrolling a participant
  const handleEnrollParticipant = async (
    programId: string,
    participantData: any,
  ) => {
    try {
      await enrollParticipant.mutateAsync({ programId, participantData });
    } catch (error) {
      console.error("Failed to enroll participant:", error);
    }
  };

  // Filter programs based on search
  const filteredPrograms = useMemo(
    () =>
      programs.filter(
        (program) =>
          program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          program.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [programs, searchTerm],
  );

  // dYs? NEW: Built-in loading and error states
  if (programsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p>Loading programs...</p>
        </div>
      </div>
    );
  }

  if (programsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load programs</p>
          <Button onClick={() => refetchPrograms()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Header with real-time stats */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <HeartPulse className="w-10 h-10 text-primary" />
              Programs Management
            </h1>
            <p className="text-lg text-muted-foreground">
              {programSummary.totalPrograms} active programs - {" "}
              {programSummary.totalParticipants} total participants
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              className="gap-2"
              onClick={() => setIsCreateDialogOpen(true)}
              disabled={createProgram.isPending}
            >
              <Plus className="w-4 h-4" />
              {createProgram.isPending ? "Creating..." : "Create Program"}
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="programs">
              Programs ({programSummary.totalPrograms})
            </TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Participants</p>
                    <p className="text-2xl font-semibold">
                      {programSummary.totalParticipants}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Average Completion</p>
                    <p className="text-2xl font-semibold">
                      {programSummary.averageCompletion}%
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-3">
                  <Activity className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active Programs</p>
                    <p className="text-2xl font-semibold">
                      {programSummary.activePrograms}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Programs</p>
                    <p className="text-2xl font-semibold">
                      {programSummary.totalPrograms}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Selected Program</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedProgramId && (
                  <p className="text-muted-foreground">
                    Select a program from the Programs tab to see its details here.
                  </p>
                )}
                {selectedProgramId && programDetailsLoading && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    <span>Loading program details...</span>
                  </div>
                )}
                {selectedProgramId && !programDetailsLoading && selectedProgram && (
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-semibold">{selectedProgram.title}</h2>
                        <p className="text-muted-foreground max-w-2xl">
                          {selectedProgram.description}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleArchiveProgram}
                          disabled={updateProgram.isPending}
                        >
                          Archive Program
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleDeleteProgram(selectedProgram.id)}
                          disabled={deleteProgram.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Coach</p>
                        <p className="font-medium">{selectedProgram.coach}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="font-medium">{selectedProgram.duration}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-medium capitalize">{selectedProgram.status}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Participants</span>
                        <span>
                          {selectedProgram.enrolledParticipants}/
                          {selectedProgram.maxParticipants ?? "--"}
                        </span>
                      </div>
                      <Progress
                        value={
                          (selectedProgram.enrolledParticipants /
                            (selectedProgram.maxParticipants ?? 100)) * 100
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                )}
                {selectedProgramId && !programDetailsLoading && !selectedProgram && (
                  <p className="text-muted-foreground">Program details not available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search programs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <Card
                  key={program.id}
                  className={`hover:shadow-lg transition-all duration-300 overflow-hidden ${
                    selectedProgramId === program.id ? "border-primary" : ""
                  }`}
                >
                  <div className="relative">
                    {program.image && (
                      <img
                        src={program.image}
                        alt={program.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        {program.category}
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        {program.status}
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{program.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {program.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duration</span>
                          <p className="font-medium">{program.duration}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Coach</span>
                          <p className="font-medium">{program.coach}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Participants</span>
                          <span>
                            {program.enrolledParticipants}/
                            {program.maxParticipants ?? "--"}
                          </span>
                        </div>
                        <Progress
                          value={
                            (program.enrolledParticipants /
                              (program.maxParticipants ?? 100)) * 100
                          }
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
                          <span className="font-medium">
                            {program.completionRate}%
                          </span>
                        </div>
                        <div className="font-semibold text-primary">
                          ${program.price}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditProgram(program)}
                        >
                          <Edit className="w-3 h-3 mr-1" /> View Details
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEnrollParticipant(program.id, {})}
                          disabled={enrollParticipant.isPending}
                        >
                          <UserPlus className="w-3 h-3 mr-1" /> Enroll
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteProgram(program.id)}
                          disabled={deleteProgram.isPending}
                          title="Delete program"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="participants" className="space-y-6">
            {!selectedProgramId && (
              <p className="text-muted-foreground">
                Select a program to load participants.
              </p>
            )}
            {selectedProgramId && participantsLoading && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                <span>Loading participants...</span>
              </div>
            )}
            {selectedProgramId && !participantsLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>Participants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {participants.length === 0 ? (
                    <p className="text-muted-foreground">
                      No participants found for this program yet.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {participants.map((participant: any, index: number) => (
                        <li
                          key={participant.id ?? participant.email ?? index}
                          className="flex items-center justify-between rounded-md border p-3"
                        >
                          <div>
                            <p className="font-medium">
                              {participant.name ?? "Participant"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {participant.email ?? "No email provided"}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {(participant.status ?? "active").toString()}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {!selectedProgramId && (
              <p className="text-muted-foreground">
                Select a program to view analytics.
              </p>
            )}
            {selectedProgramId && analyticsLoading && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                <span>Loading analytics...</span>
              </div>
            )}
            {selectedProgramId && !analyticsLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>Program Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {programAnalytics && Object.keys(programAnalytics).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(programAnalytics).map(([key, value]) => (
                        <div key={key} className="rounded-md border p-4">
                          <p className="text-sm text-muted-foreground uppercase tracking-wide">
                            {key.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <p className="text-lg font-semibold break-words">
                            {typeof value === "object"
                              ? JSON.stringify(value, null, 2)
                              : (value as any)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Analytics data is not available yet for this program.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// dYs? NEW: Example of how to use the API services directly
export async function exampleApiUsage() {
  try {
    // Type-safe API calls
    const programs = await ProgramService.getPrograms();
    console.log("Programs:", programs.data);
    console.log("Programs endpoint:", API_ENDPOINTS.EHR.PROGRAMS.LIST);

    // Create a new program
    const newProgram = await ProgramService.createProgram({
      title: "New Wellness Program",
      description: "A comprehensive wellness program",
      type: "rolling-start",
      duration: "30 Days",
      category: "wellness",
      price: 199,
      coach: "Dr. Smith",
      enrolledParticipants: 0,
      status: "active",
      completionRate: 0,
      rating: 0,
      modules: 5,
      objectives: ["Improve health", "Build habits"],
      curriculum: ["Module 1", "Module 2"],
    });
    console.log("Created program:", newProgram.data);

    if (newProgram.data?.id) {
      const program = await ProgramService.getProgram(newProgram.data.id);
      console.log("Fetched program detail:", program.data);
    }

    // Get participants for a program
    const participants =
      await ProgramService.getProgramParticipants("program-id");
    console.log("Participants:", participants.data);
  } catch (error) {
    console.error("API Error:", error);
  }
}

/*
dYs? BENEFITS OF THE NEW API ARCHITECTURE:

1)  Type Safety: Full TypeScript support with autocomplete
2)  Automatic Caching: Data cached and updated automatically
3)  Optimistic Updates: UI updates immediately
4)  Error Handling: Built-in error boundaries
5)  Loading States: Automatic loading indicators
6)  Background Sync: Data stays fresh automatically
7)  Request Deduplication: No duplicate API calls
8)  Retry Logic: Automatic retries on failure
9)  Cache Invalidation: Smart cache updates
10)  Offline Support: Works with React Query offline mode

COMPARISON:
- Old way: Static data, manual state management
- New way: Real API integration, automatic state management
*/
