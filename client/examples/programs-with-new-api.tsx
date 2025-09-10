/**
 * Example: How to use the new API architecture in your Programs component
 * This demonstrates the modern approach vs the current static data approach
 */

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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

// 🚀 NEW: Import the modern API hooks
import {
  usePrograms,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
  useProgramParticipants,
  useEnrollParticipant,
} from "../hooks/api";

// 🚀 NEW: Import type-safe services
import { ProgramService } from "../services/api.service";

// 🚀 NEW: Import API endpoints (no more hardcoded URLs)
import { API_ENDPOINTS } from "../lib/api-endpoints";

export function ModernProgramsComponent() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // 🚀 NEW: Replace static data with real API calls
  const {
    data: programs = [],
    isLoading: programsLoading,
    error: programsError,
    refetch: refetchPrograms,
  } = usePrograms();

  // 🚀 NEW: Type-safe mutations with automatic cache updates
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram();
  const deleteProgram = useDeleteProgram();

  // 🚀 NEW: Real-time participant data
  const enrollParticipant = useEnrollParticipant();

  // Handle creating a new program
  const handleCreateProgram = async (programData: any) => {
    try {
      await createProgram.mutateAsync(programData);
      setIsCreateDialogOpen(false);
      // ✅ Cache automatically updates, no manual refetch needed!
    } catch (error) {
      console.error("Failed to create program:", error);
      // ✅ Error handling built-in
    }
  };

  // Handle enrolling a participant
  const handleEnrollParticipant = async (
    programId: string,
    participantData: any,
  ) => {
    try {
      await enrollParticipant.mutateAsync({ programId, participantData });
      // ✅ Optimistic updates - UI updates immediately!
    } catch (error) {
      console.error("Failed to enroll participant:", error);
    }
  };

  // Filter programs based on search
  const filteredPrograms = programs.filter(
    (program) =>
      program.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 🚀 NEW: Built-in loading and error states
  if (programsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
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
              {programs.length} active programs •{" "}
              {programs.reduce((sum, p) => sum + p.enrolledParticipants, 0)}{" "}
              total participants
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
              Programs ({programs.length})
            </TabsTrigger>
            <TabsTrigger value="participants">Participants</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="programs" className="space-y-6">
            {/* Search */}
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

            {/* Programs Grid with real data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((program) => (
                <Card
                  key={program.id}
                  className="hover:shadow-lg transition-all duration-300 overflow-hidden"
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
                          <span className="text-muted-foreground">
                            Duration:
                          </span>
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
                          <span>
                            {program.enrolledParticipants}/
                            {program.maxParticipants || "∞"}
                          </span>
                        </div>
                        <Progress
                          value={
                            (program.enrolledParticipants /
                              (program.maxParticipants || 100)) *
                            100
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

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEditProgram(program)}
                          disabled={updateProgram.isPending}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            handleEnrollParticipant(program.id, {})
                          }
                          disabled={enrollParticipant.isPending}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          Enroll
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// 🚀 NEW: Example of how to use the API services directly
export async function exampleApiUsage() {
  try {
    // Type-safe API calls
    const programs = await ProgramService.getPrograms();
    console.log("Programs:", programs.data);

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

    // Get participants for a program
    const participants =
      await ProgramService.getProgramParticipants("program-id");
    console.log("Participants:", participants.data);
  } catch (error) {
    console.error("API Error:", error);
  }
}

/*
🚀 BENEFITS OF THE NEW API ARCHITECTURE:

1. ✅ Type Safety: Full TypeScript support with autocomplete
2. ✅ Automatic Caching: Data cached and updated automatically
3. ✅ Optimistic Updates: UI updates immediately
4. ✅ Error Handling: Built-in error boundaries
5. ✅ Loading States: Automatic loading indicators
6. ✅ Background Sync: Data stays fresh automatically
7. ✅ Request Deduplication: No duplicate API calls
8. ✅ Retry Logic: Automatic retries on failure
9. ✅ Cache Invalidation: Smart cache updates
10. ✅ Offline Support: Works with React Query offline mode

COMPARISON:
❌ Old way: Static data, manual state management
✅ New way: Real API integration, automatic state management
*/
