import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Info,
  Clock,
  X,
  Eye,
  Archive,
  Filter,
  Settings,
  Zap,
  Heart,
  Brain,
  Pill,
  TestTube,
  Shield,
  Phone,
  MessageCircle,
  Calendar,
  TrendingUp,
  Star,
  Sparkles,
} from "lucide-react";

interface Notification {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  category: "clinical" | "medication" | "lab" | "system" | "collaboration";
  title: string;
  message: string;
  timestamp: Date;
  priority: "high" | "medium" | "low";
  isRead: boolean;
  isArchived: boolean;
  actionRequired: boolean;
  source: string;
  relatedPatientId?: string;
  escalationLevel?: number;
  metadata?: Record<string, any>;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "critical",
      category: "clinical",
      title: "Critical Drug Interaction Detected",
      message:
        "High-risk interaction between Warfarin and new NSAID prescription detected for Patient #12345. Immediate review required.",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      priority: "high",
      isRead: false,
      isArchived: false,
      actionRequired: true,
      source: "Clinical Decision Support",
      relatedPatientId: "12345",
      escalationLevel: 1,
      metadata: { interaction: "Warfarin + Ibuprofen", riskLevel: "Major" },
    },
    {
      id: "2",
      type: "warning",
      category: "medication",
      title: "PGx Incompatibility Alert",
      message:
        "Patient shows CYP2D6 poor metabolizer phenotype. Codeine prescription may be ineffective.",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      priority: "high",
      isRead: false,
      isArchived: false,
      actionRequired: true,
      source: "Pharmacogenomics Engine",
      relatedPatientId: "12345",
      metadata: { gene: "CYP2D6", phenotype: "Poor Metabolizer" },
    },
    {
      id: "3",
      type: "info",
      category: "lab",
      title: "Lab Results Available",
      message:
        "New comprehensive metabolic panel results are ready for review. Cholesterol levels show 15% improvement.",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      priority: "medium",
      isRead: true,
      isArchived: false,
      actionRequired: false,
      source: "LabCorp Integration",
      relatedPatientId: "12345",
      metadata: { tests: ["CMP", "Lipid Panel"], improvement: "15%" },
    },
    {
      id: "4",
      type: "warning",
      category: "collaboration",
      title: "Provider Consultation Requested",
      message:
        "Dr. Johnson requested medication review consultation for complex polypharmacy case.",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      priority: "medium",
      isRead: false,
      isArchived: false,
      actionRequired: true,
      source: "Provider Network",
      metadata: { requester: "Dr. Johnson", urgency: "routine" },
    },
    {
      id: "5",
      type: "success",
      category: "system",
      title: "AI Model Update Complete",
      message:
        "Drug interaction prediction model updated with latest clinical evidence. Accuracy improved to 97.3%.",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      priority: "low",
      isRead: true,
      isArchived: false,
      actionRequired: false,
      source: "AI Engine",
      metadata: { version: "2.1.5", accuracy: "97.3%" },
    },
  ]);

  const [filter, setFilter] = useState<
    "all" | "unread" | "actionRequired" | "critical"
  >("all");
  const [isOpen, setIsOpen] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "clinical":
        return <Heart className="w-4 h-4" />;
      case "medication":
        return <Pill className="w-4 h-4" />;
      case "lab":
        return <TestTube className="w-4 h-4" />;
      case "collaboration":
        return <MessageCircle className="w-4 h-4" />;
      case "system":
        return <Settings className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "success":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif,
      ),
    );
  };

  const archiveNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isArchived: true } : notif,
      ),
    );
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (notif.isArchived) return false;
    switch (filter) {
      case "unread":
        return !notif.isRead;
      case "actionRequired":
        return notif.actionRequired;
      case "critical":
        return notif.type === "critical";
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(
    (n) => !n.isRead && !n.isArchived,
  ).length;
  const criticalCount = notifications.filter(
    (n) => n.type === "critical" && !n.isArchived,
  ).length;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover-lift"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-red-500 text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 max-h-[600px] overflow-hidden z-50">
          <Card className="glass-morphism border border-border/20 shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-foreground flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Notifications
                  {criticalCount > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white animate-pulse">
                      {criticalCount} Critical
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex space-x-2 mt-3">
                {["all", "unread", "actionRequired", "critical"].map(
                  (filterOption) => (
                    <Button
                      key={filterOption}
                      variant={filter === filterOption ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(filterOption as any)}
                      className={`text-xs ${filter === filterOption ? "gradient-bg text-white border-0" : ""}`}
                    >
                      {filterOption.charAt(0).toUpperCase() +
                        filterOption.slice(1).replace(/([A-Z])/g, " $1")}
                    </Button>
                  ),
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {filteredNotifications.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications match your filter</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-border/10 hover:bg-accent/50 transition-colors cursor-pointer ${
                          !notification.isRead ? "bg-primary/5" : ""
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 flex items-center space-x-2">
                            {getTypeIcon(notification.type)}
                            {getCategoryIcon(notification.category)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {notification.title}
                              </p>
                              <div className="flex items-center space-x-1">
                                <Badge
                                  className={`text-xs ${getTypeColor(notification.type)}`}
                                >
                                  {notification.type}
                                </Badge>
                                {notification.actionRequired && (
                                  <Zap className="w-3 h-3 text-primary animate-pulse" />
                                )}
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatTimeAgo(notification.timestamp)}
                                </span>
                                <span>•</span>
                                <span>{notification.source}</span>
                              </div>

                              <div className="flex items-center space-x-1">
                                {notification.actionRequired && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2"
                                  >
                                    <Star className="w-3 h-3 mr-1" />
                                    <span className="text-xs">Action</span>
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    archiveNotification(notification.id);
                                  }}
                                >
                                  <Archive className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border/20 bg-muted/20">
                <div className="flex items-center justify-between">
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Settings className="w-3 h-3 mr-1" />
                    Settings
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Eye className="w-3 h-3 mr-1" />
                    View All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
