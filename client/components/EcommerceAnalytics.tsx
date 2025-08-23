import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Star,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Award,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

interface AnalyticsData {
  revenue: {
    total: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
    daily: { date: string; revenue: number; orders: number }[];
    monthly: { month: string; revenue: number }[];
  };
  orders: {
    total: number;
    growth: number;
    avgValue: number;
    conversionRate: number;
    byStatus: { status: string; count: number; color: string }[];
  };
  products: {
    totalSold: number;
    topSelling: { id: string; name: string; sold: number; revenue: number }[];
    categoryBreakdown: { category: string; revenue: number; color: string }[];
    lowStock: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
    retention: number;
    lifetime: number;
  };
  performance: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
    cartAbandonment: number;
  };
}

const SAMPLE_ANALYTICS: AnalyticsData = {
  revenue: {
    total: 485720,
    growth: 23.5,
    trend: 'up',
    daily: [
      { date: '2024-02-10', revenue: 15420, orders: 42 },
      { date: '2024-02-11', revenue: 18320, orders: 51 },
      { date: '2024-02-12', revenue: 22150, orders: 63 },
      { date: '2024-02-13', revenue: 19870, orders: 55 },
      { date: '2024-02-14', revenue: 25400, orders: 71 },
      { date: '2024-02-15', revenue: 28300, orders: 78 },
      { date: '2024-02-16', revenue: 31250, orders: 85 },
      { date: '2024-02-17', revenue: 27680, orders: 76 },
      { date: '2024-02-18', revenue: 24920, orders: 68 }
    ],
    monthly: [
      { month: 'Oct', revenue: 145230 },
      { month: 'Nov', revenue: 168940 },
      { month: 'Dec', revenue: 192850 },
      { month: 'Jan', revenue: 234170 },
      { month: 'Feb', revenue: 285430 }
    ]
  },
  orders: {
    total: 1245,
    growth: 18.2,
    avgValue: 389.95,
    conversionRate: 3.2,
    byStatus: [
      { status: 'Delivered', count: 758, color: '#10B981' },
      { status: 'Shipped', count: 234, color: '#3B82F6' },
      { status: 'Processing', count: 156, color: '#F59E0B' },
      { status: 'Cancelled', count: 97, color: '#EF4444' }
    ]
  },
  products: {
    totalSold: 3420,
    topSelling: [
      { id: 'atorvastatin_20mg', name: 'Atorvastatin 20mg', sold: 245, revenue: 7350 },
      { id: 'metformin_500mg', name: 'Metformin 500mg', sold: 198, revenue: 4950 },
      { id: 'omega3_1000mg', name: 'Omega-3 1000mg', sold: 167, revenue: 4175 },
      { id: 'ibuprofen_200mg', name: 'Ibuprofen 200mg', sold: 156, revenue: 2028 },
      { id: 'lisinopril_10mg', name: 'Lisinopril 10mg', sold: 134, revenue: 2680 }
    ],
    categoryBreakdown: [
      { category: 'Cardiovascular', revenue: 125430, color: '#EF4444' },
      { category: 'Diabetes', revenue: 89750, color: '#3B82F6' },
      { category: 'Pain Management', revenue: 67890, color: '#10B981' },
      { category: 'Supplements', revenue: 54320, color: '#F59E0B' },
      { category: 'Mental Health', revenue: 43210, color: '#8B5CF6' },
      { category: 'Other', revenue: 32580, color: '#6B7280' }
    ],
    lowStock: 23
  },
  customers: {
    total: 2847,
    new: 456,
    returning: 689,
    retention: 72.4,
    lifetime: 1250.80
  },
  performance: {
    pageViews: 45620,
    uniqueVisitors: 12340,
    bounceRate: 34.2,
    avgSessionDuration: 4.2,
    cartAbandonment: 68.5
  }
};

interface EcommerceAnalyticsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function EcommerceAnalytics({ isOpen = true, onClose }: EcommerceAnalyticsProps) {
  const [data] = useState<AnalyticsData>(SAMPLE_ANALYTICS);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedTab, setSelectedTab] = useState('overview');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const MetricCard = ({ title, value, change, trend, icon: Icon, prefix = '', suffix = '' }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {prefix}{value}{suffix}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-1">
                {getTrendIcon(trend)}
                <span className={`text-sm ml-1 ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {change > 0 ? '+' : ''}{change}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs last period</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} style={{ color: item.color }}>
              {item.name}: {item.name.includes('Revenue') ? formatCurrency(item.value) : formatNumber(item.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            E-commerce Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive insights into your healthcare e-commerce performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Revenue"
              value={formatNumber(data.revenue.total)}
              change={data.revenue.growth}
              trend={data.revenue.trend}
              icon={DollarSign}
              prefix="$"
            />
            <MetricCard
              title="Total Orders"
              value={formatNumber(data.orders.total)}
              change={data.orders.growth}
              trend="up"
              icon={ShoppingCart}
            />
            <MetricCard
              title="Active Customers"
              value={formatNumber(data.customers.total)}
              change={15.3}
              trend="up"
              icon={Users}
            />
            <MetricCard
              title="Products Sold"
              value={formatNumber(data.products.totalSold)}
              change={22.1}
              trend="up"
              icon={Package}
            />
          </div>

          {/* Revenue Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="w-5 h-5" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.revenue.daily}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.1}
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={data.orders.byStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      dataKey="count"
                      nameKey="status"
                    >
                      {data.orders.byStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {data.orders.byStatus.map((status) => (
                    <div key={status.status} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        <span>{status.status}</span>
                      </div>
                      <span className="font-medium">{status.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="font-medium">{formatPercentage(data.orders.conversionRate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Order Value</span>
                  <span className="font-medium">{formatCurrency(data.orders.avgValue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Customer Retention</span>
                  <span className="font-medium">{formatPercentage(data.customers.retention)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cart Abandonment</span>
                  <span className="font-medium text-red-600">{formatPercentage(data.performance.cartAbandonment)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.products.categoryBreakdown.slice(0, 5).map((category, index) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">#{index + 1}</div>
                        <span className="text-sm">{category.category}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(category.revenue)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue & Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.revenue.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                      name="Revenue"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="orders"
                      stroke="#10B981"
                      name="Orders"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.revenue.monthly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.products.topSelling.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.sold} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(product.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.products.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="revenue"
                      nameKey="category"
                      label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.products.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Customers"
              value={formatNumber(data.customers.total)}
              change={12.5}
              trend="up"
              icon={Users}
            />
            <MetricCard
              title="New Customers"
              value={formatNumber(data.customers.new)}
              change={18.7}
              trend="up"
              icon={Users}
            />
            <MetricCard
              title="Customer Lifetime Value"
              value={formatCurrency(data.customers.lifetime)}
              change={8.3}
              trend="up"
              icon={DollarSign}
            />
          </div>

          {/* Customer Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segmentation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>New Customers</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-4/12 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">{data.customers.new}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Returning Customers</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-8/12 h-2 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">{data.customers.returning}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Retention Rate</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div className="w-9/12 h-2 bg-purple-500 rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">{formatPercentage(data.customers.retention)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Page Views</span>
                  <span className="font-medium">{formatNumber(data.performance.pageViews)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unique Visitors</span>
                  <span className="font-medium">{formatNumber(data.performance.uniqueVisitors)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bounce Rate</span>
                  <span className="font-medium">{formatPercentage(data.performance.bounceRate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Session Duration</span>
                  <span className="font-medium">{data.performance.avgSessionDuration} min</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
