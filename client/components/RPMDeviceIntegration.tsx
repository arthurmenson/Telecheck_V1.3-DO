import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  Smartphone,
  Wifi,
  Battery,
  Bluetooth,
  CheckCircle,
  AlertTriangle,
  Settings,
  RefreshCw,
  Plus,
  Search,
  Activity,
  Heart,
  Scale,
  Thermometer,
  Droplets,
  Timer,
  Signal,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Clock,
  Calendar,
  BarChart3,
  Target,
  TrendingUp,
  TrendingDown,
  Zap,
  Shield,
  Users,
  Info,
  HelpCircle,
  Phone,
  Mail,
  Globe
} from "lucide-react";

interface DeviceType {
  id: string;
  name: string;
  category: "glucose" | "cgm" | "blood_pressure" | "weight" | "heart_rate" | "pulse_ox" | "temperature";
  manufacturer: string;
  model: string;
  connectivity: string[];
  dataTypes: string[];
  frequency: string;
  batteryLife: string;
  accuracy: string;
  fdaApproved: boolean;
  cmsReimbursable: boolean;
  setupComplexity: "easy" | "moderate" | "complex";
  cost: number;
  compatibility: string[];
}

interface ConnectedDevice {
  id: string;
  deviceType: DeviceType;
  patientId: string;
  serialNumber: string;
  connectionStatus: "connected" | "disconnected" | "syncing" | "error";
  batteryLevel: number;
  lastSync: string;
  lastReading: {
    value: number | string;
    unit: string;
    timestamp: string;
    quality: "good" | "fair" | "poor";
  };
  syncFrequency: string;
  dataPoints: number;
  alerts: Array<{
    type: "battery" | "connection" | "reading" | "calibration";
    message: string;
    severity: "low" | "medium" | "high";
    timestamp: string;
  }>;
  setupDate: string;
  warrantyExpiry: string;
}

interface DeviceReading {
  deviceId: string;
  patientId: string;
  value: number;
  unit: string;
  timestamp: string;
  type: string;
  quality: "good" | "fair" | "poor";
  flags: string[];
  context?: {
    activity?: string;
    medication?: string;
    meal?: string;
    notes?: string;
  };
}

const deviceCatalog: DeviceType[] = [
  {
    id: "dexcom_g7",
    name: "Dexcom G7 CGM",
    category: "cgm",
    manufacturer: "Dexcom",
    model: "G7",
    connectivity: ["Bluetooth", "Mobile App"],
    dataTypes: ["Glucose", "Glucose Trends", "Alerts"],
    frequency: "Every minute",
    batteryLife: "10 days",
    accuracy: "8.2% MARD",
    fdaApproved: true,
    cmsReimbursable: true,
    setupComplexity: "moderate",
    cost: 89.99,
    compatibility: ["iOS", "Android", "Receiver"]
  },
  {
    id: "freestyle_libre_3",
    name: "FreeStyle Libre 3",
    category: "cgm", 
    manufacturer: "Abbott",
    model: "Libre 3",
    connectivity: ["Bluetooth", "NFC"],
    dataTypes: ["Glucose", "Trends", "Alarms"],
    frequency: "Every minute",
    batteryLife: "14 days",
    accuracy: "9.2% MARD",
    fdaApproved: true,
    cmsReimbursable: true,
    setupComplexity: "easy",
    cost: 75.99,
    compatibility: ["iOS", "Android"]
  },
  {
    id: "onetouch_verio",
    name: "OneTouch Verio Reflect",
    category: "glucose",
    manufacturer: "LifeScan",
    model: "Verio Reflect",
    connectivity: ["Bluetooth"],
    dataTypes: ["Blood Glucose"],
    frequency: "Manual testing",
    batteryLife: "1000 tests",
    accuracy: "±15% or ±15 mg/dL",
    fdaApproved: true,
    cmsReimbursable: true,
    setupComplexity: "easy",
    cost: 25.99,
    compatibility: ["iOS", "Android"]
  },
  {
    id: "omron_10_series",
    name: "Omron 10 Series BP Monitor",
    category: "blood_pressure",
    manufacturer: "Omron",
    model: "BP785N",
    connectivity: ["Bluetooth"],
    dataTypes: ["Systolic BP", "Diastolic BP", "Heart Rate"],
    frequency: "Manual readings",
    batteryLife: "300 readings",
    accuracy: "±3 mmHg",
    fdaApproved: true,
    cmsReimbursable: true,
    setupComplexity: "easy",
    cost: 79.99,
    compatibility: ["iOS", "Android"]
  },
  {
    id: "withings_body_plus",
    name: "Withings Body+ Scale",
    category: "weight",
    manufacturer: "Withings",
    model: "Body+",
    connectivity: ["WiFi", "Bluetooth"],
    dataTypes: ["Weight", "BMI", "Body Fat %", "Muscle Mass"],
    frequency: "Each weigh-in",
    batteryLife: "18 months",
    accuracy: "±0.1 kg",
    fdaApproved: true,
    cmsReimbursable: true,
    setupComplexity: "moderate",
    cost: 99.99,
    compatibility: ["iOS", "Android", "Web"]
  }
];

