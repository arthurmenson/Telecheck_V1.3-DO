import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationCenter } from "./NotificationCenter";
import { ThemeDropdown } from "./ThemeDropdown";
import { FloatingThemeButton } from "./FloatingThemeButton";
import { EHRSubNavigation } from "./EHRSubNavigation";
import { useAuth } from "../contexts/AuthContext";
import {
  Activity,
  Menu,
  X,
  User,
  TestTube,
  Pill,
  Brain,
  ShoppingCart,
  Dna,
  Heart,
  TrendingUp,
  MessageCircle,
  Sparkles,
  Stethoscope,
  Shield,
  LogOut,
  Settings,
  Users,
  FileText,
  BarChart3,
  Book,
  Cloud,
  UserPlus,
  ClipboardList,
  Calendar,
  DollarSign,
  Video,
  HeartPulse,
  Globe,
  Share2,
  Workflow,
  Target,
  Building,
  Package,
  RefreshCw,
  Store,
  Bell,
  ChevronDown,
  ChevronRight,
  Radio,
  Megaphone,
  Mail,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([
    "core",
    "clinical",
    "patient-management", // Expand Patient Management by default
  ]);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  // Admin navigation with organized groups
  const getAdminNavigationGroups = () => {
    return [
      {
        id: "core",
        name: "Core Dashboard",
        icon: Shield,
        items: [
          { name: "Admin Dashboard", href: "/admin-dashboard", icon: Shield },
          { name: "Analytics", href: "/ehr/reporting", icon: BarChart3 },
        ],
      },
      {
        id: "clinical",
        name: "Clinical Operations",
        icon: Stethoscope,
        items: [
          { name: "EHR Overview", href: "/ehr", icon: Cloud },
          { name: "Patient Management", href: "/patient-management", icon: Users },
          { name: "Clinical Operations", href: "/clinical-operations", icon: Stethoscope },
          { name: "Remote Monitoring", href: "/remote-monitoring", icon: Activity },
          { name: "Administration", href: "/administration", icon: Settings },
          {
            name: "Practice Management",
            href: "/ehr/scheduling",
            icon: Building,
          },
          {
            name: "Patient Engagement",
            href: "/ehr/telehealth",
            icon: HeartPulse,
          },
        ],
      },
      {
        id: "ecommerce",
        name: "E-commerce",
        icon: Store,
        items: [
          { name: "Product Catalog", href: "/catalog", icon: Store },
          { name: "Order Management", href: "/orders", icon: ShoppingCart },
          { name: "Inventory", href: "/inventory", icon: Package },
          { name: "Inventory Alerts", href: "/inventory/alerts", icon: Bell },
          {
            name: "E-commerce Analytics",
            href: "/analytics/ecommerce",
            icon: BarChart3,
          },
        ],
      },
      {
        id: "marketing",
        name: "Marketing & Outreach",
        icon: Megaphone,
        items: [
          { name: "Campaign Manager", href: "/marketing", icon: Megaphone },
          { name: "Social Media Hub", href: "/marketing/social", icon: Share2 },
          { name: "Email Campaigns", href: "/marketing/email", icon: Mail },
          {
            name: "SMS Marketing",
            href: "/marketing/sms",
            icon: MessageCircle,
          },
          {
            name: "Automation Flows",
            href: "/marketing/automation",
            icon: Workflow,
          },
          {
            name: "Customer Journey",
            href: "/marketing/journey",
            icon: Target,
          },
        ],
      },
      {
        id: "business",
        name: "Business Operations",
        icon: Building,
        items: [
          { name: "Product Admin", href: "/admin/products", icon: Settings },
          { name: "Subscriptions", href: "/subscriptions", icon: RefreshCw },
          { name: "Business Ops", href: "/ehr/affiliate", icon: Share2 },
          { name: "USSD Platform", href: "/ussd", icon: Radio },
        ],
      },
    ];
  };

  // Role-based navigation
  const getNavigationForRole = () => {
    if (!user)
      return [
        { name: "Dashboard", href: "/dashboard", icon: Activity },
        { name: "How It Works", href: "/how-it-works", icon: Sparkles },
        { name: "Labs", href: "/labs", icon: TestTube },
        { name: "Medications", href: "/medications", icon: Pill },
        { name: "AI Insights", href: "/ai-insights", icon: Brain },
        { name: "Pharmacy", href: "/pharmacy", icon: ShoppingCart },
        { name: "Wellness", href: "/wellness", icon: Heart },
        { name: "Trends", href: "/trends", icon: TrendingUp },
        { name: "AI Chat", href: "/chat", icon: MessageCircle },
      ];

    switch (user.role) {
      case "patient":
        return [
          { name: "Dashboard", href: "/dashboard", icon: Activity },
          { name: "Labs", href: "/labs", icon: TestTube },
          { name: "Medications", href: "/medications", icon: Pill },
          { name: "AI Insights", href: "/ai-insights", icon: Brain },
          { name: "Pharmacy", href: "/pharmacy", icon: ShoppingCart },
          { name: "Product Catalog", href: "/catalog", icon: Store },
          { name: "Subscriptions", href: "/subscriptions", icon: RefreshCw },
          { name: "Pharmacopia", href: "/pharmacopia", icon: Book },
          { name: "Wellness", href: "/wellness", icon: Heart },
          { name: "Trends", href: "/trends", icon: TrendingUp },
          { name: "AI Chat", href: "/chat", icon: MessageCircle },
        ];
      case "doctor":
        return [
          {
            name: "Doctor Dashboard",
            href: "/doctor-dashboard",
            icon: Stethoscope,
          },
          { name: "EHR Overview", href: "/ehr", icon: Cloud },
          { name: "Patient Management", href: "/patient-management", icon: Users },
          { name: "Clinical Operations", href: "/clinical-operations", icon: Stethoscope },
          { name: "Remote Monitoring", href: "/remote-monitoring", icon: Activity },
          { name: "Administration", href: "/administration", icon: Settings },
          { name: "AI Chat", href: "/chat", icon: MessageCircle },
        ];
      case "pharmacist":
        return [
          {
            name: "Pharmacist Dashboard",
            href: "/pharmacist-dashboard",
            icon: Pill,
          },
          { name: "Inventory Management", href: "/inventory", icon: Package },
          { name: "Order Management", href: "/orders", icon: ShoppingCart },
          { name: "Product Catalog", href: "/catalog", icon: Store },
          {
            name: "E-commerce Analytics",
            href: "/analytics/ecommerce",
            icon: BarChart3,
          },
          { name: "Inventory Alerts", href: "/inventory/alerts", icon: Bell },
          { name: "AI Chat", href: "/chat", icon: MessageCircle },
        ];
      case "nurse":
        return [
          {
            name: "Nurse Dashboard",
            href: "/nurse-dashboard",
            icon: HeartPulse,
          },
          { name: "Patient Management", href: "/patient-management", icon: Users },
          { name: "Clinical Operations", href: "/clinical-operations", icon: Stethoscope },
          { name: "Remote Monitoring", href: "/remote-monitoring", icon: Activity },
          { name: "Administration", href: "/administration", icon: Settings },
          { name: "AI Chat", href: "/chat", icon: MessageCircle },
        ];
      case "caregiver":
        return [
          {
            name: "Caregiver Dashboard",
            href: "/caregiver-dashboard",
            icon: Heart,
          },
          { name: "Remote Monitoring", href: "/remote-monitoring", icon: Activity },
          { name: "Patient Communication", href: "/patient-communication", icon: MessageCircle },
          { name: "Patient Schedule", href: "/schedule", icon: Calendar },
          { name: "AI Chat", href: "/chat", icon: MessageCircle },
        ];
      case "admin":
        return getAdminNavigationGroups();
      default:
        return [];
    }
  };

  const navigation = getNavigationForRole();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActiveRoute = (href: string) => {
    // Special handling for EHR category routes
    if (href === "/ehr" && location.pathname.startsWith("/ehr")) {
      return location.pathname === "/ehr";
    }
    if (href === "/ehr/intake" && location.pathname.startsWith("/ehr/")) {
      // Patient Management category routes
      return ["/ehr/intake", "/ehr/charting", "/ehr/care-plans"].includes(
        location.pathname,
      );
    }
    if (
      href === "/ehr/clinical-tools" &&
      location.pathname.startsWith("/ehr/")
    ) {
      // Clinical Operations category routes
      return [
        "/ehr/clinical-tools",
        "/ehr/ai-scribe",
        "/ehr/providers",
      ].includes(location.pathname);
    }
    if (href === "/ehr/scheduling" && location.pathname.startsWith("/ehr/")) {
      // Practice Management category routes
      return ["/ehr/scheduling", "/ehr/billing", "/ehr/insurance"].includes(
        location.pathname,
      );
    }
    if (href === "/ehr/reporting") {
      // Analytics & Reporting category routes
      return [
        "/ehr/reporting",
        "/analytics",
        "/ehr/workflows",
        "/ehr/quality",
      ].includes(location.pathname);
    }
    if (href === "/ehr/telehealth" && location.pathname.startsWith("/ehr/")) {
      // Patient Engagement category routes
      return [
        "/ehr/telehealth",
        "/ehr/messaging",
        "/ehr/programs",
        "/ehr/journaling",
        "/ehr/portal",
      ].includes(location.pathname);
    }
    if (href === "/ehr/affiliate" && location.pathname.startsWith("/ehr/")) {
      // Business Operations category routes
      return ["/ehr/affiliate"].includes(location.pathname);
    }
    if (href === "/ussd") {
      return location.pathname === "/ussd";
    }

    // Admin settings highlighting
    if (href === "/admin/settings") {
      return location.pathname === "/admin/settings";
    }

    return location.pathname === href;
  };

  return (
    <div className="min-h-screen aurora-bg flex">
      {/* Left Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 glass-morphism lg:backdrop-blur-xl lg:border-r lg:border-border/50 lg:shadow-2xl">
        {/* Logo */}
        <div className="flex items-center px-6 py-6 border-b border-border/20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Telecheck
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                AI Healthcare
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item: any) => {
            // Handle grouped items
            if (item.isGroup) {
              const GroupIcon = item.icon;
              const isExpanded = expandedGroups.includes(item.name.toLowerCase().replace(' ', '-'));
              const hasActiveItem = item.items?.some((subItem: any) =>
                isActiveRoute(subItem.href),
              );

              return (
                <div key={item.name} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(item.name.toLowerCase().replace(' ', '-'))}
                    className={`w-full group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover-lift ${
                      hasActiveItem
                        ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }`}
                  >
                    <GroupIcon className="w-5 h-5" />
                    <span className="font-medium flex-1 text-left">
                      {item.name}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>

                  {/* Group Items */}
                  {isExpanded && (
                    <div className="ml-4 space-y-1">
                      {item.items?.map((subItem: any) => {
                        const Icon = subItem.icon;
                        const active = isActiveRoute(subItem.href);
                        return (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className={`group flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover-lift ${
                              active
                                ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:shadow-md"
                            }`}
                          >
                            <Icon
                              className={`w-4 h-4 transition-all duration-300 ${active ? "text-white" : "group-hover:scale-110"}`}
                            />
                            <span className="font-medium">{subItem.name}</span>
                            {active && (
                              <Sparkles className="w-3 h-3 ml-auto text-white/80 animate-pulse" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else {
              // Handle regular menu items
              const Icon = item.icon;
              const active = isActiveRoute(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover-lift ${
                    active
                      ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:shadow-md"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-all duration-300 ${active ? "text-white" : "group-hover:scale-110"}`}
                  />
                  <span className="font-medium">{item.name}</span>
                  {active && (
                    <Sparkles className="w-3 h-3 ml-auto text-white/80 animate-pulse" />
                  )}
                </Link>
              );
            }
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto border-t border-border/20">
          {isAuthenticated && user ? (
            <>
              {/* User Profile */}
              <div className="glass-morphism p-3 rounded-xl mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {user.name}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                {/* Show settings based on user role */}
                {user.role === 'admin' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <Link to="/admin/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </Button>
                )}
                {(user.role === 'doctor' || user.role === 'nurse' || user.role === 'caregiver') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <Link to="/settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </Button>
                )}
                {/* No settings button for patients and pharmacists */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-muted-foreground hover:text-red-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </>
          ) : (
            <Link to="/login">
              <Button className="w-full gradient-bg text-white border-0">
                Sign In
              </Button>
            </Link>
          )}

          <div className="glass-morphism p-3 rounded-xl mt-3">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>HIPAA Compliant</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="glass-morphism backdrop-blur-xl border-b border-border/20 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Mobile Logo & Menu Button */}
              <div className="flex items-center lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 mr-3 transition-all duration-300 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
                <Link to="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center shadow-lg">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Telecheck
                  </span>
                </Link>
              </div>

              {/* Page Title (hidden on mobile, shown on desktop) */}
              <div className="hidden lg:block">
                <div className="flex items-center space-x-3">
                  <h1 className="text-lg font-semibold text-foreground">
                    {user?.role === "admin"
                      ? (() => {
                          // Find current page name in admin navigation groups
                          for (const group of navigation) {
                            const foundItem = group.items?.find(
                              (item: any) => item.href === location.pathname,
                            );
                            if (foundItem) return foundItem.name;
                          }
                          return "Admin Dashboard";
                        })()
                      : navigation.find(
                          (nav: any) => nav.href === location.pathname,
                        )?.name || "Home"}
                  </h1>
                  {isAuthenticated && user && (
                    <Badge variant="outline">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}{" "}
                      Portal
                    </Badge>
                  )}
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Right side actions */}
              <div className="flex items-center space-x-2">
                <NotificationCenter />
                <ThemeDropdown />
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex hover-lift"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <Button
                  size="sm"
                  className="gradient-bg hover:shadow-lg hover:shadow-primary/25 text-white border-0 hover-lift hidden sm:flex"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="hidden lg:inline">Talk to Doctor</span>
                  <span className="lg:hidden">Doctor</span>
                </Button>
                <Button
                  size="sm"
                  className="gradient-bg hover:shadow-lg hover:shadow-primary/25 text-white border-0 hover-lift sm:hidden"
                >
                  <Sparkles className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* EHR Sub-Navigation */}
        {(user?.role === "admin" || user?.role === "doctor") && (
          <EHRSubNavigation />
        )}

        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] glass-morphism backdrop-blur-xl border-r border-border/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Logo */}
              <div className="flex items-center px-6 py-6 border-b border-border/20">
                <Link
                  to="/"
                  className="flex items-center space-x-3 group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      Telecheck
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      AI Healthcare
                    </span>
                  </div>
                </Link>
              </div>

              {/* Mobile Navigation */}
              <nav className="px-4 py-6 space-y-2 mobile-scroll overflow-y-auto flex-1">
                {user?.role === "admin"
                  ? // Admin mobile navigation with collapsible groups
                    navigation.map((group: any) => {
                      const GroupIcon = group.icon;
                      const isExpanded = expandedGroups.includes(group.id);
                      const hasActiveItem = group.items?.some((item: any) =>
                        isActiveRoute(item.href),
                      );

                      return (
                        <div key={group.id} className="space-y-1">
                          {/* Group Header */}
                          <button
                            onClick={() => toggleGroup(group.id)}
                            className={`w-full group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover-lift ${
                              hasActiveItem
                                ? "bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            }`}
                          >
                            <GroupIcon className="w-5 h-5" />
                            <span className="font-medium flex-1 text-left">
                              {group.name}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>

                          {/* Group Items */}
                          {isExpanded && (
                            <div className="ml-4 space-y-1">
                              {group.items?.map((item: any) => {
                                const Icon = item.icon;
                                const active = isActiveRoute(item.href);
                                return (
                                  <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`group flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover-lift ${
                                      active
                                        ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:shadow-md"
                                    }`}
                                  >
                                    <Icon
                                      className={`w-4 h-4 transition-all duration-300 ${active ? "text-white" : "group-hover:scale-110"}`}
                                    />
                                    <span className="font-medium">
                                      {item.name}
                                    </span>
                                    {active && (
                                      <Sparkles className="w-3 h-3 ml-auto text-white/80 animate-pulse" />
                                    )}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  : // Standard mobile navigation for other roles
                    navigation.map((item: any) => {
                      const Icon = item.icon;
                      const active = isActiveRoute(item.href);
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover-lift ${
                            active
                              ? "bg-gradient-to-r from-primary to-primary/90 text-white shadow-lg shadow-primary/25"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:shadow-md"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 transition-all duration-300 ${active ? "text-white" : "group-hover:scale-110"}`}
                          />
                          <span className="font-medium">{item.name}</span>
                          {active && (
                            <Sparkles className="w-3 h-3 ml-auto text-white/80 animate-pulse" />
                          )}
                        </Link>
                      );
                    })}
              </nav>

              {/* Mobile Footer */}
              <div className="absolute bottom-4 left-4 right-4">
                {isAuthenticated && user ? (
                  <>
                    {/* User Profile in Mobile */}
                    <div className="glass-morphism p-3 rounded-xl mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">
                            {user.name}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" className="text-xs">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions in Mobile */}
                    <div className="space-y-2 mb-3">
                      {/* Show settings based on user role */}
                      {user.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-muted-foreground hover:text-foreground"
                          asChild
                        >
                          <Link
                            to="/admin/settings"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                        </Button>
                      )}
                      {(user.role === 'doctor' || user.role === 'nurse' || user.role === 'caregiver') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-muted-foreground hover:text-foreground"
                          asChild
                        >
                          <Link
                            to="/settings"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Link>
                        </Button>
                      )}
                      {/* No settings button for patients and pharmacists */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full justify-start text-muted-foreground hover:text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full gradient-bg text-white border-0 mb-3">
                      Sign In
                    </Button>
                  </Link>
                )}

                <div className="glass-morphism p-3 rounded-xl">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>HIPAA Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1">{children}</main>
      </div>

      {/* Floating Theme Button for Mobile */}
      <FloatingThemeButton />
    </div>
  );
}
