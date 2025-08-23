// Shared types for the entire application
export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'patient' | 'doctor' | 'admin' | 'pharmacist' | 'nurse';
  avatar?: string;
  dateOfBirth?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: UserPreferences;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  timezone: string;
  privacy: {
    shareData: boolean;
    allowAnalytics: boolean;
  };
}

export interface LabResult {
  id: string;
  userId: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'borderline' | 'high' | 'low' | 'critical';
  testDate: string;
  labName?: string;
  doctorNotes?: string;
  createdAt: string;
}

export interface LabReport {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  analysisStatus: 'pending' | 'processing' | 'completed' | 'failed';
  results: LabResult[];
  aiSummary?: string;
  confidence: number;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate?: string;
  prescribedBy: string;
  instructions?: string;
  sideEffects?: string[];
  interactions?: string[];
  isActive: boolean;
}

export interface VitalSigns {
  id: string;
  userId: string;
  heartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  recordedAt: string;
  source: 'manual' | 'device' | 'wearable';
}

export interface ChatMessage {
  id: string;
  userId: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  context?: {
    labs?: boolean;
    medications?: boolean;
    symptoms?: boolean;
    vitals?: boolean;
  };
  timestamp: string;
  confidence?: number;
  suggestions?: string[];
}

export interface HealthInsight {
  id: string;
  userId: string;
  type: 'recommendation' | 'alert' | 'insight' | 'warning';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  confidence: number;
  actionRequired: boolean;
  dismissed: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: 'patient' | 'doctor' | 'admin' | 'pharmacist' | 'nurse';
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Program Types
export interface Program {
  id: string;
  title: string;
  description: string;
  type: 'rolling-start' | 'fixed-start';
  duration: string;
  enrolledParticipants: number;
  maxParticipants?: number;
  status: 'active' | 'archived' | 'draft';
  category: string;
  price: number;
  coach: string;
  image?: string;
  completionRate: number;
  rating: number;
  modules: number;
  objectives: string[];
  curriculum: string[];
  nextStartDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgramParticipant {
  id: string;
  programId: string;
  userId: string;
  enrollmentDate: string;
  completionDate?: string;
  progress: number;
  status: 'enrolled' | 'active' | 'completed' | 'dropped';
  notes?: string;
}

// Error Response
export interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
  stack?: string; // Only in development
}

// File Upload Types
export interface FileUpload {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  category?: string;
  uploadedBy: string;
  uploadedAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  expiresAt?: string;
}
