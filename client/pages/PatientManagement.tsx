import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Users, UserPlus, BarChart3, MessageCircle } from "lucide-react";

// Import existing page components
import { PatientRegistry } from "./PatientRegistry";
import { Intake } from "./ehr/Intake";
import { PatientAnalytics } from "./PatientAnalytics";
import { PatientCommunication } from "./PatientCommunication";

export function PatientManagement() {
  const [activeTab, setActiveTab] = useState("registry");

  const tabs = [
    {
      id: "registry",
      label: "Patient Registry",
      icon: Users,
      component: PatientRegistry,
      description: "View and manage patient records"
    },
    {
      id: "intake",
      label: "Patient Intake",
      icon: UserPlus,
      component: Intake,
      description: "Onboard new patients"
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      component: PatientAnalytics,
      description: "Patient insights and reports"
    },
    {
      id: "communication",
      label: "Communication",
      icon: MessageCircle,
      component: PatientCommunication,
      description: "Patient messaging and outreach"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Patient Management
            </h1>
            <p className="text-muted-foreground">
              Comprehensive patient management tools and analytics
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            All-in-One Platform
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
                  isActive ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{tab.label}</h3>
                      <p className="text-xs text-muted-foreground">{tab.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
