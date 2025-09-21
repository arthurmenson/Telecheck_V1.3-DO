// Wearable Device Integration Service
export class WearableIntegrationService {
  private static connectedDevices = new Map();

  // Apple Health integration simulation
  static async syncAppleHealth(userId: string): Promise<{
    steps: number;
    heartRate: number[];
    sleepData: any;
    workouts: any[];
    lastSync: string;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock Apple Health data
    return {
      steps: 8543,
      heartRate: [68, 72, 75, 71, 69, 73, 70], // Last 7 readings
      sleepData: {
        duration: 7.5,
        efficiency: 92,
        deepSleep: 1.8,
        remSleep: 1.2,
        restingHeartRate: 58,
      },
      workouts: [
        {
          type: "Walking",
          duration: 45,
          calories: 180,
          startTime: "2024-02-15T07:00:00Z",
          averageHeartRate: 95,
        },
        {
          type: "Strength Training",
          duration: 30,
          calories: 150,
          startTime: "2024-02-14T18:00:00Z",
          averageHeartRate: 110,
        },
      ],
      lastSync: new Date().toISOString(),
    };
  }

  // Fitbit integration simulation
  static async syncFitbit(userId: string): Promise<{
    steps: number;
    activeMinutes: number;
    calories: number;
    heartRateZones: any;
    sleep: any;
  }> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      steps: 9234,
      activeMinutes: 67,
      calories: 2340,
      heartRateZones: {
        fatBurn: 25,
        cardio: 15,
        peak: 5,
      },
      sleep: {
        totalMinutes: 450,
        efficiency: 89,
        stages: {
          wake: 15,
          light: 240,
          deep: 108,
          rem: 87,
        },
      },
    };
  }

  // Continuous glucose monitor integration
  static async syncCGM(userId: string): Promise<{
    currentGlucose: number;
    trend: "rising" | "falling" | "stable";
    readings: any[];
    timeInRange: number;
    alerts: any[];
  }> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Generate realistic CGM data
    const readings = [];
    let currentGlucose = 95;

    for (let i = 0; i < 24; i++) {
      const variation = (Math.random() - 0.5) * 20;
      currentGlucose = Math.max(70, Math.min(180, currentGlucose + variation));

      readings.push({
        timestamp: new Date(
          Date.now() - (24 - i) * 60 * 60 * 1000,
        ).toISOString(),
        glucose: Math.round(currentGlucose),
        trend: variation > 5 ? "rising" : variation < -5 ? "falling" : "stable",
      });
    }

    const timeInRange =
      (readings.filter((r) => r.glucose >= 70 && r.glucose <= 180).length /
        readings.length) *
      100;

    return {
      currentGlucose: readings[readings.length - 1].glucose,
      trend: readings[readings.length - 1].trend,
      readings,
      timeInRange,
      alerts:
        timeInRange < 70
          ? [
              {
                type: "low_time_in_range",
                message: "Time in range below target",
              },
            ]
          : [],
    };
  }

  // Blood pressure monitor integration
  static async syncBPMonitor(userId: string): Promise<{
    readings: any[];
    average: any;
    trend: string;
    alerts: any[];
  }> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const readings = [
      {
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        systolic: 125,
        diastolic: 82,
      },
      {
        timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        systolic: 122,
        diastolic: 80,
      },
      {
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        systolic: 120,
        diastolic: 78,
      },
      {
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        systolic: 119,
        diastolic: 77,
      },
      {
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        systolic: 118,
        diastolic: 76,
      },
      {
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        systolic: 117,
        diastolic: 75,
      },
      { timestamp: new Date().toISOString(), systolic: 118, diastolic: 76 },
    ];

    const avgSystolic =
      readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length;
    const avgDiastolic =
      readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length;

    return {
      readings,
      average: {
        systolic: Math.round(avgSystolic),
        diastolic: Math.round(avgDiastolic),
      },
      trend: "improving",
      alerts: [],
    };
  }

  // Smart scale integration
  static async syncSmartScale(userId: string): Promise<{
    weight: number;
    bmi: number;
    bodyFat: number;
    muscleMass: number;
    trend: string;
    history: any[];
  }> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const history = [
      { date: "2024-02-01", weight: 170, bodyFat: 18.5, muscleMass: 68.2 },
      { date: "2024-02-08", weight: 168, bodyFat: 18.2, muscleMass: 68.5 },
      { date: "2024-02-15", weight: 165, bodyFat: 17.8, muscleMass: 68.8 },
    ];

    const latest = history[history.length - 1];
    const height = 70; // inches
    const bmi = (latest.weight / (height * height)) * 703;

    return {
      weight: latest.weight,
      bmi: Math.round(bmi * 10) / 10,
      bodyFat: latest.bodyFat,
      muscleMass: latest.muscleMass,
      trend: "decreasing",
      history,
    };
  }

  // Device registration and management
  static async registerDevice(
    userId: string,
    deviceInfo: any,
  ): Promise<{
    deviceId: string;
    status: "connected" | "pending" | "failed";
    capabilities: string[];
  }> {
    const deviceId = `device_${Date.now()}`;

    this.connectedDevices.set(deviceId, {
      userId,
      ...deviceInfo,
      registeredAt: new Date().toISOString(),
      lastSync: new Date().toISOString(),
    });

    return {
      deviceId,
      status: "connected",
      capabilities: deviceInfo.capabilities || [],
    };
  }

  // Get all connected devices for user
  static getConnectedDevices(userId: string): any[] {
    const devices = [];

    for (const [deviceId, device] of this.connectedDevices.entries()) {
      if (device.userId === userId) {
        devices.push({
          deviceId,
          ...device,
        });
      }
    }

    return devices;
  }

  // Aggregate data from all devices
  static async aggregateWearableData(userId: string): Promise<{
    summary: any;
    devices: any[];
    lastUpdate: string;
  }> {
    const [appleHealth, fitbit, cgm, bpMonitor, smartScale] = await Promise.all(
      [
        this.syncAppleHealth(userId),
        this.syncFitbit(userId),
        this.syncCGM(userId),
        this.syncBPMonitor(userId),
        this.syncSmartScale(userId),
      ],
    );

    const summary = {
      steps: Math.max(appleHealth.steps, fitbit.steps),
      heartRate: {
        current: appleHealth.heartRate[appleHealth.heartRate.length - 1],
        resting: appleHealth.sleepData.restingHeartRate,
        average: Math.round(
          appleHealth.heartRate.reduce((a, b) => a + b, 0) /
            appleHealth.heartRate.length,
        ),
      },
      glucose: {
        current: cgm.currentGlucose,
        trend: cgm.trend,
        timeInRange: cgm.timeInRange,
      },
      bloodPressure: bpMonitor.average,
      weight: smartScale.weight,
      bmi: smartScale.bmi,
      sleep: {
        duration: appleHealth.sleepData.duration,
        efficiency: appleHealth.sleepData.efficiency,
        quality: appleHealth.sleepData.efficiency > 85 ? "good" : "fair",
      },
      activity: {
        activeMinutes: fitbit.activeMinutes,
        calories: fitbit.calories,
        workouts: appleHealth.workouts.length,
      },
    };

    return {
      summary,
      devices: this.getConnectedDevices(userId),
      lastUpdate: new Date().toISOString(),
    };
  }
}
