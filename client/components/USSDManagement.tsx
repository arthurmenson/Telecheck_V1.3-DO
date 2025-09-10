import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Progress } from "./ui/progress";
import {
  Phone,
  Globe,
  Users,
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Save,
  Play,
  Pause,
  BarChart3,
  Settings,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Signal,
  Smartphone,
  PhoneCall,
  Activity,
  Heart,
  Pill,
  Calendar,
  Bell,
  Book,
  Target,
  Zap,
  Brain,
  Link,
  Download,
  Upload,
  Eye,
  Copy,
  ArrowRight,
  ArrowLeft,
  Languages,
  DollarSign,
  Shield,
  Wifi,
  Radio,
  HelpCircle,
  Star,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Headphones,
  Monitor,
  Truck,
} from "lucide-react";

interface USSDMenu {
  id: string;
  code: string;
  title: string;
  description: string;
  isActive: boolean;
  language: string;
  menuItems: USSDMenuItem[];
  analytics: {
    totalSessions: number;
    completionRate: number;
    avgDuration: number;
    peakHours: string[];
  };
}

interface USSDMenuItem {
  id: string;
  option: string;
  text: string;
  action:
    | "submenu"
    | "callback"
    | "sms"
    | "end"
    | "questionnaire"
    | "appointment";
  subItems?: USSDMenuItem[];
  followUpAction?: {
    type: "nurse_call" | "sms_reminder" | "appointment" | "prescription";
    delay: number;
    message?: string;
  };
  triggerConditions?: string[];
}

interface USSDProvider {
  id: string;
  name: string;
  region: string;
  apiKey?: string;
  isConnected: boolean;
  supportedFeatures: string[];
  pricing: {
    setupFee: number;
    perSession: number;
    monthly: number;
  };
}

const USSD_PROVIDERS: USSDProvider[] = [
  {
    id: "africas_talking",
    name: "Africa's Talking",
    region: "Africa-wide",
    isConnected: false,
    supportedFeatures: ["USSD", "SMS", "Voice", "Mobile Money"],
    pricing: { setupFee: 100, perSession: 0.02, monthly: 50 },
  },
  {
    id: "hubtel",
    name: "Hubtel",
    region: "Ghana",
    isConnected: false,
    supportedFeatures: ["USSD", "SMS", "Mobile Money", "Voice"],
    pricing: { setupFee: 200, perSession: 0.015, monthly: 75 },
  },
  {
    id: "twilio",
    name: "Twilio",
    region: "Global (Limited USSD)",
    isConnected: false,
    supportedFeatures: ["SMS", "Voice", "WhatsApp"],
    pricing: { setupFee: 0, perSession: 0.05, monthly: 0 },
  },
];

const SAMPLE_MENUS: USSDMenu[] = [
  {
    id: "diabetes_care",
    code: "*765#",
    title: "Diabetes Care Portal",
    description: "Comprehensive diabetes management for rural patients",
    isActive: true,
    language: "en",
    menuItems: [
      {
        id: "1",
        option: "1",
        text: "Talk to a nurse",
        action: "callback",
        followUpAction: {
          type: "nurse_call",
          delay: 15,
          message: "A nurse will call you within 15 minutes",
        },
      },
      {
        id: "2",
        option: "2",
        text: "Order diabetes medicine",
        action: "submenu",
        subItems: [
          {
            id: "2.1",
            option: "1",
            text: "Metformin 500mg",
            action: "sms",
            followUpAction: {
              type: "prescription",
              delay: 60,
              message:
                "Your Metformin order has been confirmed. Delivery in 2-3 days.",
            },
          },
          {
            id: "2.2",
            option: "2",
            text: "Insulin (various)",
            action: "callback",
          },
        ],
      },
      {
        id: "3",
        option: "3",
        text: "Health check questions",
        action: "questionnaire",
      },
      {
        id: "4",
        option: "4",
        text: "Book doctor appointment",
        action: "appointment",
      },
      {
        id: "5",
        option: "5",
        text: "Medication reminders",
        action: "sms",
      },
    ],
    analytics: {
      totalSessions: 1247,
      completionRate: 78.5,
      avgDuration: 145,
      peakHours: ["8AM-10AM", "6PM-8PM"],
    },
  },
];

const LANGUAGES = [
  { code: "en", name: "English", region: "Global" },
  { code: "tw", name: "Twi", region: "Ghana" },
  { code: "ha", name: "Hausa", region: "West Africa" },
  { code: "sw", name: "Swahili", region: "East Africa" },
  { code: "fr", name: "French", region: "Francophone Africa" },
  { code: "ar", name: "Arabic", region: "North Africa" },
  { code: "es", name: "Spanish", region: "Latin America" },
];

