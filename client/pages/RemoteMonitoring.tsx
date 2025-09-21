import React, { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Activity, HeartPulse, Heart } from "lucide-react";

// Import existing page components
import { RPMCommandCenter } from "./RPMCommandCenter";
import { CCMWorkflow } from "./CCMWorkflow";
import { PatientRPMDashboard } from "./PatientRPMDashboard";
import { VitalSubmission } from "./VitalSubmission";

export function RemoteMonitoring() {
  const [activeTab, setActiveTab] = useState("command-center");

  const tabs = [
    {
      id: "command-center",
      label: "RPM Command Center",
      icon: Activity,
      component: RPMCommandCenter,
      description: "Central monitoring hub",
    },
    {
      id: "ccm-workflow",
      label: "CCM Workflow",
      icon: HeartPulse,
      component: CCMWorkflow,
      description: "Chronic care management",
    },
    {
      id: "patient-rpm",
      label: "Patient RPM",
      icon: Heart,
      component: PatientRPMDashboard,
      description: "Patient remote monitoring",
    },
    {
      id: "vital-submission",
      label: "Vital Submission",
      icon: Activity,
      component: VitalSubmission,
      description: "Submit and track vitals",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Remote Patient Monitoring
            </h1>
            <p className="text-muted-foreground">
              Advanced remote monitoring and chronic care management
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            RPM Suite
          </Badge>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Card
                key={tab.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isActive ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isActive
                          ? "bg-primary text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{tab.label}</h3>
                      <p className="text-xs text-muted-foreground">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabbed Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map((tab) => {
            const Component = tab.component;
            return (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                <Component />
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}
