import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Share2,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Search,
  Filter,
  ArrowLeft,
  Settings,
  Eye,
  Edit,
  Copy,
  CheckCircle,
  AlertTriangle,
  Star,
  BarChart3,
  Link as LinkIcon,
  Crown,
  Award,
  Target,
  Calendar,
  Mail,
  Phone,
  Globe,
  CreditCard,
  Percent,
  Activity,
  FileText,
  Download,
  Upload,
  Clock,
  UserCheck,
  Building,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SalesOptimization } from "../../components/SalesOptimization";

// Mock affiliate data
const affiliateStats = [
  {
    title: "Active Affiliates",
    value: "247",
    change: "+23 this month",
    changeType: "increase",
    icon: Users,
    color: "#10b981",
  },
  {
    title: "Total Revenue",
    value: "$127,840",
    change: "+18.5% MTD",
    changeType: "increase",
    icon: DollarSign,
    color: "#3b82f6",
  },
  {
    title: "Conversions",
    value: "1,284",
    change: "+12.3%",
    changeType: "increase",
    icon: Target,
    color: "#8b5cf6",
  },
  {
    title: "Commission Paid",
    value: "$24,567",
    change: "+$3,240",
    changeType: "increase",
    icon: CreditCard,
    color: "#f59e0b",
  },
];

const topAffiliates = [
  {
    id: "AFF001",
    name: "HealthHub Network",
    email: "partners@healthhub.com",
    tier: "Platinum",
    commissionRate: 15,
    totalEarnings: 12580,
    referrals: 156,
    conversions: 89,
    status: "active",
    joinDate: "2023-01-15",
    website: "healthhub.com",
    location: "New York, NY",
  },
  {
    id: "AFF002",
    name: "Wellness Partners Inc",
    email: "info@wellnesspartners.com",
    tier: "Gold",
    commissionRate: 12,
    totalEarnings: 8940,
    referrals: 112,
    conversions: 67,
    status: "active",
    joinDate: "2023-02-20",
    website: "wellnesspartners.com",
    location: "Los Angeles, CA",
  },
  {
    id: "AFF003",
    name: "MedConnect Solutions",
    email: "partnerships@medconnect.com",
    tier: "Silver",
    commissionRate: 10,
    totalEarnings: 5670,
    referrals: 78,
    conversions: 45,
    status: "active",
    joinDate: "2023-03-10",
    website: "medconnect.com",
    location: "Chicago, IL",
  },
  {
    id: "AFF004",
    name: "Digital Health Collective",
    email: "team@digitalhealth.co",
    tier: "Bronze",
    commissionRate: 8,
    totalEarnings: 3420,
    referrals: 45,
    conversions: 28,
    status: "pending",
    joinDate: "2023-04-05",
    website: "digitalhealth.co",
    location: "Austin, TX",
  },
];

const commissionTiers = [
  {
    name: "Bronze",
    minReferrals: 0,
    rate: 8,
    color: "#cd7f32",
    benefits: ["Basic marketing materials", "Monthly reports", "Email support"],
  },
  {
    name: "Silver",
    minReferrals: 25,
    rate: 10,
    color: "#c0c0c0",
    benefits: ["Priority support", "Custom landing pages", "Quarterly bonuses"],
  },
  {
    name: "Gold",
    minReferrals: 50,
    rate: 12,
    color: "#ffd700",
    benefits: [
      "Dedicated account manager",
      "Early access to features",
      "Performance bonuses",
    ],
  },
  {
    name: "Platinum",
    minReferrals: 100,
    rate: 15,
    color: "#e5e4e2",
    benefits: [
      "Custom commission rates",
      "Co-marketing opportunities",
      "VIP support",
    ],
  },
];

const recentPayouts = [
  {
    id: "PAY001",
    affiliateId: "AFF001",
    affiliateName: "HealthHub Network",
    amount: 2840,
    period: "March 2024",
    status: "paid",
    paidDate: "2024-04-01",
    method: "Bank Transfer",
  },
  {
    id: "PAY002",
    affiliateId: "AFF002",
    affiliateName: "Wellness Partners Inc",
    amount: 1920,
    period: "March 2024",
    status: "processing",
    paidDate: null,
    method: "PayPal",
  },
  {
    id: "PAY003",
    affiliateId: "AFF003",
    affiliateName: "MedConnect Solutions",
    amount: 1350,
    period: "March 2024",
    status: "pending",
    paidDate: null,
    method: "Check",
  },
];