const mockConnectedDevices: ConnectedDevice[] = [
  {
    id: "device_001",
    deviceType: deviceCatalog[0], // Dexcom G7
    patientId: "rpm_001",
    serialNumber: "DG7-2024-001234",
    connectionStatus: "connected",
    batteryLevel: 85,
    lastSync: "2024-01-16T08:30:00",
    lastReading: {
      value: 128,
      unit: "mg/dL",
      timestamp: "2024-01-16T08:25:00",
      quality: "good"
    },
    syncFrequency: "Every 15 minutes",
    dataPoints: 14400, // 10 days * 24 hours * 60 minutes
    alerts: [
      {
        type: "reading",
        message: "Glucose trending high after meal",
        severity: "medium",
        timestamp: "2024-01-16T07:45:00"
      }
    ],
    setupDate: "2024-01-05T10:00:00",
    warrantyExpiry: "2025-01-05"
  },
  {
    id: "device_002",
    deviceType: deviceCatalog[3], // Omron BP Monitor
    patientId: "rpm_001",
    serialNumber: "OM-BP785-9876",
    connectionStatus: "connected",
    batteryLevel: 60,
    lastSync: "2024-01-16T06:00:00",
    lastReading: {
      value: "128/82",
      unit: "mmHg",
      timestamp: "2024-01-16T06:00:00",
      quality: "good"
    },
    syncFrequency: "After each reading",
    dataPoints: 145,
    alerts: [],
    setupDate: "2024-01-05T11:00:00",
    warrantyExpiry: "2026-01-05"
  }
];

