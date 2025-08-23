import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Shield,
  Smartphone,
  Key,
  Fingerprint,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Lock,
  Unlock,
  Settings,
  User,
  Mail,
  Phone,
  QrCode,
  RefreshCw,
  Activity,
  Globe,
  MapPin,
  Calendar,
  Bell,
  Star,
  Info,
} from "lucide-react";

interface AuthMethod {
  id: string;
  type: "password" | "sms" | "totp" | "biometric" | "hardware_token";
  name: string;
  description: string;
  isEnabled: boolean;
  isConfigured: boolean;
  lastUsed?: Date;
  backupCodes?: string[];
}

interface SecurityEvent {
  id: string;
  type:
    | "login"
    | "failed_login"
    | "password_change"
    | "mfa_setup"
    | "suspicious_activity";
  timestamp: Date;
  location: string;
  device: string;
  ipAddress: string;
  success: boolean;
  details: string;
}

interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActivity: Date;
  isCurrent: boolean;
  isActive: boolean;
}

export function EnhancedAuth() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "methods" | "sessions" | "audit"
  >("overview");
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");

  const authMethods: AuthMethod[] = [
    {
      id: "1",
      type: "password",
      name: "Password",
      description: "Your account password with complexity requirements",
      isEnabled: true,
      isConfigured: true,
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "2",
      type: "totp",
      name: "Authenticator App",
      description: "Google Authenticator, Authy, or similar TOTP app",
      isEnabled: true,
      isConfigured: true,
      lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000),
      backupCodes: ["ABC123", "DEF456", "GHI789", "JKL012", "MNO345"],
    },
    {
      id: "3",
      type: "sms",
      name: "SMS Verification",
      description: "Text message codes to your registered phone",
      isEnabled: true,
      isConfigured: true,
      lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      id: "4",
      type: "biometric",
      name: "Biometric Authentication",
      description: "Fingerprint or facial recognition",
      isEnabled: false,
      isConfigured: false,
    },
    {
      id: "5",
      type: "hardware_token",
      name: "Hardware Security Key",
      description: "YubiKey or similar FIDO2 security key",
      isEnabled: false,
      isConfigured: false,
    },
  ];

  const securityEvents: SecurityEvent[] = [
    {
      id: "1",
      type: "login",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      location: "San Francisco, CA",
      device: "Chrome on Windows",
      ipAddress: "192.168.1.100",
      success: true,
      details: "Successful login with TOTP verification",
    },
    {
      id: "2",
      type: "failed_login",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      location: "Unknown",
      device: "Chrome on Android",
      ipAddress: "203.0.113.45",
      success: false,
      details: "Failed login attempt - incorrect TOTP code",
    },
    {
      id: "3",
      type: "mfa_setup",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      location: "San Francisco, CA",
      device: "Safari on macOS",
      ipAddress: "192.168.1.100",
      success: true,
      details: "TOTP authenticator app configured",
    },
    {
      id: "4",
      type: "password_change",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      location: "San Francisco, CA",
      device: "Chrome on Windows",
      ipAddress: "192.168.1.100",
      success: true,
      details: "Password updated successfully",
    },
  ];

  const activeSessions: Session[] = [
    {
      id: "1",
      device: "Windows PC",
      browser: "Chrome 120.0",
      location: "San Francisco, CA",
      ipAddress: "192.168.1.100",
      lastActivity: new Date(Date.now() - 10 * 60 * 1000),
      isCurrent: true,
      isActive: true,
    },
    {
      id: "2",
      device: "iPhone 15",
      browser: "Safari Mobile",
      location: "San Francisco, CA",
      ipAddress: "192.168.1.101",
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isCurrent: false,
      isActive: true,
    },
    {
      id: "3",
      device: "iPad Pro",
      browser: "Safari",
      location: "San Francisco, CA",
      ipAddress: "192.168.1.102",
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isCurrent: false,
      isActive: false,
    },
  ];

  const getMethodIcon = (type: string) => {
    switch (type) {
      case "password":
        return <Key className="w-4 h-4" />;
      case "sms":
        return <Phone className="w-4 h-4" />;
      case "totp":
        return <Smartphone className="w-4 h-4" />;
      case "biometric":
        return <Fingerprint className="w-4 h-4" />;
      case "hardware_token":
        return <Shield className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "login":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed_login":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "password_change":
        return <Key className="w-4 h-4 text-blue-500" />;
      case "mfa_setup":
        return <Shield className="w-4 h-4 text-purple-500" />;
      case "suspicious_activity":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string, success: boolean) => {
    if (!success) return "bg-red-100 text-red-800 border-red-200";
    switch (type) {
      case "login":
        return "bg-green-100 text-green-800 border-green-200";
      case "password_change":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "mfa_setup":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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

  const securityScore = 85; // Calculate based on enabled methods and security practices
  const enabledMethods = authMethods.filter((m) => m.isEnabled).length;
  const configuredMethods = authMethods.filter((m) => m.isConfigured).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass-morphism border border-border/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-foreground flex items-center">
              <Shield className="w-6 h-6 mr-2 text-primary" />
              Enhanced Authentication & Security
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Security Score: {securityScore}%
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <div className="flex space-x-2 mt-4">
            {["overview", "methods", "sessions", "audit"].map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab as any)}
                className={
                  activeTab === tab ? "gradient-bg text-white border-0" : ""
                }
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Security Overview */}
          <div className="lg:col-span-2">
            <Card className="glass-morphism border border-border/20 mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 gradient-bg rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {securityScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Security Score
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-blue-500 rounded-full flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {enabledMethods}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Auth Methods
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {activeSessions.filter((s) => s.isActive).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Sessions
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="glass-morphism p-4 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-foreground">
                        Multi-Factor Authentication Enabled
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your account is protected with multiple authentication
                      methods
                    </p>
                  </div>

                  <div className="glass-morphism p-4 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-foreground">
                        Session Management Active
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All active sessions are monitored and can be remotely
                      terminated
                    </p>
                  </div>

                  <div className="glass-morphism p-4 rounded-xl">
                    <div className="flex items-center space-x-3 mb-2">
                      <Activity className="w-5 h-5 text-purple-500" />
                      <span className="font-medium text-foreground">
                        Security Monitoring
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Continuous monitoring for suspicious activities and login
                      attempts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="glass-morphism border border-border/20 mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Key className="w-4 h-4 mr-3" />
                    Change Password
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Smartphone className="w-4 h-4 mr-3" />
                    Setup Authenticator
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <QrCode className="w-4 h-4 mr-3" />
                    View Backup Codes
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Globe className="w-4 h-4 mr-3" />
                    Manage Sessions
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="w-4 h-4 mr-3" />
                    View Security Log
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Security Events */}
            <Card className="glass-morphism border border-border/20">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-foreground">
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="glass-morphism p-3 rounded-lg"
                    >
                      <div className="flex items-center space-x-3 mb-1">
                        {getEventIcon(event.type)}
                        <span className="text-sm font-medium text-foreground">
                          {event.type
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <Badge
                          className={getEventColor(event.type, event.success)}
                        >
                          {event.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(event.timestamp)} • {event.location}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "methods" && (
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">
              Authentication Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {authMethods.map((method) => (
                <div key={method.id} className="glass-morphism p-6 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                        {getMethodIcon(method.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {method.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                        {method.lastUsed && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Last used: {formatTimeAgo(method.lastUsed)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        className={
                          method.isEnabled
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {method.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Button
                        variant={method.isEnabled ? "outline" : "default"}
                        size="sm"
                        className={
                          !method.isEnabled
                            ? "gradient-bg text-white border-0"
                            : ""
                        }
                      >
                        {method.isEnabled ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>

                  {method.type === "totp" && method.isConfigured && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="glass-morphism p-4 rounded-lg">
                        <h4 className="font-medium text-foreground mb-2">
                          Enter TOTP Code
                        </h4>
                        <div className="flex space-x-2">
                          <Input
                            placeholder="000000"
                            value={totpCode}
                            onChange={(e) => setTotpCode(e.target.value)}
                            maxLength={6}
                          />
                          <Button size="sm">Verify</Button>
                        </div>
                      </div>
                      <div className="glass-morphism p-4 rounded-lg">
                        <h4 className="font-medium text-foreground mb-2">
                          Backup Codes
                        </h4>
                        <div className="text-xs text-muted-foreground">
                          {method.backupCodes?.length || 0} unused codes
                          remaining
                        </div>
                        <Button variant="outline" size="sm" className="mt-2">
                          <Eye className="w-4 h-4 mr-2" />
                          View Codes
                        </Button>
                      </div>
                    </div>
                  )}

                  {method.type === "password" && method.isConfigured && (
                    <div className="glass-morphism p-4 rounded-lg mt-4">
                      <h4 className="font-medium text-foreground mb-2">
                        Password Security
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-muted-foreground">
                            Minimum 12 characters
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-muted-foreground">
                            Mixed case letters
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-muted-foreground">
                            Numbers and symbols
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Key className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "sessions" && (
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div key={session.id} className="glass-morphism p-6 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-foreground">
                            {session.device}
                          </h3>
                          {session.isCurrent && (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              Current Session
                            </Badge>
                          )}
                          {!session.isActive && (
                            <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.browser}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{session.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Globe className="w-3 h-3" />
                            <span>{session.ipAddress}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              Last active: {formatTimeAgo(session.lastActivity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!session.isCurrent && (
                        <Button variant="outline" size="sm">
                          <AlertTriangle className="w-4 h-4 mr-2" />
                          Terminate
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "audit" && (
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">
              Security Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {securityEvents.map((event) => (
                <div key={event.id} className="glass-morphism p-6 rounded-xl">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">
                          {event.type
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </h3>
                        <Badge
                          className={getEventColor(event.type, event.success)}
                        >
                          {event.success ? "Success" : "Failed"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {event.details}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-muted-foreground">
                        <div>
                          <div className="font-medium">Time</div>
                          <div>{event.timestamp.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="font-medium">Location</div>
                          <div>{event.location}</div>
                        </div>
                        <div>
                          <div className="font-medium">Device</div>
                          <div>{event.device}</div>
                        </div>
                        <div>
                          <div className="font-medium">IP Address</div>
                          <div>{event.ipAddress}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
