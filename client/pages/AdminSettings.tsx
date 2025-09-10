import React, { useState, useEffect } from "react";
import { messagingAdminService, MessagingConfig } from '../services/messagingAdmin.service';
import { useToast } from '../hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Progress } from "../components/ui/progress";
import {
  Settings,
  Users,
  Shield,
  Bell,
  Database,
  FileText,
  CreditCard,
  Lock,
  Monitor,
  Globe,
  Palette,
  Mail,
  Phone,
  Upload,
  Download,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
  Activity,
  BarChart3,
  Calendar,
  Clock,
  HardDrive,
  Server,
  Wifi,
  Zap,
  Building,
  MapPin,
  Flag,
  Plus,
  Stethoscope,
  Brain,
  MessageSquare,
  Send,
  Volume2,
  Timer,
  Target,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Edit3,
  Copy,
  ExternalLink,
} from "lucide-react";

// Mock data for settings
const systemStats = {
  totalUsers: 2847,
  activeUsers: 347,
  totalStorage: "2.4 TB",
  usedStorage: "1.8 TB",
  uptime: "99.9%",
  lastBackup: "2024-02-15 02:00 AM",
};

const mockUsers = [
  { id: "1", name: "Dr. Sarah Johnson", email: "sarah@hospital.com", role: "doctor", status: "active", lastLogin: "2024-02-15" },
  { id: "2", name: "John Smith", email: "john@email.com", role: "patient", status: "active", lastLogin: "2024-02-14" },
  { id: "3", name: "Emily Davis", email: "emily@pharmacy.com", role: "pharmacist", status: "active", lastLogin: "2024-02-13" },
  { id: "4", name: "Michael Brown", email: "michael@clinic.com", role: "nurse", status: "pending", lastLogin: "Never" },
];

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  const [messagingConfig, setMessagingConfig] = useState<MessagingConfig | null>(null);
  const [messagingAnalytics, setMessagingAnalytics] = useState<any>(null);
  const [patientSchedules, setPatientSchedules] = useState<any[]>([]);
  const [careTeamMembers, setCareTeamMembers] = useState<any[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<any[]>([]);
  const [settings, setSettings] = useState({
    // General Settings
    systemName: "Telecheck AI Healthcare",
    systemDescription: "Comprehensive AI-powered healthcare management platform",
    timezone: "UTC-8",
    language: "en",
    currency: "USD",
    dateFormat: "MM/DD/YYYY",
    
    // Security Settings
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    twoFactorRequired: false,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maintenanceNotifications: true,
    securityAlerts: true,
    
    // System Settings
    autoBackup: true,
    backupFrequency: "daily",
    dataRetention: "7",
    auditLogging: true,
    performanceMonitoring: true,
    
    // Integration Settings
    enableAPI: true,
    apiRateLimit: 1000,
    webhookEnabled: false,
    
    // Compliance Settings
    hipaaCompliance: true,
    gdprCompliance: true,
    dataEncryption: true,
    auditTrail: true,

    // AI Management Settings
    primaryLLMProvider: "openai",
    openaiKey: "",
    anthropicKey: "",
    medicalModel: "gpt-4-medical",
    medicalDisclaimer: true,
    humanOversight: true,
    contentFiltering: true,
    confidenceThreshold: 85,
    maxTokens: 2048,
    drugInteractionChecks: true,
    diagnosisAssistance: true,
    treatmentSuggestions: true,
    clinicalDatabase: "pubmed",
    specialtyFocus: "general",
    usageAlerts: true,
    monthlyBudget: 500,
    autoModelUpdate: true,
    performanceLogging: true,
    aiAuditLogging: true,
    biasMonitoring: true,
    explainableAI: true,
    complianceFramework: "fda",

    // Messaging Settings
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

    // Alert Thresholds
    glucoseCriticalLow: 70,
    glucoseCriticalHigh: 400,
    bloodPressureSystolicHigh: 180,
    bloodPressureDiastolicHigh: 110,
    heartRateHigh: 120,
    heartRateLow: 50,
    temperatureHigh: 101.5,
    temperatureLow: 95.0,
    oxygenSaturationLow: 88,

    // Notification Templates
    enableMessageTemplates: true,
    customGreeting: "Hello from your care team",
    emergencyContactNumber: "+1-800-CARE-TEAM",

    // Care Team Settings
    enableCareTeamAlerts: true,
    escalationTimeoutMinutes: 15,
    maxEscalationLevels: 3,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load messaging configuration when messaging tab is active
  useEffect(() => {
    if (activeTab === 'messaging') {
      loadMessagingData();
    }
  }, [activeTab]);

  const loadMessagingData = async () => {
    try {
      setIsLoading(true);

      const [configResult, analyticsResult] = await Promise.all([
        messagingAdminService.getConfig(),
        messagingAdminService.getAnalytics('24h')
      ]);

      if (configResult.success && configResult.config) {
        setMessagingConfig(configResult.config);
      }

      if (analyticsResult.success && analyticsResult.analytics) {
        setMessagingAnalytics(analyticsResult.analytics);
      }

    } catch (error) {
      console.error('Error loading messaging data:', error);
      toast({
        title: "Error",
        description: "Failed to load messaging configuration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMessagingConfig = async (updates: Partial<MessagingConfig>) => {
    if (!messagingConfig) return;

    try {
      const result = await messagingAdminService.updateConfig({ ...messagingConfig, ...updates });

      if (result.success) {
        setMessagingConfig({ ...messagingConfig, ...updates });
        toast({
          title: "Success",
          description: "Messaging configuration updated successfully"
        });
      } else {
        throw new Error(result.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating messaging config:', error);
      toast({
        title: "Error",
        description: "Failed to update messaging configuration",
        variant: "destructive"
      });
    }
  };

  const testMessagingService = async (provider: 'telnyx' | 'twilio', type: 'sms' | 'voice') => {
    const phoneNumber = prompt('Enter phone number to test (e.g., +1234567890):');
    if (!phoneNumber) return;

    try {
      setIsLoading(true);
      const result = await messagingAdminService.testService(provider, type, phoneNumber);

      if (result.success) {
        toast({
          title: "Test Successful",
          description: `${type.toUpperCase()} test sent successfully via ${provider}`
        });
      } else {
        throw new Error(result.error || 'Test failed');
      }
    } catch (error) {
      console.error('Error testing messaging service:', error);
      toast({
        title: "Test Failed",
        description: `Failed to send ${type} via ${provider}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Show success message
  };

  const handleTestEmail = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const handleBackupNow = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              System Settings
            </h1>
            <p className="text-muted-foreground">Manage system configuration and administrative settings</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleSaveSettings} disabled={isLoading}>
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{systemStats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Storage Used</p>
                  <p className="text-2xl font-bold text-foreground">{systemStats.usedStorage}</p>
                  <Progress value={75} className="mt-2 h-2" />
                </div>
                <HardDrive className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                  <p className="text-2xl font-bold text-foreground">{systemStats.uptime}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Backup</p>
                  <p className="text-2xl font-bold text-foreground">2h ago</p>
                </div>
                <Database className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="messaging">Messaging</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="ai">AI Management</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Organization Information
                  </CardTitle>
                  <CardDescription>Basic system and organization settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="systemName">System Name</Label>
                    <Input
                      id="systemName"
                      value={settings.systemName}
                      onChange={(e) => handleSettingChange("systemName", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="systemDescription">Description</Label>
                    <Textarea
                      id="systemDescription"
                      value={settings.systemDescription}
                      onChange={(e) => handleSettingChange("systemDescription", e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                          <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                          <SelectItem value="UTC+0">Greenwich Mean Time (UTC+0)</SelectItem>
                          <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language">Default Language</Label>
                      <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Regional Settings
                  </CardTitle>
                  <CardDescription>Currency, date format, and regional preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={settings.currency} onValueChange={(value) => handleSettingChange("currency", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange("dateFormat", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="font-medium mb-3">System Theme</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="border-2 border-primary rounded-lg p-3 text-center cursor-pointer">
                        <div className="w-8 h-8 bg-white border rounded mx-auto mb-2"></div>
                        <span className="text-sm">Light</span>
                      </div>
                      <div className="border-2 border-muted rounded-lg p-3 text-center cursor-pointer">
                        <div className="w-8 h-8 bg-slate-800 rounded mx-auto mb-2"></div>
                        <span className="text-sm">Dark</span>
                      </div>
                      <div className="border-2 border-muted rounded-lg p-3 text-center cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-white to-slate-800 rounded mx-auto mb-2"></div>
                        <span className="text-sm">Auto</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">User Management</h3>
                <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Users className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account with role and permissions</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrator</SelectItem>
                          <SelectItem value="doctor">Doctor</SelectItem>
                          <SelectItem value="nurse">Nurse</SelectItem>
                          <SelectItem value="pharmacist">Pharmacist</SelectItem>
                          <SelectItem value="patient">Patient</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Create User</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="border-b border-border p-4">
                  <div className="flex items-center gap-4">
                    <Input placeholder="Search users..." className="max-w-sm" />
                    <Select defaultValue="all">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="nurse">Nurse</SelectItem>
                        <SelectItem value="patient">Patient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="divide-y">
                  {mockUsers.map((user) => (
                    <div key={user.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Last login: {user.lastLogin}</span>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5" />
                    Password Policy
                  </CardTitle>
                  <CardDescription>Configure password requirements for all users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => handleSettingChange("passwordMinLength", parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireUppercase">Require Uppercase Letters</Label>
                      <Switch
                        id="requireUppercase"
                        checked={settings.passwordRequireUppercase}
                        onCheckedChange={(checked) => handleSettingChange("passwordRequireUppercase", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireNumbers">Require Numbers</Label>
                      <Switch
                        id="requireNumbers"
                        checked={settings.passwordRequireNumbers}
                        onCheckedChange={(checked) => handleSettingChange("passwordRequireNumbers", checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSymbols">Require Special Characters</Label>
                      <Switch
                        id="requireSymbols"
                        checked={settings.passwordRequireSymbols}
                        onCheckedChange={(checked) => handleSettingChange("passwordRequireSymbols", checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Session & Access Control
                  </CardTitle>
                  <CardDescription>Manage user sessions and access controls</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange("sessionTimeout", parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => handleSettingChange("maxLoginAttempts", parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="twoFactorRequired">Require Two-Factor Authentication</Label>
                    <Switch
                      id="twoFactorRequired"
                      checked={settings.twoFactorRequired}
                      onCheckedChange={(checked) => handleSettingChange("twoFactorRequired", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Security
                  </CardTitle>
                  <CardDescription>Manage API keys and access tokens</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Master API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value="sk_live_1234567890abcdef"
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiRateLimit">API Rate Limit (requests/hour)</Label>
                    <Input
                      id="apiRateLimit"
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) => handleSettingChange("apiRateLimit", parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      Regenerate Key
                    </Button>
                    <Button variant="outline" className="flex-1">
                      View Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messaging Settings */}
          <TabsContent value="messaging" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* API Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    API Configuration
                  </CardTitle>
                  <CardDescription>Configure messaging service providers and API keys</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryProvider">Primary Messaging Provider</Label>
                    <Select value={messagingConfig?.primaryProvider || "telnyx"} onValueChange={(value) => updateMessagingConfig({ primaryProvider: value as 'telnyx' | 'twilio' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="telnyx">Telnyx (Primary)</SelectItem>
                        <SelectItem value="twilio">Twilio (Backup)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telnyxApiKey">Telnyx API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={settings.telnyxApiKey || ""}
                        onChange={(e) => handleSettingChange("telnyxApiKey", e.target.value)}
                        placeholder="KEY..."
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twilioAccountSid">Twilio Account SID (Backup)</Label>
                    <Input
                      type="password"
                      value={settings.twilioAccountSid || ""}
                      onChange={(e) => handleSettingChange("twilioAccountSid", e.target.value)}
                      placeholder="AC..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
                    <Input
                      type="password"
                      value={settings.twilioAuthToken || ""}
                      onChange={(e) => handleSettingChange("twilioAuthToken", e.target.value)}
                      placeholder="Auth Token"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telnyxPhone">Telnyx Phone Number</Label>
                      <Input
                        value={settings.telnyxPhoneNumber || ""}
                        onChange={(e) => handleSettingChange("telnyxPhoneNumber", e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twilioPhone">Twilio Phone Number</Label>
                      <Input
                        value={settings.twilioPhoneNumber || ""}
                        onChange={(e) => handleSettingChange("twilioPhoneNumber", e.target.value)}
                        placeholder="+1234567890"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => testMessagingService('telnyx', 'sms')}
                      disabled={isLoading}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Test SMS
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => testMessagingService('telnyx', 'voice')}
                      disabled={isLoading}
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Test Voice
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Messaging Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Messaging Features
                  </CardTitle>
                  <CardDescription>Enable and configure messaging capabilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableSMS">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                    <Switch
                      id="enableSMS"
                      checked={messagingConfig?.enableSMS !== false}
                      onCheckedChange={(checked) => updateMessagingConfig({ enableSMS: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableVoice">Voice Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send critical alerts via voice calls</p>
                    </div>
                    <Switch
                      id="enableVoice"
                      checked={messagingConfig?.enableVoice === true}
                      onCheckedChange={(checked) => updateMessagingConfig({ enableVoice: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableScheduled">Scheduled Messaging</Label>
                      <p className="text-sm text-muted-foreground">Automated medication and appointment reminders</p>
                    </div>
                    <Switch
                      id="enableScheduled"
                      checked={messagingConfig?.enableScheduled !== false}
                      onCheckedChange={(checked) => updateMessagingConfig({ enableScheduled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="messageAudit">Message Audit Logging</Label>
                      <p className="text-sm text-muted-foreground">Log all communications for compliance</p>
                    </div>
                    <Switch
                      id="messageAudit"
                      checked={settings.messageAuditLogging !== false}
                      onCheckedChange={(checked) => handleSettingChange("messageAuditLogging", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quiet Hours</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Start Time</Label>
                        <Input
                          type="time"
                          value={settings.messagingQuietHoursStart || "22:00"}
                          onChange={(e) => handleSettingChange("messagingQuietHoursStart", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">End Time</Label>
                        <Input
                          type="time"
                          value={settings.messagingQuietHoursEnd || "07:00"}
                          onChange={(e) => handleSettingChange("messagingQuietHoursEnd", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maxRetries">Max Retry Attempts</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={settings.maxRetryAttempts || 3}
                        onChange={(e) => handleSettingChange("maxRetryAttempts", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retryDelay">Retry Delay (minutes)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="60"
                        value={settings.retryDelayMinutes || 5}
                        onChange={(e) => handleSettingChange("retryDelayMinutes", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alert Thresholds */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Critical Alert Thresholds
                  </CardTitle>
                  <CardDescription>Configure when to trigger critical patient alerts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="glucoseLow">Glucose Critical Low (mg/dL)</Label>
                      <Input
                        type="number"
                        value={settings.glucoseCriticalLow || 70}
                        onChange={(e) => handleSettingChange("glucoseCriticalLow", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="glucoseHigh">Glucose Critical High (mg/dL)</Label>
                      <Input
                        type="number"
                        value={settings.glucoseCriticalHigh || 400}
                        onChange={(e) => handleSettingChange("glucoseCriticalHigh", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bpSystolic">BP Systolic Alert (mmHg)</Label>
                      <Input
                        type="number"
                        value={settings.bloodPressureSystolicHigh || 180}
                        onChange={(e) => handleSettingChange("bloodPressureSystolicHigh", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bpDiastolic">BP Diastolic Alert (mmHg)</Label>
                      <Input
                        type="number"
                        value={settings.bloodPressureDiastolicHigh || 110}
                        onChange={(e) => handleSettingChange("bloodPressureDiastolicHigh", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heartRateHigh">Heart Rate High (bpm)</Label>
                      <Input
                        type="number"
                        value={settings.heartRateHigh || 120}
                        onChange={(e) => handleSettingChange("heartRateHigh", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heartRateLow">Heart Rate Low (bpm)</Label>
                      <Input
                        type="number"
                        value={settings.heartRateLow || 50}
                        onChange={(e) => handleSettingChange("heartRateLow", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tempHigh">Temperature High (°F)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.temperatureHigh || 101.5}
                        onChange={(e) => handleSettingChange("temperatureHigh", parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempLow">Temperature Low (°F)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={settings.temperatureLow || 95.0}
                        onChange={(e) => handleSettingChange("temperatureLow", parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oxygenLow">Oxygen Sat Low (%)</Label>
                      <Input
                        type="number"
                        value={settings.oxygenSaturationLow || 88}
                        onChange={(e) => handleSettingChange("oxygenSaturationLow", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">Global Alert Thresholds</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      These are default thresholds for all patients. Individual patients can have custom thresholds that override these global settings.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Settings className="w-3 h-3 mr-1" />
                        Manage Patient-Specific Thresholds
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Message Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Message Templates
                  </CardTitle>
                  <CardDescription>Customize notification templates and greetings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="enableTemplates">Enable Custom Templates</Label>
                    <Switch
                      id="enableTemplates"
                      checked={settings.enableMessageTemplates !== false}
                      onCheckedChange={(checked) => handleSettingChange("enableMessageTemplates", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customGreeting">Default Greeting</Label>
                    <Input
                      value={settings.customGreeting || "Hello from your care team"}
                      onChange={(e) => handleSettingChange("customGreeting", e.target.value)}
                      placeholder="Hello from your care team"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact Number</Label>
                    <Input
                      value={settings.emergencyContactNumber || "+1-800-CARE-TEAM"}
                      onChange={(e) => handleSettingChange("emergencyContactNumber", e.target.value)}
                      placeholder="+1-800-CARE-TEAM"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Template Library</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-sm flex-1">Medication Reminder</span>
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <MessageSquare className="w-4 h-4 text-green-500" />
                        <span className="text-sm flex-1">Glucose Check Reminder</span>
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <MessageSquare className="w-4 h-4 text-purple-500" />
                        <span className="text-sm flex-1">Appointment Reminder</span>
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <MessageSquare className="w-4 h-4 text-red-500" />
                        <span className="text-sm flex-1">Critical Alert</span>
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Custom Template
                  </Button>
                </CardContent>
              </Card>

              {/* Care Team Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Care Team Management
                  </CardTitle>
                  <CardDescription>Configure care team alerts and escalation workflows</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableCareTeam">Care Team Alerts</Label>
                      <p className="text-sm text-muted-foreground">Enable automated care team notifications</p>
                    </div>
                    <Switch
                      id="enableCareTeam"
                      checked={settings.enableCareTeamAlerts !== false}
                      onCheckedChange={(checked) => handleSettingChange("enableCareTeamAlerts", checked)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="escalationTimeout">Escalation Timeout (minutes)</Label>
                      <Input
                        type="number"
                        min="5"
                        max="60"
                        value={settings.escalationTimeoutMinutes || 15}
                        onChange={(e) => handleSettingChange("escalationTimeoutMinutes", parseInt(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxEscalation">Max Escalation Levels</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={settings.maxEscalationLevels || 3}
                        onChange={(e) => handleSettingChange("maxEscalationLevels", parseInt(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Care Team Hierarchy</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm flex-1">Primary Nurse (Level 1)</span>
                        <Badge variant="secondary">Online</Badge>
                      </div>
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm flex-1">Supervising RN (Level 2)</span>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                      <div className="flex items-center gap-2 p-2 border rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm flex-1">Attending Physician (Level 3)</span>
                        <Badge variant="secondary">On-call</Badge>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Care Team
                  </Button>
                </CardContent>
              </Card>

              {/* Messaging Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Messaging Analytics
                  </CardTitle>
                  <CardDescription>Monitor messaging performance and delivery rates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{messagingAnalytics?.overview?.totalMessages || 0}</p>
                      <p className="text-sm text-muted-foreground">Messages Today</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{messagingAnalytics?.overview?.successRate || '0.0'}%</p>
                      <p className="text-sm text-muted-foreground">Delivery Rate</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{messagingAnalytics?.scheduling?.activePatients || 0}</p>
                      <p className="text-sm text-muted-foreground">Active Schedules</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">SMS Delivery Rate</span>
                        <span className="text-sm text-muted-foreground">98.5%</span>
                      </div>
                      <Progress value={98.5} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Voice Call Success</span>
                        <span className="text-sm text-muted-foreground">94.2%</span>
                      </div>
                      <Progress value={94.2} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Patient Response Rate</span>
                        <span className="text-sm text-muted-foreground">76.8%</span>
                      </div>
                      <Progress value={76.8} className="h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Reports
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Info className="w-4 h-4" />
                      <span className="text-sm font-medium">Real-time Status</span>
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      All messaging services operational. No delivery issues detected.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Patient-Specific Thresholds */}
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Patient-Specific Thresholds
                  </CardTitle>
                  <CardDescription>Override global alert thresholds for individual patients</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search for patient by ID..."
                        className="max-w-sm"
                      />
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Patient Threshold
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Configure Patient-Specific Thresholds</DialogTitle>
                          <DialogDescription>
                            Set custom alert thresholds for individual patients that override global settings
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="patientSearch">Patient</Label>
                            <Input
                              id="patientSearch"
                              placeholder="Search and select patient..."
                            />
                          </div>

                          <div className="space-y-3">
                            <Label>Threshold Overrides</Label>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-sm">Glucose Low (mg/dL)</Label>
                                <Input type="number" placeholder="70" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">Glucose High (mg/dL)</Label>
                                <Input type="number" placeholder="400" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">BP Systolic High (mmHg)</Label>
                                <Input type="number" placeholder="180" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">BP Diastolic High (mmHg)</Label>
                                <Input type="number" placeholder="110" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">Heart Rate High (bpm)</Label>
                                <Input type="number" placeholder="120" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-sm">Heart Rate Low (bpm)</Label>
                                <Input type="number" placeholder="50" />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="notes">Clinical Notes</Label>
                            <Textarea
                              id="notes"
                              placeholder="Enter any clinical reasoning for these custom thresholds..."
                              rows={3}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button>Save Thresholds</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="border rounded-lg">
                    <div className="border-b p-4 bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Patients with Custom Thresholds</h4>
                          <p className="text-sm text-muted-foreground">Patients who have personalized alert thresholds</p>
                        </div>
                        <Badge variant="secondary">3 patients</Badge>
                      </div>
                    </div>

                    <div className="divide-y">
                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">John Smith</p>
                            <p className="text-sm text-muted-foreground">ID: patient-001</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">5 custom thresholds</Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium">Mary Johnson</p>
                            <p className="text-sm text-muted-foreground">ID: patient-002</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">3 custom thresholds</Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">Robert Davis</p>
                            <p className="text-sm text-muted-foreground">ID: patient-003</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">2 custom thresholds</Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-amber-800">Global vs Patient-Specific Thresholds</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Patient-specific thresholds override global settings. When no custom threshold is set for a patient, the global threshold applies. This allows for personalized care while maintaining system-wide defaults.
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Global Settings:</span> Apply to all patients by default
                          </div>
                          <div>
                            <span className="font-medium">Patient Override:</span> Takes precedence when configured
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notification Channels
                  </CardTitle>
                  <CardDescription>Configure how system notifications are delivered</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send critical alerts via SMS</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Browser and mobile push notifications</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                    />
                  </div>
                  
                  <Button onClick={handleTestEmail} disabled={isLoading} className="w-full">
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4 mr-2" />
                    )}
                    Send Test Email
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alert Types
                  </CardTitle>
                  <CardDescription>Configure which events trigger notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="maintenanceNotifications">Maintenance Alerts</Label>
                    <Switch
                      id="maintenanceNotifications"
                      checked={settings.maintenanceNotifications}
                      onCheckedChange={(checked) => handleSettingChange("maintenanceNotifications", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="securityAlerts">Security Alerts</Label>
                    <Switch
                      id="securityAlerts"
                      checked={settings.securityAlerts}
                      onCheckedChange={(checked) => handleSettingChange("securityAlerts", checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Email Recipients</Label>
                    <div className="space-y-2">
                      <Input placeholder="admin@example.com" />
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Recipient
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Management */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LLM Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    LLM Configuration
                  </CardTitle>
                  <CardDescription>Configure AI model providers and API keys</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="primaryProvider">Primary LLM Provider</Label>
                    <Select value={settings.primaryLLMProvider || "openai"} onValueChange={(value) => handleSettingChange("primaryLLMProvider", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI (GPT-4)</SelectItem>
                        <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                        <SelectItem value="azure">Azure OpenAI</SelectItem>
                        <SelectItem value="google">Google (Gemini)</SelectItem>
                        <SelectItem value="local">Local Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="openaiKey">OpenAI API Key</Label>
                    <div className="flex gap-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={settings.openaiKey || "sk-..."}
                        onChange={(e) => handleSettingChange("openaiKey", e.target.value)}
                        placeholder="sk-..."
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="anthropicKey">Anthropic API Key</Label>
                    <Input
                      type="password"
                      value={settings.anthropicKey || ""}
                      onChange={(e) => handleSettingChange("anthropicKey", e.target.value)}
                      placeholder="sk-ant-..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="medicalModel">Medical-Specific Model</Label>
                    <Select value={settings.medicalModel || "gpt-4-medical"} onValueChange={(value) => handleSettingChange("medicalModel", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4-medical">GPT-4 Medical Tuned</SelectItem>
                        <SelectItem value="claude-3-medical">Claude 3 Medical</SelectItem>
                        <SelectItem value="med-palm">Med-PaLM 2</SelectItem>
                        <SelectItem value="custom">Custom Medical Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* AI Safety & Ethics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    AI Safety & Ethics
                  </CardTitle>
                  <CardDescription>Configure safety protocols and ethical guidelines</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="medicalDisclaimer">Medical Disclaimer Required</Label>
                    <Switch
                      id="medicalDisclaimer"
                      checked={settings.medicalDisclaimer !== false}
                      onCheckedChange={(checked) => handleSettingChange("medicalDisclaimer", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="humanOversight">Human Oversight Required</Label>
                    <Switch
                      id="humanOversight"
                      checked={settings.humanOversight !== false}
                      onCheckedChange={(checked) => handleSettingChange("humanOversight", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="contentFiltering">Content Filtering</Label>
                    <Switch
                      id="contentFiltering"
                      checked={settings.contentFiltering !== false}
                      onCheckedChange={(checked) => handleSettingChange("contentFiltering", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confidenceThreshold">Minimum Confidence Threshold</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={settings.confidenceThreshold || 85}
                        onChange={(e) => handleSettingChange("confidenceThreshold", parseInt(e.target.value))}
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Response Tokens</Label>
                    <Input
                      type="number"
                      value={settings.maxTokens || 2048}
                      onChange={(e) => handleSettingChange("maxTokens", parseInt(e.target.value))}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Clinical Decision Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5" />
                    Clinical Decision Support
                  </CardTitle>
                  <CardDescription>Configure AI-powered clinical recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="drugInteractionChecks">Drug Interaction Checks</Label>
                    <Switch
                      id="drugInteractionChecks"
                      checked={settings.drugInteractionChecks !== false}
                      onCheckedChange={(checked) => handleSettingChange("drugInteractionChecks", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="diagnosisAssistance">Diagnosis Assistance</Label>
                    <Switch
                      id="diagnosisAssistance"
                      checked={settings.diagnosisAssistance !== false}
                      onCheckedChange={(checked) => handleSettingChange("diagnosisAssistance", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="treatmentSuggestions">Treatment Suggestions</Label>
                    <Switch
                      id="treatmentSuggestions"
                      checked={settings.treatmentSuggestions !== false}
                      onCheckedChange={(checked) => handleSettingChange("treatmentSuggestions", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clinicalDatabase">Clinical Knowledge Database</Label>
                    <Select value={settings.clinicalDatabase || "pubmed"} onValueChange={(value) => handleSettingChange("clinicalDatabase", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pubmed">PubMed + Medical Literature</SelectItem>
                        <SelectItem value="uptodate">UpToDate Integration</SelectItem>
                        <SelectItem value="mayo">Mayo Clinic Guidelines</SelectItem>
                        <SelectItem value="custom">Custom Knowledge Base</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialtyFocus">Medical Specialty Focus</Label>
                    <Select value={settings.specialtyFocus || "general"} onValueChange={(value) => handleSettingChange("specialtyFocus", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Medicine</SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="oncology">Oncology</SelectItem>
                        <SelectItem value="pediatrics">Pediatrics</SelectItem>
                        <SelectItem value="psychiatry">Psychiatry</SelectItem>
                        <SelectItem value="emergency">Emergency Medicine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Monitoring & Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Usage Monitoring
                  </CardTitle>
                  <CardDescription>Monitor AI usage, costs, and performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">12.4K</p>
                      <p className="text-sm text-muted-foreground">API Calls Today</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">$247.80</p>
                      <p className="text-sm text-muted-foreground">Monthly Cost</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Token Usage</span>
                      <span>2.8M / 5M tokens</span>
                    </div>
                    <Progress value={56} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usageAlerts">Usage Alerts</Label>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Alert at 80% of monthly limit</span>
                      <Switch
                        checked={settings.usageAlerts !== false}
                        onCheckedChange={(checked) => handleSettingChange("usageAlerts", checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthlyBudget">Monthly Budget Limit</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">$</span>
                      <Input
                        type="number"
                        value={settings.monthlyBudget || 500}
                        onChange={(e) => handleSettingChange("monthlyBudget", parseInt(e.target.value))}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export Usage Report
                  </Button>
                </CardContent>
              </Card>

              {/* Model Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Model Performance
                  </CardTitle>
                  <CardDescription>Monitor AI model accuracy and response quality</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Diagnostic Accuracy</span>
                        <span className="text-sm text-muted-foreground">94.2%</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">Response Time</span>
                        <span className="text-sm text-muted-foreground">1.3s avg</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">User Satisfaction</span>
                        <span className="text-sm text-muted-foreground">4.7/5</span>
                      </div>
                      <Progress value={94} className="h-2" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoModelUpdate">Auto Model Updates</Label>
                    <Switch
                      id="autoModelUpdate"
                      checked={settings.autoModelUpdate !== false}
                      onCheckedChange={(checked) => handleSettingChange("autoModelUpdate", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="performanceLogging">Performance Logging</Label>
                    <Switch
                      id="performanceLogging"
                      checked={settings.performanceLogging !== false}
                      onCheckedChange={(checked) => handleSettingChange("performanceLogging", checked)}
                    />
                  </div>

                  <Button variant="outline" className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Recalibrate Models
                  </Button>
                </CardContent>
              </Card>

              {/* Compliance & Audit */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    AI Compliance & Audit
                  </CardTitle>
                  <CardDescription>Ensure AI systems meet regulatory requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="aiAuditLogging">AI Decision Audit Logging</Label>
                    <Switch
                      id="aiAuditLogging"
                      checked={settings.aiAuditLogging !== false}
                      onCheckedChange={(checked) => handleSettingChange("aiAuditLogging", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="biasMonitoring">Bias Monitoring</Label>
                    <Switch
                      id="biasMonitoring"
                      checked={settings.biasMonitoring !== false}
                      onCheckedChange={(checked) => handleSettingChange("biasMonitoring", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="explainableAI">Explainable AI Outputs</Label>
                    <Switch
                      id="explainableAI"
                      checked={settings.explainableAI !== false}
                      onCheckedChange={(checked) => handleSettingChange("explainableAI", checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complianceFramework">Compliance Framework</Label>
                    <Select value={settings.complianceFramework || "fda"} onValueChange={(value) => handleSettingChange("complianceFramework", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fda">FDA Medical Device</SelectItem>
                        <SelectItem value="eu-mdr">EU MDR</SelectItem>
                        <SelectItem value="iso13485">ISO 13485</SelectItem>
                        <SelectItem value="hipaa">HIPAA Compliant</SelectItem>
                        <SelectItem value="custom">Custom Framework</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      AI Audit Report
                    </Button>
                    <Button variant="outline" size="sm">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Compliance Check
                    </Button>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Last compliance audit: February 10, 2024
                    </p>
                    <p className="text-xs text-green-600">
                      ✓ All AI systems compliant
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Backup & Recovery
                  </CardTitle>
                  <CardDescription>Configure automatic backups and data recovery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoBackup">Enable Automatic Backups</Label>
                    <Switch
                      id="autoBackup"
                      checked={settings.autoBackup}
                      onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Backup Frequency</Label>
                    <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange("backupFrequency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Every Hour</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Data Retention (years)</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={settings.dataRetention}
                      onChange={(e) => handleSettingChange("dataRetention", e.target.value)}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleBackupNow} disabled={isLoading} className="flex-1">
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Backup Now
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Upload className="w-4 h-4 mr-2" />
                      Restore
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    System Monitoring
                  </CardTitle>
                  <CardDescription>Performance monitoring and logging settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auditLogging">Enable Audit Logging</Label>
                    <Switch
                      id="auditLogging"
                      checked={settings.auditLogging}
                      onCheckedChange={(checked) => handleSettingChange("auditLogging", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="performanceMonitoring">Performance Monitoring</Label>
                    <Switch
                      id="performanceMonitoring"
                      checked={settings.performanceMonitoring}
                      onCheckedChange={(checked) => handleSettingChange("performanceMonitoring", checked)}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CPU Usage</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Memory Usage</span>
                      <span className="text-sm font-medium">62%</span>
                    </div>
                    <Progress value={62} className="h-2" />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Disk Usage</span>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Detailed Metrics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Settings */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Healthcare Compliance
                  </CardTitle>
                  <CardDescription>HIPAA and healthcare-specific compliance settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="hipaaCompliance">HIPAA Compliance</Label>
                      <p className="text-sm text-muted-foreground">Enable HIPAA-compliant data handling</p>
                    </div>
                    <Switch
                      id="hipaaCompliance"
                      checked={settings.hipaaCompliance}
                      onCheckedChange={(checked) => handleSettingChange("hipaaCompliance", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dataEncryption">Data Encryption</Label>
                      <p className="text-sm text-muted-foreground">Encrypt all data at rest and in transit</p>
                    </div>
                    <Switch
                      id="dataEncryption"
                      checked={settings.dataEncryption}
                      onCheckedChange={(checked) => handleSettingChange("dataEncryption", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auditTrail">Audit Trail</Label>
                      <p className="text-sm text-muted-foreground">Maintain comprehensive audit logs</p>
                    </div>
                    <Switch
                      id="auditTrail"
                      checked={settings.auditTrail}
                      onCheckedChange={(checked) => handleSettingChange("auditTrail", checked)}
                    />
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">HIPAA Compliant</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      All required HIPAA safeguards are properly configured
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flag className="w-5 h-5" />
                    Privacy Regulations
                  </CardTitle>
                  <CardDescription>GDPR and other privacy compliance settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="gdprCompliance">GDPR Compliance</Label>
                      <p className="text-sm text-muted-foreground">Enable GDPR data protection features</p>
                    </div>
                    <Switch
                      id="gdprCompliance"
                      checked={settings.gdprCompliance}
                      onCheckedChange={(checked) => handleSettingChange("gdprCompliance", checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Privacy Policy</Label>
                    <div className="flex gap-2">
                      <Input placeholder="https://yoursite.com/privacy" className="flex-1" />
                      <Button variant="outline">Update</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Terms of Service</Label>
                    <div className="flex gap-2">
                      <Input placeholder="https://yoursite.com/terms" className="flex-1" />
                      <Button variant="outline">Update</Button>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Data Purge Request
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Data Purge Request</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all data older than the retention period. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Confirm Purge
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
