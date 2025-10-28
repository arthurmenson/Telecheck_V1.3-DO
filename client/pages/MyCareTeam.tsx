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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Video,
  MessageCircle,
  Calendar,
  Phone,
  Mail,
  Star,
  MapPin,
  Clock,
  Award,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHcwCaregivers } from "@/hooks/api";
import type { ApiError } from "@/lib/api-client";
import type { HcwCaregiver } from "@/services/api.service";

export default function MyCareTeam() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"all" | "primary" | "specialists">(
    "all",
  );

  const caregiversQuery = useHcwCaregivers();
  const caregivers: HcwCaregiver[] = caregiversQuery.data ?? [];

  useEffect(() => {
    const error = caregiversQuery.error as ApiError | undefined;
    if (error?.status === 401) {
      navigate("/login");
      return;
    }

    if (error) {
      toast({
        title: "Error",
        description: error.message ?? "Failed to load your care team.",
        variant: "destructive",
      });
    }
  }, [caregiversQuery.error, navigate, toast]);

  const filteredCaregivers = useMemo(() => {
    if (activeTab === "primary") {
      return caregivers.filter((caregiver) => caregiver.isPrimary);
    }

    if (activeTab === "specialists") {
      return caregivers.filter(
        (caregiver) => caregiver.assignmentType === "specialist",
      );
    }

    return caregivers;
  }, [activeTab, caregivers]);

  const handleMessage = (caregiverId: string) => {
    navigate(`/hcw-messages?caregiver=${caregiverId}`);
  };

  const handleSchedule = (caregiverId: string) => {
    navigate(`/hcw-visits/book?caregiver=${caregiverId}`);
  };

  const handleVideoCall = (caregiverId: string) => {
    navigate(`/schedule?caregiver=${caregiverId}&type=video`);
  };

  const isLoading = caregiversQuery.isLoading;

  if (isLoading && caregivers.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  My Care Team
                </h1>
                <p className="text-muted-foreground">
                  Connect with your assigned caregivers and manage visits.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full">
                {caregivers.length} team members
              </Badge>
              <Badge variant="outline" className="rounded-full">
                HCW@Home Partnership
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as typeof activeTab)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="primary">Primary</TabsTrigger>
            <TabsTrigger value="specialists">Specialists</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredCaregivers.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>No caregivers assigned yet</CardTitle>
              <CardDescription>
                Your care team will appear here once assignments are made.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/care-team")} className="gap-2">
                <Calendar className="w-4 h-4" />
                Schedule a Visit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCaregivers.map((caregiver) => (
              <Card
                key={caregiver.id}
                className="flex flex-col border-muted/60"
              >
                <CardHeader className="pb-3 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage
                        alt={`${caregiver.firstName} ${caregiver.lastName}`}
                      />
                      <AvatarFallback className="text-lg">
                        {`${caregiver.firstName[0]}${caregiver.lastName[0]}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {caregiver.firstName} {caregiver.lastName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {caregiver.specialty}
                        <span className="text-xs text-muted-foreground">
                          {caregiver.credentials}
                        </span>
                      </CardDescription>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {caregiver.isPrimary && (
                      <Badge variant="secondary" className="rounded-full">
                        Primary
                      </Badge>
                    )}
                    {caregiver.assignmentType && !caregiver.isPrimary && (
                      <Badge variant="outline" className="rounded-full">
                        {caregiver.assignmentType}
                      </Badge>
                    )}
                    {caregiver.rating ? (
                      <span className="inline-flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500" />
                        {caregiver.rating.toFixed(1)} (
                        {caregiver.reviewCount ?? 0})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Trusted caregiver
                      </span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    {caregiver.bio && (
                      <p className="line-clamp-3">{caregiver.bio}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Typical response within 24 hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>Supports home and virtual visits</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    {caregiver.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{caregiver.email}</span>
                      </div>
                    )}
                    {caregiver.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{caregiver.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <div className="p-5 pt-0 mt-auto">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMessage(caregiver.id)}
                      className="gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Message</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVideoCall(caregiver.id)}
                      className="gap-1"
                    >
                      <Video className="w-4 h-4" />
                      <span className="hidden sm:inline">Video</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSchedule(caregiver.id)}
                      className="gap-1"
                    >
                      <Calendar className="w-4 h-4" />
                      <span className="hidden sm:inline">Book</span>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Quick Access
              </CardTitle>
              <CardDescription>
                Jump back into your care coordination tools.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/hcw-visits")}
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Scheduled Visits
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/hcw-messages")}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                View Messages
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/care-plan")}
              >
                <Users className="w-4 h-4 mr-2" />
                My Care Plan
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="w-5 h-5 text-primary" />
                Emergency Contact
              </CardTitle>
              <CardDescription>
                Reach your care team immediately when urgent issues arise.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                For urgent medical issues, contact your primary care provider or
                call:
              </p>
              <Button variant="destructive" className="w-full" size="lg">
                <Phone className="w-4 h-4 mr-2" />
                Emergency Contact
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                For life-threatening emergencies, call 911
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
