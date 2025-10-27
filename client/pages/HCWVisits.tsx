import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { HCW } from "@/lib/api-endpoints";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Visit {
  id: string;
  scheduledTime: Date;
  actualStart?: Date;
  actualEnd?: Date;
  visitType: string;
  purpose: string;
  location?: string;
  notes?: string;
  status: string;
  rating?: number;
  feedback?: string;
  caregiver: {
    firstName: string;
    lastName: string;
    specialty: string;
    credentials: string;
  };
}

export default function HCWVisits() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    fetchVisits();
  }, [activeTab]);

  const fetchVisits = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const endpoint =
        activeTab === "upcoming" ? HCW.VISITS.UPCOMING : HCW.VISITS.HISTORY;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch visits");
      }

      const data = await response.json();
      setVisits(data.visits || []);
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast({
        title: "Error",
        description: "Failed to load visits. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    if (!confirm("Are you sure you want to cancel this visit?")) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(HCW.VISITS.CANCEL(visitId), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cancellationReason: "Patient requested cancellation",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel visit");
      }

      toast({
        title: "Visit Cancelled",
        description: "Your visit has been successfully cancelled.",
      });

      fetchVisits();
    } catch (error) {
      console.error("Error cancelling visit:", error);
      toast({
        title: "Error",
        description: "Failed to cancel visit. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/care-team")}
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Empty State */}
        {visits.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {activeTab === "upcoming"
                  ? "No Upcoming Visits"
                  : "No Visit History"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {activeTab === "upcoming"
                  ? "Schedule a visit with your care team to get started."
                  : "Your completed visits will appear here."}
              </p>
              {activeTab === "upcoming" && (
                <Button onClick={() => navigate("/care-team")}>
                  Schedule Your First Visit
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Visits List */}
        <div className="space-y-4">
          {visits.map((visit) => (
            <Card key={visit.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">
                        {getVisitTypeLabel(visit.visitType)}
                      </CardTitle>
                      {getStatusBadge(visit.status)}
                    </div>
                    <CardDescription className="text-base">
                      {visit.purpose}
                    </CardDescription>
                  </div>
                  {activeTab === "history" && visit.rating && (
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < visit.rating!
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Caregiver */}
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        Dr. {visit.caregiver.firstName}{" "}
                        {visit.caregiver.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {visit.caregiver.specialty} •{" "}
                        {visit.caregiver.credentials}
                      </p>
                    </div>
                  </div>

                  {/* Date/Time */}
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

                  {/* Location */}
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

                {/* Notes/Feedback */}
                {(visit.notes || visit.feedback) && (
                  <div className="bg-muted p-4 rounded-lg mb-4">
                    <p className="text-sm font-medium mb-2">
                      {visit.notes ? "Visit Notes" : "Your Feedback"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {visit.notes || visit.feedback}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {activeTab === "upcoming" && visit.status === "scheduled" && (
                  <div className="flex gap-2">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
