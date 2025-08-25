import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import {
  Mail,
  MessageCircle,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Calendar,
  Users,
  Target,
  TrendingUp,
  BarChart3,
  Settings,
  Play,
  Pause,
  Send,
  Edit,
  Eye,
  Plus,
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Bot,
  Globe,
  Smartphone,
  Monitor,
  Truck,
  Store,
  ShoppingCart,
  CreditCard,
  Gift,
  Star,
  Heart,
  Share2,
  Bell,
  Megaphone,
  PieChart,
  Activity,
  DollarSign,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  ChevronRight,
  Building,
  MapPin,
  Layers,
  Split,
  RefreshCw,
  Database,
  Code,
  Sparkles,
  Workflow,
  Radio,
  Headphones,
  Image,
  Video,
  FileText,
  Calendar as CalendarIcon,
  Repeat,
  Hash,
  Bookmark,
  MousePointer,
  Trash2,
  Copy,
  Download,
  Upload,
  RotateCcw,
  CheckSquare,
  AlertTriangle,
  TrendingDown,
  Percent,
  Timer,
  UserCheck,
  UserX,
  Shuffle,
  ExternalLink,
  LinkIcon,
  Palette,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "sms" | "social" | "push" | "multi-channel";
  status: "draft" | "active" | "paused" | "completed";
  channels: string[];
  audience: string;
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  metrics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
    revenue: number;
  };
  automationType: "trigger" | "scheduled" | "lifecycle" | "behavioral";
}

interface SocialMediaPost {
  id: string;
  platform: "facebook" | "instagram" | "twitter" | "linkedin" | "youtube";
  content: string;
  media?: {
    type: "image" | "video" | "carousel";
    url: string;
    alt?: string;
  };
  scheduledDate?: string;
  status: "draft" | "scheduled" | "published" | "failed";
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  hashtags: string[];
  campaign?: string;
}

interface AbandonedCartFlow {
  id: string;
  name: string;
  trigger: {
    delay: string;
    conditions: string[];
  };
  steps: CartFlowStep[];
  status: "active" | "paused" | "draft";
  performance: {
    triggered: number;
    emails_sent: number;
    sms_sent: number;
    recovered: number;
    revenue: number;
    recovery_rate: number;
  };
  settings: {
    maxAttempts: number;
    excludeCompleted: boolean;
    personalizeOffer: boolean;
    dynamicDiscount: boolean;
  };
}

interface CartFlowStep {
  id: string;
  type: "email" | "sms" | "push" | "wait" | "condition" | "offer";
  delay: string;
  title: string;
  content?: string;
  template?: string;
  offer?: {
    type: "percentage" | "fixed" | "free_shipping";
    value: number;
    expires: string;
  };
  condition?: string;
}

interface SocialMediaTemplate {
  id: string;
  name: string;
  platform: string;
  category:
    | "health_tips"
    | "product_highlight"
    | "testimonial"
    | "educational"
    | "promotional";
  content: string;
  hashtags: string[];
  media_suggestions: string[];
}

interface MarketingAutomationProps {
  defaultTab?: string;
}

