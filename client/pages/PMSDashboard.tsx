import React from "react";
import { Link } from "react-router-dom";
import {
  Building,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  ShieldCheck,
  Stethoscope,
  Users,
  Workflow,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const metrics = [
  {
    label: "Appointments Today",
    value: "48",
    change: "+6.2%",
    changeTone: "positive" as const,
    description: "across 5 care teams",
  },
  {
    label: "Check-in Completion",
    value: "92%",
    change: "+4.1%",
    changeTone: "positive" as const,
    description: "pre-visit forms returned",
  },
  {
    label: "Outstanding Tasks",
    value: "18",
    change: "-3",
    changeTone: "positive" as const,
    description: "actions queued for staff",
  },
  {
    label: "Daily Net Collections",
    value: "$36.4K",
    change: "-1.8%",
    changeTone: "negative" as const,
    description: "vs. rolling 7-day avg",
  },
];

const priorityWorkflows = [
  {
    title: "Visit Operations",
    description: "Coordinate schedules, waitlists, and provider coverage.",
    icon: Calendar,
    to: "/pms/scheduling",
    badge: "Live view",
  },
  {
    title: "Patient Registry",
    description: "Segment, filter, and manage active patient panels.",
    icon: Users,
    to: "/patient-registry",
    badge: "2 alerts",
  },
  {
    title: "Clinical Documentation",
    description: "Track chart completion, coding status, and QA audits.",
    icon: FileText,
    to: "/patient-care-coordination",
    badge: "5 charts",
  },
  {
    title: "Operations Console",
    description: "Manage facility logistics, staffing, and escalations.",
    icon: Building,
    to: "/administration",
    badge: "Attention",
  },
];

const taskQueues = [
  {
    name: "Registration & Eligibility",
    owner: "Front Desk",
    sla: "15m",
    progress: 78,
    status: "On Track",
  },
  {
    name: "Orders & Follow-ups",
    owner: "Clinical",
    sla: "24h",
    progress: 52,
    status: "Needs Review",
  },
  {
    name: "Revenue Cycle",
    owner: "Billing",
    sla: "48h",
    progress: 63,
    status: "Delayed",
  },
];

const revenueInsights = [
  {
    title: "Coding & Charge Capture",
    icon: ClipboardList,
    items: [
      "8 encounters pending coding",
      "4 claims require modifier review",
      "E/M guideline hints available",
    ],
  },
  {
    title: "Claims & Payments",
    icon: CreditCard,
    items: [
      "12 claims submitted today",
      "$8.9K awaiting payer response",
      "Remits auto-posted overnight",
    ],
  },
  {
    title: "Compliance & Audits",
    icon: ShieldCheck,
    items: [
      "2 denials flagged for appeal",
      "Audit trail exported for QA",
      "Monthly compliance review due",
    ],
  },
];

const automationHighlights = [
  {
    title: "Smart Intake",
    description:
      "Automated insurance checks and consent capture reduce manual entry.",
  },
  {
    title: "Task Orchestration",
    description:
      "Rules-based routing assigns follow-ups to the right role instantly.",
  },
  {
    title: "Revenue Assist",
    description:
      "AI validates documentation and suggests charge optimization steps.",
  },
];

export function PMSDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Workflow className="h-4 w-4" />
              Practice Management Suite
            </div>
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <Building className="h-10 w-10 text-primary" />
              Operational Command Center
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Coordinate front-desk, clinical, and revenue-cycle workflows from
              a single interface designed for practice operations teams.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Real-time occupancy sync
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-4 w-4" />
                SLA-driven queues
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <DollarSign className="h-4 w-4" />
                Revenue insights
              </Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild variant="default" className="gap-2">
              <Link to="/pms/scheduling">
                <Calendar className="h-4 w-4" />
                Open live schedule
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/patient-management">
                <Users className="h-4 w-4" />
                Manage patient roster
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <Card key={metric.label} className="hover:shadow-lg transition-all">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {metric.value}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
                <Badge
                  variant={
                    metric.changeTone === "positive" ? "outline" : "destructive"
                  }
                  className={
                    metric.changeTone === "positive"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-red-100 text-red-700 border-red-200"
                  }
                >
                  {metric.changeTone === "positive" ? "+ " : ""}
                  {metric.change}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl">Priority Workflows</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Launch key PMS modules in context.
                </p>
              </div>
              <Badge variant="secondary">Updated 5 minutes ago</Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {priorityWorkflows.map((workflow) => {
                const Icon = workflow.icon;
                return (
                  <Link
                    key={workflow.title}
                    to={workflow.to}
                    className="rounded-xl border p-5 hover:border-primary hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline">{workflow.badge}</Badge>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">
                      {workflow.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      {workflow.description}
                    </p>
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" />
                Task Queues
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {taskQueues.map((queue) => (
                <div
                  key={queue.name}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {queue.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Owner: {queue.owner} • SLA {queue.sla}
                      </p>
                    </div>
                    <Badge variant="secondary">{queue.status}</Badge>
                  </div>
                  <Progress value={queue.progress} />
                  <p className="text-xs text-muted-foreground">
                    {queue.progress}% of assigned work completed
                  </p>
                </div>
              ))}
              <Button asChild variant="ghost" className="w-full">
                <Link to="/ehr/workflows">View orchestration rules</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Revenue Cycle Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {revenueInsights.map((bucket) => {
                const Icon = bucket.icon;
                return (
                  <div
                    key={bucket.title}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {bucket.title}
                      </h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {bucket.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/ccm-workflow">
                    <ClipboardList className="h-4 w-4" />
                    Open CCM Workspace
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2">
                  <Link to="/rpm-command-center">
                    <Stethoscope className="h-4 w-4" />
                    Review RPM billing
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Automation Highlights</CardTitle>
              <p className="text-sm text-muted-foreground">
                Accelerate operations with AI and workflow automation.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {automationHighlights.map((highlight) => (
                <div key={highlight.title} className="rounded-lg border p-4">
                  <h3 className="font-semibold text-foreground">
                    {highlight.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {highlight.description}
                  </p>
                </div>
              ))}
              <Button asChild className="w-full">
                <Link to="/ehr/workflows">Configure automations</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default PMSDashboard;
