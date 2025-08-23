import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  DollarSign, 
  Users, 
  Eye, 
  ShoppingCart,
  Calendar,
  Target,
  Activity,
  Percent,
  Clock,
  Star,
  Award,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from "lucide-react";

interface BundlePerformance {
  id: string;
  name: string;
  views: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  conversionRate: number;
  avgOrderValue: number;
  customerRating: number;
  timeOnPage: number;
  refundRate: number;
  repeatPurchaseRate: number;
  trends: {
    viewsChange: number;
    conversionChange: number;
    revenueChange: number;
  };
}

interface CustomerSegment {
  segment: string;
  percentage: number;
  avgSpend: number;
  conversionRate: number;
  color: string;
}

export function BundleAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  const bundlePerformanceData: BundlePerformance[] = [
    {
      id: "bundle_1",
      name: "Complete Heart Health Bundle",
      views: 1247,
      addToCarts: 312,
      purchases: 198,
      revenue: 43578.02,
      conversionRate: 15.9,
      avgOrderValue: 219.99,
      customerRating: 4.7,
      timeOnPage: 145,
      refundRate: 2.1,
      repeatPurchaseRate: 34.5,
      trends: {
        viewsChange: 23.4,
        conversionChange: 8.7,
        revenueChange: 31.2
      }
    },
    {
      id: "bundle_2", 
      name: "Diabetes Management Kit",
      views: 892,
      addToCarts: 187,
      purchases: 134,
      revenue: 24118.66,
      conversionRate: 15.0,
      avgOrderValue: 179.99,
      customerRating: 4.8,
      timeOnPage: 167,
      refundRate: 1.8,
      repeatPurchaseRate: 41.2,
      trends: {
        viewsChange: 15.2,
        conversionChange: 12.1,
        revenueChange: 28.9
      }
    },
    {
      id: "bundle_3",
      name: "Women's Wellness Package", 
      views: 675,
      addToCarts: 145,
      purchases: 89,
      revenue: 10679.11,
      conversionRate: 13.2,
      avgOrderValue: 119.99,
      customerRating: 4.6,
      timeOnPage: 132,
      refundRate: 3.2,
      repeatPurchaseRate: 29.8,
      trends: {
        viewsChange: -5.3,
        conversionChange: 2.4,
        revenueChange: 7.8
      }
    }
  ];

  const customerSegments: CustomerSegment[] = [
    { segment: "New Customers", percentage: 45, avgSpend: 167.23, conversionRate: 12.4, color: "#3b82f6" },
    { segment: "Returning Customers", percentage: 35, avgSpend: 234.56, conversionRate: 18.7, color: "#10b981" },
    { segment: "VIP Customers", percentage: 20, avgSpend: 312.89, conversionRate: 24.3, color: "#f59e0b" }
  ];

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  const getTrendIcon = (change: number) => {
    if (change > 0) return <ArrowUp className="w-3 h-3 text-green-600" />;
    if (change < 0) return <ArrowDown className="w-3 h-3 text-red-600" />;
    return <RefreshCw className="w-3 h-3 text-gray-600" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Bundle Analytics</h2>
          <p className="text-muted-foreground">Detailed performance insights for your product bundles</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {["7d", "30d", "90d", "1y"].map((period) => (
              <Button
                key={period}
                variant={selectedTimeframe === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bundle Revenue</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(bundlePerformanceData.reduce((sum, b) => sum + b.revenue, 0))}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+22.8% vs last period</span>
                    </div>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bundle Conversions</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatNumber(bundlePerformanceData.reduce((sum, b) => sum + b.purchases, 0))}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+15.2% vs last period</span>
                    </div>
                  </div>
                  <ShoppingCart className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Bundle AOV</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(bundlePerformanceData.reduce((sum, b) => sum + b.avgOrderValue, 0) / bundlePerformanceData.length)}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+8.4% vs last period</span>
                    </div>
                  </div>
                  <Target className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bundle Conv. Rate</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatPercent(bundlePerformanceData.reduce((sum, b) => sum + b.conversionRate, 0) / bundlePerformanceData.length)}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>+3.7% vs last period</span>
                    </div>
                  </div>
                  <Percent className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bundle Performance List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Bundle Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bundlePerformanceData.map((bundle, index) => (
                  <div key={bundle.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">{bundle.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatNumber(bundle.views)} views</span>
                          <span>{formatNumber(bundle.purchases)} purchases</span>
                          <span>{formatPercent(bundle.conversionRate)} conv.</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatCurrency(bundle.revenue)}</div>
                      <div className="flex items-center gap-1 text-sm">
                        {getTrendIcon(bundle.trends.revenueChange)}
                        <span className={getTrendColor(bundle.trends.revenueChange)}>
                          {formatPercent(Math.abs(bundle.trends.revenueChange))}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bundlePerformanceData.map((bundle) => (
              <Card key={bundle.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{bundle.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{bundle.customerRating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Revenue</div>
                      <div className="text-xl font-bold text-primary">{formatCurrency(bundle.revenue)}</div>
                      <div className={`flex items-center gap-1 text-xs ${getTrendColor(bundle.trends.revenueChange)}`}>
                        {getTrendIcon(bundle.trends.revenueChange)}
                        <span>{formatPercent(Math.abs(bundle.trends.revenueChange))}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Conversions</div>
                      <div className="text-xl font-bold text-green-600">{formatNumber(bundle.purchases)}</div>
                      <div className={`flex items-center gap-1 text-xs ${getTrendColor(bundle.trends.conversionChange)}`}>
                        {getTrendIcon(bundle.trends.conversionChange)}
                        <span>{formatPercent(Math.abs(bundle.trends.conversionChange))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Conversion Rate</span>
                      <span className="font-medium">{formatPercent(bundle.conversionRate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Avg Order Value</span>
                      <span className="font-medium">{formatCurrency(bundle.avgOrderValue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Time on Page</span>
                      <span className="font-medium">{bundle.timeOnPage}s</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Refund Rate</span>
                      <span className="font-medium">{formatPercent(bundle.refundRate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Repeat Purchase</span>
                      <span className="font-medium">{formatPercent(bundle.repeatPurchaseRate)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Add to Cart Rate</span>
                      <span className="text-sm font-medium">
                        {formatPercent((bundle.addToCarts / bundle.views) * 100)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Customer Segments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customerSegments.map((segment) => (
                    <div key={segment.segment} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{segment.segment}</span>
                        <span className="text-sm text-muted-foreground">{segment.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ 
                            width: `${segment.percentage}%`,
                            backgroundColor: segment.color 
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Avg Spend: </span>
                          <span className="font-medium">{formatCurrency(segment.avgSpend)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Conv Rate: </span>
                          <span className="font-medium">{formatPercent(segment.conversionRate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Bundle Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "John D.", orders: 3, spent: 659.97, tier: "VIP" },
                    { name: "Sarah M.", orders: 2, spent: 439.98, tier: "Regular" },
                    { name: "Mike R.", orders: 2, spent: 399.98, tier: "Regular" },
                    { name: "Lisa K.", orders: 1, spent: 219.99, tier: "New" },
                    { name: "David L.", orders: 1, spent: 179.99, tier: "New" }
                  ].map((customer, index) => (
                    <div key={customer.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">#{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.orders} orders</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(customer.spent)}</div>
                        <Badge className={
                          customer.tier === 'VIP' ? 'bg-yellow-100 text-yellow-800' :
                          customer.tier === 'Regular' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }>
                          {customer.tier}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Bundle Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {bundlePerformanceData.map((bundle) => (
                  <div key={bundle.id} className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-3">{bundle.name}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Views Trend</div>
                        <div className={`text-lg font-bold ${getTrendColor(bundle.trends.viewsChange)}`}>
                          {formatPercent(bundle.trends.viewsChange)}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(bundle.trends.viewsChange)}
                          <span className="text-xs text-muted-foreground">vs last period</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Conversion Trend</div>
                        <div className={`text-lg font-bold ${getTrendColor(bundle.trends.conversionChange)}`}>
                          {formatPercent(bundle.trends.conversionChange)}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(bundle.trends.conversionChange)}
                          <span className="text-xs text-muted-foreground">vs last period</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Revenue Trend</div>
                        <div className={`text-lg font-bold ${getTrendColor(bundle.trends.revenueChange)}`}>
                          {formatPercent(bundle.trends.revenueChange)}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(bundle.trends.revenueChange)}
                          <span className="text-xs text-muted-foreground">vs last period</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
