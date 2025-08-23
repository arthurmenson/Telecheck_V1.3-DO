import { RequestHandler } from "express";
import { TelemedicineService } from "../utils/telemedicine";
import { ApiResponse } from "@shared/types";

// Get available providers
export const getAvailableProviders: RequestHandler = async (req, res) => {
  try {
    const { specialty, location } = req.query;
    const providers = await TelemedicineService.getAvailableProviders(
      specialty as string, 
      location as string
    );
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get available providers'
    });
  }
};

// Schedule appointment
export const scheduleAppointment: RequestHandler = async (req, res) => {
  try {
    const appointmentData = req.body;
    const appointment = await TelemedicineService.scheduleAppointment(appointmentData);
    
    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Schedule appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule appointment'
    });
  }
};

// Get user appointments
export const getUserAppointments: RequestHandler = async (req, res) => {
  try {
    const userId = req.params.userId || 'user-1';
    const appointments = TelemedicineService.getUserAppointments(userId);
    
    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get appointments'
    });
  }
};

// Create consultation room
export const createConsultationRoom: RequestHandler = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const room = await TelemedicineService.createConsultationRoom(appointmentId);
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create consultation room'
    });
  }
};

// Generate consultation summary
export const generateConsultationSummary: RequestHandler = async (req, res) => {
  try {
    const { roomId } = req.params;
    const summary = await TelemedicineService.generateConsultationSummary(roomId);
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Generate summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate consultation summary'
    });
  }
};

// Emergency triage
export const triageEmergency: RequestHandler = async (req, res) => {
  try {
    const { symptoms, vitals } = req.body;
    const triage = TelemedicineService.triageEmergencyConsultation(symptoms, vitals);
    
    res.json({
      success: true,
      data: triage
    });
  } catch (error) {
    console.error('Emergency triage error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to triage emergency consultation'
    });
  }
};