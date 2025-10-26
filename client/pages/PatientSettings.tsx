import React, { useState, useEffect } from "react";
import { useToast } from "../hooks/use-toast";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  Settings,
  Bell,
  Shield,
  Globe,
  Lock,
  Save,
  Loader2,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";

interface SettingsState {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    appointments: boolean;
    labResults: boolean;
    messages: boolean;
    reminders: boolean;
  };
  privacy: {
    dataSharing: boolean;
    marketingConsent: boolean;
    thirdPartySharing: boolean;
  };
  communication: {
    preferredContactMethod: string;
    languagePreference: string;
  };
  security: {
    twoFactorEnabled: boolean;
  };
}

export function PatientSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [twoFactorData, setTwoFactorData] = useState({
    qrCode: "",
    secret: "",
    token: "",
  });

  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      email: true,
      sms: true,
      push: false,
      appointments: true,
      labResults: true,
      messages: true,
      reminders: true,
    },
    privacy: {
      dataSharing: false,
      marketingConsent: false,
      thirdPartySharing: false,
    },
    communication: {
      preferredContactMethod: "email",
      languagePreference: "en",
    },
    security: {
      twoFactorEnabled: false,
    },
  });

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/patient/settings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }

        const data = await response.json();
        setSettings(data.settings);
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/patient/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          emailNotifications: settings.notifications.email,
          smsNotifications: settings.notifications.sms,
          pushNotifications: settings.notifications.push,
          appointmentNotifications: settings.notifications.appointments,
          labResultNotifications: settings.notifications.labResults,
          messageNotifications: settings.notifications.messages,
          reminderNotifications: settings.notifications.reminders,
          dataSharing: settings.privacy.dataSharing,
          marketingConsent: settings.privacy.marketingConsent,
          thirdPartySharing: settings.privacy.thirdPartySharing,
          preferredContactMethod: settings.communication.preferredContactMethod,
          languagePreference: settings.communication.languagePreference,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      toast({
        title: "Success",
        description: "Your settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/patient/settings/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      toast({
        title: "Success",
        description: "Your password has been changed successfully.",
      });

      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to change password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEnable2FA = async () => {
    try {
      const response = await fetch("/api/patient/settings/2fa/enable", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to enable 2FA");
      }

      const data = await response.json();
      setTwoFactorData({
        qrCode: data.qrCode,
        secret: data.secret,
        token: "",
      });
      setShow2FADialog(true);
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to enable 2FA. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleVerify2FA = async () => {
    try {
      const response = await fetch("/api/patient/settings/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          token: twoFactorData.token,
        }),
      });

      if (!response.ok) {
        throw new Error("Invalid verification code");
      }

      toast({
        title: "Success",
        description: "Two-factor authentication has been enabled.",
      });

      setSettings((prev) => ({
        ...prev,
        security: { ...prev.security, twoFactorEnabled: true },
      }));

      setShow2FADialog(false);
      setTwoFactorData({ qrCode: "", secret: "", token: "" });
    } catch (error) {
      console.error("Error verifying 2FA:", error);
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your preferences and privacy
            </p>
          </div>
          <Button onClick={handleSaveSettings} disabled={isLoading} size="lg">
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, email: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive urgent alerts via text
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={settings.notifications.sms}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, sms: checked },
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Browser and app notifications
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({
                      ...prev,
                      notifications: { ...prev.notifications, push: checked },
                    }))
                  }
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3">Notification Types</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="appointment-notifications">
                    Appointment Reminders
                  </Label>
                  <Switch
                    id="appointment-notifications"
                    checked={settings.notifications.appointments}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          appointments: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="lab-notifications">Lab Results</Label>
                  <Switch
                    id="lab-notifications"
                    checked={settings.notifications.labResults}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          labResults: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="message-notifications">Messages</Label>
                  <Switch
                    id="message-notifications"
                    checked={settings.notifications.messages}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          messages: checked,
                        },
                      }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder-notifications">
                    Health Reminders
                  </Label>
                  <Switch
                    id="reminder-notifications"
                    checked={settings.notifications.reminders}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          reminders: checked,
                        },
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy Controls
            </CardTitle>
            <CardDescription>
              Manage your data sharing preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="data-sharing">Data Sharing for Research</Label>
                <p className="text-sm text-muted-foreground">
                  Share anonymized data to improve healthcare
                </p>
              </div>
              <Switch
                id="data-sharing"
                checked={settings.privacy.dataSharing}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    privacy: { ...prev.privacy, dataSharing: checked },
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-consent">
                  Marketing Communications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive health tips and wellness content
                </p>
              </div>
              <Switch
                id="marketing-consent"
                checked={settings.privacy.marketingConsent}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    privacy: { ...prev.privacy, marketingConsent: checked },
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="third-party-sharing">Third-party Sharing</Label>
                <p className="text-sm text-muted-foreground">
                  Allow sharing with partner services
                </p>
              </div>
              <Switch
                id="third-party-sharing"
                checked={settings.privacy.thirdPartySharing}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    privacy: { ...prev.privacy, thirdPartySharing: checked },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Communication Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Communication Preferences
            </CardTitle>
            <CardDescription>How you prefer to be contacted</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact-method">Preferred Contact Method</Label>
              <Select
                value={settings.communication.preferredContactMethod}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    communication: {
                      ...prev.communication,
                      preferredContactMethod: value,
                    },
                  }))
                }
              >
                <SelectTrigger id="contact-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language Preference</Label>
              <Select
                value={settings.communication.languagePreference}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    communication: {
                      ...prev.communication,
                      languagePreference: value,
                    },
                  }))
                }
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Protect your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  {settings.security.twoFactorEnabled
                    ? "Enabled - Your account is protected"
                    : "Add an extra layer of security"}
                </p>
              </div>
              <Button
                variant={
                  settings.security.twoFactorEnabled ? "destructive" : "default"
                }
                onClick={handleEnable2FA}
                disabled={settings.security.twoFactorEnabled}
              >
                <Key className="w-4 h-4 mr-2" />
                {settings.security.twoFactorEnabled ? "Enabled" : "Enable 2FA"}
              </Button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <Label>Password</Label>
                <p className="text-sm text-muted-foreground">
                  Change your password regularly for security
                </p>
              </div>
              <Dialog
                open={showPasswordDialog}
                onOpenChange={setShowPasswordDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and choose a new one
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData((prev) => ({
                              ...prev,
                              newPassword: e.target.value,
                            }))
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleChangePassword}>
                      Change Password
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* 2FA Setup Dialog */}
        <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan the QR code with your authenticator app and enter the
                verification code
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {twoFactorData.qrCode && (
                <div className="flex justify-center">
                  <img
                    src={twoFactorData.qrCode}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="verification-code">Verification Code</Label>
                <Input
                  id="verification-code"
                  placeholder="000000"
                  value={twoFactorData.token}
                  onChange={(e) =>
                    setTwoFactorData((prev) => ({
                      ...prev,
                      token: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShow2FADialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleVerify2FA}>Verify & Enable</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mobile Save Button */}
        <div className="md:hidden">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