export function Affiliate() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTier, setSelectedTier] = useState("all");

  const filteredAffiliates = topAffiliates.filter(
    (affiliate) =>
      (selectedTier === "all" ||
        affiliate.tier.toLowerCase() === selectedTier) &&
      (affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        affiliate.email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const getTierBadgeColor = (tier: string) => {
    switch (tier.toLowerCase()) {
      case "platinum":
        return "bg-gray-100 text-gray-800";
      case "gold":
        return "bg-yellow-100 text-yellow-800";
      case "silver":
        return "bg-gray-100 text-gray-600";
      case "bronze":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <Share2 className="w-10 h-10 text-primary" />
              Affiliate Management
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage affiliate partnerships and track commission performance
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Settings className="w-4 h-4" />
              Program Settings
            </Button>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Affiliate
            </Button>
          </div>
        </div>

        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="sales-optimization">
              Sales Optimization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {affiliateStats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={idx}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-foreground">
                            {stat.value}
                          </p>
                          <div className="flex items-center gap-1 text-sm mt-1 text-green-600">
                            <TrendingUp className="w-3 h-3" />
                            <span>{stat.change}</span>
                          </div>
                        </div>
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${stat.color}15` }}
                        >
                          <Icon
                            className="w-6 h-6"
                            style={{ color: stat.color }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Commission Tiers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Commission Tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {commissionTiers.map((tier, idx) => (
                    <Card key={idx} className="border-2">
                      <CardContent className="p-4">
                        <div className="text-center mb-4">
                          <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2"
                            style={{ backgroundColor: `${tier.color}20` }}
                          >
                            <Award
                              className="w-8 h-8"
                              style={{ color: tier.color }}
                            />
                          </div>
                          <h3
                            className="font-bold text-lg"
                            style={{ color: tier.color }}
                          >
                            {tier.name}
                          </h3>
                          <p className="text-2xl font-bold text-foreground">
                            {tier.rate}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tier.minReferrals}+ referrals
                          </p>
                        </div>
                        <ul className="space-y-1 text-xs">
                          {tier.benefits.map((benefit, benefitIdx) => (
                            <li
                              key={benefitIdx}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Top Performing Affiliates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topAffiliates.slice(0, 3).map((affiliate, idx) => (
                    <div
                      key={affiliate.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold">{affiliate.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {affiliate.email}
                          </p>
                        </div>
                        <Badge className={getTierBadgeColor(affiliate.tier)}>
                          {affiliate.tier}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ${affiliate.totalEarnings.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {affiliate.referrals} referrals
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="affiliates" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search affiliates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    {["all", "platinum", "gold", "silver", "bronze"].map(
                      (tier) => (
                        <Button
                          key={tier}
                          variant={
                            selectedTier === tier ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setSelectedTier(tier)}
                          className="capitalize"
                        >
                          {tier}
                        </Button>
                      ),
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Affiliates List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAffiliates.map((affiliate) => (
                <Card
                  key={affiliate.id}
                  className="hover:shadow-lg transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{affiliate.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {affiliate.email}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getTierBadgeColor(affiliate.tier)}>
                          {affiliate.tier}
                        </Badge>
                        <Badge
                          className={getStatusBadgeColor(affiliate.status)}
                        >
                          {affiliate.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">
                          {affiliate.commissionRate}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Commission Rate
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          ${affiliate.totalEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Total Earnings
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Referrals</span>
                        <span className="font-medium">
                          {affiliate.referrals}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Conversions
                        </span>
                        <span className="font-medium">
                          {affiliate.conversions}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Conversion Rate
                        </span>
                        <span className="font-medium">
                          {(
                            (affiliate.conversions / affiliate.referrals) *
                            100
                          ).toFixed(1)}
                          %
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Join Date</span>
                        <span className="font-medium">
                          {new Date(affiliate.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                      <Globe className="w-3 h-3" />
                      <span>{affiliate.website}</span>
                      <MapPin className="w-3 h-3 ml-2" />
                      <span>{affiliate.location}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="commissions" className="space-y-6">
            {/* Commission Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-primary" />
                    Commission Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>New Patient Referral</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        $50 + 10%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>Subscription Signup</span>
                      <Badge className="bg-green-100 text-green-800">
                        15% recurring
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <span>Premium Service</span>
                      <Badge className="bg-purple-100 text-purple-800">
                        20% first month
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Payment Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Frequency</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        Monthly
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Date</span>
                      <span className="font-medium">1st of each month</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Minimum Payout</span>
                      <span className="font-medium">$50</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Payment Methods</span>
                      <span className="font-medium">Bank, PayPal, Check</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Payouts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Recent Payouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentPayouts.map((payout) => (
                    <div
                      key={payout.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h4 className="font-semibold">
                          {payout.affiliateName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {payout.period} • {payout.method}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ${payout.amount.toLocaleString()}
                        </p>
                        <Badge
                          className={
                            payout.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : payout.status === "processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {payout.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Conversion Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Clicks</span>
                        <span>12,547</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Signups</span>
                        <span>3,214 (25.6%)</span>
                      </div>
                      <Progress value={25.6} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Conversions</span>
                        <span>1,284 (40.0%)</span>
                      </div>
                      <Progress value={40} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Monthly Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">New Affiliates</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">+23</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total Referrals</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">+18.5%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Revenue Generated</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">+24.7%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Commission Paid</span>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        <span className="font-medium">+21.3%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Performance by Tier
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {commissionTiers.map((tier) => {
                    const tierAffiliates = topAffiliates.filter(
                      (a) => a.tier.toLowerCase() === tier.name.toLowerCase(),
                    );
                    const totalEarnings = tierAffiliates.reduce(
                      (sum, a) => sum + a.totalEarnings,
                      0,
                    );
                    const totalReferrals = tierAffiliates.reduce(
                      (sum, a) => sum + a.referrals,
                      0,
                    );

                    return (
                      <div
                        key={tier.name}
                        className="text-center p-4 border rounded-lg"
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                          style={{ backgroundColor: `${tier.color}20` }}
                        >
                          <Award
                            className="w-6 h-6"
                            style={{ color: tier.color }}
                          />
                        </div>
                        <h3 className="font-bold" style={{ color: tier.color }}>
                          {tier.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-2">
                          {tierAffiliates.length} affiliates
                        </p>
                        <p className="text-lg font-bold">
                          ${totalEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {totalReferrals} referrals
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales-optimization">
            <SalesOptimization />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
