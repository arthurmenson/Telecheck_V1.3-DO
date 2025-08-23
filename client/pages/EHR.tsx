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
  FileText,
  Users,
  Calendar,
  DollarSign,
  Shield,
  Brain,
  MessageCircle,
  Video,
  BarChart3,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Stethoscope,
  ClipboardList,
  HeartPulse,
  Pill,
  UserCheck,
  BookOpen,
  Zap,
  Globe,
  Lock,
  Activity,
  TrendingUp,
  Bell,
  Mail,
  Phone,
  Workflow,
  Target,
  Database,
  Cloud,
  Microscope,
  UserPlus,
  CalendarCheck,
  CreditCard,
  Building,
  FileCheck,
  Sparkles,
  PlayCircle,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Quick Stats
const quickStats = [
  {
    title: "Active Patients",
    value: "2,847",
    change: "+12.5%",
    changeType: "increase",
    icon: Users,
    color: "#10b981"
  },
  {
    title: "Today's Appointments",
    value: "47",
    change: "+8 new",
    changeType: "increase",
    icon: Calendar,
    color: "#3b82f6"
  },
  {
    title: "Pending Charts",
    value: "23",
    change: "-15 completed",
    changeType: "decrease",
    icon: FileText,
    color: "#f59e0b"
  },
  {
    title: "Revenue (MTD)",
    value: "$284K",
    change: "+18.2%",
    changeType: "increase",
    icon: DollarSign,
    color: "#ef4444"
  }
];

export function EHR() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Cloud className="w-10 h-10 text-primary" />
              Cloud-Based EHR System
            </h1>
            <p className="text-lg text-muted-foreground">
              Comprehensive Electronic Health Records & Practice Management Platform
            </p>
            <div className="flex items-center gap-4 mt-3">
              <Badge className="bg-green-100 text-green-700 gap-1">
                <Lock className="w-3 h-3" />
                HIPAA Compliant
              </Badge>
              <Badge className="bg-blue-100 text-blue-700 gap-1">
                <Shield className="w-3 h-3" />
                SOC 2 Type II
              </Badge>
              <Badge className="bg-purple-100 text-purple-700 gap-1">
                <Zap className="w-3 h-3" />
                AI-Powered
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              System Settings
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Quick Actions
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      <div className={`flex items-center gap-1 text-sm mt-1 ${
                        stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'increase' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingUp className="w-3 h-3 rotate-180" />
                        )}
                        <span>{stat.change}</span>
                      </div>
                    </div>
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Module Access Notice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              EHR Module Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Welcome to the EHR System</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Access all EHR modules directly from the navigation menu on the left. Each module is designed 
                to streamline your healthcare workflow and improve patient care delivery.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <UserPlus className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium">Patient Management</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Clinical Tools</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Building className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium">Practice Management</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <BarChart3 className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium">Analytics & Reports</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <HeartPulse className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium">Patient Engagement</span>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Share2 className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium">Business Operations</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-500" />
              System Status & Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">System Health</span>
                </div>
                <p className="text-2xl font-bold text-green-600">99.9%</p>
                <p className="text-xs text-muted-foreground">Uptime</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">Data Sync</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">Real-time</p>
                <p className="text-xs text-muted-foreground">&lt; 1s latency</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">Security</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">256-bit</p>
                <p className="text-xs text-muted-foreground">Encryption</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">Active Users</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">347</p>
                <p className="text-xs text-muted-foreground">Online now</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
