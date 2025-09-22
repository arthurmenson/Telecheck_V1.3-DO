import React, { useState, useEffect, useCallback } from "react";
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
import {
  messagingAdminService,
  MessagingConfig,
  MessagingAnalytics,
  ProviderCredentialConfig,
} from "../services/messagingAdmin.service";

const DEFAULT_MESSAGING_CONFIG: MessagingConfig = {
  primaryProvider: "telnyx",
  enableSMS: true,
  enableVoice: false,
  enableScheduled: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  maxRetries: 3,
  retryDelay: 5,
  auditLogging: true,
  thresholds: {
    glucoseLow: 70,
    glucoseHigh: 400,
    bpSystolicHigh: 180,
    bpDiastolicHigh: 110,
    heartRateHigh: 120,
    heartRateLow: 50,
    temperatureHigh: 101.5,
    temperatureLow: 95.0,
    oxygenSatLow: 88,
  },
  careTeam: {
    enableAlerts: true,
    escalationTimeout: 15,
    maxEscalationLevels: 3,
  },
  providerCredentials: {
    telnyx: {
      apiKeyRef: "",
      messagingProfileIdRef: "",
      fromNumber: "",
    },
    twilio: {
      accountSidRef: "",
      authTokenRef: "",
      messagingServiceSidRef: "",
      fromNumber: "",
    },
  },
};

const DEFAULT_ANALYTICS: MessagingAnalytics = {
  period: "24h",
  overview: {
    totalMessages: 0,
    successfulMessages: 0,
    failedMessages: 0,
    successRate: "0.0",
  },
  providerStats: [],
  scheduling: {
    totalActiveJobs: 0,
    messagesSentToday: 0,
    messagesFailedToday: 0,
    activePatients: 0,
  },
};

const mergeConfigUpdates = (
  current: MessagingConfig,
  updates: Partial<MessagingConfig>,
): MessagingConfig => {
  const next: MessagingConfig = {
    ...current,
    ...updates,
    thresholds: updates.thresholds
      ? { ...current.thresholds, ...updates.thresholds }
      : current.thresholds,
    careTeam: updates.careTeam
      ? { ...current.careTeam, ...updates.careTeam }
      : current.careTeam,
    providerCredentials: updates.providerCredentials
      ? {
          telnyx: {
            ...current.providerCredentials.telnyx,
            ...updates.providerCredentials.telnyx,
          },
          twilio: {
            ...current.providerCredentials.twilio,
            ...updates.providerCredentials.twilio,
          },
        }
      : current.providerCredentials,
  };

  return next;
};

