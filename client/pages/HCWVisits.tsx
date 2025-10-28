import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Star,
  ArrowLeft,
  Plus,
  X,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  useCancelHcwVisit,
  useHcwUpcomingVisits,
  useHcwVisitHistory,
} from "@/hooks/api";
import type { ApiError } from "@/lib/api-client";
import type { HcwVisit } from "@/services/api.service";

export default function HCWVisits() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">(
    "upcoming",
  );

  const upcomingVisitsQuery = useHcwUpcomingVisits();
  const historyVisitsQuery = useHcwVisitHistory(activeTab === "history");
  const cancelVisitMutation = useCancelHcwVisit();

  const visits: HcwVisit[] = useMemo(() => {
    return activeTab === "upcoming"
      ? (upcomingVisitsQuery.data ?? [])
      : (historyVisitsQuery.data ?? []);
  }, [activeTab, upcomingVisitsQuery.data, historyVisitsQuery.data]);

  const isLoading =
    activeTab === "upcoming"
      ? upcomingVisitsQuery.isLoading
      : historyVisitsQuery.isLoading;

  useEffect(() => {
    const error = upcomingVisitsQuery.error as ApiError | undefined;
    if (error?.status === 401) {
      navigate("/login");
      return;
    }

    if (error) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to load upcoming visits.",
        variant: "destructive",
      });
    }
  }, [upcomingVisitsQuery.error, navigate, toast]);

  useEffect(() => {
    if (activeTab !== "history") {
      return;
    }

    const error = historyVisitsQuery.error as ApiError | undefined;
    if (error && error.status !== 401) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to load visit history.",
        variant: "destructive",
      });
    }
  }, [historyVisitsQuery.error, activeTab, toast]);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        label: string;
      }
    > = {
      scheduled: { variant: "default", label: "Scheduled" },
      in_progress: { variant: "default", label: "In Progress" },
      completed: { variant: "secondary", label: "Completed" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      no_show: { variant: "destructive", label: "No Show" },
    };

    const config = variants[status] || {
      variant: "outline" as const,
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getVisitTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      routine: "Routine Visit",
      urgent: "Urgent Visit",
      follow_up: "Follow-Up",
      initial_assessment: "Initial Assessment",
    };
    return labels[type] || type;
  };

  const handleCancelVisit = async (visitId: string) => {
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this visit?",
    );
    if (!shouldCancel) {
      return;
    }

    try {
      await cancelVisitMutation.mutateAsync({
        visitId,
        cancellationReason: "Patient requested cancellation",
      });
      toast({
        title: "Visit cancelled",
        description: "Your visit has been successfully cancelled.",
      });
    } catch (error) {
      console.error("Error cancelling visit:", error);
      toast({
        title: "Error",
        description: "Failed to cancel visit. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading && !visits.length) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/my-care-team")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary" />
                My Visits
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your healthcare visits
              </p>
            </div>
          </div>
          <Button onClick={() => navigate("/care-team")} className="gap-2">
            <Plus className="w-4 h-4" />
            Schedule Visit
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "upcoming" | "history")
          }
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>

        {visits.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No visits found</CardTitle>
              <CardDescription>
                You don&apos;t have any{" "}
                {activeTab === "upcoming" ? "upcoming" : "past"} visits yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/care-team")} className="gap-2">
                <Plus className="w-4 h-4" />
                Schedule a Visit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {visits.map((visit) => (
              <Card key={visit.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 border-b bg-muted/40">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      {getVisitTypeLabel(visit.visitType)}
                      {getStatusBadge(visit.status)}
                    </CardTitle>
                    {visit.purpose && (
                      <CardDescription>{visit.purpose}</CardDescription>
                    )}
                  </div>
                  {visit.status === "completed" && visit.rating && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">
                        {visit.rating}
                      </span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {visit.caregiver.firstName} {visit.caregiver.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {visit.caregiver.specialty} •{" "}
                          {visit.caregiver.credentials}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {format(
                            new Date(visit.scheduledTime),
                            "EEEE, MMMM d, yyyy",
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(visit.scheduledTime), "h:mm a")}
                          {visit.actualStart && visit.actualEnd && (
                            <span>
                              {" "}
                              (Duration:{" "}
                              {Math.round(
                                (new Date(visit.actualEnd).getTime() -
                                  new Date(visit.actualStart).getTime()) /
                                  60000,
                              )}{" "}
                              min)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {visit.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Visit Location</p>
                          <p className="text-sm text-muted-foreground">
                            {visit.location}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {(visit.notes ||
                    visit.feedback ||
                    visit.cancellationReason) && (
                    <div className="bg-muted/50 border border-muted rounded-lg p-4 space-y-2">
                      {visit.notes && (
                        <div>
                          <p className="text-sm font-medium">Visit notes</p>
                          <p className="text-sm text-muted-foreground">
                            {visit.notes}
                          </p>
                        </div>
                      )}
                      {visit.feedback && (
                        <div>
                          <p className="text-sm font-medium">Your feedback</p>
                          <p className="text-sm text-muted-foreground">
                            {visit.feedback}
                          </p>
                        </div>
                      )}
                      {visit.cancellationReason && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <X className="w-4 h-4" />
                          <span>{visit.cancellationReason}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "upcoming" && visit.status === "scheduled" && (
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(`/hcw-visits/${visit.id}/reschedule`)
                        }
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleCancelVisit(visit.id)}
                        disabled={cancelVisitMutation.isPending}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel Visit
                      </Button>
                    </div>
                  )}

                  {activeTab === "history" &&
                    visit.status === "completed" &&
                    !visit.rating && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          navigate(`/hcw-visits/${visit.id}/feedback`)
                        }
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Leave Feedback
                      </Button>
                    )}

                  {visit.status === "completed" && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>Visit completed successfully</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