export function MarketingAutomation({
  defaultTab = "overview",
}: MarketingAutomationProps = {}) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSocialPlatform, setSelectedSocialPlatform] = useState("all");

  // Enhanced abandoned cart flows
  const abandonedCartFlows: AbandonedCartFlow[] = [
    {
      id: "cart-recovery-1",
      name: "Standard Cart Recovery",
      trigger: {
        delay: "1 hour",
        conditions: [
          "Cart value > $25",
          "User registered",
          "No purchase completed",
        ],
      },
      steps: [
        {
          id: "step1",
          type: "wait",
          delay: "1 hour",
          title: "Initial Wait Period",
        },
        {
          id: "step2",
          type: "email",
          delay: "0",
          title: "Gentle Reminder Email",
          content: "You left something in your cart!",
          template: "cart-reminder-1",
        },
        {
          id: "step3",
          type: "wait",
          delay: "6 hours",
          title: "Wait for Response",
        },
        {
          id: "step4",
          type: "condition",
          delay: "0",
          title: "Check Cart Status",
          condition: "Cart still active AND no purchase",
        },
        {
          id: "step5",
          type: "email",
          delay: "0",
          title: "Urgency Email with Discount",
          content: "Don't miss out! Complete your order now",
          template: "cart-urgency-discount",
          offer: {
            type: "percentage",
            value: 10,
            expires: "24 hours",
          },
        },
        {
          id: "step6",
          type: "wait",
          delay: "24 hours",
          title: "Final Wait Period",
        },
        {
          id: "step7",
          type: "sms",
          delay: "0",
          title: "Last Chance SMS",
          content: "Last chance! Your cart expires soon. Get 15% off now.",
          offer: {
            type: "percentage",
            value: 15,
            expires: "6 hours",
          },
        },
      ],
      status: "active",
      performance: {
        triggered: 1250,
        emails_sent: 2100,
        sms_sent: 650,
        recovered: 320,
        revenue: 48750,
        recovery_rate: 25.6,
      },
      settings: {
        maxAttempts: 3,
        excludeCompleted: true,
        personalizeOffer: true,
        dynamicDiscount: true,
      },
    },
    {
      id: "cart-recovery-2",
      name: "High-Value Cart Recovery",
      trigger: {
        delay: "30 minutes",
        conditions: ["Cart value > $100", "Premium customer", "Multiple items"],
      },
      steps: [
        {
          id: "step1",
          type: "wait",
          delay: "30 minutes",
          title: "Quick Response Wait",
        },
        {
          id: "step2",
          type: "email",
          delay: "0",
          title: "Premium Customer Email",
          content: "Your premium items are waiting",
          template: "premium-cart-reminder",
        },
        {
          id: "step3",
          type: "wait",
          delay: "2 hours",
          title: "Short Wait",
        },
        {
          id: "step4",
          type: "push",
          delay: "0",
          title: "Mobile Push Notification",
          content: "Complete your premium order for free shipping",
        },
        {
          id: "step5",
          type: "wait",
          delay: "12 hours",
          title: "Extended Wait",
        },
        {
          id: "step6",
          type: "offer",
          delay: "0",
          title: "Exclusive Offer",
          offer: {
            type: "free_shipping",
            value: 0,
            expires: "48 hours",
          },
        },
      ],
      status: "active",
      performance: {
        triggered: 485,
        emails_sent: 485,
        sms_sent: 0,
        recovered: 185,
        revenue: 24850,
        recovery_rate: 38.1,
      },
      settings: {
        maxAttempts: 2,
        excludeCompleted: true,
        personalizeOffer: true,
        dynamicDiscount: false,
      },
    },
  ];

  // Enhanced social media posts
  const socialMediaPosts: SocialMediaPost[] = [
    {
      id: "post1",
      platform: "instagram",
      content:
        "🌿 Your health journey starts with small, consistent steps. Our AI-powered health insights help you track what matters most. #HealthTech #Wellness #Telecheck",
      media: {
        type: "image",
        url: "/health-journey.jpg",
        alt: "Person using health app",
      },
      scheduledDate: "2024-01-25T10:00:00Z",
      status: "scheduled",
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0,
        views: 0,
      },
      hashtags: ["HealthTech", "Wellness", "Telecheck", "AI", "HealthJourney"],
      campaign: "Health Awareness Q1",
    },
    {
      id: "post2",
      platform: "facebook",
      content:
        "Medication management made simple! 💊 Never miss a dose with our smart reminder system. Your health, simplified.",
      media: {
        type: "video",
        url: "/medication-demo.mp4",
        alt: "Medication reminder demo",
      },
      status: "published",
      engagement: {
        likes: 245,
        shares: 32,
        comments: 18,
        views: 1250,
      },
      hashtags: ["MedicationManagement", "HealthTech", "PatientCare"],
      campaign: "Medication Awareness",
    },
    {
      id: "post3",
      platform: "twitter",
      content:
        "Did you know? 🧬 Pharmacogenomic testing can help optimize your medication effectiveness by up to 40%. Learn more about personalized medicine at Telecheck.",
      status: "published",
      engagement: {
        likes: 89,
        shares: 67,
        comments: 12,
      },
      hashtags: [
        "PGx",
        "PersonalizedMedicine",
        "Pharmacogenomics",
        "HealthInnovation",
      ],
      campaign: "PGx Education",
    },
    {
      id: "post4",
      platform: "linkedin",
      content:
        "Healthcare providers: Streamline your practice with our comprehensive EHR solution. From AI-powered diagnostics to seamless patient management. Book a demo today.",
      media: {
        type: "carousel",
        url: "/ehr-features.jpg",
        alt: "EHR system features",
      },
      status: "draft",
      engagement: {
        likes: 0,
        shares: 0,
        comments: 0,
      },
      hashtags: ["EHR", "HealthcareTech", "MedicalPractice", "HealthIT"],
      campaign: "Provider Outreach",
    },
  ];

  // Social media templates
  const socialMediaTemplates: SocialMediaTemplate[] = [
    {
      id: "template1",
      name: "Health Tip Monday",
      platform: "instagram",
      category: "health_tips",
      content:
        "💡 Monday Health Tip: {tip_content} Remember, small changes lead to big results! #MondayMotivation #HealthTips",
      hashtags: ["MondayMotivation", "HealthTips", "Wellness", "Telecheck"],
      media_suggestions: [
        "Infographic",
        "Health illustration",
        "Motivational quote",
      ],
    },
    {
      id: "template2",
      name: "Product Spotlight",
      platform: "facebook",
      category: "product_highlight",
      content:
        "🌟 Product Spotlight: {product_name} - {product_description}. Discover how it can transform your health journey.",
      hashtags: ["ProductSpotlight", "HealthTech", "Innovation"],
      media_suggestions: [
        "Product demo video",
        "Before/after graphics",
        "Feature highlights",
      ],
    },
    {
      id: "template3",
      name: "Patient Success Story",
      platform: "twitter",
      category: "testimonial",
      content:
        '🎉 Success Story: "{testimonial_text}" - {patient_initials}. Your health journey matters to us. #PatientSuccess #HealthJourney',
      hashtags: ["PatientSuccess", "HealthJourney", "Testimonial", "Telecheck"],
      media_suggestions: [
        "Patient photo (with consent)",
        "Success metrics",
        "Journey timeline",
      ],
    },
  ];

  // Sample campaigns data
  const campaigns: Campaign[] = [
    {
      id: "camp1",
      name: "Summer Health Check Campaign",
      type: "multi-channel",
      status: "active",
      channels: ["email", "sms", "instagram", "facebook"],
      audience: "Health-conscious Adults",
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      budget: 5000,
      spent: 3200,
      metrics: {
        sent: 15000,
        delivered: 14500,
        opened: 7800,
        clicked: 2100,
        converted: 320,
        revenue: 48000,
      },
      automationType: "lifecycle",
    },
    {
      id: "camp2",
      name: "Medication Reminder Series",
      type: "sms",
      status: "active",
      channels: ["sms", "push"],
      audience: "Chronic Care Patients",
      startDate: "2024-05-15",
      budget: 2000,
      spent: 1650,
      metrics: {
        sent: 8500,
        delivered: 8200,
        opened: 6800,
        clicked: 1200,
        converted: 450,
        revenue: 15600,
      },
      automationType: "behavioral",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "published":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "facebook":
        return Facebook;
      case "instagram":
        return Instagram;
      case "twitter":
        return Twitter;
      case "linkedin":
        return Building;
      case "youtube":
        return Youtube;
      default:
        return Share2;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "facebook":
        return "text-blue-600";
      case "instagram":
        return "text-pink-600";
      case "twitter":
        return "text-sky-500";
      case "linkedin":
        return "text-blue-700";
      case "youtube":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const filteredSocialPosts = socialMediaPosts.filter(
    (post) =>
      selectedSocialPlatform === "all" ||
      post.platform === selectedSocialPlatform,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                  <Megaphone className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                  Marketing & Outreach Hub
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-xs px-3 py-1">
                    <Globe className="w-3 h-3 mr-1" />
                    Omni-Channel
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Advanced automation, social media management, and customer
                  recovery systems
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {campaigns.filter((c) => c.status === "active").length}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Active Campaigns
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      $
                      {(
                        campaigns.reduce(
                          (sum, c) => sum + c.metrics.revenue,
                          0,
                        ) / 1000
                      ).toFixed(0)}
                      K
                    </div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="cart-recovery">Cart Recovery</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="audiences">Audiences</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Social Reach
                    </p>
                    <p className="text-2xl font-bold text-purple-600">125K</p>
                  </div>
                  <Share2 className="w-8 h-8 text-purple-500" />
                </div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+18.5% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Cart Recovery
                    </p>
                    <p className="text-2xl font-bold text-green-600">28.3%</p>
                  </div>
                  <RotateCcw className="w-8 h-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+3.2% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Engagement Rate
                    </p>
                    <p className="text-2xl font-bold text-blue-600">15.8%</p>
                  </div>
                  <Heart className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+2.4% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Revenue Impact
                    </p>
                    <p className="text-2xl font-bold text-orange-600">$73K</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+22.1% vs last month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab("social")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Instagram className="w-8 h-8 text-pink-500" />
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-2">Social Media Manager</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Schedule posts, manage content, track engagement across all
                  platforms
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    4 platforms
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    8 scheduled
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab("cart-recovery")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <ShoppingCart className="w-8 h-8 text-orange-500" />
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-2">Cart Recovery Flows</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Automated sequences to recover abandoned carts with
                  personalized offers
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    2 active flows
                  </Badge>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    28% recovery
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab("automation")}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Workflow className="w-8 h-8 text-blue-500" />
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold mb-2">Marketing Automation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Build complex customer journeys with triggers and conditions
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    5 workflows
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    Running
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Social Media Management</h3>
              <select
                value={selectedSocialPlatform}
                onChange={(e) => setSelectedSocialPlatform(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="all">All Platforms</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Content Calendar
              </Button>
              <Button className="gradient-bg text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                platform: "facebook",
                followers: "24.5K",
                engagement: "8.2%",
                posts: 12,
              },
              {
                platform: "instagram",
                followers: "18.9K",
                engagement: "12.4%",
                posts: 8,
              },
              {
                platform: "twitter",
                followers: "15.3K",
                engagement: "5.7%",
                posts: 15,
              },
              {
                platform: "linkedin",
                followers: "8.7K",
                engagement: "15.2%",
                posts: 6,
              },
            ].map((stat) => {
              const Icon = getPlatformIcon(stat.platform);
              return (
                <Card key={stat.platform}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Icon
                        className={`w-6 h-6 ${getPlatformColor(stat.platform)}`}
                      />
                      <Badge variant="outline" className="text-xs capitalize">
                        {stat.posts} posts
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold">{stat.followers}</div>
                      <div className="text-xs text-muted-foreground">
                        Followers
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        {stat.engagement} engagement
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Social Media Posts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSocialPosts.map((post) => {
              const Icon = getPlatformIcon(post.platform);
              return (
                <Card
                  key={post.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-6 h-6 ${getPlatformColor(post.platform)}`}
                        />
                        <div>
                          <CardTitle className="text-lg capitalize">
                            {post.platform}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {post.campaign || "No campaign"}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(post.status)}>
                        {post.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm">{post.content}</p>
                      </div>

                      {post.media && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          {post.media.type === "image" && (
                            <Image className="w-4 h-4 text-blue-600" />
                          )}
                          {post.media.type === "video" && (
                            <Video className="w-4 h-4 text-blue-600" />
                          )}
                          {post.media.type === "carousel" && (
                            <Layers className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-xs text-blue-700">
                            {post.media.type}
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {post.hashtags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {post.status === "published" && (
                        <div className="grid grid-cols-4 gap-2 text-center text-sm">
                          <div>
                            <Heart className="w-4 h-4 mx-auto mb-1 text-red-500" />
                            <div className="font-medium">
                              {post.engagement.likes}
                            </div>
                            <div className="text-xs text-gray-500">Likes</div>
                          </div>
                          <div>
                            <Share2 className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                            <div className="font-medium">
                              {post.engagement.shares}
                            </div>
                            <div className="text-xs text-gray-500">Shares</div>
                          </div>
                          <div>
                            <MessageCircle className="w-4 h-4 mx-auto mb-1 text-green-500" />
                            <div className="font-medium">
                              {post.engagement.comments}
                            </div>
                            <div className="text-xs text-gray-500">
                              Comments
                            </div>
                          </div>
                          {post.engagement.views && (
                            <div>
                              <Eye className="w-4 h-4 mx-auto mb-1 text-purple-500" />
                              <div className="font-medium">
                                {post.engagement.views}
                              </div>
                              <div className="text-xs text-gray-500">Views</div>
                            </div>
                          )}
                        </div>
                      )}

                      {post.scheduledDate && post.status === "scheduled" && (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-700">
                            Scheduled for{" "}
                            {new Date(post.scheduledDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Copy className="w-4 h-4 mr-1" />
                          Duplicate
                        </Button>
                        <Button variant="outline" size="sm">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Content Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Content Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {socialMediaTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline" className="text-xs capitalize">
                        {template.platform}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.content}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.hashtags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cart Recovery Tab */}
        <TabsContent value="cart-recovery" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Abandoned Cart Recovery</h3>
              <Badge className="bg-green-100 text-green-800">
                Active Flows:{" "}
                {abandonedCartFlows.filter((f) => f.status === "active").length}
              </Badge>
            </div>
            <Button className="gradient-bg text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Recovery Flow
            </Button>
          </div>

          {/* Cart Recovery Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Recovery Rate
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {(
                        abandonedCartFlows.reduce(
                          (sum, f) => sum + f.performance.recovery_rate,
                          0,
                        ) / abandonedCartFlows.length
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                  <RotateCcw className="w-8 h-8 text-green-500" />
                </div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+5.2% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Recovered Revenue
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      $
                      {(
                        abandonedCartFlows.reduce(
                          (sum, f) => sum + f.performance.revenue,
                          0,
                        ) / 1000
                      ).toFixed(0)}
                      K
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-purple-500" />
                </div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span>+12.8% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Carts Triggered
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {abandonedCartFlows
                        .reduce((sum, f) => sum + f.performance.triggered, 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-blue-500" />
                </div>
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <Timer className="w-4 h-4 mr-1" />
                  <span>This month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Avg Recovery Time
                    </p>
                    <p className="text-2xl font-bold text-orange-600">4.2h</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
                <div className="flex items-center mt-2 text-sm text-green-600">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span>-0.8h improvement</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Recovery Flows */}
          <div className="space-y-6">
            {abandonedCartFlows.map((flow) => (
              <Card key={flow.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-orange-600" />
                        {flow.name}
                        <Badge className={getStatusColor(flow.status)}>
                          {flow.status}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Trigger: {flow.trigger.delay} after cart abandonment
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {flow.performance.recovery_rate}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Recovery Rate
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Trigger Conditions */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Trigger Conditions:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {flow.trigger.conditions.map((condition, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Flow Steps */}
                    <div>
                      <h4 className="font-medium text-sm mb-3">Flow Steps:</h4>
                      <div className="space-y-3">
                        {flow.steps.map((step, index) => (
                          <div
                            key={step.id}
                            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">
                                  {step.title}
                                </span>
                                {step.type === "email" && (
                                  <Mail className="w-4 h-4 text-blue-500" />
                                )}
                                {step.type === "sms" && (
                                  <MessageCircle className="w-4 h-4 text-green-500" />
                                )}
                                {step.type === "wait" && (
                                  <Clock className="w-4 h-4 text-orange-500" />
                                )}
                                {step.type === "offer" && (
                                  <Gift className="w-4 h-4 text-purple-500" />
                                )}
                                {step.type === "condition" && (
                                  <Split className="w-4 h-4 text-gray-500" />
                                )}
                              </div>
                              {step.delay !== "0" && (
                                <div className="text-xs text-gray-500">
                                  Wait: {step.delay}
                                </div>
                              )}
                              {step.offer && (
                                <div className="text-xs text-purple-600 font-medium">
                                  {step.offer.type === "percentage" &&
                                    `${step.offer.value}% discount`}
                                  {step.offer.type === "fixed" &&
                                    `$${step.offer.value} off`}
                                  {step.offer.type === "free_shipping" &&
                                    "Free shipping"}
                                  {step.offer.expires &&
                                    ` (expires in ${step.offer.expires})`}
                                </div>
                              )}
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <div className="capitalize">{step.type}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {flow.performance.triggered}
                        </div>
                        <div className="text-xs text-gray-600">Triggered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {flow.performance.emails_sent}
                        </div>
                        <div className="text-xs text-gray-600">Emails Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {flow.performance.sms_sent}
                        </div>
                        <div className="text-xs text-gray-600">SMS Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {flow.performance.recovered}
                        </div>
                        <div className="text-xs text-gray-600">Recovered</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          ${flow.performance.revenue.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600">Revenue</div>
                      </div>
                    </div>

                    {/* Flow Settings */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Settings:</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span>Max Attempts:</span>
                          <Badge variant="outline">
                            {flow.settings.maxAttempts}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Exclude Completed:</span>
                          <div
                            className={`w-2 h-2 rounded-full ${flow.settings.excludeCompleted ? "bg-green-500" : "bg-gray-300"}`}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Personalize Offers:</span>
                          <div
                            className={`w-2 h-2 rounded-full ${flow.settings.personalizeOffer ? "bg-green-500" : "bg-gray-300"}`}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Dynamic Discount:</span>
                          <div
                            className={`w-2 h-2 rounded-full ${flow.settings.dynamicDiscount ? "bg-green-500" : "bg-gray-300"}`}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Flow
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Analytics
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Copy className="w-4 h-4 mr-1" />
                        Duplicate
                      </Button>
                      <Button variant="outline" size="sm">
                        {flow.status === "active" ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Other tabs remain the same but with updated styling */}
        <TabsContent value="campaigns">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Campaign Management</h3>
            <p className="text-muted-foreground">
              Comprehensive campaign management interface coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="automation">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Marketing Automation</h3>
            <p className="text-muted-foreground">
              Advanced automation workflow builder coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="audiences">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Audience Management</h3>
            <p className="text-muted-foreground">
              Dynamic audience segmentation tools coming soon...
            </p>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Marketing Analytics</h3>
            <p className="text-muted-foreground">
              Comprehensive analytics dashboard coming soon...
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
