export interface ThresholdType {
  type: string;
  name: string;
  unit: string;
  description: string;
}

export interface PatientThreshold {
  id?: number;
  patientId: string;
  thresholdType: string;
  thresholdValue: number;
  unit: string;
  notes?: string;
  isActive: boolean;
  createdBy: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EffectiveThreshold {
  type: string;
  name: string;
  unit: string;
  description: string;
  currentValue: number;
  isPatientSpecific: boolean;
  notes?: string;
}

export interface ThresholdAlert {
  patientId: string;
  thresholdType: string;
  actualValue: number;
  thresholdValue: number;
  unit: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isPatientSpecific: boolean;
  alertMessage: string;
}

export interface Patient {
  id: string;
  name: string;
  displayName: string;
}

export interface PatientWithCustomThresholds {
  patientId: string;
  thresholdCount: number;
}

export interface ThresholdReport {
  patientId: string;
  report: Array<{
    thresholdType: string;
    name: string;
    unit: string;
    description: string;
    currentValue: number;
    isPatientSpecific: boolean;
    notes?: string;
    source: string;
  }>;
  summary: {
    totalThresholds: number;
    patientSpecific: number;
    globalDefaults: number;
  };
}

class PatientThresholdsService {
  private baseUrl = '/api/admin/thresholds';

  async getThresholdTypes(): Promise<{ success: boolean; thresholdTypes?: ThresholdType[]; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/types`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching threshold types:', error);
      return { success: false, error: 'Failed to fetch threshold types' };
    }
  }

  async getPatientThresholds(patientId: string): Promise<{ 
    success: boolean; 
    patientThresholds?: PatientThreshold[]; 
    effectiveThresholds?: EffectiveThreshold[];
    error?: string 
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/${patientId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching patient thresholds:', error);
      return { success: false, error: 'Failed to fetch patient thresholds' };
    }
  }

  async setPatientThreshold(
    patientId: string, 
    thresholdData: {
      thresholdType: string;
      thresholdValue: number;
      unit?: string;
      notes?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/${patientId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(thresholdData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error setting patient threshold:', error);
      return { success: false, error: 'Failed to set patient threshold' };
    }
  }

  async removePatientThreshold(
    patientId: string, 
    thresholdType: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/${patientId}/${thresholdType}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing patient threshold:', error);
      return { success: false, error: 'Failed to remove patient threshold' };
    }
  }

  async bulkUpdatePatientThresholds(
    patientId: string,
    thresholds: Array<{
      thresholdType: string;
      thresholdValue: number;
      unit?: string;
      notes?: string;
    }>
  ): Promise<{ 
    success: boolean; 
    message?: string;
    results?: Array<{
      thresholdType: string;
      success: boolean;
      error?: string;
    }>;
    error?: string 
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/${patientId}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ thresholds }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bulk updating patient thresholds:', error);
      return { success: false, error: 'Failed to bulk update patient thresholds' };
    }
  }

  async getPatientsWithCustomThresholds(): Promise<{ 
    success: boolean; 
    patients?: PatientWithCustomThresholds[]; 
    error?: string 
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/patients`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching patients with custom thresholds:', error);
      return { success: false, error: 'Failed to fetch patients with custom thresholds' };
    }
  }

  async searchPatients(query: string, limit: number = 20): Promise<{ 
    success: boolean; 
    patients?: Patient[]; 
    error?: string 
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/search?query=${encodeURIComponent(query)}&limit=${limit}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching patients:', error);
      return { success: false, error: 'Failed to search patients' };
    }
  }

  async testThresholdCheck(
    patientId: string,
    vitalType: string,
    value: number
  ): Promise<{ 
    success: boolean; 
    alert?: ThresholdAlert; 
    message?: string;
    error?: string 
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/${patientId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vitalType, value }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error testing threshold check:', error);
      return { success: false, error: 'Failed to test threshold check' };
    }
  }

  async getThresholdReport(patientId: string): Promise<{ 
    success: boolean; 
    report?: ThresholdReport;
    error?: string 
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/patients/${patientId}/report`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching threshold report:', error);
      return { success: false, error: 'Failed to fetch threshold report' };
    }
  }

  // Helper methods for UI formatting
  formatThresholdValue(value: number, unit: string): string {
    return `${value} ${unit}`;
  }

  getSeverityColor(severity: 'low' | 'medium' | 'high' | 'critical'): string {
    const colors = {
      low: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      medium: 'text-orange-600 bg-orange-50 border-orange-200', 
      high: 'text-red-600 bg-red-50 border-red-200',
      critical: 'text-red-800 bg-red-100 border-red-300'
    };
    return colors[severity] || colors.medium;
  }

  getSeverityIcon(severity: 'low' | 'medium' | 'high' | 'critical'): string {
    const icons = {
      low: '⚠️',
      medium: '🔶',
      high: '⚠️',
      critical: '🚨'
    };
    return icons[severity] || icons.medium;
  }

  getThresholdDisplayName(thresholdType: string): string {
    const displayNames: Record<string, string> = {
      'glucose_low': 'Glucose Low',
      'glucose_high': 'Glucose High',
      'bp_systolic_high': 'Blood Pressure Systolic High',
      'bp_diastolic_high': 'Blood Pressure Diastolic High',
      'bp_systolic_low': 'Blood Pressure Systolic Low',
      'bp_diastolic_low': 'Blood Pressure Diastolic Low',
      'heart_rate_high': 'Heart Rate High',
      'heart_rate_low': 'Heart Rate Low',
      'temperature_high': 'Temperature High',
      'temperature_low': 'Temperature Low',
      'oxygen_saturation_low': 'Oxygen Saturation Low',
      'systolic_pressure_critical': 'Blood Pressure Systolic Critical',
      'diastolic_pressure_critical': 'Blood Pressure Diastolic Critical'
    };
    return displayNames[thresholdType] || thresholdType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
}

export const patientThresholdsService = new PatientThresholdsService();