export function RPMDeviceIntegration() {
  const [activeTab, setActiveTab] = useState("overview");
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>(mockConnectedDevices);
  const [availableDevices, setAvailableDevices] = useState<DeviceType[]>(deviceCatalog);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<ConnectedDevice | null>(null);
  const [deviceFilter, setDeviceFilter] = useState<string>("all");

  const totalDevices = connectedDevices.length;
  const activeDevices = connectedDevices.filter(d => d.connectionStatus === "connected").length;
  const lowBatteryDevices = connectedDevices.filter(d => d.batteryLevel < 20).length;
  const recentAlerts = connectedDevices.flatMap(d => d.alerts).length;

  const handleDevicePairing = async (deviceType: DeviceType) => {
    setIsScanning(true);
    // Simulate device pairing process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const newDevice: ConnectedDevice = {
      id: `device_${Date.now()}`,
      deviceType,
      patientId: "rpm_001",
      serialNumber: `${deviceType.manufacturer.toUpperCase()}-${Date.now()}`,
      connectionStatus: "connected",
      batteryLevel: 100,
      lastSync: new Date().toISOString(),
      lastReading: {
        value: deviceType.category === "glucose" ? 120 : deviceType.category === "blood_pressure" ? "120/80" : 75,
        unit: deviceType.category === "glucose" ? "mg/dL" : deviceType.category === "blood_pressure" ? "mmHg" : "kg",
        timestamp: new Date().toISOString(),
        quality: "good"
      },
      syncFrequency: deviceType.frequency,
      dataPoints: 0,
      alerts: [],
      setupDate: new Date().toISOString(),
      warrantyExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setConnectedDevices([...connectedDevices, newDevice]);
    setIsScanning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "bg-green-500";
      case "syncing": return "bg-blue-500";
      case "disconnected": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected": return { color: "default", text: "Connected" };
      case "syncing": return { color: "secondary", text: "Syncing" };
      case "disconnected": return { color: "warning", text: "Disconnected" };
      case "error": return { color: "destructive", text: "Error" };
      default: return { color: "secondary", text: "Unknown" };
    }
  };

  const filteredDevices = deviceFilter === "all" 
    ? connectedDevices 
    : connectedDevices.filter(d => d.deviceType.category === deviceFilter);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            RPM Device Integration
          </h1>
          <p className="text-muted-foreground">
            Manage connected devices and monitor patient data streams
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            {activeDevices}/{totalDevices} Active
          </Badge>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Devices</p>
                <div className="text-2xl font-bold">{totalDevices}</div>
                <p className="text-sm text-muted-foreground">Registered</p>
              </div>
              <Smartphone className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Devices</p>
                <div className="text-2xl font-bold text-green-600">{activeDevices}</div>
                <p className="text-sm text-green-600">Currently connected</p>
              </div>
              <Signal className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Battery</p>
                <div className="text-2xl font-bold text-yellow-600">{lowBatteryDevices}</div>
                <p className="text-sm text-muted-foreground">Need attention</p>
              </div>
              <Battery className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Recent Alerts</p>
                <div className="text-2xl font-bold text-red-600">{recentAlerts}</div>
                <p className="text-sm text-muted-foreground">Last 24 hours</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">My Devices</TabsTrigger>
          <TabsTrigger value="catalog">Device Catalog</TabsTrigger>
          <TabsTrigger value="data">Data Streams</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Device Status Monitor</CardTitle>
                <CardDescription>Real-time status of all connected devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectedDevices.map((device) => (
                  <Card key={device.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(device.connectionStatus)}`} />
                          {device.connectionStatus === "syncing" && (
                            <RefreshCw className="w-4 h-4 absolute -top-0.5 -left-0.5 animate-spin text-blue-500" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{device.deviceType.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {device.deviceType.manufacturer} • {device.serialNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadge(device.connectionStatus).color as any}>
                          {getStatusBadge(device.connectionStatus).text}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Battery className={`w-4 h-4 ${
                            device.batteryLevel > 50 ? "text-green-600" :
                            device.batteryLevel > 20 ? "text-yellow-600" : "text-red-600"
                          }`} />
                          <span className="text-sm">{device.batteryLevel}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Last Reading:</span>
                        <p className="font-medium">
                          {device.lastReading.value} {device.lastReading.unit}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Sync:</span>
                        <p className="font-medium">
                          {new Date(device.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data Points:</span>
                        <p className="font-medium">{device.dataPoints.toLocaleString()}</p>
                      </div>
                    </div>

                    {device.alerts.length > 0 && (
                      <Alert className="mt-3 border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <AlertDescription className="text-orange-800 dark:text-orange-200">
                          {device.alerts[0].message}
                        </AlertDescription>
                      </Alert>
                    )}
                  </Card>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start">
                    <Search className="w-4 h-4 mr-2" />
                    Scan for Devices
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync All Devices
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Device Settings
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Connectivity</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={92} className="w-16 h-2" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Quality</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={96} className="w-16 h-2" />
                      <span className="text-sm font-medium">96%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Sync Success Rate</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={98} className="w-16 h-2" />
                      <span className="text-sm font-medium">98%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold">Connected Devices</h3>
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  <SelectItem value="glucose">Glucose Meters</SelectItem>
                  <SelectItem value="cgm">CGM Systems</SelectItem>
                  <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                  <SelectItem value="weight">Weight Scales</SelectItem>
                  <SelectItem value="heart_rate">Heart Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh All
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDevices.map((device) => (
              <Card key={device.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{device.deviceType.name}</CardTitle>
                      <CardDescription>
                        {device.deviceType.manufacturer} • SN: {device.serialNumber}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadge(device.connectionStatus).color as any}>
                      {getStatusBadge(device.connectionStatus).text}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Battery Level</Label>
                      <div className="flex items-center space-x-2">
                        <Progress value={device.batteryLevel} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{device.batteryLevel}%</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Data Quality</Label>
                      <Badge variant={device.lastReading.quality === "good" ? "default" : "secondary"}>
                        {device.lastReading.quality}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Last Reading</Label>
                      <p className="font-medium text-lg">
                        {device.lastReading.value} {device.lastReading.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(device.lastReading.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Sync Frequency</Label>
                      <p className="font-medium">{device.syncFrequency}</p>
                      <p className="text-xs text-muted-foreground">
                        Last: {new Date(device.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={() => setSelectedDevice(device)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                    <div className="flex space-x-1">
                      {device.connectionStatus === "connected" ? (
                        <Button size="sm" variant="outline">
                          <Power className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <PowerOff className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Devices</h3>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search devices..."
                className="w-64"
              />
              <Button variant="outline">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {availableDevices.map((device) => (
              <Card key={device.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{device.name}</CardTitle>
                      <CardDescription>{device.manufacturer} • {device.model}</CardDescription>
                    </div>
                    <Badge variant="outline">{device.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Accuracy:</span>
                      <span className="font-medium">{device.accuracy}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Battery Life:</span>
                      <span className="font-medium">{device.batteryLife}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Connectivity:</span>
                      <span className="font-medium">{device.connectivity.join(", ")}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Setup:</span>
                      <Badge variant={
                        device.setupComplexity === "easy" ? "default" :
                        device.setupComplexity === "moderate" ? "secondary" : "destructive"
                      }>
                        {device.setupComplexity}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {device.fdaApproved && (
                      <Badge variant="outline" className="text-xs">FDA Approved</Badge>
                    )}
                    {device.cmsReimbursable && (
                      <Badge variant="outline" className="text-xs">CMS Reimbursable</Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <span className="text-lg font-bold">${device.cost}</span>
                      <span className="text-sm text-muted-foreground">/device</span>
                    </div>
                    <Button 
                      onClick={() => handleDevicePairing(device)}
                      disabled={isScanning}
                    >
                      {isScanning ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      {isScanning ? "Pairing..." : "Add Device"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Transmission Health</CardTitle>
                <CardDescription>Real-time monitoring of data flow from devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectedDevices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(device.connectionStatus)}`} />
                      <div>
                        <h5 className="font-medium">{device.deviceType.name}</h5>
                        <p className="text-sm text-muted-foreground">{device.dataPoints} data points</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">
                          {Math.round(device.dataPoints / 30)} avg/day
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Last: {new Date(device.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Export & Management</CardTitle>
                <CardDescription>Export patient data for analysis and reporting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">Glucose Readings</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">14,400 points</span>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">Blood Pressure</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">145 readings</span>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">Weight Measurements</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">45 entries</span>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Export All Data (CSV)
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Upload className="w-4 h-4 mr-2" />
                    Generate FHIR Bundle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync Settings</CardTitle>
                <CardDescription>Configure how and when devices sync data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Auto-Sync Frequency</Label>
                  <Select defaultValue="15min">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5min">Every 5 minutes</SelectItem>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="30min">Every 30 minutes</SelectItem>
                      <SelectItem value="60min">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Data Retention Period</Label>
                  <Select defaultValue="1year">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6months">6 months</SelectItem>
                      <SelectItem value="1year">1 year</SelectItem>
                      <SelectItem value="2years">2 years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sync Preferences</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="wifiOnly" defaultChecked />
                      <Label htmlFor="wifiOnly">WiFi only sync</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="backgroundSync" defaultChecked />
                      <Label htmlFor="backgroundSync">Background sync</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="lowPowerMode" />
                      <Label htmlFor="lowPowerMode">Low power mode</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Alert Settings</CardTitle>
                <CardDescription>Configure device alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Low Battery Alerts</Label>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Connection Lost Alerts</Label>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Data Quality Alerts</Label>
                    <input type="checkbox" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Calibration Reminders</Label>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>

                <div>
                  <Label>Battery Alert Threshold</Label>
                  <div className="flex items-center space-x-4 mt-2">
                    <span>0%</span>
                    <input type="range" min="0" max="50" defaultValue="20" className="flex-1" />
                    <span>50%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Currently set to 20%</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Label({ children, className, htmlFor, ...props }: { 
  children: React.ReactNode; 
  className?: string; 
  htmlFor?: string;
  [key: string]: any;
}) {
  return (
    <label htmlFor={htmlFor} className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props}>
      {children}
    </label>
  );
}
