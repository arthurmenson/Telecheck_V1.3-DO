import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
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
import { Switch } from "./ui/switch";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  RefreshCw,
  Calendar as CalendarIcon,
  Package,
  CreditCard,
  Truck,
  Pause,
  Play,
  Edit,
  Trash2,
  Plus,
  Clock,
  Star,
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Activity,
  Gift,
  Award,
  Settings,
  Bell,
  Info,
  Download,
  Eye,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react";
import { format, addDays, addWeeks, addMonths, addQuarters } from "date-fns";

interface Subscription {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  brand?: string;
  dosage: string;
  quantity: number;
  unitPrice: number;
  discountedPrice: number;
  savings: number;
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "custom";
  customFrequencyDays?: number;
  status: "active" | "paused" | "cancelled" | "expired";
  nextDelivery: string;
  lastDelivery?: string;
  deliveryCount: number;
  totalSavings: number;
  autoRefill: boolean;
  prescriptionRequired: boolean;
  prescriberId?: string;
  prescriberName?: string;
  refillsRemaining?: number;
  shippingMethod: "standard" | "express" | "overnight";
  paymentMethod: string;
  adherenceScore: number;
  createdAt: string;
  modifiedAt: string;
}

interface SubscriptionManagerProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// Sample subscription data
const SAMPLE_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "sub_1",
    productId: "atorvastatin_20mg",
    productName: "Atorvastatin",
    brand: "Lipitor",
    dosage: "20mg",
    quantity: 90,
    unitPrice: 29.99,
    discountedPrice: 25.49,
    savings: 4.5,
    frequency: "monthly",
    status: "active",
    nextDelivery: "2024-02-15",
    lastDelivery: "2024-01-15",
    deliveryCount: 6,
    totalSavings: 27.0,
    autoRefill: true,
    prescriptionRequired: true,
    prescriberId: "dr_smith_123",
    prescriberName: "Dr. Sarah Smith",
    refillsRemaining: 4,
    shippingMethod: "standard",
    paymentMethod: "card_ending_1234",
    adherenceScore: 95,
    createdAt: "2023-08-15",
    modifiedAt: "2024-01-15",
  },
  {
    id: "sub_2",
    productId: "metformin_500mg",
    productName: "Metformin",
    brand: "Glucophage",
    dosage: "500mg",
    quantity: 180,
    unitPrice: 24.99,
    discountedPrice: 19.99,
    savings: 5.0,
    frequency: "monthly",
    status: "active",
    nextDelivery: "2024-02-20",
    lastDelivery: "2024-01-20",
    deliveryCount: 4,
    totalSavings: 20.0,
    autoRefill: true,
    prescriptionRequired: true,
    prescriberId: "dr_johnson_456",
    prescriberName: "Dr. Michael Johnson",
    refillsRemaining: 2,
    shippingMethod: "standard",
    paymentMethod: "card_ending_5678",
    adherenceScore: 88,
    createdAt: "2023-10-20",
    modifiedAt: "2024-01-20",
  },
  {
    id: "sub_3",
    productId: "omega3_1000mg",
    productName: "Omega-3 Fish Oil",
    dosage: "1000mg",
    quantity: 120,
    unitPrice: 24.99,
    discountedPrice: 21.24,
    savings: 3.75,
    frequency: "quarterly",
    status: "active",
    nextDelivery: "2024-03-10",
    lastDelivery: "2023-12-10",
    deliveryCount: 3,
    totalSavings: 11.25,
    autoRefill: true,
    prescriptionRequired: false,
    shippingMethod: "standard",
    paymentMethod: "card_ending_9012",
    adherenceScore: 92,
    createdAt: "2023-09-10",
    modifiedAt: "2023-12-10",
  },
  {
    id: "sub_4",
    productId: "sertraline_50mg",
    productName: "Sertraline",
    brand: "Zoloft",
    dosage: "50mg",
    quantity: 30,
    unitPrice: 34.99,
    discountedPrice: 29.74,
    savings: 5.25,
    frequency: "monthly",
    status: "paused",
    nextDelivery: "2024-02-25",
    lastDelivery: "2024-01-25",
    deliveryCount: 2,
    totalSavings: 10.5,
    autoRefill: false,
    prescriptionRequired: true,
    prescriberId: "dr_wilson_789",
    prescriberName: "Dr. Emily Wilson",
    refillsRemaining: 3,
    shippingMethod: "express",
    paymentMethod: "card_ending_3456",
    adherenceScore: 75,
    createdAt: "2023-11-25",
    modifiedAt: "2024-01-25",
  },
];

