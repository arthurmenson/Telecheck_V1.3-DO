import React, { useState } from "react";
import { ClinicalDecisionSupport } from "../components/ClinicalDecisionSupport";
import { ProviderCollaboration } from "../components/ProviderCollaboration";
import { PopulationHealthAnalytics } from "../components/PopulationHealthAnalytics";
import { EnhancedAuth } from "../components/EnhancedAuth";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  BarChart3,
  Brain,
  Users,
  Shield,
  Activity,
  Sparkles,
} from "lucide-react";

export function Analytics() {
  const [activeSection, setActiveSection] = useState<
    "clinical" | "collaboration" | "population" | "security"
  >("clinical");

  const sections = [
    {
      id: "clinical",
      name: "Clinical Decision Support",
      description: "AI-powered clinical alerts and recommendations",
      icon: Brain,
      component: ClinicalDecisionSupport,
    },
    {
      id: "collaboration",
      name: "Provider Collaboration",
      description: "Real-time provider communication and consultation",
      icon: Users,
      component: ProviderCollaboration,
    },
    {
      id: "population",
      name: "Population Health",
      description: "Advanced analytics and quality measures",
      icon: BarChart3,
      component: PopulationHealthAnalytics,
    },
    {
      id: "security",
      name: "Security & Authentication",
      description: "Enhanced security features and audit trails",
      icon: Shield,
      component: EnhancedAuth,
    },
  ];

  const currentSection = sections.find((s) => s.id === activeSection);
  const CurrentComponent = currentSection?.component;

  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2 flex items-center">
                <Activity className="w-8 h-8 text-primary mr-3" />
                Advanced Analytics & Features
              </h1>
              <p className="text-muted-foreground text-lg">
                Comprehensive healthcare analytics with enhanced clinical
                decision support
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button
                size="sm"
                className="gradient-bg text-white border-0 hover-lift"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Insights
              </Button>
            </div>
          </div>

          {/* Section Navigation */}
          <Card className="glass-morphism border border-border/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id as any)}
                      className={`p-4 rounded-xl text-left transition-all duration-300 hover-lift ${
                        activeSection === section.id
                          ? "gradient-bg text-white shadow-lg shadow-primary/25"
                          : "glass-morphism hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <Icon
                          className={`w-6 h-6 ${activeSection === section.id ? "text-white" : "text-primary"}`}
                        />
                        <h3
                          className={`font-semibold ${activeSection === section.id ? "text-white" : "text-foreground"}`}
                        >
                          {section.name}
                        </h3>
                      </div>
                      <p
                        className={`text-sm ${activeSection === section.id ? "text-white/80" : "text-muted-foreground"}`}
                      >
                        {section.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Section Content */}
        {CurrentComponent && <CurrentComponent />}
      </div>
    </div>
  );
}
