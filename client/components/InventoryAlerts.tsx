import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertTriangle,
  Bell,
  BellOff,
  Package,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { SAMPLE_PRODUCTS } from "../data/products";

interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  alertType:
    | "low_stock"
    | "out_of_stock"
    | "expiring"
    | "overstock"
    | "reorder_needed";
  threshold: number;
  currentValue: number;
  priority: "low" | "medium" | "high" | "critical";
  message: string;
  isActive: boolean;
  notificationMethods: ("email" | "sms" | "push" | "dashboard")[];
  createdAt: string;
  triggeredAt?: string;
  resolvedAt?: string;
  assignedTo?: string;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  alertType: InventoryAlert["alertType"];
  condition: "less_than" | "greater_than" | "equals" | "between";
  threshold: number;
  secondaryThreshold?: number;
  isActive: boolean;
  notificationMethods: ("email" | "sms" | "push" | "dashboard")[];
  recipients: string[];
  frequency: "immediate" | "hourly" | "daily" | "weekly";
}

const SAMPLE_ALERTS: InventoryAlert[] = [
  {
    id: "alert_1",
    productId: "atorvastatin_20mg",
    productName: "Atorvastatin 20mg",
    alertType: "low_stock",
    threshold: 50,
    currentValue: 25,
    priority: "high",
    message: "Stock level has fallen below minimum threshold",
    isActive: true,
    notificationMethods: ["email", "dashboard"],
    createdAt: "2024-02-15T10:30:00Z",
    triggeredAt: "2024-02-17T14:20:00Z",
  },
  {
    id: "alert_2",
    productId: "metformin_500mg",
    productName: "Metformin 500mg",
    alertType: "reorder_needed",
    threshold: 100,
    currentValue: 95,
    priority: "medium",
    message: "Product has reached reorder point",
    isActive: true,
    notificationMethods: ["email", "push"],
    createdAt: "2024-02-16T09:15:00Z",
    triggeredAt: "2024-02-18T11:45:00Z",
  },
  {
    id: "alert_3",
    productId: "omega3_1000mg",
    productName: "Omega-3 Fish Oil 1000mg",
    alertType: "expiring",
    threshold: 30,
    currentValue: 15,
    priority: "critical",
    message: "Products expiring in 15 days",
    isActive: true,
    notificationMethods: ["email", "sms", "dashboard"],
    createdAt: "2024-02-10T08:00:00Z",
    triggeredAt: "2024-02-18T09:30:00Z",
  },
];

const SAMPLE_ALERT_RULES: AlertRule[] = [
  {
    id: "rule_1",
    name: "Low Stock Alert",
    description: "Trigger when stock falls below minimum threshold",
    alertType: "low_stock",
    condition: "less_than",
    threshold: 50,
    isActive: true,
    notificationMethods: ["email", "dashboard"],
    recipients: ["inventory@company.com", "manager@company.com"],
    frequency: "immediate",
  },
  {
    id: "rule_2",
    name: "Reorder Point Alert",
    description: "Trigger when stock reaches reorder point",
    alertType: "reorder_needed",
    condition: "less_than",
    threshold: 100,
    isActive: true,
    notificationMethods: ["email", "push"],
    recipients: ["purchasing@company.com"],
    frequency: "immediate",
  },
  {
    id: "rule_3",
    name: "Expiration Warning",
    description: "Alert when products are expiring soon",
    alertType: "expiring",
    condition: "less_than",
    threshold: 30,
    isActive: true,
    notificationMethods: ["email", "sms"],
    recipients: ["pharmacy@company.com", "manager@company.com"],
    frequency: "daily",
  },
];

