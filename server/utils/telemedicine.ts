// Telemedicine Service for video consultations and provider management
export class TelemedicineService {
  private static providers = new Map();
  private static appointments = new Map();
  private static consultationRooms = new Map();

  // Provider network management
  static async getAvailableProviders(specialty?: string, location?: string): Promise<any[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockProviders = [
      {
        id: 'provider_1',
        name: 'Dr. Sarah Chen',
        specialty: 'Internal Medicine',
        credentials: 'MD, FACP',
        rating: 4.9,
        reviewCount: 247,
        languages: ['English', 'Mandarin'],
        availability: {
          today: ['2:00 PM', '3:30 PM', '4:45 PM'],
          tomorrow: ['9:00 AM', '10:30 AM', '2:00 PM', '3:15 PM']
        },
        consultationFee: 150,
        acceptsInsurance: true,
        bio: 'Board-certified internist with 15 years experience in preventive medicine and chronic disease management.',
        education: 'Harvard Medical School',
        location: 'Boston, MA',
        telehealth: true
      },
      {
        id: 'provider_2',
        name: 'Dr. Michael Rodriguez',
        specialty: 'Cardiology',
        credentials: 'MD, FACC',
        rating: 4.8,
        reviewCount: 189,
        languages: ['English', 'Spanish'],
        availability: {
          today: ['1:00 PM', '4:00 PM'],
          tomorrow: ['8:00 AM', '11:00 AM', '3:00 PM']
        },
        consultationFee: 200,
        acceptsInsurance: true,
        bio: 'Interventional cardiologist specializing in preventive cardiology and lipid management.',
        education: 'Johns Hopkins School of Medicine',
        location: 'Baltimore, MD',
        telehealth: true
      },
      {
        id: 'provider_3',
        name: 'Dr. Emily Johnson',
        specialty: 'Endocrinology',
        credentials: 'MD, FACE',
        rating: 4.9,
        reviewCount: 156,
        languages: ['English'],
        availability: {
          today: [],
          tomorrow: ['10:00 AM', '2:30 PM', '4:00 PM']
        },
        consultationFee: 180,
        acceptsInsurance: true,
        bio: 'Diabetes and metabolism specialist with expertise in continuous glucose monitoring.',
        education: 'Mayo Clinic',
        location: 'Rochester, MN',
        telehealth: true
      }
    ];

    return specialty 
      ? mockProviders.filter(p => p.specialty.toLowerCase().includes(specialty.toLowerCase()))
      : mockProviders;
  }

  // Schedule appointment
  static async scheduleAppointment(appointmentData: {
    providerId: string;
    userId: string;
    dateTime: string;
    type: 'video' | 'phone' | 'in_person';
    reason: string;
    duration: number;
  }): Promise<{
    appointmentId: string;
    confirmationNumber: string;
    meetingLink?: string;
    instructions: string[];
  }> {
    const appointmentId = `appt_${Date.now()}`;
    const confirmationNumber = `CONF${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    
    const appointment = {
      ...appointmentData,
      appointmentId,
      confirmationNumber,
      status: 'scheduled',
      createdAt: new Date().toISOString()
    };

    this.appointments.set(appointmentId, appointment);

    const meetingLink = appointmentData.type === 'video' 
      ? `https://telecheck.com/consultation/${appointmentId}`
      : undefined;

    return {
      appointmentId,
      confirmationNumber,
      meetingLink,
      instructions: [
        'Join the consultation 5 minutes before your scheduled time',
        'Ensure you have a stable internet connection',
        'Have your current medications list ready',
        'Prepare any questions you want to discuss',
        appointmentData.type === 'video' ? 'Test your camera and microphone beforehand' : ''
      ].filter(Boolean)
    };
  }

  // Get user appointments
  static getUserAppointments(userId: string): any[] {
    const userAppointments = [];
    
    for (const [appointmentId, appointment] of this.appointments.entries()) {
      if (appointment.userId === userId) {
        userAppointments.push({
          appointmentId,
          ...appointment
        });
      }
    }
    
    return userAppointments.sort((a, b) => 
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );
  }