export function AdminSettings() {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<
    "general" | "messaging" | "security" | "advanced"
  >("general");

  const [messagingConfig, setMessagingConfig] = useState<MessagingConfig>(
    DEFAULT_MESSAGING_CONFIG,
  );

  const [messagingAnalytics, setMessagingAnalytics] =
    useState<MessagingAnalytics>(DEFAULT_ANALYTICS);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isBusy = isLoading || isSaving;

  // Load messaging configuration when messaging tab is active
  const loadMessagingData = useCallback(async () => {
    try {
      setIsLoading(true);

      const [configResult, analyticsResult] = await Promise.all([
        messagingAdminService.getConfig(),
        messagingAdminService.getAnalytics("24h"),
      ]);

      if (configResult.success && configResult.config) {
        setMessagingConfig(
          mergeConfigUpdates(DEFAULT_MESSAGING_CONFIG, configResult.config),
        );
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
  }, [toast]);

  useEffect(() => {
    if (activeTab === "messaging") {
      loadMessagingData();
    }
  }, [activeTab, loadMessagingData]);

  const updateMessagingConfig = useCallback(
    async (updates: Partial<MessagingConfig>) => {
      const nextConfig = mergeConfigUpdates(messagingConfig, updates);

      try {
        setIsSaving(true);
        const result = await messagingAdminService.updateConfig(nextConfig);

        if (result.success) {
          setMessagingConfig(nextConfig);
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
      } finally {
        setIsSaving(false);
      }
    },
    [messagingConfig, toast],
  );

  const handleProviderCredentialChange = (
    provider: "telnyx" | "twilio",
    field: keyof ProviderCredentialConfig,
    value: string,
  ) => {
    updateMessagingConfig({
      providerCredentials: {
        ...messagingConfig.providerCredentials,
        [provider]: {
          ...messagingConfig.providerCredentials[provider],
          [field]: value,
        },
      },
    });
  };

  return (
    <div className="container mx-auto p-6" aria-busy={isBusy}>
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
                Configure messaging providers and operational safeguards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6" aria-busy={isBusy}>
              {isLoading && (
                <p className="text-sm text-muted-foreground">
                  Loading messaging configuration...
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primaryProvider">Primary Provider</Label>
                  <select
                    id="primaryProvider"
                    className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none"
                    value={messagingConfig.primaryProvider}
                    onChange={(event) =>
                      updateMessagingConfig({
                        primaryProvider: event.target
                          .value as MessagingConfig["primaryProvider"],
                      })
                    }
                    disabled={isBusy}
                  >
                    <option value="telnyx">Telnyx</option>
                    <option value="twilio">Twilio</option>
                    <option value="auto">Auto (failover)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quietHoursStart">Quiet Hours Start</Label>
                    <Input
                      id="quietHoursStart"
                      value={messagingConfig.quietHoursStart}
                      onChange={(event) =>
                        updateMessagingConfig({
                          quietHoursStart: event.target.value,
                        })
                      }
                      disabled={isBusy}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quietHoursEnd">Quiet Hours End</Label>
                    <Input
                      id="quietHoursEnd"
                      value={messagingConfig.quietHoursEnd}
                      onChange={(event) =>
                        updateMessagingConfig({
                          quietHoursEnd: event.target.value,
                        })
                      }
                      disabled={isBusy}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telnyxApiKeyRef">
                    Telnyx API Key Secret Reference
                  </Label>
                  <Input
                    id="telnyxApiKeyRef"
                    value={
                      messagingConfig.providerCredentials.telnyx.apiKeyRef || ""
                    }
                    onChange={(event) =>
                      handleProviderCredentialChange(
                        "telnyx",
                        "apiKeyRef",
                        event.target.value,
                      )
                    }
                    placeholder="vault://path/to/telnyx/api-key"
                    disabled={isBusy}
                  />
                </div>
                <div>
                  <Label htmlFor="telnyxProfileRef">
                    Telnyx Messaging Profile Reference
                  </Label>
                  <Input
                    id="telnyxProfileRef"
                    value={
                      messagingConfig.providerCredentials.telnyx
                        .messagingProfileIdRef || ""
                    }
                    onChange={(event) =>
                      handleProviderCredentialChange(
                        "telnyx",
                        "messagingProfileIdRef",
                        event.target.value,
                      )
                    }
                    placeholder="vault://path/to/telnyx/profile"
                    disabled={isBusy}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telnyxNumber">Telnyx From Number</Label>
                  <Input
                    id="telnyxNumber"
                    value={
                      messagingConfig.providerCredentials.telnyx.fromNumber ||
                      ""
                    }
                    onChange={(event) =>
                      handleProviderCredentialChange(
                        "telnyx",
                        "fromNumber",
                        event.target.value,
                      )
                    }
                    placeholder="+12345556789"
                    disabled={isBusy}
                  />
                </div>
                <div>
                  <Label htmlFor="twilioFromNumber">Twilio From Number</Label>
                  <Input
                    id="twilioFromNumber"
                    value={
                      messagingConfig.providerCredentials.twilio.fromNumber ||
                      ""
                    }
                    onChange={(event) =>
                      handleProviderCredentialChange(
                        "twilio",
                        "fromNumber",
                        event.target.value,
                      )
                    }
                    placeholder="+12345556789"
                    disabled={isBusy}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twilioAccountSidRef">
                    Twilio Account SID Secret Reference
                  </Label>
                  <Input
                    id="twilioAccountSidRef"
                    value={
                      messagingConfig.providerCredentials.twilio
                        .accountSidRef || ""
                    }
                    onChange={(event) =>
                      handleProviderCredentialChange(
                        "twilio",
                        "accountSidRef",
                        event.target.value,
                      )
                    }
                    placeholder="vault://path/to/twilio/account-sid"
                    disabled={isBusy}
                  />
                </div>
                <div>
                  <Label htmlFor="twilioAuthTokenRef">
                    Twilio Auth Token Secret Reference
                  </Label>
                  <Input
                    id="twilioAuthTokenRef"
                    value={
                      messagingConfig.providerCredentials.twilio.authTokenRef ||
                      ""
                    }
                    onChange={(event) =>
                      handleProviderCredentialChange(
                        "twilio",
                        "authTokenRef",
                        event.target.value,
                      )
                    }
                    placeholder="vault://path/to/twilio/auth-token"
                    disabled={isBusy}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twilioMessagingServiceSidRef">
                    Twilio Messaging Service SID Reference
                  </Label>
                  <Input
                    id="twilioMessagingServiceSidRef"
                    value={
                      messagingConfig.providerCredentials.twilio
                        .messagingServiceSidRef || ""
                    }
                    onChange={(event) =>
                      handleProviderCredentialChange(
                        "twilio",
                        "messagingServiceSidRef",
                        event.target.value,
                      )
                    }
                    placeholder="vault://path/to/twilio/messaging-sid"
                    disabled={isBusy}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxRetries">Max Retry Attempts</Label>
                    <Input
                      id="maxRetries"
                      type="number"
                      value={messagingConfig.maxRetries}
                      onChange={(event) =>
                        updateMessagingConfig({
                          maxRetries: Number(event.target.value),
                        })
                      }
                      disabled={isBusy}
                    />
                  </div>
                  <div>
                    <Label htmlFor="retryDelay">Retry Delay (minutes)</Label>
                    <Input
                      id="retryDelay"
                      type="number"
                      value={messagingConfig.retryDelay}
                      onChange={(event) =>
                        updateMessagingConfig({
                          retryDelay: Number(event.target.value),
                        })
                      }
                      disabled={isBusy}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableSMS">Enable SMS Notifications</Label>
                  <Switch
                    id="enableSMS"
                    checked={messagingConfig.enableSMS}
                    onCheckedChange={(checked) =>
                      updateMessagingConfig({ enableSMS: checked })
                    }
                    disabled={isBusy}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableVoice">
                    Enable Voice Notifications
                  </Label>
                  <Switch
                    id="enableVoice"
                    checked={messagingConfig.enableVoice}
                    onCheckedChange={(checked) =>
                      updateMessagingConfig({ enableVoice: checked })
                    }
                    disabled={isBusy}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableScheduled">
                    Enable Scheduled Messaging
                  </Label>
                  <Switch
                    id="enableScheduled"
                    checked={messagingConfig.enableScheduled}
                    onCheckedChange={(checked) =>
                      updateMessagingConfig({ enableScheduled: checked })
                    }
                    disabled={isBusy}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="auditLogging">
                    Enable Message Audit Logging
                  </Label>
                  <Switch
                    id="auditLogging"
                    checked={messagingConfig.auditLogging}
                    onCheckedChange={(checked) =>
                      updateMessagingConfig({ auditLogging: checked })
                    }
                    disabled={isBusy}
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
                    {messagingAnalytics.overview.totalMessages}
                  </div>
                  <div className="text-sm text-gray-600">Total Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {messagingAnalytics.overview.successfulMessages}
                  </div>
                  <div className="text-sm text-gray-600">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {messagingAnalytics.overview.failedMessages}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {messagingAnalytics.overview.successRate}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
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

export default AdminSettings;
