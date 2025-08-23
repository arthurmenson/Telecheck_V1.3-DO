import { RequestHandler } from "express";
import { WearableIntegrationService } from "../utils/wearableIntegration";
import { ApiResponse } from "@shared/types";

// Sync Apple Health data
export const syncAppleHealth: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const healthData = await WearableIntegrationService.syncAppleHealth(userId);
    
    res.json({
      success: true,
      data: healthData
    });
  } catch (error) {
    console.error('Apple Health sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync Apple Health data'
    });
  }
};

// Sync Fitbit data
export const syncFitbit: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const fitbitData = await WearableIntegrationService.syncFitbit(userId);
    
    res.json({
      success: true,
      data: fitbitData
    });
  } catch (error) {
    console.error('Fitbit sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync Fitbit data'
    });
  }
};

// Sync continuous glucose monitor
export const syncCGM: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const cgmData = await WearableIntegrationService.syncCGM(userId);
    
    res.json({
      success: true,
      data: cgmData
    });
  } catch (error) {
    console.error('CGM sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync CGM data'
    });
  }
};

// Get aggregated wearable data
export const getAggregatedWearableData: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const aggregatedData = await WearableIntegrationService.aggregateWearableData(userId);
    
    res.json({
      success: true,
      data: aggregatedData
    });
  } catch (error) {
    console.error('Wearable data aggregation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to aggregate wearable data'
    });
  }
};

// Register new wearable device
export const registerWearableDevice: RequestHandler = async (req, res) => {
  try {
    const userId = req.body.userId || 'user-1';
    const deviceInfo = req.body;
    
    const registration = await WearableIntegrationService.registerDevice(userId, deviceInfo);
    
    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    console.error('Device registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register device'
    });
  }
};

// Get connected devices
export const getConnectedDevices: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const devices = WearableIntegrationService.getConnectedDevices(userId);
    
    res.json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get connected devices'
    });
  }
};