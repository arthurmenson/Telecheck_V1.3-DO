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
import { Progress } from "../../components/ui/progress";
import {
  Globe,
  User,
  Calendar,
  FileText,
  MessageCircle,
  CreditCard,
  Bell,
  Settings,
  Eye,
  Download,
  Upload,
  Plus,
  ArrowLeft,
  Heart,
  Pill,
  TestTube,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  Lock,
  Smartphone,
  Video,
  Activity,
  BarChart3,
  Target,
  BookOpen,
  Star,
  Users,
  HelpCircle,
  Search,
} from "lucide-react";
import { Link } from "react-router-dom";

// Mock patient portal data
const portalStats = [
  {
    title: "Active Patients",
    value: "1,247",
    change: "+12% this month",
    icon: Users,
    color: "#10b981"
  },
  {
    title: "Portal Adoption Rate",
    value: "89%",
    change: "+5% this quarter",
    icon: Smartphone,
    color: "#3b82f6"
  },
  {
    title: "Avg. Session Time",
    value: "8.5 min",
    change: "+2.1 min engagement",
    icon: Clock,
    color: "#f59e0b"
  },
  {
    title: "Patient Satisfaction",
    value: "4.7/5",
    change: "+0.3 improvement",
    icon: Star,
    color: "#ef4444"
  }
];

const portalFeatures = [
  {
    category: "Health Records",
    features: [
      {
        title: "Medical Records Access",
        description: "View complete medical history, lab results, and imaging",
        icon: FileText,
        users: 1189,
        satisfaction: 4.8,
        status: "active"
      },
      {
        title: "Lab Results Portal",
        description: "Real-time lab results with AI explanations",
        icon: TestTube,
        users: 956,
        satisfaction: 4.6,
        status: "active"
      },
      {
        title: "Medication Management",
        description: "Current medications, refill requests, and adherence tracking",
        icon: Pill,
        users: 834,
        satisfaction: 4.5,
        status: "active"
      }
    ]
  },
  {
    category: "Appointments & Communication",
    features: [
      {
        title: "Online Scheduling",
        description: "24/7 appointment booking with AI-powered recommendations",
        icon: Calendar,
        users: 1098,
        satisfaction: 4.7,
        status: "active"
      },
      {
        title: "Secure Messaging",
        description: "HIPAA-compliant messaging with care team",
        icon: MessageCircle,
        users: 876,
        satisfaction: 4.4,
        status: "active"
      },
      {
        title: "Video Consultations",
        description: "Integrated telehealth platform",
        icon: Video,
        users: 567,
        satisfaction: 4.8,
        status: "active"
      }
    ]
  },
  {
    category: "Billing & Insurance",
    features: [
      {
        title: "Bill Pay & Statements",
        description: "Online payment and billing history",
        icon: CreditCard,
        users: 923,
        satisfaction: 4.3,
        status: "active"
      },
      {
        title: "Insurance Management",
        description: "Coverage details and claims tracking",
        icon: Shield,
        users: 712,
        satisfaction: 4.2,
        status: "active"
      },
      {
        title: "Cost Transparency",
        description: "Procedure costs and insurance estimates",
        icon: BarChart3,
        users: 445,
        satisfaction: 4.6,
        status: "beta"
      }
    ]
  },
  {
    category: "Health & Wellness",
    features: [
      {
        title: "Health Tracking",
        description: "Vital signs, symptoms, and wellness metrics",
        icon: Activity,
        users: 678,
        satisfaction: 4.5,
        status: "active"
      },
      {
        title: "Care Plan Management",
        description: "Personalized care plans and goal tracking",
        icon: Target,
        users: 523,
        satisfaction: 4.7,
        status: "active"
      },
      {
        title: "Health Education",
        description: "Personalized health education resources",
        icon: BookOpen,
        users: 789,
        satisfaction: 4.4,
        status: "active"
      }
    ]
  }
];

