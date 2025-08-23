import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import {
  Activity,
  Heart,
  Thermometer,
  Droplets,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RefreshCw,
  Bell,
  Shield,
  Zap,
  Clock,
  Monitor,
  Smartphone,
  Watch,
  Battery,
  Signal
} from 'lucide-react';

export function RealTimeDashboard() {
  // Step 1: Use static data to isolate WebSocket issues
  const [data, setData] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState<string | null>(null);
  
  // Step 2: Initialize with static vital signs data
  const [vitalSigns, setVitalSigns] = useState({
    heartRate: 72,
    bloodPressure: { systolic: 120, diastolic: 80 },
    temperature: 98.6,
    oxygenSaturation: 98,
    respiratoryRate: 16
  });

  // Step 3: Safe alerts initialization
  const [alerts, setAlerts] = useState<any[]>([]);

  // Step 4: Test with static data first
  useEffect(() => {
    console.log('=== Static Data Test ===');
    
    // Simulating WebSocket data being received
    const simulatedData = ['heartRate', 'bloodPressure', 'temperature', 'oxygenSaturation'];
    console.log('Setting simulated data:', simulatedData);
    
    setData(simulatedData);
    
    // Test indexOf with static data
    try {
      if (Array.isArray(simulatedData)) {
        const testIndex = simulatedData.indexOf('heartRate');
        console.log('Static data indexOf test successful:', testIndex);
      }
    } catch (error) {
      console.error('Error with static data indexOf:', error);
    }
    
    console.log('=== End Static Data Test ===');
  }, []);

  // Step 5: Simplified WebSocket connection with extensive debugging
  useEffect(() => {
    console.log('=== WebSocket Connection Test ===');
    
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
    console.log('WebSocket URL:', wsUrl);
    
    if (!wsUrl || typeof wsUrl !== 'string') {
      console.error('Invalid WebSocket URL:', wsUrl);
      setWsError('Invalid WebSocket URL');
      return;
    }

    let ws: WebSocket | null = null;
    
    try {
      console.log('Creating WebSocket connection to:', wsUrl);
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connection opened successfully');
        setWsConnected(true);
        setWsError(null);
      };

      ws.onmessage = (event) => {
        console.log('=== WebSocket Message Received ===');
        console.log('Raw event data:', event.data);
        console.log('Event data type:', typeof event.data);
        
        try {
          if (typeof event.data === 'string') {
            const parsedData = JSON.parse(event.data);
            console.log('Parsed data:', parsedData);
            console.log('Parsed data type:', typeof parsedData);
            console.log('Is parsed data an array?', Array.isArray(parsedData));

            if (Array.isArray(parsedData)) {
              console.log('Setting WebSocket data array');
              setData(parsedData);
              
              // Test indexOf with WebSocket data
              try {
                const testIndex = parsedData.indexOf('test');
                console.log('WebSocket data indexOf test:', testIndex);
              } catch (indexError) {
                console.error('Error with WebSocket data indexOf:', indexError);
              }
            } else if (parsedData && typeof parsedData === 'object') {
              console.log('Received object data, processing...');
              
              if (parsedData.type === 'vital_signs' && parsedData.data) {
                console.log('Processing vital signs update');
                setVitalSigns(prev => ({ ...prev, ...parsedData.data }));
              } else if (parsedData.type === 'health_alert' && parsedData.data) {
                console.log('Processing health alert');
                setAlerts(prev => {
                  const newAlert = parsedData.data;
                  const updatedAlerts = [newAlert];
                  
                  // Manual array construction to avoid any indexOf usage
                  for (let i = 0; i < Math.min(4, prev.length); i++) {
                    updatedAlerts.push(prev[i]);
                  }
                  
                  return updatedAlerts;
                });
              }
            } else {
              console.error('Parsed data is neither array nor expected object:', parsedData);
            }
          } else {
            console.error('WebSocket data is not a string:', typeof event.data);
          }
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
        }
        
        console.log('=== End WebSocket Message Processing ===');
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsError('WebSocket connection error');
        setWsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setWsConnected(false);
      };

    } catch (connectionError) {
      console.error('Error creating WebSocket:', connectionError);
      setWsError('Failed to create WebSocket connection');
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        console.log('Cleaning up WebSocket connection');
        ws.close();
      }
    };
  }, []);

  // Step 6: Simulation effect with safe array handling
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isSimulating) {
      console.log('Starting vital signs simulation');
      
      interval = setInterval(() => {
        try {
          const newVitals = {
            heartRate: Math.max(60, Math.min(100, vitalSigns.heartRate + (Math.random() - 0.5) * 6)),
            bloodPressure: {
              systolic: Math.max(90, Math.min(140, vitalSigns.bloodPressure.systolic + (Math.random() - 0.5) * 4)),
              diastolic: Math.max(60, Math.min(90, vitalSigns.bloodPressure.diastolic + (Math.random() - 0.5) * 3))
            },
            temperature: Math.max(97.0, Math.min(99.5, vitalSigns.temperature + (Math.random() - 0.5) * 0.2)),
            oxygenSaturation: Math.max(95, Math.min(100, vitalSigns.oxygenSaturation + (Math.random() - 0.5) * 1)),
            respiratoryRate: Math.max(12, Math.min(20, vitalSigns.respiratoryRate + (Math.random() - 0.5) * 2))
          };

          console.log('Generated new vitals:', newVitals);
          setVitalSigns(newVitals);

          // Generate alerts with completely safe array handling
          if (newVitals.heartRate > 90 || newVitals.heartRate < 65) {
            console.log('Generating heart rate alert');
            setAlerts(prevAlerts => {
              const newAlert = {
                id: Date.now(),
                type: 'warning',
                message: `Heart rate ${newVitals.heartRate < 65 ? 'low' : 'elevated'}: ${Math.round(newVitals.heartRate)} bpm`,
                timestamp: new Date(),
                severity: newVitals.heartRate > 95 || newVitals.heartRate < 60 ? 'high' : 'medium'
              };
              
              // Manual array construction - completely avoid any built-in array methods
              const result = [newAlert];
              if (prevAlerts && Array.isArray(prevAlerts)) {
                for (let i = 0; i < Math.min(4, prevAlerts.length); i++) {
                  result.push(prevAlerts[i]);
                }
              }
              
              return result;
            });
          }
        } catch (simulationError) {
          console.error('Error in vital signs simulation:', simulationError);
        }
      }, 3000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isSimulating, vitalSigns]);

  // Step 7: Safe utility functions
  const getVitalStatus = (vital: string, value: number | { systolic: number; diastolic: number }) => {
    try {
      if (value === undefined || value === null) {
        return 'normal';
      }

      switch (vital) {
        case 'heartRate':
          const hr = value as number;
          if (typeof hr !== 'number' || isNaN(hr)) return 'normal';
          if (hr < 60 || hr > 100) return 'warning';
          if (hr < 65 || hr > 90) return 'caution';
          return 'normal';
        case 'bloodPressure':
          const bp = value as { systolic: number; diastolic: number };
          if (!bp || typeof bp !== 'object') return 'normal';
          if (bp.systolic > 140 || bp.diastolic > 90) return 'warning';
          if (bp.systolic > 130 || bp.diastolic > 85) return 'caution';
          return 'normal';
        case 'temperature':
          const temp = value as number;
          if (typeof temp !== 'number' || isNaN(temp)) return 'normal';
          if (temp < 97.0 || temp > 99.5) return 'warning';
          if (temp < 97.5 || temp > 99.0) return 'caution';
          return 'normal';
        case 'oxygenSaturation':
          const spo2 = value as number;
          if (typeof spo2 !== 'number' || isNaN(spo2)) return 'normal';
          if (spo2 < 95) return 'warning';
          if (spo2 < 97) return 'caution';
          return 'normal';
        default:
          return 'normal';
      }
    } catch (error) {
      console.error('Error in getVitalStatus:', error);
      return 'normal';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'caution':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'warning':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  // Step 8: Safe item click handler for testing
  const handleItemClick = (item: string) => {
    console.log('=== Item Click Test ===');
    console.log('Clicked item:', item);
    console.log('Current data:', data);
    console.log('Is data an array?', Array.isArray(data));
    
    try {
      if (Array.isArray(data)) {
        // Safe indexOf usage with extensive logging
        console.log('Attempting indexOf on data array');
        const index = data.indexOf(item);
        console.log('Item index found:', index);
      } else {
        console.error('Data is not an array, cannot use indexOf');
      }
    } catch (indexError) {
      console.error('Error using indexOf:', indexError);
    }
    
    console.log('=== End Item Click Test ===');
  };

  // Step 9: Connected devices data
  const connectedDevices = [
    { name: 'Apple Watch Series 9', status: 'connected', battery: 78, lastSync: '2 min ago' },
    { name: 'Omron BP Monitor', status: 'connected', battery: 45, lastSync: '5 min ago' },
    { name: 'Oura Ring Gen 3', status: 'connected', battery: 62, lastSync: '1 min ago' },
    { name: 'Withings Scale', status: 'connected', battery: 89, lastSync: '1 hour ago' }
  ];

  return (
    <div className="space-y-6">
      {/* Debug Information */}
      <Card className="glass-morphism border border-border/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>WebSocket URL: {import.meta.env.VITE_WS_URL || 'ws://localhost:8080'}</div>
            <div>WebSocket Connected: {wsConnected ? 'Yes' : 'No'}</div>
            <div>WebSocket Error: {wsError || 'None'}</div>
            <div>Data Array Length: {data.length}</div>
            <div>Is Data Array: {Array.isArray(data) ? 'Yes' : 'No'}</div>
            <div>Simulation Active: {isSimulating ? 'Yes' : 'No'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Real-time Health Monitoring</h2>
            <p className="text-muted-foreground">Live vital signs with AI-powered alerts</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {wsConnected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {wsConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <Button
            variant={isSimulating ? "destructive" : "default"}
            size="sm"
            onClick={() => setIsSimulating(!isSimulating)}
            className={isSimulating ? "" : "gradient-bg text-white border-0"}
          >
            {isSimulating ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Demo
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Demo
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Static Data Test Section */}
      <Card className="glass-morphism border border-border/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground">Static Data Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Test Data Array:</h4>
              {data.length === 0 ? (
                <p className="text-muted-foreground">No data available</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {data.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleItemClick(item)}
                      className="p-2 bg-primary/10 rounded-lg text-sm hover:bg-primary/20 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Vital Signs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-morphism border border-border/20 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-muted-foreground">Heart Rate</span>
              </div>
              <Badge className={getStatusColor(getVitalStatus('heartRate', vitalSigns.heartRate))}>
                {getVitalStatus('heartRate', vitalSigns.heartRate)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-foreground">
                  {Math.round(vitalSigns.heartRate)}
                </span>
                <span className="text-sm text-muted-foreground">bpm</span>
              </div>
              <div className="text-xs text-muted-foreground">Normal: 60-100 bpm</div>
              {isSimulating && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism border border-border/20 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">Blood Pressure</span>
              </div>
              <Badge className={getStatusColor(getVitalStatus('bloodPressure', vitalSigns.bloodPressure))}>
                {getVitalStatus('bloodPressure', vitalSigns.bloodPressure)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-foreground">
                  {Math.round(vitalSigns.bloodPressure.systolic)}/{Math.round(vitalSigns.bloodPressure.diastolic)}
                </span>
                <span className="text-sm text-muted-foreground">mmHg</span>
              </div>
              <div className="text-xs text-muted-foreground">Normal: {'<'}120/80 mmHg</div>
              {isSimulating && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism border border-border/20 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-muted-foreground">Temperature</span>
              </div>
              <Badge className={getStatusColor(getVitalStatus('temperature', vitalSigns.temperature))}>
                {getVitalStatus('temperature', vitalSigns.temperature)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-foreground">
                  {vitalSigns.temperature.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">°F</span>
              </div>
              <div className="text-xs text-muted-foreground">Normal: 97.0-99.0°F</div>
              {isSimulating && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-morphism border border-border/20 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Droplets className="w-5 h-5 text-cyan-500" />
                <span className="text-sm font-medium text-muted-foreground">SpO2</span>
              </div>
              <Badge className={getStatusColor(getVitalStatus('oxygenSaturation', vitalSigns.oxygenSaturation))}>
                {getVitalStatus('oxygenSaturation', vitalSigns.oxygenSaturation)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline space-x-1">
                <span className="text-3xl font-bold text-foreground">
                  {Math.round(vitalSigns.oxygenSaturation)}
                </span>
                <span className="text-sm text-muted-foreground">%</span>
              </div>
              <div className="text-xs text-muted-foreground">Normal: 95-100%</div>
              {isSimulating && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Alerts */}
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center">
              <Bell className="w-5 h-5 text-primary mr-2" />
              Health Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.isArray(alerts) && alerts.length > 0 ? (
                alerts.map((alert, index) => {
                  if (!alert || typeof alert !== 'object') {
                    return null;
                  }

                  return (
                    <div
                      key={alert.id || index}
                      className={`p-4 rounded-xl border-2 ${getAlertColor(alert.severity || 'low')} hover-lift`}
                    >
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                          alert.severity === 'high' ? 'text-red-500' : 
                          alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground mb-1">
                            {alert.message || 'Unknown alert'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {alert.timestamp ? 
                              (alert.timestamp instanceof Date ? 
                                alert.timestamp.toLocaleTimeString() : 
                                new Date(alert.timestamp).toLocaleTimeString()
                              ) : 'Unknown time'
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>All vitals normal</p>
                  <p className="text-xs">No alerts at this time</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Connected Devices */}
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center">
              <Smartphone className="w-5 h-5 text-primary mr-2" />
              Connected Devices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {connectedDevices.map((device, index) => (
                <div key={index} className="glass-morphism p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{device.name}</span>
                    <Badge className={device.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {device.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Battery className="w-3 h-3" />
                      <span>{device.battery}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{device.lastSync}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="glass-morphism border border-border/20">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center">
              <Shield className="w-5 h-5 text-primary mr-2" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="glass-morphism p-3 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">AI Processing</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-xs text-muted-foreground">All systems operational</div>
              </div>

              <div className="glass-morphism p-3 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Data Security</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-xs text-muted-foreground">End-to-end encrypted</div>
              </div>

              <div className="glass-morphism p-3 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">HIPAA Compliance</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-xs text-muted-foreground">Fully compliant</div>
              </div>

              <div className="glass-morphism p-3 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Response Time</span>
                  <Zap className="w-4 h-4 text-yellow-500" />
                </div>
                <div className="text-xs text-muted-foreground">{'<'} 2 seconds avg</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Chart */}
      <Card className="glass-morphism border border-border/20">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center">
            <TrendingUp className="w-5 h-5 text-primary mr-2" />
            Live Vital Signs Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <Monitor className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Real-time charting visualization</p>
              <p className="text-sm text-muted-foreground">
                {isSimulating ? 'Demo mode active - simulated data' : 'Start demo to see live trends'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}