  // Create consultation room
  static async createConsultationRoom(appointmentId: string): Promise<{
    roomId: string;
    accessToken: string;
    participantTokens: any;
    roomUrl: string;
  }> {
    const roomId = `room_${appointmentId}`;
    const accessToken = `token_${Math.random().toString(36).substr(2, 16)}`;
    
    const room = {
      roomId,
      appointmentId,
      createdAt: new Date().toISOString(),
      status: 'active',
      participants: [],
      recordings: [],
      chatHistory: []
    };

    this.consultationRooms.set(roomId, room);

    return {
      roomId,
      accessToken,
      participantTokens: {
        patient: `patient_${accessToken}`,
        provider: `provider_${accessToken}`
      },
      roomUrl: `https://telecheck.com/room/${roomId}`
    };
  }

  // Generate consultation summary
  static async generateConsultationSummary(roomId: string): Promise<{
    summary: string;
    diagnosis: string[];
    recommendations: string[];
    prescriptions: any[];
    followUp: any;
    duration: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock consultation summary
    return {
      summary: 'Patient presented with concerns about recent lab results showing elevated cholesterol. Discussed cardiovascular risk factors and treatment options. Patient is motivated to make lifestyle changes.',
      diagnosis: [
        'Hyperlipidemia (ICD-10: E78.5)',
        'Cardiovascular risk factors'
      ],
      recommendations: [
        'Initiate atorvastatin 20mg daily',
        'Low-saturated fat diet (<7% of calories)',
        'Regular aerobic exercise 150 min/week',
        'Weight reduction goal of 10 pounds',
        'Smoking cessation counseling if applicable'
      ],
      prescriptions: [
        {
          medication: 'Atorvastatin',
          strength: '20mg',
          quantity: 30,
          directions: 'Take one tablet by mouth daily in the evening',
          refills: 5,
          daw: false
        }
      ],
      followUp: {
        timeframe: '6 weeks',
        type: 'lab_recheck',
        tests: ['Lipid panel', 'Liver function tests'],
        appointment: 'Schedule follow-up visit in 3 months'
      },
      duration: 25 // minutes
    };
  }

  // Emergency consultation triage
  static triageEmergencyConsultation(symptoms: string[], vitals?: any): {
    urgency: 'emergency' | 'urgent' | 'routine';
    recommendations: string[];
    estimatedWaitTime: string;
    escalation: boolean;
  } {
    const symptomText = symptoms.join(' ').toLowerCase();
    
    // Emergency symptoms
    const emergencyKeywords = [
      'chest pain', 'difficulty breathing', 'severe headache',
      'loss of consciousness', 'severe bleeding', 'stroke symptoms',
      'severe abdominal pain', 'high fever'
    ];
    
    if (emergencyKeywords.some(keyword => symptomText.includes(keyword))) {
      return {
        urgency: 'emergency',
        recommendations: [
          'Call 911 immediately',
          'Go to nearest emergency room',
          'Do not delay seeking immediate medical attention'
        ],
        estimatedWaitTime: 'Immediate',
        escalation: true
      };
    }

    // Urgent symptoms
    const urgentKeywords = [
      'severe pain', 'high fever', 'persistent vomiting',
      'severe diarrhea', 'difficulty swallowing'
    ];
    
    if (urgentKeywords.some(keyword => symptomText.includes(keyword))) {
      return {
        urgency: 'urgent',
        recommendations: [
          'Seek medical attention within 2-4 hours',
          'Consider urgent care or emergency room',
          'Monitor symptoms closely'
        ],
        estimatedWaitTime: '15-30 minutes',
        escalation: false
      };
    }

    return {
      urgency: 'routine',
      recommendations: [
        'Schedule consultation with healthcare provider',
        'Monitor symptoms and seek care if worsening',
        'Consider telehealth consultation'
      ],
      estimatedWaitTime: '2-5 minutes',
      escalation: false
    };
  }
}