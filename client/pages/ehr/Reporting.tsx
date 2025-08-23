import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  BarChart,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  Users,
  Activity,
  DollarSign,
  Clock,
  FileText,
  Brain,
  Heart,
  Pill,
  Target,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

export function Reporting() {
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days");
  const [selectedReport, setSelectedReport] = useState("overview");

  const kpiCards = [
    {
      title: "Total Patients",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Monthly Revenue",
      value: "$187,420",
      change: "+8.2%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Average Wait Time",
      value: "14 min",
      change: "-3.2%",
      trend: "down",
      icon: Clock,
      color: "text-orange-600"
    },
    {
      title: "Patient Satisfaction",
      value: "4.8/5",
      change: "+0.2",
      trend: "up",
      icon: Heart,
      color: "text-red-600"
    }
  ];

  const reports = [
    {
      name: "Patient Demographics",
      description: "Detailed breakdown of patient age, gender, and location",
      category: "Population Health",
      lastRun: "2 hours ago",
      status: "Ready"
    },
    {
      name: "Financial Performance",
      description: "Revenue analysis, billing metrics, and payment trends",
      category: "Financial",
      lastRun: "1 day ago",
      status: "Ready"
    },
    {
      name: "Clinical Quality Metrics",
      description: "Quality indicators, outcomes, and compliance measures",
      category: "Quality",
      lastRun: "4 hours ago",
      status: "Running"
    },
    {
      name: "Medication Adherence",
      description: "Patient medication compliance and prescription analytics",
      category: "Clinical",
      lastRun: "6 hours ago",
      status: "Ready"
    },
    {
      name: "Appointment Analytics",
      description: "Scheduling efficiency and no-show analysis",
      category: "Operations",
      lastRun: "3 hours ago",
      status: "Ready"
    },
    {
      name: "Provider Performance",
      description: "Provider productivity and patient outcome metrics",
      category: "Performance",
      lastRun: "1 day ago",
      status: "Ready"
    }
  ];

  const chartData = {
    patientVisits: [
      { month: "Jan", visits: 320 },
      { month: "Feb", visits: 285 },
      { month: "Mar", visits: 392 },
      { month: "Apr", visits: 410 },
      { month: "May", visits: 445 },
      { month: "Jun", visits: 489 }
    ],
    diagnosisDistribution: [
      { diagnosis: "Hypertension", count: 145, percentage: 28 },
      { diagnosis: "Diabetes", count: 89, percentage: 17 },
      { diagnosis: "Depression", count: 76, percentage: 15 },
      { diagnosis: "Anxiety", count: 67, percentage: 13 },
      { diagnosis: "Other", count: 138, percentage: 27 }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready': return 'bg-green-100 text-green-800';
      case 'Running': return 'bg-blue-100 text-blue-800';
      case 'Error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ready': return CheckCircle;
      case 'Running': return Activity;
      case 'Error': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Reporting & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive healthcare analytics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="relative">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {kpi.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {kpi.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center ${kpi.color}`}>
                  <kpi.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.change}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                  from last period
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Visits Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Patient Visits Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.patientVisits.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-12">{data.month}</span>
                  <div className="flex-1 mx-4">
                    <Progress value={(data.visits / 500) * 100} className="h-2" />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{data.visits}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Top Diagnoses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.diagnosisDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-blue-${(index + 1) * 100}`} />
                    <span className="text-sm font-medium">{item.diagnosis}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    <Badge variant="outline">{item.percentage}%</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Available Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report, index) => {
              const StatusIcon = getStatusIcon(report.status);
              return (
                <Card key={index} className="border hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="text-xs">
                          {report.category}
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {report.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {report.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {report.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Last run: {report.lastRun}</span>
                        <Button size="sm" variant="outline">
                          Run Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Report Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Financial Performance report generated", time: "2 hours ago", user: "Dr. Smith" },
              { action: "Patient Demographics report exported", time: "4 hours ago", user: "Admin User" },
              { action: "Quality Metrics report scheduled", time: "6 hours ago", user: "Quality Team" },
              { action: "Medication Adherence report shared", time: "1 day ago", user: "Dr. Johnson" }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium text-sm">{activity.action}</div>
                  <div className="text-xs text-gray-500">by {activity.user}</div>
                </div>
                <div className="text-xs text-gray-500">{activity.time}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
