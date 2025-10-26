// Telemedicine Provider Types

export interface AvailabilitySlot {
  date: string; // ISO date string "2025-10-26"
  slots: string[]; // Time slots ["09:00", "09:30", "10:00"]
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // computed: firstName + lastName
  specialty: string;
  credentials: string; // "MD", "DO", "NP", etc.
  bio: string;
  experience: number; // years
  rating: number; // 0-5
  reviewCount: number;
  languages: string[]; // ["English", "Spanish"]
  videoEnabled: boolean;
  phoneEnabled: boolean;
  inPersonEnabled: boolean;
  location: string; // "Boston, MA" or "Medical Plaza, Main St"
  education: string; // "Harvard Medical School"
  nextAvailable: string | null; // ISO date string or null
  availability: AvailabilitySlot[];
}

export interface ProvidersResponse {
  providers: Doctor[];
}

export interface ProvidersQueryParams {
  specialty?: string;
  videoEnabled?: boolean;
  available?: string; // ISO date string
}