interface InventoryAlertsProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function InventoryAlerts({
  isOpen = true,
  onClose,
}: InventoryAlertsProps) {
  const [alerts, setAlerts] = useState<InventoryAlert[]>(SAMPLE_ALERTS);
  const [alertRules, setAlertRules] = useState<AlertRule[]>(SAMPLE_ALERT_RULES);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAlert, setSelectedAlert] = useState<InventoryAlert | null>(
    null,
  );
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority =
      priorityFilter === "all" || alert.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && alert.isActive && !alert.resolvedAt) ||
      (statusFilter === "resolved" && alert.resolvedAt);

    return matchesSearch && matchesPriority && matchesStatus;
  });

  const getPriorityColor = (priority: InventoryAlert["priority"]) => {
    switch (priority) {
      case "critical":
        return "text-red-600 bg-red-100";
      case "high":
        return "text-orange-600 bg-orange-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getAlertTypeIcon = (type: InventoryAlert["alertType"]) => {
    switch (type) {
      case "low_stock":
        return <TrendingDown className="w-4 h-4" />;
      case "out_of_stock":
        return <XCircle className="w-4 h-4" />;
      case "expiring":
        return <Clock className="w-4 h-4" />;
      case "reorder_needed":
        return <RefreshCw className="w-4 h-4" />;
      case "overstock":
        return <Package className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return (
      new Date(dateString).toLocaleDateString() +
      " " +
      new Date(dateString).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? { ...alert, resolvedAt: new Date().toISOString(), isActive: false }
          : alert,
      ),
    );
  };

  const dismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-8 h-8 text-primary" />
            Inventory Alerts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage inventory alerts and notifications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsRuleDialogOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Alert Rules
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active Alerts
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter((a) => a.isActive && !a.resolvedAt).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Critical
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {
                    alerts.filter(
                      (a) => a.priority === "critical" && a.isActive,
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/20">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Resolved Today
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {
                    alerts.filter(
                      (a) =>
                        a.resolvedAt &&
                        new Date(a.resolvedAt).toDateString() ===
                          new Date().toDateString(),
                    ).length
                  }
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Alert Rules
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {alertRules.filter((r) => r.isActive).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Alerts ({filteredAlerts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length > 0 ? (
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${getPriorityColor(alert.priority)}`}
                    >
                      {getAlertTypeIcon(alert.alertType)}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {alert.productName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          className={`text-xs ${getPriorityColor(alert.priority)}`}
                        >
                          {alert.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {alert.triggeredAt
                            ? `Triggered: ${formatDate(alert.triggeredAt)}`
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedAlert(alert);
                        setIsDetailDialogOpen(true);
                      }}
                    >
                      View
                    </Button>
                    {alert.isActive && !alert.resolvedAt && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissAlert(alert.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No alerts found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ||
                priorityFilter !== "all" ||
                statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "All systems are running smoothly"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      {selectedAlert && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getAlertTypeIcon(selectedAlert.alertType)}
                Alert Details
              </DialogTitle>
              <DialogDescription>
                {selectedAlert.productName} -{" "}
                {selectedAlert.alertType.replace("_", " ")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product</Label>
                  <p className="font-medium">{selectedAlert.productName}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={getPriorityColor(selectedAlert.priority)}>
                    {selectedAlert.priority.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label>Threshold</Label>
                  <p>{selectedAlert.threshold}</p>
                </div>
                <div>
                  <Label>Current Value</Label>
                  <p className="font-medium">{selectedAlert.currentValue}</p>
                </div>
                <div>
                  <Label>Created</Label>
                  <p>{formatDate(selectedAlert.createdAt)}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <p>{selectedAlert.resolvedAt ? "Resolved" : "Active"}</p>
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {selectedAlert.message}
                </p>
              </div>
              <div>
                <Label>Notification Methods</Label>
                <div className="flex gap-2 mt-1">
                  {selectedAlert.notificationMethods.map((method) => (
                    <Badge key={method} variant="outline">
                      {method === "email" && <Mail className="w-3 h-3 mr-1" />}
                      {method === "sms" && (
                        <Smartphone className="w-3 h-3 mr-1" />
                      )}
                      {method === "push" && <Bell className="w-3 h-3 mr-1" />}
                      {method === "dashboard" && (
                        <Settings className="w-3 h-3 mr-1" />
                      )}
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDetailDialogOpen(false)}
              >
                Close
              </Button>
              {selectedAlert.isActive && !selectedAlert.resolvedAt && (
                <Button
                  onClick={() => {
                    resolveAlert(selectedAlert.id);
                    setIsDetailDialogOpen(false);
                  }}
                >
                  Mark as Resolved
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
