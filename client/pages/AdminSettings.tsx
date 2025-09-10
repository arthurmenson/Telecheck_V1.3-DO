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

export default function AdminSettings() {
  const { toast } = useToast();

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

  // Load messaging configuration when messaging tab is active
  useEffect(() => {
    if (activeTab === "messaging") {
      loadMessagingData();
    }
  }, [activeTab]);

  const loadMessagingData = async () => {
    try {
      setIsLoading(true);

      const [configResult, analyticsResult] = await Promise.all([
        messagingAdminService.getConfig(),
        messagingAdminService.getAnalytics("24h"),
      ]);

      if (configResult.success && configResult.config) {
        setMessagingConfig(configResult.config);
      }

      if (analyticsResult.success && analyticsResult.analytics) {
        setMessagingAnalytics(analyticsResult.analytics);
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
        ...messagingConfig,
        ...updates,
      });

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

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-gray-600">
          Manage system configuration and settings
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Basic system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appName">Application Name</Label>
                  <Input id="appName" defaultValue="TeleCheck" />
                </div>
                <div>
                  <Label htmlFor="version">Version</Label>
                  <Input id="version" defaultValue="1.3.0" disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
                  <Input
                    id="twilioAccountSid"
                    value={messagingConfig.twilioAccountSid}
                    onChange={(e) =>
                      updateMessagingConfig({
                        twilioAccountSid: e.target.value,
                      })
                    }
                    placeholder="Enter your Twilio Account SID"
                  />
                </div>
                <div>
                  <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
                  <Input
                    id="twilioAuthToken"
                    type="password"
                    value={messagingConfig.twilioAuthToken}
                    onChange={(e) =>
                      updateMessagingConfig({ twilioAuthToken: e.target.value })
                    }
                    placeholder="Enter your Twilio Auth Token"
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

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security and authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="twoFactor">
                    Enable Two-Factor Authentication
                  </Label>
                  <Switch id="twoFactor" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    defaultValue="30"
                    className="w-24"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>Advanced system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="debugMode">Debug Mode</Label>
                  <Switch id="debugMode" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                  <Switch id="maintenanceMode" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
