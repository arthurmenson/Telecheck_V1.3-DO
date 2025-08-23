import { PatientService, Patient } from '../patient.service';

// Mock the API client
jest.mock('../api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('PatientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPatientStats', () => {
    it('should return patient statistics', async () => {
      const mockStats = {
        total_patients: 100,
        active_patients: 85,
        inactive_patients: 15,
        new_this_month: 12,
        pediatric_patients: 25,
        senior_patients: 30,
      };

      const mockResponse = { data: { data: mockStats } };
      (PatientService as any).apiClient = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };

      const result = await PatientService.getPatientStats();
      expect(result).toEqual(mockStats);
    });

    it('should return fallback data on API error', async () => {
      (PatientService as any).apiClient = {
        get: jest.fn().mockRejectedValue(new Error('API Error')),
      };

      const result = await PatientService.getPatientStats();
      expect(result).toEqual({
        total_patients: 0,
        active_patients: 0,
        inactive_patients: 0,
        new_this_month: 0,
        pediatric_patients: 0,
        senior_patients: 0,
      });
    });
  });

  describe('searchPatients', () => {
    it('should search patients with filters', async () => {
      const mockSearchResult = {
        patients: [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      const mockResponse = { data: { data: mockSearchResult } };
      (PatientService as any).apiClient = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };

      const result = await PatientService.searchPatients({ query: 'John' }, 1, 20);
      expect(result).toEqual(mockSearchResult);
    });

    it('should return empty results on API error', async () => {
      (PatientService as any).apiClient = {
        get: jest.fn().mockRejectedValue(new Error('API Error')),
      };

      const result = await PatientService.searchPatients({}, 1, 20);
      expect(result).toEqual({
        patients: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });
    });
  });

  describe('getPatientById', () => {
    it('should return patient data for valid ID', async () => {
      const mockPatient = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        dateOfBirth: '1990-01-01',
      };

      const mockResponse = { data: { success: true, data: mockPatient } };
      (PatientService as any).apiClient = {
        get: jest.fn().mockResolvedValue(mockResponse),
      };

      const result = await PatientService.getPatientById('1');
      expect(result).toEqual(mockPatient);
    });

    it('should return fallback data for invalid ID', async () => {
      (PatientService as any).apiClient = {
        get: jest.fn().mockRejectedValue(new Error('Patient not found')),
      };

      const result = await PatientService.getPatientById('invalid-id');
      expect(result).toMatchObject({
        id: 'invalid-id',
        firstName: 'Unknown',
        lastName: 'Patient',
        _error: expect.any(String),
      });
    });
  });

  describe('createPatient', () => {
    it('should create a new patient', async () => {
      const newPatient = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '555-1234',
        dateOfBirth: '1985-05-15',
        gender: 'female',
        address: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        zipCode: '62701',
        allergies: [],
        emergencyContacts: {},
        insuranceInfo: {},
      };

      const mockResponse = { data: { success: true, data: { id: '2', ...newPatient } } };
      (PatientService as any).apiClient = {
        post: jest.fn().mockResolvedValue(mockResponse),
      };

      const result = await PatientService.createPatient(newPatient);
      expect(result).toEqual({ id: '2', ...newPatient });
    });
  });

  describe('exportToCsv', () => {
    it('should export patients to CSV format', () => {
      const mockPatients: Patient[] = [
        {
          id: '1',
          userId: '1',
          mrn: 'MRN001',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-1234',
          dateOfBirth: '1990-01-01',
          gender: 'male',
          address: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          status: 'active',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          allergies: [],
        },
      ];

      const result = PatientService.exportToCsv(mockPatients);
      
      expect(result).toContain('MRN,First Name,Last Name');
      expect(result).toContain('MRN001,"John","Doe"');
      expect(result).toContain('john@example.com');
      expect(result).toContain('555-1234');
    });

    it('should handle empty patient list', () => {
      const result = PatientService.exportToCsv([]);
      const lines = result.split('\n');
      
      expect(lines).toHaveLength(1); // Only header line
      expect(lines[0]).toContain('MRN,First Name,Last Name');
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = '1990-01-01';
      const age = PatientService.calculateAge(birthDate);
      
      // Age should be approximately 34 (depending on current date)
      expect(age).toBeGreaterThan(30);
      expect(age).toBeLessThan(40);
    });

    it('should handle invalid date', () => {
      const age = PatientService.calculateAge('invalid-date');
      expect(age).toBe(0);
    });
  });

  describe('formatPatientName', () => {
    it('should format patient name correctly', () => {
      const patient = {
        firstName: 'John',
        lastName: 'Doe',
      } as Patient;

      const name = PatientService.formatPatientName(patient);
      expect(name).toBe('John Doe');
    });

    it('should handle missing names', () => {
      const patient = {
        firstName: '',
        lastName: 'Doe',
      } as Patient;

      const name = PatientService.formatPatientName(patient);
      expect(name).toBe(' Doe');
    });
  });
});
