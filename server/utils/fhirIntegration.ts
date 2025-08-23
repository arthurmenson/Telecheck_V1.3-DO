// FHIR (Fast Healthcare Interoperability Resources) Integration
export class FHIRIntegrationService {
  private static fhirEndpoint = 'https://api.telecheck.com/fhir/R4';
  
  // Convert internal data to FHIR format
  static convertToFHIRObservation(labResult: any): any {
    return {
      resourceType: 'Observation',
      id: labResult.id,
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'laboratory',
          display: 'Laboratory'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: this.getLoincCode(labResult.testName),
          display: labResult.testName
        }]
      },
      subject: {
        reference: `Patient/${labResult.userId}`
      },
      effectiveDateTime: labResult.testDate,
      valueQuantity: {
        value: labResult.value,
        unit: labResult.unit,
        system: 'http://unitsofmeasure.org'
      },
      referenceRange: [{
        text: labResult.referenceRange
      }],
      interpretation: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
          code: this.getInterpretationCode(labResult.status),
          display: labResult.status
        }]
      }]
    };
  }

  private static getLoincCode(testName: string): string {
    const loincMap: { [key: string]: string } = {
      'glucose': '33747-0',
      'total cholesterol': '2093-3',
      'hdl cholesterol': '2085-9',
      'ldl cholesterol': '18262-6',
      'triglycerides': '2571-8',
      'hemoglobin a1c': '4548-4',
      'creatinine': '2160-0',
      'bun': '3094-0'
    };
    
    const key = Object.keys(loincMap).find(k => 
      testName.toLowerCase().includes(k)
    );
    
    return key ? loincMap[key] : '33747-0'; // Default to glucose
  }

  private static getInterpretationCode(status: string): string {
    const interpretationMap: { [key: string]: string } = {
      'normal': 'N',
      'high': 'H',
      'low': 'L',
      'critical': 'HH',
      'borderline': 'A'
    };
    
    return interpretationMap[status] || 'N';
  }

  // Convert medication to FHIR MedicationStatement
  static convertToFHIRMedicationStatement(medication: any): any {
    return {
      resourceType: 'MedicationStatement',
      id: medication.id,
      status: medication.isActive ? 'active' : 'stopped',
      medicationCodeableConcept: {
        coding: [{
          system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
          code: this.getRxNormCode(medication.name),
          display: medication.name
        }]
      },
      subject: {
        reference: `Patient/${medication.userId}`
      },
      effectiveDateTime: medication.startDate,
      dosage: [{
        text: `${medication.dosage} ${medication.frequency}`,
        timing: {
          repeat: {
            frequency: this.parseFrequency(medication.frequency)
          }
        }
      }]
    };
  }

  private static getRxNormCode(medicationName: string): string {
    const rxNormMap: { [key: string]: string } = {
      'atorvastatin': '83367',
      'metformin': '6809',
      'lisinopril': '29046',
      'amlodipine': '17767',
      'simvastatin': '36567'
    };
    
    const key = Object.keys(rxNormMap).find(k => 
      medicationName.toLowerCase().includes(k)
    );
    
    return key ? rxNormMap[key] : '83367';
  }

  private static parseFrequency(frequency: string): number {
    if (frequency.toLowerCase().includes('once')) return 1;
    if (frequency.toLowerCase().includes('twice')) return 2;
    if (frequency.toLowerCase().includes('three')) return 3;
    if (frequency.toLowerCase().includes('four')) return 4;
    return 1;
  }

  // Create FHIR Patient resource
  static convertToFHIRPatient(user: any): any {
    return {
      resourceType: 'Patient',
      id: user.id,
      active: true,
      name: [{
        use: 'official',
        family: user.lastName,
        given: [user.firstName]
      }],
      telecom: [{
        system: 'email',
        value: user.email,
        use: 'home'
      }, {
        system: 'phone',
        value: user.phone,
        use: 'mobile'
      }],
      gender: user.gender || 'unknown',
      birthDate: user.dateOfBirth,
      address: [{
        use: 'home',
        text: user.address || 'Address not provided'
      }],
      contact: user.emergencyContact ? [{
        relationship: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v2-0131',
            code: 'C',
            display: 'Emergency Contact'
          }]
        }],
        name: {
          text: user.emergencyContact.name
        },
        telecom: [{
          system: 'phone',
          value: user.emergencyContact.phone
        }]
      }] : []
    };
  }

  // Export health data in FHIR format
  static async exportHealthDataAsFHIR(userId: string, dataTypes: string[]): Promise<{
    bundle: any;
    resourceCount: number;
    exportDate: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const bundle = {
      resourceType: 'Bundle',
      id: `export_${Date.now()}`,
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: []
    };

    let resourceCount = 0;

    // Add patient resource
    if (dataTypes.includes('patient')) {
      bundle.entry.push({
        resource: this.convertToFHIRPatient({ id: userId, firstName: 'John', lastName: 'Doe' })
      });
      resourceCount++;
    }

    // Add observations (lab results)
    if (dataTypes.includes('observations')) {
      const mockObservations = [
        { id: 'obs1', testName: 'Glucose', value: 95, unit: 'mg/dL', status: 'normal' },
        { id: 'obs2', testName: 'Total Cholesterol', value: 205, unit: 'mg/dL', status: 'high' }
      ];
      
      mockObservations.forEach(obs => {
        bundle.entry.push({
          resource: this.convertToFHIRObservation({ ...obs, userId, testDate: new Date().toISOString() })
        });
        resourceCount++;
      });
    }

    return {
      bundle,
      resourceCount,
      exportDate: new Date().toISOString()
    };
  }

  // Import FHIR data
  static async importFHIRBundle(bundle: any): Promise<{
    imported: number;
    errors: any[];
    summary: any;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let imported = 0;
    const errors = [];
    const summary = {
      patients: 0,
      observations: 0,
      medications: 0,
      conditions: 0
    };

    if (bundle.entry) {
      for (const entry of bundle.entry) {
        try {
          const resource = entry.resource;
          
          switch (resource.resourceType) {
            case 'Patient':
              summary.patients++;
              break;
            case 'Observation':
              summary.observations++;
              break;
            case 'MedicationStatement':
              summary.medications++;
              break;
            case 'Condition':
              summary.conditions++;
              break;
          }
          
          imported++;
        } catch (error) {
          errors.push({
            resourceType: entry.resource?.resourceType,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    }

    return { imported, errors, summary };
  }
}