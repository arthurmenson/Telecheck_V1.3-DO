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
import { Label } from "../../components/ui/label";
import { Progress } from "../../components/ui/progress";
import {
  Users,
  User,
  UserPlus,
  MessageCircle,
  Calendar,
  FileText,
  Phone,
  Mail,
  Video,
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Settings,
  CheckCircle,
  Clock,
  AlertTriangle,
  Star,
  Building,
  Stethoscope,
  Heart,
  Brain,
  Activity,
  Shield,
  MapPin,
  Globe,
  Zap,
  Eye,
  Edit,
  Share,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock provider data
const connectedProviders = [
  {
    id: "PROV001",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    hospital: "Metro General Hospital",
    status: "active",
    lastActivity: "2 hours ago",
    sharedPatients: 23,
    rating: 4.9,
    consultations: 156,
    location: "Downtown Medical Center",
    phone: "(555) 123-4567",
    email: "s.johnson@metro.health"
  },
  {
    id: "PROV002", 
    name: "Dr. Michael Chen",
    specialty: "Endocrinology",
    hospital: "University Medical Center",
    status: "active",
    lastActivity: "45 minutes ago",
    sharedPatients: 18,
    rating: 4.8,
    consultations: 89,
    location: "University District",
    phone: "(555) 234-5678",
    email: "m.chen@umc.health"
  },
  {
    id: "PROV003",
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatology", 
    hospital: "Skin Care Specialists",
    status: "busy",
    lastActivity: "1 hour ago",
    sharedPatients: 31,
    rating: 4.7,
    consultations: 203,
    location: "Medical Plaza",
    phone: "(555) 345-6789",
    email: "e.rodriguez@skincare.com"
  },
  {
    id: "PROV004",
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    hospital: "Bone & Joint Institute",
    status: "offline",
    lastActivity: "3 hours ago", 
    sharedPatients: 12,
    rating: 4.6,
    consultations: 67,
    location: "Sports Medicine Center",
    phone: "(555) 456-7890",
    email: "j.wilson@bji.health"
  }
];

const recentCollaborations = [
  {
    id: "COLLAB001",
    patientName: "Anonymous Patient A",
    primaryProvider: "Dr. Smith (Internal Medicine)",
    consultingProvider: "Dr. Johnson (Cardiology)",
    type: "consultation",
    status: "completed",
    date: "2024-02-15",
    notes: "Cardiac evaluation for chest pain"
  },
  {
    id: "COLLAB002",
    patientName: "Anonymous Patient B", 
    primaryProvider: "Dr. Williams (Family Medicine)",
    consultingProvider: "Dr. Chen (Endocrinology)",
    type: "referral",
    status: "pending",
    date: "2024-02-15",
    notes: "Diabetes management consultation"
  },
  {
    id: "COLLAB003",
    patientName: "Anonymous Patient C",
    primaryProvider: "Dr. Davis (Pediatrics)",
    consultingProvider: "Dr. Rodriguez (Dermatology)",
    type: "second-opinion",
    status: "in-progress",
    date: "2024-02-14",
    notes: "Pediatric dermatology evaluation"
  }
];

const providerStats = [
  {
    title: "Connected Providers",
    value: "247",
    change: "+12 this month",
    icon: Users,
    color: "#10b981"
  },
  {
    title: "Active Collaborations",
    value: "89",
    change: "+15 this week",
    icon: MessageCircle,
    color: "#3b82f6"
  },
  {
    title: "Patient Referrals",
    value: "156",
    change: "+23 today",
    icon: Share,
    color: "#f59e0b"
  },
  {
    title: "Network Rating",
    value: "4.8/5",
    change: "+0.2 improvement",
    icon: Star,
    color: "#ef4444"
  }
];

export function Providers() {
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProviders = connectedProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || provider.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/ehr">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to EHR
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                Multi-Provider Coordination
              </h1>
              <p className="text-muted-foreground">Collaborative care coordination platform</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Network Settings
            </Button>
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Invite Provider
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {providerStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <Icon className="w-8 h-8" style={{ color: stat.color }} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Provider Network */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search providers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    {["all", "active", "busy", "offline"].map((status) => (
                      <Button
                        key={status}
                        variant={statusFilter === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStatusFilter(status)}
                        className="capitalize"
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Provider List */}
            <Card>
              <CardHeader>
                <CardTitle>Connected Healthcare Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredProviders.map((provider) => (
                    <div key={provider.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-primary" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                            provider.status === 'active' ? 'bg-green-500' :
                            provider.status === 'busy' ? 'bg-orange-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div>
                          <h4 className="font-medium">{provider.name}</h4>
                          <p className="text-sm text-muted-foreground">{provider.specialty}</p>
                          <p className="text-xs text-muted-foreground">{provider.hospital}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Shared Patients</p>
                          <p className="font-medium">{provider.sharedPatients}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span className="font-medium">{provider.rating}</span>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Last Activity</p>
                          <p className="font-medium">{provider.lastActivity}</p>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" title="Send Message">
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Schedule Consultation">
                            <Calendar className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" title="Video Call">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            title="View Profile"
                            onClick={() => setSelectedProvider(provider)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Collaborations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Collaborations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCollaborations.map((collab) => (
                    <div key={collab.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{collab.patientName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {collab.primaryProvider} → {collab.consultingProvider}
                          </p>
                          <p className="text-xs text-muted-foreground">{collab.notes}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="font-medium capitalize">{collab.type}</p>
                        </div>
                        
                        <Badge className={
                          collab.status === 'completed' ? 'bg-green-100 text-green-700' :
                          collab.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {collab.status.replace('-', ' ')}
                        </Badge>
                        
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <UserPlus className="w-4 h-4" />
                    Invite New Provider
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Start Group Chat
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Calendar className="w-4 h-4" />
                    Schedule Team Meeting
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="w-4 h-4" />
                    Create Referral
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="w-4 h-4" />
                    Export Network Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Collaboration Types */}
            <Card>
              <CardHeader>
                <CardTitle>Collaboration Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: "Consultations", count: 45, icon: Stethoscope },
                    { type: "Referrals", count: 67, icon: Share },
                    { type: "Second Opinions", count: 23, icon: Eye },
                    { type: "Co-Management", count: 34, icon: Users }
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="text-sm">{item.type}</span>
                        </div>
                        <Badge variant="secondary">{item.count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Network Health */}
            <Card>
              <CardHeader>
                <CardTitle>Network Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Response Rate</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Avg. Response Time</span>
                      <span>2.5 hours</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Network Satisfaction</span>
                      <span>4.8/5</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Provider Specialties */}
            <Card>
              <CardHeader>
                <CardTitle>Network Specialties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { specialty: "Cardiology", count: 23 },
                    { specialty: "Internal Medicine", count: 45 },
                    { specialty: "Dermatology", count: 18 },
                    { specialty: "Orthopedics", count: 31 },
                    { specialty: "Endocrinology", count: 16 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span>{item.specialty}</span>
                      <Badge variant="outline">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Provider Detail Modal */}
        {selectedProvider && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Provider Details</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedProvider(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                      <Stethoscope className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{selectedProvider.name}</h3>
                      <p className="text-muted-foreground">{selectedProvider.specialty}</p>
                      <p className="text-sm text-muted-foreground">{selectedProvider.hospital}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Location</Label>
                      <p className="text-sm">{selectedProvider.location}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="text-sm">{selectedProvider.phone}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm">{selectedProvider.email}</p>
                    </div>
                    <div>
                      <Label>Network Rating</Label>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm">{selectedProvider.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{selectedProvider.sharedPatients}</p>
                      <p className="text-sm text-muted-foreground">Shared Patients</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{selectedProvider.consultations}</p>
                      <p className="text-sm text-muted-foreground">Consultations</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary">{selectedProvider.rating}</p>
                      <p className="text-sm text-muted-foreground">Rating</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Send Message
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      <Video className="w-4 h-4" />
                      Video Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