export function SubscriptionManager({
  isOpen = true,
  onClose,
}: SubscriptionManagerProps) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(SAMPLE_SUBSCRIPTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);

  // Calculate subscription metrics
  const subscriptionMetrics = useMemo(() => {
    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === "active",
    );
    const pausedSubscriptions = subscriptions.filter(
      (s) => s.status === "paused",
    );
    const monthlySpend = activeSubscriptions.reduce((total, sub) => {
      const monthlyPrice =
        sub.frequency === "monthly"
          ? sub.discountedPrice
          : sub.frequency === "quarterly"
            ? sub.discountedPrice / 3
            : sub.frequency === "weekly"
              ? sub.discountedPrice * 4
              : sub.discountedPrice;
      return total + monthlyPrice;
    }, 0);
    const totalSavings = subscriptions.reduce(
      (total, sub) => total + sub.totalSavings,
      0,
    );
    const avgAdherence =
      subscriptions.reduce((total, sub) => total + sub.adherenceScore, 0) /
      subscriptions.length;

    return {
      totalSubscriptions: subscriptions.length,
      activeCount: activeSubscriptions.length,
      pausedCount: pausedSubscriptions.length,
      monthlySpend,
      totalSavings,
      avgAdherence: Math.round(avgAdherence),
    };
  }, [subscriptions]);

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    let filtered = subscriptions;

    if (searchQuery) {
      filtered = filtered.filter(
        (sub) =>
          sub.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sub.prescriberName?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    return filtered.sort(
      (a, b) =>
        new Date(a.nextDelivery).getTime() - new Date(b.nextDelivery).getTime(),
    );
  }, [subscriptions, searchQuery, statusFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const getStatusColor = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return "text-green-600";
      case "paused":
        return "text-yellow-600";
      case "cancelled":
        return "text-red-600";
      case "expired":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusBadge = (status: Subscription["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">Paused</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getFrequencyText = (
    frequency: Subscription["frequency"],
    customDays?: number,
  ) => {
    switch (frequency) {
      case "weekly":
        return "Weekly";
      case "biweekly":
        return "Every 2 weeks";
      case "monthly":
        return "Monthly";
      case "quarterly":
        return "Quarterly";
      case "custom":
        return customDays ? `Every ${customDays} days` : "Custom";
      default:
        return frequency;
    }
  };

  const getDaysUntilDelivery = (deliveryDate: string) => {
    const today = new Date();
    const delivery = new Date(deliveryDate);
    const diffTime = delivery.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return `${diffDays} days`;
  };

  const handlePauseSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsPauseDialogOpen(true);
  };

  const handleCancelSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setIsCancelDialogOpen(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription({ ...subscription });
    setIsEditDialogOpen(true);
  };

  const confirmPause = () => {
    if (selectedSubscription) {
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSubscription.id
            ? { ...sub, status: "paused" as const }
            : sub,
        ),
      );
      setIsPauseDialogOpen(false);
      setSelectedSubscription(null);
    }
  };

  const confirmCancel = () => {
    if (selectedSubscription) {
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSubscription.id
            ? { ...sub, status: "cancelled" as const }
            : sub,
        ),
      );
      setIsCancelDialogOpen(false);
      setSelectedSubscription(null);
    }
  };

  const saveSubscriptionChanges = () => {
    if (editingSubscription) {
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === editingSubscription.id
            ? { ...editingSubscription, modifiedAt: new Date().toISOString() }
            : sub,
        ),
      );
      setIsEditDialogOpen(false);
      setEditingSubscription(null);
    }
  };

  const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color = "blue",
  }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {trend && (
              <div
                className={`flex items-center text-sm ${trend.positive ? "text-green-600" : "text-red-600"}`}
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                {trend.value}
              </div>
            )}
          </div>
          <div
            className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20`}
          >
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SubscriptionCard = ({
    subscription,
  }: {
    subscription: Subscription;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {subscription.productName}
              </h3>
              {subscription.brand && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subscription.brand} • {subscription.dosage}
                </p>
              )}
              <div className="flex items-center gap-2 mt-1">
                {getStatusBadge(subscription.status)}
                {subscription.prescriptionRequired && (
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Rx
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {formatPrice(subscription.discountedPrice)}
            </p>
            {subscription.savings > 0 && (
              <p className="text-sm text-green-600">
                Save {formatPrice(subscription.savings)}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Frequency
            </p>
            <p className="font-medium">
              {getFrequencyText(
                subscription.frequency,
                subscription.customFrequencyDays,
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quantity</p>
            <p className="font-medium">{subscription.quantity} pills</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Next Delivery
            </p>
            <p className="font-medium">
              {formatDate(subscription.nextDelivery)}
              <span className="text-sm text-gray-500 ml-1">
                ({getDaysUntilDelivery(subscription.nextDelivery)})
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Adherence
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    subscription.adherenceScore >= 80
                      ? "bg-green-500"
                      : subscription.adherenceScore >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${subscription.adherenceScore}%` }}
                />
              </div>
              <span className="text-sm font-medium">
                {subscription.adherenceScore}%
              </span>
            </div>
          </div>
        </div>

        {subscription.prescriptionRequired &&
          subscription.refillsRemaining !== undefined && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {subscription.refillsRemaining} refills remaining
                </span>
              </div>
              {subscription.prescriberName && (
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Prescribed by {subscription.prescriberName}
                </p>
              )}
            </div>
          )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditSubscription(subscription)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            {subscription.status === "active" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePauseSubscription(subscription)}
              >
                <Pause className="w-4 h-4 mr-1" />
                Pause
              </Button>
            ) : subscription.status === "paused" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubscriptions((prev) =>
                    prev.map((sub) =>
                      sub.id === subscription.id
                        ? { ...sub, status: "active" as const }
                        : sub,
                    ),
                  );
                }}
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </Button>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSubscription(subscription)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCancelSubscription(subscription)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Subscription Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your medication subscriptions and auto-refills
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Subscription
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Subscriptions"
          value={subscriptionMetrics.activeCount}
          icon={RefreshCw}
          color="green"
        />
        <MetricCard
          title="Monthly Spend"
          value={formatPrice(subscriptionMetrics.monthlySpend)}
          icon={DollarSign}
          trend={{ positive: false, value: "-8.2%" }}
          color="blue"
        />
        <MetricCard
          title="Total Savings"
          value={formatPrice(subscriptionMetrics.totalSavings)}
          icon={Gift}
          trend={{ positive: true, value: "+24.5%" }}
          color="green"
        />
        <MetricCard
          title="Avg. Adherence"
          value={`${subscriptionMetrics.avgAdherence}%`}
          icon={Activity}
          color="purple"
        />
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Grid */}
      {filteredSubscriptions.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No subscriptions found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start saving with automatic medication deliveries"}
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Subscription
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Upcoming Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredSubscriptions
              .filter((sub) => sub.status === "active")
              .slice(0, 5)
              .map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {subscription.productName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subscription.quantity} pills •{" "}
                        {formatPrice(subscription.discountedPrice)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(subscription.nextDelivery)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {getDaysUntilDelivery(subscription.nextDelivery)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Subscription Dialog */}
      {editingSubscription && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>
                Modify your subscription settings for{" "}
                {editingSubscription.productName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select
                    value={editingSubscription.frequency}
                    onValueChange={(value) =>
                      setEditingSubscription((prev) =>
                        prev
                          ? {
                              ...prev,
                              frequency: value as Subscription["frequency"],
                            }
                          : null,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Every 2 weeks</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={editingSubscription.quantity}
                    onChange={(e) =>
                      setEditingSubscription((prev) =>
                        prev
                          ? { ...prev, quantity: Number(e.target.value) }
                          : null,
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Shipping Method</Label>
                <Select
                  value={editingSubscription.shippingMethod}
                  onValueChange={(value) =>
                    setEditingSubscription((prev) =>
                      prev
                        ? {
                            ...prev,
                            shippingMethod:
                              value as Subscription["shippingMethod"],
                          }
                        : null,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard (FREE)</SelectItem>
                    <SelectItem value="express">Express (+$15.99)</SelectItem>
                    <SelectItem value="overnight">
                      Overnight (+$25.99)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingSubscription.autoRefill}
                  onCheckedChange={(checked) =>
                    setEditingSubscription((prev) =>
                      prev ? { ...prev, autoRefill: checked } : null,
                    )
                  }
                />
                <Label>Auto-refill when running low</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={saveSubscriptionChanges}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Pause Confirmation Dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to pause your subscription for{" "}
              {selectedSubscription?.productName}? You can resume it anytime.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPauseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmPause}>Pause Subscription</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription for{" "}
              {selectedSubscription?.productName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Keep Subscription
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Cancel Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
