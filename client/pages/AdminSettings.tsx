import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { useToast } from "../hooks/use-toast";
import { messagingAdminService } from "../services/messagingAdmin.service";

interface MessagingConfig {
  telnyxApiKey: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhoneNumber: string;
  telnyxPhoneNumber: string;
  primaryMessagingProvider: string;
  enableSMSNotifications: boolean;
  enableVoiceNotifications: boolean;
  enableScheduledMessaging: boolean;
  messageAuditLogging: boolean;
  messagingQuietHoursStart: string;
  messagingQuietHoursEnd: string;
  maxRetryAttempts: number;
  retryDelayMinutes: number;
}

interface MessagingAnalytics {
  totalMessages: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  averageResponseTime: number;
}

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AdminSettings() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("general");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Password management state
  const [passwordForm, setPasswordForm] = useState<PasswordChangeForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const [messagingConfig, setMessagingConfig] = useState<MessagingConfig>({
    telnyxApiKey: "YOUR_TELNYX_API_KEY_HERE",
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioPhoneNumber: "",
    telnyxPhoneNumber: "",
    primaryMessagingProvider: "telnyx",
    enableSMSNotifications: true,
    enableVoiceNotifications: false,
    enableScheduledMessaging: true,
    messageAuditLogging: true,
    messagingQuietHoursStart: "22:00",
    messagingQuietHoursEnd: "07:00",
    maxRetryAttempts: 3,
    retryDelayMinutes: 5,
  });

  const [messagingAnalytics, setMessagingAnalytics] =
    useState<MessagingAnalytics>({
      totalMessages: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
      averageResponseTime: 0,
    });

  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // System settings
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Load messaging configuration when messaging tab is active
  useEffect(() => {
    if (activeTab === "messaging") {
      loadMessagingData();
    }
  }, [activeTab]);

  // Password strength calculation
  useEffect(() => {
    calculatePasswordStrength(passwordForm.newPassword);
  }, [passwordForm.newPassword]);

  const loadMessagingData = async () => {
    try {
      setIsLoading(true);

      const [configResult, analyticsResult] = await Promise.all([
        messagingAdminService.getConfig(),
        messagingAdminService.getAnalytics("24h"),
      ]);

      if (configResult.success && configResult.config) {
        setMessagingConfig(configResult.config as unknown as MessagingConfig);
      }

      if (analyticsResult.success && analyticsResult.analytics) {
        setMessagingAnalytics(
          analyticsResult.analytics as unknown as MessagingAnalytics,
        );
      }
    } catch (error) {
      console.error("Error loading messaging data:", error);
      toast({
        title: "Error",
        description: "Failed to load messaging configuration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessagingConfig = async (updates: Partial<MessagingConfig>) => {
    if (!messagingConfig) return;

    try {
      const result = await messagingAdminService.updateConfig({
        ...(messagingConfig || {}),
        ...updates,
      } as any);

      if (result.success) {
        setMessagingConfig({ ...messagingConfig, ...updates });
        toast({
          title: "Success",
          description: "Messaging configuration updated successfully",
        });
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (error) {
      console.error("Error updating messaging config:", error);
      toast({
        title: "Error",
        description: "Failed to update messaging configuration",
        variant: "destructive",
      });
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    const errors: string[] = [];

    if (password.length >= 12) strength += 25;
    else errors.push("At least 12 characters required");

    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    else errors.push("Use both uppercase and lowercase letters");

    if (/\d/.test(password)) strength += 25;
    else errors.push("Include at least one number");

    if (/[^a-zA-Z0-9]/.test(password)) strength += 25;
    else errors.push("Include at least one special character");

    setPasswordStrength(strength);
    setPasswordErrors(errors);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (passwordStrength < 100) {
      toast({
        title: "Weak Password",
        description: "Please use a stronger password",
        variant: "destructive",
      });
      return;
    }

    try {
      // API call to change password
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Password changed successfully",
        });
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to change password");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });

      if (response.ok) {
        toast({
          title: "Account Deleted",
          description: "Your account has been permanently deleted",
        });
        // Redirect to login page
        window.location.href = "/login";
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500";
    if (passwordStrength < 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Enter a password";
    if (passwordStrength < 50) return "Weak";
    if (passwordStrength < 75) return "Moderate";
    if (passwordStrength < 100) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-gray-600">
          Manage system configuration, security, and administrative settings
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Application Information</CardTitle>
              <CardDescription>
                Basic information about the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appName">Application Name</Label>
                  <Input id="appName" defaultValue="Telecheck" disabled />
                </div>
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input id="version" defaultValue="2.0.0" disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <Input
                    id="environment"
                    defaultValue={
                      process.env.NODE_ENV === "production"
                        ? "Production"
                        : "Development"
                    }
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="deployment">Deployment</Label>
                  <Input id="deployment" defaultValue="DigitalOcean" disabled />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Current system health and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">●</div>
                  <div className="text-sm text-gray-600">API Status</div>
                  <div className="text-xs text-green-600">Online</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">●</div>
                  <div className="text-sm text-gray-600">Database</div>
                  <div className="text-xs text-green-600">Connected</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">●</div>
                  <div className="text-sm text-gray-600">Cache (Redis)</div>
                  <div className="text-xs text-yellow-600">Not Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">●</div>
                  <div className="text-sm text-gray-600">Storage</div>
                  <div className="text-xs text-green-600">Online</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Settings Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </Button>
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordForm.newPassword && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${getPasswordStrengthColor()}`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      {passwordErrors.length > 0 && (
                        <ul className="text-sm text-red-600 list-disc list-inside">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <Button type="submit" disabled={passwordStrength < 100}>
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions that affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
                <div>
                  <h3 className="font-semibold text-red-600">Delete Account</h3>
                  <p className="text-sm text-gray-600">
                    Permanently delete your account and all associated data.
                    This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>
                Configure security and authentication options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <Label htmlFor="mfaEnabled" className="text-base">
                    Multi-Factor Authentication (MFA)
                  </Label>
                  <p className="text-sm text-gray-600">
                    Require 2FA for all user logins (TOTP or SMS)
                  </p>
                </div>
                <Switch
                  id="mfaEnabled"
                  checked={mfaEnabled}
                  onCheckedChange={setMfaEnabled}
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <Label htmlFor="sessionTimeout" className="text-base">
                    Session Timeout
                  </Label>
                  <p className="text-sm text-gray-600">
                    Automatically log out inactive users
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(Number(e.target.value))}
                    className="w-20"
                    min="5"
                    max="120"
                  />
                  <span className="text-sm text-gray-600">minutes</span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <Label htmlFor="auditLogging" className="text-base">
                    Audit Logging
                  </Label>
                  <p className="text-sm text-gray-600">
                    Log all security-related events
                  </p>
                </div>
                <Switch
                  id="auditLogging"
                  checked={auditLoggingEnabled}
                  onCheckedChange={setAuditLoggingEnabled}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>Requirements for user passwords</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">Minimum 12 characters</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">
                  Uppercase and lowercase letters required
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">At least one number required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">
                  At least one special character required
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">
                  Password history: Last 5 passwords cannot be reused
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="text-sm">
                  Account lockout: 5 failed attempts = 15 minute lockout
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messaging Tab */}
        <TabsContent value="messaging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Messaging Configuration</CardTitle>
              <CardDescription>
                Configure SMS and voice messaging services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telnyxApiKey">Telnyx API Key</Label>
                  <div className="relative">
                    <Input
                      id="telnyxApiKey"
                      type={showApiKey ? "text" : "password"}
                      value={messagingConfig.telnyxApiKey}
                      onChange={(e) =>
                        updateMessagingConfig({ telnyxApiKey: e.target.value })
                      }
                      placeholder="Enter your Telnyx API key"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? "Hide" : "Show"}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="telnyxPhoneNumber">Telnyx Phone Number</Label>
                  <Input
                    id="telnyxPhoneNumber"
                    value={messagingConfig.telnyxPhoneNumber}
                    onChange={(e) =>
                      updateMessagingConfig({
                        telnyxPhoneNumber: e.target.value,
                      })
                    }
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableSMS">Enable SMS Notifications</Label>
                  <Switch
                    id="enableSMS"
                    checked={messagingConfig.enableSMSNotifications}
                    onCheckedChange={(checked) =>
                      updateMessagingConfig({ enableSMSNotifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableVoice">
                    Enable Voice Notifications
                  </Label>
                  <Switch
                    id="enableVoice"
                    checked={messagingConfig.enableVoiceNotifications}
                    onCheckedChange={(checked) =>
                      updateMessagingConfig({
                        enableVoiceNotifications: checked,
                      })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableScheduled">
                    Enable Scheduled Messaging
                  </Label>
                  <Switch
                    id="enableScheduled"
                    checked={messagingConfig.enableScheduledMessaging}
                    onCheckedChange={(checked) =>
                      updateMessagingConfig({
                        enableScheduledMessaging: checked,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Messaging Analytics (Last 24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {messagingAnalytics.totalMessages}
                  </div>
                  <div className="text-sm text-gray-600">Total Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {messagingAnalytics.successfulDeliveries}
                  </div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {messagingAnalytics.failedDeliveries}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {messagingAnalytics.averageResponseTime}ms
                  </div>
                  <div className="text-sm text-gray-600">Avg Response</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Advanced system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div className="space-y-0.5">
                  <Label htmlFor="maintenanceMode" className="text-base">
                    Maintenance Mode
                  </Label>
                  <p className="text-sm text-gray-600">
                    Temporarily disable user access for maintenance
                  </p>
                </div>
                <Switch
                  id="maintenanceMode"
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Database Information</CardTitle>
              <CardDescription>Production database details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Database Type</Label>
                  <p className="font-medium">PostgreSQL 15</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Cluster Name</Label>
                  <p className="font-medium">telecheck-postgres-cluster</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Tables</Label>
                  <p className="font-medium">17</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Status</Label>
                  <p className="font-medium text-green-600">Online</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deployment Information</CardTitle>
              <CardDescription>Current deployment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Platform</Label>
                  <p className="font-medium">DigitalOcean App Platform</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Region</Label>
                  <p className="font-medium">NYC3</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">API Instances</Label>
                  <p className="font-medium">2 × Professional-XS</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Web Instances</Label>
                  <p className="font-medium">1 × Basic-XXS</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { AdminSettings };
