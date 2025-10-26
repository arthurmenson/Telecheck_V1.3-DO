import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Video,
  Clock,
  Calendar,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Activity,
  Timer,
  Play,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../lib/api-client";
import type {
  ConsultationAppointment,
  AppointmentsListResponse,
  ConsultationFilters,
  ConsultationStats,
} from "../types/consultation";

interface DoctorVideoConsultationsProps {
  className?: string;
  showStats?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function DoctorVideoConsultations({
  className = "",
  showStats = true,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: DoctorVideoConsultationsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [activeTab, setActiveTab] = useState<"upcoming" | "today" | "past">(
    "upcoming",
  );
  const [appointments, setAppointments] = useState<ConsultationAppointment[]>(
    [],
  );
  const [stats, setStats] = useState<ConsultationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ConsultationFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  // Countdown state for each appointment
  const [countdowns, setCountdowns] = useState<Record<string, string>>({});

  // Fetch appointments from API
  const fetchAppointments = useCallback(async () => {
    if (!user?.id) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    try {
      setError(null);

      // Build query parameters
      const params = new URLSearchParams({
        doctorId: user.id,
        type: "video",
        limit: itemsPerPage.toString(),
        offset: ((currentPage - 1) * itemsPerPage).toString(),
      });

      // Add date filters based on active tab
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      if (activeTab === "upcoming") {
        params.append("startDate", now.toISOString());
        params.append("status", "confirmed");
      } else if (activeTab === "today") {
        params.append("startDate", todayStart.toISOString());
        params.append("endDate", todayEnd.toISOString());
      } else if (activeTab === "past") {
        params.append("endDate", now.toISOString());
        params.append("status", "completed");
      }

      // Add additional filters
      if (filters.status) {
        params.set("status", filters.status);
      }
      if (filters.startDate) {
        params.set("startDate", filters.startDate);
      }
      if (filters.endDate) {
        params.set("endDate", filters.endDate);
      }

      const response = await apiClient.get<AppointmentsListResponse>(
        `/appointments?${params.toString()}`,
      );

      if (response.success && response.data) {
        let filteredAppointments = response.data.appointments;

        // Client-side search filtering
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredAppointments = filteredAppointments.filter(
            (apt) =>
              `${apt.patient.firstName} ${apt.patient.lastName}`
                .toLowerCase()
                .includes(term) ||
              apt.reason?.toLowerCase().includes(term) ||
              apt.patient.email.toLowerCase().includes(term),
          );
        }

        setAppointments(filteredAppointments);
        setTotal(response.data.total);
        setTotalPages(Math.ceil(response.data.total / itemsPerPage));
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load video consultations",
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, activeTab, currentPage, filters, searchTerm]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!user?.id || !showStats) return;

    try {
      // Fetch today's appointments for stats
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const params = new URLSearchParams({
        doctorId: user.id,
        type: "video",
        startDate: todayStart.toISOString(),
        endDate: todayEnd.toISOString(),
        limit: "100",
      });

      const response = await apiClient.get<AppointmentsListResponse>(
        `/appointments?${params.toString()}`,
      );

      if (response.success && response.data) {
        const todayAppointments = response.data.appointments;
        const completed = todayAppointments.filter(
          (apt) => apt.status === "completed",
        );
        const upcoming = todayAppointments.filter(
          (apt) =>
            apt.status === "confirmed" && new Date(apt.scheduledTime) > now,
        );

        const totalDuration = completed.reduce(
          (sum, apt) => sum + (apt.videoConsultation?.duration || 0),
          0,
        );
        const avgDuration =
          completed.length > 0 ? totalDuration / completed.length : 0;

        setStats({
          totalToday: todayAppointments.length,
          upcoming: upcoming.length,
          completed: completed.length,
          averageDuration: avgDuration,
          noShowRate: 0, // Calculate based on your business logic
        });
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [user?.id, showStats]);

  // Calculate countdown for each appointment
  const updateCountdowns = useCallback(() => {
    const newCountdowns: Record<string, string> = {};

    appointments.forEach((appointment) => {
      const scheduledTime = new Date(appointment.scheduledTime);
      const now = new Date();
      const diff = scheduledTime.getTime() - now.getTime();

      if (diff > 0) {
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
          newCountdowns[appointment.id] = `${days}d ${hours % 24}h`;
        } else if (hours > 0) {
          newCountdowns[appointment.id] = `${hours}h ${minutes % 60}m`;
        } else {
          newCountdowns[appointment.id] = `${minutes}m`;
        }
      } else if (diff > -3600000) {
        // Within 1 hour after scheduled time
        newCountdowns[appointment.id] = "Now";
      } else {
        newCountdowns[appointment.id] = "Overdue";
      }
    });

    setCountdowns(newCountdowns);
  }, [appointments]);

  // Check if appointment can be joined (within 15 minutes of start time)
  const canJoinConsultation = (
    appointment: ConsultationAppointment,
  ): boolean => {
    const scheduledTime = new Date(appointment.scheduledTime);
    const now = new Date();
    const diff = scheduledTime.getTime() - now.getTime();
    const minutesUntil = diff / 60000;

    // Can join 15 minutes before to 60 minutes after scheduled time
    return minutesUntil <= 15 && minutesUntil >= -60;
  };

  // Handle joining a consultation
  const handleJoinConsultation = async (
    appointment: ConsultationAppointment,
  ) => {
    try {
      // Navigate to the televisit page
      navigate(`/ehr/televisit/${appointment.id}`);
    } catch (err) {
      console.error("Failed to join consultation:", err);
      setError("Failed to join consultation. Please try again.");
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAppointments();
    fetchStats();
  }, [fetchAppointments, fetchStats]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchAppointments();
      fetchStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAppointments, fetchStats]);

  // Update countdowns every second
  useEffect(() => {
    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [updateCountdowns]);

  // Handle tab change
  const handleTabChange = (tab: "upcoming" | "today" | "past") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Format duration
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // Format date/time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // Render loading state
  if (isLoading && appointments.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Total</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalToday}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.upcoming}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.completed}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Duration</p>
                  <p className="text-3xl font-bold text-foreground">
                    {Math.round(stats.averageDuration)}m
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Timer className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Consultations Card */}
      <Card className="glass-morphism border border-border/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center">
              <Video className="w-6 h-6 mr-3 text-primary" />
              Video Consultations
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  fetchAppointments();
                  fetchStats();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status: value === "all" ? undefined : (value as any),
                }))
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange as any}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="upcoming">
                Upcoming (
                {
                  appointments.filter(
                    (a) => new Date(a.scheduledTime) > new Date(),
                  ).length
                }
                )
              </TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-center py-12">
                  <Video className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No consultations found
                  </h3>
                  <p className="text-muted-foreground">
                    {activeTab === "upcoming"
                      ? "You don't have any upcoming video consultations."
                      : activeTab === "today"
                        ? "No consultations scheduled for today."
                        : "No past consultations to display."}
                  </p>
                </div>
              ) : (
                <>
                  {appointments.map((appointment) => {
                    const { date, time } = formatDateTime(
                      appointment.scheduledTime,
                    );
                    const canJoin = canJoinConsultation(appointment);
                    const countdown = countdowns[appointment.id] || "";

                    return (
                      <div
                        key={appointment.id}
                        className="glass-morphism p-5 rounded-xl border border-border/10 hover-lift transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Patient Info */}
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-foreground truncate">
                                  {appointment.patient.firstName}{" "}
                                  {appointment.patient.lastName}
                                </h3>
                                <Badge
                                  className={getStatusColor(appointment.status)}
                                >
                                  {appointment.status}
                                </Badge>
                                {canJoin && (
                                  <Badge className="bg-green-100 text-green-800 animate-pulse">
                                    <Activity className="w-3 h-3 mr-1" />
                                    Ready
                                  </Badge>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{date}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{time}</span>
                                  {countdown && activeTab === "upcoming" && (
                                    <span className="ml-2 font-semibold text-primary">
                                      ({countdown})
                                    </span>
                                  )}
                                </div>
                                {appointment.patient.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{appointment.patient.phone}</span>
                                  </div>
                                )}
                                {appointment.reason && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="w-4 h-4" />
                                    <span className="truncate">
                                      {appointment.reason}
                                    </span>
                                  </div>
                                )}
                              </div>
                              {appointment.videoConsultation &&
                                activeTab === "past" && (
                                  <div className="mt-2 text-sm text-muted-foreground">
                                    Duration:{" "}
                                    {formatDuration(
                                      appointment.videoConsultation.duration,
                                    )}
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {activeTab === "upcoming" && (
                              <>
                                {canJoin ? (
                                  <Button
                                    onClick={() =>
                                      handleJoinConsultation(appointment)
                                    }
                                    className="gradient-bg text-white border-0"
                                    size="lg"
                                  >
                                    <Play className="w-4 h-4 mr-2" />
                                    Join Now
                                  </Button>
                                ) : (
                                  <Button variant="outline" size="sm" disabled>
                                    <Clock className="w-4 h-4 mr-2" />
                                    {countdown}
                                  </Button>
                                )}
                              </>
                            )}
                            {activeTab === "past" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/patient-records/${appointment.patientId}`,
                                  )
                                }
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View Records
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                navigate(`/patient/${appointment.patientId}`)
                              }
                            >
                              <User className="w-4 h-4 mr-2" />
                              Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(currentPage * itemsPerPage, total)} of {total}{" "}
                        consultations
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.max(1, p - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm text-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((p) => Math.min(totalPages, p + 1))
                          }
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