export function USSDManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [menus, setMenus] = useState<USSDMenu[]>(SAMPLE_MENUS);
  const [providers, setProviders] = useState<USSDProvider[]>(USSD_PROVIDERS);
  const [selectedMenu, setSelectedMenu] = useState<USSDMenu | null>(null);
  const [editingMenu, setEditingMenu] = useState<USSDMenu | null>(null);
  const [showMenuBuilder, setShowMenuBuilder] = useState(false);
  const [showProviderSetup, setShowProviderSetup] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<USSDProvider | null>(
    null,
  );
  const [isDeployingMenu, setIsDeployingMenu] = useState(false);

  const totalSessions = menus.reduce(
    (sum, menu) => sum + menu.analytics.totalSessions,
    0,
  );
  const avgCompletionRate =
    menus.reduce((sum, menu) => sum + menu.analytics.completionRate, 0) /
    menus.length;
  const activeMenus = menus.filter((menu) => menu.isActive).length;

  const deployMenu = async (menu: USSDMenu) => {
    setIsDeployingMenu(true);
    // Simulate deployment
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsDeployingMenu(false);
  };

  const createSampleDiabetesMenu = () => {
    const newMenu: USSDMenu = {
      id: `menu_${Date.now()}`,
      code: "*7650#",
      title: "Ghana Diabetes Care",
      description: "Complete diabetes management in English and Twi",
      isActive: false,
      language: "en",
      menuItems: [
        {
          id: "1",
          option: "1",
          text: "Kasa nurse bi (Talk to nurse)",
          action: "callback",
          followUpAction: {
            type: "nurse_call",
            delay: 10,
            message:
              "Nurse bi bɛfrɛ wo wɔ simma 10 mu (A nurse will call you in 10 minutes)",
          },
        },
        {
          id: "2",
          option: "2",
          text: "Pε aduro (Order medicine)",
          action: "submenu",
          subItems: [
            {
              id: "2.1",
              option: "1",
              text: "Metformin",
              action: "sms",
            },
            {
              id: "2.2",
              option: "2",
              text: "Insulin",
              action: "callback",
            },
          ],
        },
        {
          id: "3",
          option: "3",
          text: "Apɔmuden nsεmmisa (Health questions)",
          action: "questionnaire",
        },
      ],
      analytics: {
        totalSessions: 0,
        completionRate: 0,
        avgDuration: 0,
        peakHours: [],
      },
    };
    setMenus([...menus, newMenu]);
    setEditingMenu(newMenu);
    setShowMenuBuilder(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl">
              <Radio className="w-8 h-8 text-blue-600" />
            </div>
            USSD Health Platform
          </h2>
          <p className="text-muted-foreground mt-2">
            Deliver healthcare services to rural populations via basic phones -
            no internet required
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowProviderSetup(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Provider Setup
          </Button>
          <Button
            onClick={createSampleDiabetesMenu}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create USSD Menu
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="menus">USSD Menus</TabsTrigger>
          <TabsTrigger value="workflows">Care Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Integration</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Sessions
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {totalSessions.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +23% this month
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Completion Rate
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {avgCompletionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-green-600">Above target</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Menus
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {activeMenus}
                    </p>
                    <p className="text-xs text-blue-600">
                      {LANGUAGES.length} languages
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                    <Languages className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Rural Reach
                    </p>
                    <p className="text-3xl font-bold text-foreground">15.2K</p>
                    <p className="text-xs text-purple-600">Unique patients</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                  Universal Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Basic Phone Support</p>
                      <p className="text-xs text-muted-foreground">
                        Works on any phone, no data needed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Multi-Language</p>
                      <p className="text-xs text-muted-foreground">
                        Local languages + English
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <Wifi className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Offline Capable</p>
                      <p className="text-xs text-muted-foreground">
                        Works in areas with poor connectivity
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-600" />
                  Healthcare Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                      <Headphones className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nurse Triage</p>
                      <p className="text-xs text-muted-foreground">
                        Immediate callback for urgent care
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Pill className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Medication Orders</p>
                      <p className="text-xs text-muted-foreground">
                        Direct prescription delivery
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Appointments</p>
                      <p className="text-xs text-muted-foreground">
                        Voice calls or in-person visits
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Impact Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Patient Satisfaction
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-medium">4.8/5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Care Access Increase
                    </span>
                    <span className="text-sm font-medium text-green-600">
                      +340%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Medication Adherence
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      89%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Emergency Prevention
                    </span>
                    <span className="text-sm font-medium text-purple-600">
                      67%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sample USSD Flow */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-blue-600" />
                Sample USSD Flow: Diabetes Care
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm space-y-3">
                <div className="border-b border-gray-700 pb-2">
                  <p className="text-gray-400">User dials: *765#</p>
                </div>
                <div className="space-y-2">
                  <p className="text-white">Welcome to Telecheck Health!</p>
                  <p>1. Talk to a nurse</p>
                  <p>2. Order diabetes medicine</p>
                  <p>3. Health check questions</p>
                  <p>4. Book doctor appointment</p>
                  <p>5. Medication reminders</p>
                  <p>0. Exit</p>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <p className="text-blue-400">User selects: 2</p>
                </div>
                <div className="space-y-2">
                  <p className="text-white">Select medicine:</p>
                  <p>1. Metformin 500mg</p>
                  <p>2. Semaglutide injection</p>
                  <p>3. Insulin (various)</p>
                  <p>0. Back</p>
                </div>
                <div className="border-t border-gray-700 pt-2">
                  <p className="text-blue-400">User selects: 1</p>
                </div>
                <div className="space-y-2">
                  <p className="text-white">✓ Metformin order confirmed!</p>
                  <p className="text-yellow-400">
                    SMS: "Order confirmed. Delivery in 2-3 days to [address].
                    Call 0244123456 for questions."
                  </p>
                  <p className="text-green-400">
                    Follow-up: Nurse call scheduled in 1 hour
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USSD Menus Tab */}
        <TabsContent value="menus" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">USSD Menu Management</h3>
            <Button onClick={() => setShowMenuBuilder(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create New Menu
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {menus.map((menu) => (
              <Card key={menu.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {menu.code}
                        </Badge>
                        {menu.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {menu.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          menu.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {menu.isActive ? "Active" : "Draft"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {LANGUAGES.find((l) => l.code === menu.language)?.name}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {menu.analytics.totalSessions}
                        </p>
                        <p className="text-muted-foreground">Sessions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {menu.analytics.completionRate}%
                        </p>
                        <p className="text-muted-foreground">Completion</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          {menu.analytics.avgDuration}s
                        </p>
                        <p className="text-muted-foreground">Avg Duration</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">
                        Menu Structure ({menu.menuItems.length} options)
                      </p>
                      <div className="space-y-1">
                        {menu.menuItems.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="text-xs text-muted-foreground flex items-center gap-2"
                          >
                            <Badge
                              variant="outline"
                              className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                            >
                              {item.option}
                            </Badge>
                            <span className="truncate">{item.text}</span>
                            <Badge variant="secondary" className="text-xs">
                              {item.action}
                            </Badge>
                          </div>
                        ))}
                        {menu.menuItems.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{menu.menuItems.length - 3} more options
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setEditingMenu(menu);
                          setShowMenuBuilder(true);
                        }}
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMenu(menu)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                      <Button
                        size="sm"
                        disabled={isDeployingMenu}
                        onClick={() => deployMenu(menu)}
                        className={
                          menu.isActive
                            ? "bg-orange-500 hover:bg-orange-600"
                            : "bg-green-500 hover:bg-green-600"
                        }
                      >
                        {isDeployingMenu ? (
                          <Activity className="w-3 h-3 mr-1 animate-spin" />
                        ) : menu.isActive ? (
                          <Pause className="w-3 h-3 mr-1" />
                        ) : (
                          <Play className="w-3 h-3 mr-1" />
                        )}
                        {menu.isActive ? "Pause" : "Deploy"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Care Workflows Tab */}
        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneCall className="w-5 h-5 text-blue-600" />
                  Nurse Triage Workflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        USSD Request Received
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Patient selects "Talk to nurse" option
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium">Priority Assessment</p>
                      <p className="text-xs text-muted-foreground">
                        Auto-categorize based on responses
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium">Nurse Assignment</p>
                      <p className="text-xs text-muted-foreground">
                        Route to available nurse by language/specialty
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-medium">Callback Initiated</p>
                      <p className="text-xs text-muted-foreground">
                        Voice call within 15 minutes (target: 5 min avg)
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">
                      SLA: 95% of calls within 15 minutes
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span>Emergency escalation: &lt;2 minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-purple-600" />
                  Medication Order Flow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Medication Selection
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Patient browses available medications via USSD
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Prescription Verification
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Check existing prescriptions & dosage
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium">Order Confirmation</p>
                      <p className="text-xs text-muted-foreground">
                        SMS confirmation with delivery details
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                      4
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Fulfillment & Delivery
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2-3 day delivery with tracking updates
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">
                      Delivery: 2-3 days rural, 1-2 days urban
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>Payment: Mobile money or cash on delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nurse Scripts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5 text-green-600" />
                Nurse Triage Scripts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-600">
                    Emergency Assessment (Twi + English)
                  </h4>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium mb-2">
                      🚨 High Priority - Immediate Assessment
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>English:</strong> "Hello, this is Nurse [Name]
                        from Telecheck. Are you having trouble breathing or
                        chest pain right now?"
                      </p>
                      <p>
                        <strong>Twi:</strong> "Akwaaba, meyε Nurse [Name] fi
                        Telecheck. Wowɔ ahome anaa koma mu yea seesei?"
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-600">
                    Routine Care (Diabetes Focus)
                  </h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium mb-2">
                      📋 Standard Assessment
                    </p>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Blood sugar check:</strong> "When did you last
                        check your blood sugar? What was the reading?"
                      </p>
                      <p>
                        <strong>Medication compliance:</strong> "Are you taking
                        your diabetes medication regularly?"
                      </p>
                      <p>
                        <strong>Symptoms:</strong> "Any unusual thirst, frequent
                        urination, or blurred vision?"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Peak Usage Hours
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      8-10 AM
                    </p>
                    <p className="text-xs text-blue-600">
                      Morning routine check-ins
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Avg Session Cost
                    </p>
                    <p className="text-2xl font-bold text-foreground">$0.03</p>
                    <p className="text-xs text-green-600">
                      83% cost reduction vs clinic
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Emergency Escalations
                    </p>
                    <p className="text-2xl font-bold text-foreground">2.3%</p>
                    <p className="text-xs text-red-600">
                      Requiring immediate care
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Patient Retention
                    </p>
                    <p className="text-2xl font-bold text-foreground">89%</p>
                    <p className="text-xs text-purple-600">
                      Monthly active users
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage by Region */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Usage by Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    region: "Ashanti Region",
                    sessions: 3456,
                    growth: "+23%",
                    languages: ["en", "tw"],
                  },
                  {
                    region: "Northern Region",
                    sessions: 2890,
                    growth: "+45%",
                    languages: ["en", "ha"],
                  },
                  {
                    region: "Volta Region",
                    sessions: 2134,
                    growth: "+12%",
                    languages: ["en", "tw"],
                  },
                  {
                    region: "Upper East",
                    sessions: 1567,
                    growth: "+67%",
                    languages: ["en", "ha"],
                  },
                ].map((region, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="font-medium">{region.region}</p>
                        <div className="flex gap-1 mt-1">
                          {region.languages.map((lang) => (
                            <Badge
                              key={lang}
                              variant="outline"
                              className="text-xs"
                            >
                              {LANGUAGES.find((l) => l.code === lang)?.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {region.sessions.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">{region.growth}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integration Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5 text-blue-600" />
                USSD Provider Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <Card
                    key={provider.id}
                    className={`border-2 ${provider.isConnected ? "border-green-200 bg-green-50 dark:bg-green-900/10" : "border-gray-200"}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{provider.name}</h3>
                        <Badge
                          className={
                            provider.isConnected
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {provider.isConnected ? "Connected" : "Available"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {provider.region}
                      </p>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Features</p>
                          <div className="flex flex-wrap gap-1">
                            {provider.supportedFeatures.map((feature) => (
                              <Badge
                                key={feature}
                                variant="outline"
                                className="text-xs"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2">Pricing</p>
                          <div className="text-xs space-y-1">
                            <p>Setup: ${provider.pricing.setupFee}</p>
                            <p>Per session: ${provider.pricing.perSession}</p>
                            <p>Monthly: ${provider.pricing.monthly}</p>
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          variant={provider.isConnected ? "outline" : "default"}
                          onClick={() => {
                            setSelectedProvider(provider);
                            setShowProviderSetup(true);
                          }}
                        >
                          {provider.isConnected ? "Configure" : "Connect"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-purple-600" />
                Multi-Language Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {LANGUAGES.map((language) => (
                  <div
                    key={language.code}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{language.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {language.region}
                      </p>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Provider Setup Dialog */}
      <Dialog open={showProviderSetup} onOpenChange={setShowProviderSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedProvider
                ? `Configure ${selectedProvider.name}`
                : "Provider Setup"}
            </DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect with the USSD provider
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key..."
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="Username or app ID..." />
            </div>
            <div>
              <Label htmlFor="short-code">USSD Short Code</Label>
              <Input id="short-code" placeholder="*765# (assigned by telco)" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowProviderSetup(false)}
            >
              Cancel
            </Button>
            <Button>Test Connection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
