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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { HCW } from "@/lib/api-endpoints";
import { useToast } from "@/hooks/use-toast";

interface Caregiver {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  specialty: string;
  credentials: string;
  bio?: string;
  phoneNumber?: string;
  email: string;
  isActive: boolean;
  isPrimary?: boolean;
  assignmentType?: string;
  rating?: number;
  reviewCount?: number;
}

export default function MyCareTeam() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(HCW.CAREGIVERS.ASSIGNED, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch care team");
      }

      const data = await response.json();
      setCaregivers(data.caregivers || []);
    } catch (error) {
      console.error("Error fetching caregivers:", error);
      toast({
        title: "Error",
        description: "Failed to load your care team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const filteredCaregivers = caregivers.filter((caregiver) => {
    if (activeTab === "primary") return caregiver.isPrimary;
    if (activeTab === "specialists")
      return caregiver.assignmentType === "specialist";
    return true;
  });

  const handleMessage = (caregiverId: string) => {
    navigate(`/hcw-messages?caregiver=${caregiverId}`);
  };

  const handleSchedule = (caregiverId: string) => {
    navigate(`/hcw-visits/book?caregiver=${caregiverId}`);
  };

  const handleVideoCall = (caregiverId: string) => {
    navigate(`/schedule?caregiver=${caregiverId}&type=video`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              My Care Team
            </h1>
            <p className="text-muted-foreground mt-2">
              Connect with your healthcare professionals
            </p>
          </div>
          <Button onClick={() => navigate("/schedule")} className="gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Appointment
          </Button>
        </div>

        {/* Empty State */}
        {caregivers.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Care Team Members Yet
              </h3>
              <p className="text-muted-foreground mb-6">
                Schedule an appointment to be assigned a healthcare
                professional.
              </p>
              <Button onClick={() => navigate("/schedule")}>
                Schedule Your First Appointment
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Care Team Grid */}
        {caregivers.length > 0 && (
          <>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-6"
            >
              <TabsList>
                <TabsTrigger value="all">All ({caregivers.length})</TabsTrigger>
                <TabsTrigger value="primary">
                  Primary ({caregivers.filter((c) => c.isPrimary).length})
                </TabsTrigger>
                <TabsTrigger value="specialists">
                  Specialists (
                  {
                    caregivers.filter((c) => c.assignmentType === "specialist")
                      .length
                  }
                  )
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCaregivers.map((caregiver) => (
                <Card
                  key={caregiver.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-16 h-16">
                          <AvatarImage
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${caregiver.firstName} ${caregiver.lastName}`}
                          />
                          <AvatarFallback>
                            {getInitials(
                              caregiver.firstName,
                              caregiver.lastName,
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            Dr. {caregiver.firstName} {caregiver.lastName}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            {caregiver.credentials}
                          </CardDescription>
                        </div>
                      </div>
                      {caregiver.isPrimary && (
                        <Badge className="bg-primary">Primary</Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Specialty */}
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{caregiver.specialty}</span>
                    </div>

                    {/* Rating */}
                    {caregiver.rating && (
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 font-medium">
                            {caregiver.rating.toFixed(1)}
                          </span>
                          <span className="text-muted-foreground ml-1">
                            ({caregiver.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2">
                      {caregiver.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{caregiver.email}</span>
                        </div>
                      )}
                      {caregiver.phoneNumber && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{caregiver.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {caregiver.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {caregiver.bio}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-4">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Quick Access
              </CardTitle>
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
