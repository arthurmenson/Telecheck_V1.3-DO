/**
 * API Endpoints Configuration
 * Centralized endpoint definitions with type safety
 */

// API Endpoints organized by domain
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    REGISTER: "/auth/register",
    VERIFY_EMAIL: "/auth/verify-email",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
  },

  // User Management
  USERS: {
    PROFILE: "/users/profile",
    UPDATE_PROFILE: "/users/profile",
    PREFERENCES: "/users/preferences",
    AVATAR: "/users/avatar",
    DELETE_ACCOUNT: "/users/delete",
    ADMIN: {
      LIST: "/users",
      DETAIL: (id: string) => `/users/${id}`,
      INVITE: "/users/invite",
      STATS: "/users/stats/overview",
      DEACTIVATE: (id: string) => `/users/${id}`,
    },
  },

  // Lab Results
  LABS: {
    RESULTS: "/labs/results",
    REPORTS: "/labs/reports",
    ANALYZE: "/labs/analyze",
    ANALYSIS: "/labs/analysis",
    UPLOAD: "/labs/upload",
    TRENDS: "/labs/trends",
  },

  // Medications
  MEDICATIONS: {
    LIST: "/medications",
    ADD: "/medications",
    UPDATE: (id: string) => `/medications/${id}`,
    DELETE: (id: string) => `/medications/${id}`,
    INTERACTIONS: "/medications/interactions",
    SEARCH: "/medications/search",
    REMINDERS: "/medications/reminders",
  },

  // Vital Signs
  VITALS: {
    LIST: "/vitals",
    ADD: "/vitals",
    UPDATE: (id: string) => `/vitals/${id}`,
    DELETE: (id: string) => `/vitals/${id}`,
    TRENDS: "/vitals/trends",
    STATISTICS: "/vitals/statistics",
  },

  // Health Insights
  INSIGHTS: {
    LIST: "/insights",
    GENERATE: "/insights/generate",
    DISMISS: (id: string) => `/insights/${id}/dismiss`,
    DETAILS: (id: string) => `/insights/${id}`,
  },

  // Chat/AI Assistant
  CHAT: {
    SEND: "/chat",
    HISTORY: "/chat/history",
    SESSIONS: "/chat/sessions",
    DELETE_SESSION: (id: string) => `/chat/sessions/${id}`,
  },

  // EHR Modules
  EHR: {
    // Patient Management
    INTAKE: {
      LIST: "/ehr/intake",
      CREATE: "/ehr/intake",
      UPDATE: (id: string) => `/ehr/intake/${id}`,
      DELETE: (id: string) => `/ehr/intake/${id}`,
      COMPLETE: (id: string) => `/ehr/intake/${id}/complete`,
    },

    // Clinical Charting
    CHARTING: {
      LIST: "/ehr/charting",
      CREATE: "/ehr/charting",
      UPDATE: (id: string) => `/ehr/charting/${id}`,
      DELETE: (id: string) => `/ehr/charting/${id}`,
      TEMPLATES: "/ehr/charting/templates",
    },

    // Care Plans
    CARE_PLANS: {
      LIST: "/ehr/care-plans",
      CREATE: "/ehr/care-plans",
      UPDATE: (id: string) => `/ehr/care-plans/${id}`,
      DELETE: (id: string) => `/ehr/care-plans/${id}`,
      GOALS: (id: string) => `/ehr/care-plans/${id}/goals`,
    },

    // AI Scribe
    AI_SCRIBE: {
      TRANSCRIBE: "/ehr/ai-scribe/transcribe",
      GENERATE_NOTES: "/ehr/ai-scribe/generate-notes",
      SESSIONS: "/ehr/ai-scribe/sessions",
      EXPORT: (id: string) => `/ehr/ai-scribe/${id}/export`,
    },

    // Programs
    PROGRAMS: {
      LIST: "/ehr/programs",
      CREATE: "/ehr/programs",
      UPDATE: (id: string) => `/ehr/programs/${id}`,
      DELETE: (id: string) => `/ehr/programs/${id}`,
      ENROLL: (id: string) => `/ehr/programs/${id}/enroll`,
      PARTICIPANTS: (id: string) => `/ehr/programs/${id}/participants`,
      ANALYTICS: (id: string) => `/ehr/programs/${id}/analytics`,
    },

    // Providers
    PROVIDERS: {
      LIST: "/ehr/providers",
      CREATE: "/ehr/providers",
      UPDATE: (id: string) => `/ehr/providers/${id}`,
      DELETE: (id: string) => `/ehr/providers/${id}`,
      NETWORK: "/ehr/providers/network",
    },

    // Scheduling
    SCHEDULING: {
      APPOINTMENTS: "/ehr/scheduling/appointments",
      SLOTS: "/ehr/scheduling/slots",
      BOOK: "/ehr/scheduling/book",
      CANCEL: (id: string) => `/ehr/scheduling/${id}/cancel`,
      RESCHEDULE: (id: string) => `/ehr/scheduling/${id}/reschedule`,
    },

    // Billing
    BILLING: {
      INVOICES: "/ehr/billing/invoices",
      PAYMENTS: "/ehr/billing/payments",
      CLAIMS: "/ehr/billing/claims",
      REVENUE: "/ehr/billing/revenue",
      STATEMENTS: "/ehr/billing/statements",
      X12_837P: "/billing/claims/837p",
      CLAIM_STATUS: (id: string) => `/billing/claims/${id}/status`,
    },

    // Messaging
    MESSAGING: {
      CONVERSATIONS: "/ehr/messaging/conversations",
      SEND: "/ehr/messaging/send",
      MARK_READ: (id: string) => `/ehr/messaging/${id}/read`,
      ATTACHMENTS: "/ehr/messaging/attachments",
    },

    // Telehealth
    TELEHEALTH: {
      SESSIONS: "/ehr/telehealth/sessions",
      CREATE_ROOM: "/ehr/telehealth/create-room",
      JOIN_ROOM: (id: string) => `/ehr/telehealth/${id}/join`,
      END_SESSION: (id: string) => `/ehr/telehealth/${id}/end`,
    },

    // e-Prescribing (stubs)
    ERX: {
      CREATE: "/erx/prescriptions",
      GET: (id: string) => `/erx/prescriptions/${id}`,
      CANCEL: (id: string) => `/erx/prescriptions/${id}/cancel`,
      REFILL: (id: string) => `/erx/prescriptions/${id}/refill`,
      EPCS_VERIFY: "/erx/epcs/verify",
      HISTORY: (patientId: string) => `/erx/history/${patientId}`,
    },

    // Affiliate Management
    AFFILIATES: {
      LIST: "/ehr/affiliates",
      CREATE: "/ehr/affiliates",
      UPDATE: (id: string) => `/ehr/affiliates/${id}`,
      DELETE: (id: string) => `/ehr/affiliates/${id}`,
      COMMISSIONS: "/ehr/affiliates/commissions",
      PAYOUTS: "/ehr/affiliates/payouts",
      ANALYTICS: "/ehr/affiliates/analytics",
    },
  },

  // Clinical Entities (stubs for chart expansion)
  CLINICAL: {
    CONDITIONS: {
      LIST: "/ehr/conditions",
      CREATE: "/ehr/conditions",
      UPDATE: (id: string) => `/ehr/conditions/${id}`,
      DELETE: (id: string) => `/ehr/conditions/${id}`,
    },
    ALLERGIES: {
      LIST: "/ehr/allergies",
      CREATE: "/ehr/allergies",
      UPDATE: (id: string) => `/ehr/allergies/${id}`,
      DELETE: (id: string) => `/ehr/allergies/${id}`,
    },
    IMMUNIZATIONS: {
      LIST: "/ehr/immunizations",
      CREATE: "/ehr/immunizations",
      UPDATE: (id: string) => `/ehr/immunizations/${id}`,
      DELETE: (id: string) => `/ehr/immunizations/${id}`,
    },
    ENCOUNTERS: {
      LIST: "/ehr/encounters",
      CREATE: "/ehr/encounters",
      UPDATE: (id: string) => `/ehr/encounters/${id}`,
      DELETE: (id: string) => `/ehr/encounters/${id}`,
    },
    ORDERS: {
      LIST: "/ehr/orders",
      CREATE: "/ehr/orders",
      UPDATE: (id: string) => `/ehr/orders/${id}`,
      DELETE: (id: string) => `/ehr/orders/${id}`,
    },
  },

  // FHIR/SMART (stubs)
  FHIR: {
    BASE: "/fhir",
    PATIENT: (id: string) => `/fhir/Patient/${id}`,
    ENCOUNTER: (id: string) => `/fhir/Encounter/${id}`,
    CONDITION: (id: string) => `/fhir/Condition/${id}`,
    ALLERGY: (id: string) => `/fhir/AllergyIntolerance/${id}`,
    IMMUNIZATION: (id: string) => `/fhir/Immunization/${id}`,
    MEDICATION: (id: string) => `/fhir/Medication/${id}`,
    MEDICATION_REQUEST: (id: string) => `/fhir/MedicationRequest/${id}`,
    CARE_PLAN: (id: string) => `/fhir/CarePlan/${id}`,
    DOCUMENT_REFERENCE: (id: string) => `/fhir/DocumentReference/${id}`,
  },
  SMART: {
    WELL_KNOWN: "/smart/.well-known/smart-configuration",
    AUTHORIZE: "/smart/authorize",
    TOKEN: "/smart/token",
    INTROSPECT: "/smart/introspect",
  },

  // Analytics and Reporting
  ANALYTICS: {
    DASHBOARD: "/analytics/dashboard",
    REPORTS: "/analytics/reports",
    EXPORT: "/analytics/export",
    CUSTOM: "/analytics/custom",
    POPULATION_HEALTH: "/analytics/population-health",
  },

  REPORTING: {
    AUDIT: "/reporting/audit",
    MIPS: "/reporting/mips",
    EXPORT: "/reporting/export",
  },

  ELIGIBILITY: {
    CHECK: "/eligibility/check",
  },

  // System Administration
  ADMIN: {
    USERS: "/admin/users",
    SYSTEM_STATUS: "/admin/system-status",
    SETTINGS: "/admin/settings",
    AUDIT_LOG: "/admin/audit-log",
    BACKUPS: "/admin/backups",
  },

  // File Management
  FILES: {
    UPLOAD: "/files/upload",
    DOWNLOAD: (id: string) => `/files/${id}`,
    DELETE: (id: string) => `/files/${id}`,
    LIST: "/files",
  },

  // Notifications
  NOTIFICATIONS: {
    LIST: "/notifications",
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/mark-all-read",
    PREFERENCES: "/notifications/preferences",
    SUBSCRIBE: "/notifications/subscribe",
  },

  // Pharmacy Commerce
  COMMERCE: {
    CATALOG: "/commerce/catalog",
    SEARCH: "/commerce/search",
    ORDERS: "/commerce/orders",
    ORDER: (id: string) => `/commerce/orders/${id}`,
  },
} as const;

// Helper type to extract endpoint paths
export type ApiEndpoint = typeof API_ENDPOINTS;

// Utility function to build dynamic endpoints
export const buildEndpoint = (
  template: string,
  params: Record<string, string | number>,
): string => {
  return Object.entries(params).reduce(
    (url, [key, value]) => url.replace(`:${key}`, String(value)),
    template,
  );
};

// Export individual endpoint groups for easier imports
export const {
  AUTH,
  USERS,
  LABS,
  MEDICATIONS,
  VITALS,
  INSIGHTS,
  CHAT,
  EHR,
  ANALYTICS,
  REPORTING,
  ELIGIBILITY,
  ADMIN,
  FILES,
  NOTIFICATIONS,
} = API_ENDPOINTS;
