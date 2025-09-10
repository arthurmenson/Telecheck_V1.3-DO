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

  // Analytics and Reporting
  ANALYTICS: {
    DASHBOARD: "/analytics/dashboard",
    REPORTS: "/analytics/reports",
    EXPORT: "/analytics/export",
    CUSTOM: "/analytics/custom",
    POPULATION_HEALTH: "/analytics/population-health",
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
  ADMIN,
  FILES,
  NOTIFICATIONS,
} = API_ENDPOINTS;