const recentActivity = [
  {
    action: "Lab results viewed",
    patient: "Anonymous",
    time: "2 minutes ago",
    details: "CBC with differential"
  },
  {
    action: "Appointment scheduled",
    patient: "Anonymous", 
    time: "5 minutes ago",
    details: "Annual physical - Dr. Smith"
  },
  {
    action: "Message sent",
    patient: "Anonymous",
    time: "8 minutes ago", 
    details: "Question about medication"
  },
  {
    action: "Bill payment",
    patient: "Anonymous",
    time: "12 minutes ago",
    details: "$125.00 - Office visit"
  },
  {
    action: "Health data logged",
    patient: "Anonymous",
    time: "18 minutes ago",
    details: "Blood pressure reading"
  }
];

export function PatientPortal() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["all", ...new Set(portalFeatures.map(f => f.category))];

  const filteredFeatures = portalFeatures.filter(featureGroup => 
    selectedCategory === "all" || featureGroup.category === selectedCategory
  );

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
                <Globe className="w-8 h-8 text-primary" />
                Patient Portal Management
              </h1>
              <p className="text-muted-foreground">Comprehensive patient self-service portal administration</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Portal Settings
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Feature
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {portalStats.map((stat, idx) => {
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
          
          {/* Portal Features */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search portal features..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize"
                      >
                        {category.replace(/&/g, " & ")}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feature Categories */}
            {filteredFeatures.map((featureGroup, groupIdx) => (
              <Card key={groupIdx}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{featureGroup.category}</span>
                    <Badge variant="outline">{featureGroup.features.length} features</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {featureGroup.features.map((feature, idx) => {
                      const Icon = feature.icon;
                      return (
                        <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${feature.status === 'active' ? '#10b981' : '#f59e0b'}15` }}
                          >
                            <Icon className="w-6 h-6" style={{ 
                              color: feature.status === 'active' ? '#10b981' : '#f59e0b' 
                            }} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{feature.title}</h4>
                              <Badge className={
                                feature.status === 'active' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-100 text-yellow-700'
                              }>
                                {feature.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                            
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Active Users</p>
                                <p className="font-medium">{feature.users.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Satisfaction</p>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="font-medium">{feature.satisfaction}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Adoption Rate</p>
                                <p className="font-medium">{Math.round((feature.users / 1247) * 100)}%</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4 mr-2" />
                              Configure
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Portal Access Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Access Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { method: "Web Portal", users: "78%", icon: Globe },
                    { method: "Mobile App", users: "65%", icon: Smartphone },
                    { method: "SMS Notifications", users: "42%", icon: MessageCircle },
                    { method: "Email Alerts", users: "89%", icon: Mail }
                  ].map((access, idx) => {
                    const Icon = access.icon;
                    return (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="text-sm">{access.method}</span>
                        </div>
                        <span className="text-sm font-medium">{access.users}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Real-time Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Real-time Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-muted-foreground text-xs">{activity.details}</p>
                        <p className="text-muted-foreground text-xs">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Activity
                </Button>
              </CardContent>
            </Card>

            {/* Portal Health Score */}
            <Card>
              <CardHeader>
                <CardTitle>Portal Health Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600">92</div>
                  <p className="text-sm text-muted-foreground">Excellent Performance</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Uptime</span>
                      <span>99.8%</span>
                    </div>
                    <Progress value={99.8} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Performance</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>User Experience</span>
                      <span>88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Plus className="w-4 h-4" />
                    Create Announcement
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Settings className="w-4 h-4" />
                    Portal Configuration
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Usage Analytics
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Support Center
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Portal Security & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Security & Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { title: "HIPAA Compliance", status: "Certified", icon: Shield, color: "#10b981" },
                { title: "Data Encryption", status: "256-bit AES", icon: Lock, color: "#3b82f6" },
                { title: "Access Controls", status: "MFA Enabled", icon: User, color: "#f59e0b" },
                { title: "Audit Logging", status: "Complete", icon: FileText, color: "#ef4444" }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="text-center">
                    <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: item.color }} />
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.status}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
