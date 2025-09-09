import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  UserPlus,
  FileText,
  ClipboardList,
  Stethoscope,
  Brain,
  Users,
  Calendar,
  DollarSign,
  Shield,
  BarChart3,
  Workflow,
  Target,
  Video,
  MessageCircle,
  HeartPulse,
  BookOpen,
  Globe,
  Share2,
  Cloud,
} from "lucide-react";

// Define EHR navigation categories and their sub-items
const ehrCategories = {
  dashboard: {
    name: "Dashboard & Overview",
    items: [
      { name: "EHR Overview", href: "/ehr", icon: Cloud, key: "overview" },
    ],
  },
  "patient-management": {
    name: "Patient Management",
    items: [
      {
        name: "Patient Intake",
        href: "/ehr/intake",
        icon: UserPlus,
        key: "intake",
      },
      {
        name: "Clinical Charting",
        href: "/ehr/charting",
        icon: FileText,
        key: "charting",
      },
      {
        name: "Care Plans",
        href: "/ehr/care-plans",
        icon: ClipboardList,
        key: "care-plans",
      },
    ],
  },
  "clinical-operations": {
    name: "Clinical Operations",
    items: [
      {
        name: "Clinical Tools",
        href: "/ehr/clinical-tools",
        icon: Stethoscope,
        key: "clinical-tools",
      },
      {
        name: "AI Medical Scribe",
        href: "/ehr/ai-scribe",
        icon: Brain,
        key: "ai-scribe",
      },
      {
        name: "Multi-Provider",
        href: "/ehr/providers",
        icon: Users,
        key: "providers",
      },
    ],
  },
  "practice-management": {
    name: "Practice Management",
    items: [
      {
        name: "Smart Scheduling",
        href: "/ehr/scheduling",
        icon: Calendar,
        key: "scheduling",
      },
      {
        name: "Billing & Revenue",
        href: "/ehr/billing",
        icon: DollarSign,
        key: "billing",
      },
      {
        name: "Insurance Management",
        href: "/ehr/insurance",
        icon: Shield,
        key: "insurance",
      },
    ],
  },
  "analytics-reporting": {
    name: "Analytics & Reporting",
    items: [
      {
        name: "Reporting Dashboard",
        href: "/ehr/reporting",
        icon: BarChart3,
        key: "reporting",
      },
      {
        name: "System Analytics",
        href: "/analytics",
        icon: BarChart3,
        key: "analytics",
      },
      {
        name: "Workflows",
        href: "/ehr/workflows",
        icon: Workflow,
        key: "workflows",
      },
      {
        name: "Quality Measures",
        href: "/ehr/quality",
        icon: Target,
        key: "quality",
      },
    ],
  },
  "patient-engagement": {
    name: "Patient Engagement",
    items: [
      {
        name: "Telehealth",
        href: "/ehr/telehealth",
        icon: Video,
        key: "telehealth",
      },
      {
        name: "Secure Messaging",
        href: "/ehr/messaging",
        icon: MessageCircle,
        key: "messaging",
      },
      {
        name: "Programs",
        href: "/ehr/programs",
        icon: HeartPulse,
        key: "programs",
      },
      {
        name: "Patient Journaling",
        href: "/ehr/journaling",
        icon: BookOpen,
        key: "journaling",
      },
      {
        name: "Patient Portal",
        href: "/ehr/portal",
        icon: Globe,
        key: "portal",
      },
      {
        name: "Questionnaire Builder",
        href: "/questionnaire-builder",
        icon: ClipboardList,
        key: "questionnaire",
      },
    ],
  },
  "business-operations": {
    name: "Business Operations",
    items: [
      {
        name: "Affiliate Management",
        href: "/ehr/affiliate",
        icon: Share2,
        key: "affiliate",
      },
    ],
  },
};

// Function to determine which category the current route belongs to
function getCurrentCategory(pathname: string): string | null {
  // Map routes to categories
  const routeToCategory: Record<string, string> = {
    "/ehr": "dashboard",
    "/ehr/intake": "patient-management",
    "/ehr/charting": "patient-management",
    "/ehr/care-plans": "patient-management",
    "/ehr/clinical-tools": "clinical-operations",
    "/ehr/ai-scribe": "clinical-operations",
    "/ehr/providers": "clinical-operations",
    "/ehr/scheduling": "practice-management",
    "/ehr/billing": "practice-management",
    "/ehr/insurance": "practice-management",
    "/ehr/reporting": "analytics-reporting",
    "/ehr/workflows": "analytics-reporting",
    "/analytics": "analytics-reporting",
    "/ehr/quality": "analytics-reporting",
    "/ehr/telehealth": "patient-engagement",
    "/ehr/messaging": "patient-engagement",
    "/ehr/programs": "patient-engagement",
    "/ehr/journaling": "patient-engagement",
    "/ehr/portal": "patient-engagement",
    "/questionnaire-builder": "patient-engagement",
    "/ehr/affiliate": "business-operations",
  };

  return routeToCategory[pathname] || null;
}

interface EHRSubNavigationProps {
  className?: string;
}

export function EHRSubNavigation({ className = "" }: EHRSubNavigationProps) {
  const location = useLocation();
  const currentCategory = getCurrentCategory(location.pathname);

  // Don't render if we can't determine the category
  if (
    !currentCategory ||
    !ehrCategories[currentCategory as keyof typeof ehrCategories]
  ) {
    return null;
  }

  const category = ehrCategories[currentCategory as keyof typeof ehrCategories];

  // Don't render if there's only one item in the category
  if (category.items.length <= 1) {
    return null;
  }

  return (
    <div
      className={`border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-16 z-30 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <Badge
              variant="outline"
              className="text-xs font-medium whitespace-nowrap"
            >
              {category.name}
            </Badge>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {category.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;

                return (
                  <Button
                    key={item.key}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 transition-all duration-200 whitespace-nowrap ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    asChild
                  >
                    <Link to={item.href}>
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{item.name}</span>
                      <span className="sm:hidden">
                        {item.name.split(" ")[0]}
                      </span>
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Optional: Add action buttons or status indicators */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs whitespace-nowrap">
              {category.items.length} modules
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EHRSubNavigation;
