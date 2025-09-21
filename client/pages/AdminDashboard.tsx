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
import { useAuth } from "../contexts/AuthContext";
import {
  Shield,
  Users,
  Activity,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  Lock,
  Eye,
  Settings,
  UserPlus,
  FileText,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Brain,
  Stethoscope,
  Pill,
  Building,
  Dna,
} from "lucide-react";
import { Link } from "react-router-dom";

export function AdminDashboard() {
  const { user, switchRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const systemMetrics = {
    totalUsers: 15420,
    activeUsers: 12845,
    dailyTransactions: 8965,
    systemUptime: 99.97,
    responseTime: 1.2,
    errorRate: 0.03,
  };

  const usersByRole = [
    {
      role: "Patients",
      count: 12845,
      percentage: 83.3,
      trend: "up",
      change: "+245",
    },
    {
      role: "Doctors",
      count: 1876,
      percentage: 12.1,
      trend: "up",
      change: "+18",
    },
    {
      role: "Pharmacists",
      count: 645,
      percentage: 4.2,
      trend: "stable",
      change: "+3",
    },
    {
      role: "Admins",
      count: 54,
      percentage: 0.4,
      trend: "stable",
      change: "0",
    },
  ];

  const recentActivities = [
    {
      id: "1",
      type: "user_registration",
      description: "New patient registered: Sarah Johnson",
      timestamp: "5 minutes ago",
      severity: "info",
    },
    {
      id: "2",
      type: "security_alert",
      description: "Multiple failed login attempts detected",
      timestamp: "15 minutes ago",
      severity: "warning",
    },
    {
      id: "3",
      type: "system_update",
      description: "AI model updated to version 2.1.4",
      timestamp: "1 hour ago",
      severity: "success",
    },
    {
      id: "4",
      type: "prescription_volume",
      description: "Daily prescription limit reached: 500 processed",
      timestamp: "2 hours ago",
      severity: "info",
    },
  ];

  const securityAlerts = [
    {
      id: "1",
      type: "Failed Login Attempts",
      description: "15 failed attempts from IP 192.168.1.100",
      severity: "high",
      timestamp: "30 minutes ago",
      status: "investigating",
    },
    {
      id: "2",
      type: "Unusual Data Access",
      description: "Doctor accessed 50+ patient records in 1 hour",
      severity: "medium",
      timestamp: "2 hours ago",
      status: "resolved",
    },
    {
      id: "3",
      type: "System Anomaly",
      description: "API response time increased by 300%",
      severity: "low",
      timestamp: "4 hours ago",
      status: "monitoring",
    },
  ];

  const platformStats = [
    {
      title: "AI Consultations",
      value: "1,245",
      change: "+12%",
      trend: "up",
      icon: Brain,
      color: "bg-purple-500",
    },
    {
      title: "Prescriptions",
      value: "3,876",
      change: "+8%",
      trend: "up",
      icon: Pill,
      color: "bg-green-500",
    },
    {
      title: "Telehealth Sessions",
      value: "892",
      change: "+15%",
      trend: "up",
      icon: Stethoscope,
      color: "bg-blue-500",
    },
    {
      title: "Organizations",
      value: "156",
      change: "+2%",
      trend: "up",
      icon: Building,
      color: "bg-orange-500",
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800";
      case "investigating":
        return "bg-orange-100 text-orange-800";
      case "monitoring":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 bg-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Admin Portal
                </h1>
                <p className="text-muted-foreground">
                  Platform Administration • {user?.name}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline">Super Admin</Badge>
                  <Badge variant="outline">{user?.organization}</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                System Settings
              </Button>
              <div className="relative">
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Alerts
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
                    3
                  </Badge>
                </Button>
              </div>
            </div>
          </div>

          {/* Role Switcher */}
          <Card className="glass-morphism border border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-900 dark:text-blue-100">
                    Admin Tools
                  </span>
                  <span className="text-sm text-blue-800 dark:text-blue-200">
                    Switch to different role portals for testing
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => switchRole("patient")}
                  >
                    Patient View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => switchRole("doctor")}
                  >
                    Doctor View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => switchRole("pharmacist")}
                  >
                    Pharmacist View
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">
                    {systemMetrics.totalUsers.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">+2.5% this month</p>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Uptime</p>
                  <p className="text-3xl font-bold text-foreground">
                    {systemMetrics.systemUptime}%
                  </p>
                  <p className="text-sm text-green-600">Excellent</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Daily Transactions
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {systemMetrics.dailyTransactions.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">+15% vs yesterday</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Security Score
                  </p>
                  <p className="text-3xl font-bold text-foreground">9.8</p>
                  <p className="text-sm text-green-600">Excellent security</p>
                </div>
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {platformStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="glass-morphism border border-border/20"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        {getTrendIcon(stat.trend)}
                        <span className="text-sm text-green-600">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Analytics */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism border border-border/20 mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersByRole.map((userGroup, index) => (
                    <div key={index} className="glass-morphism p-4 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-foreground">
                            {userGroup.role}
                          </h3>
                          <Badge variant="outline">
                            {userGroup.count.toLocaleString()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTrendIcon(userGroup.trend)}
                          <span className="text-sm text-muted-foreground">
                            {userGroup.change}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={userGroup.percentage}
                        className="h-2 mb-2"
                      />
                      <div className="text-sm text-muted-foreground">
                        {userGroup.percentage}% of total users
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent System Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-background/50 border border-border/10"
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${
                          activity.severity === "warning"
                            ? "bg-yellow-500"
                            : activity.severity === "success"
                              ? "bg-green-500"
                              : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">
                          {activity.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Alerts */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  Security Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 rounded-lg border border-border/10 bg-background/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity} priority
                        </Badge>
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                      </div>
                      <div className="text-sm font-medium text-foreground mb-1">
                        {alert.type}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {alert.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {alert.timestamp}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  Admin Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  System Backup
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Generate Reports
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="w-4 h-4 mr-2" />
                  Security Audit
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  System Configuration
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link to="/algorithm-config">
                    <Dna className="w-4 h-4 mr-2" />
                    Health Score Algorithm
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">CPU Usage</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">
                        Memory Usage
                      </span>
                      <span className="font-medium">62%</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Storage</span>
                      <span className="font-medium">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Network</span>
                      <span className="font-medium text-green-600">
                        Optimal
                      </span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
