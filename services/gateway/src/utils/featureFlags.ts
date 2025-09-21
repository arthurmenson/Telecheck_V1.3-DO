/**
 * Feature flags utilities for server-side feature management
 */

// Mirror of frontend feature flags for server-side consistency
export interface FeatureFlag {
  default: boolean;
  owner: string;
  sunset?: string;
  description: string;
}

export const SERVER_FLAGS: Record<string, FeatureFlag> = {
  enableScheduling: {
    default: true,
    owner: 'ehr-team',
    description: 'Enable appointment scheduling functionality'
  },
  enableLabAnalysis: {
    default: true,
    owner: 'labs-team',
    description: 'Enable AI-powered lab analysis'
  },
  enableRPMAlerts: {
    default: true,
    owner: 'rpm-team',
    description: 'Enable RPM alerting system'
  },
  enableMedicationInteractions: {
    default: true,
    owner: 'medications-team',
    description: 'Enable drug interaction checking'
  },
  enableBillingEDI: {
    default: false,
    owner: 'billing-team',
    description: 'Enable EDI billing functionality'
  },
  enableAdvancedAnalytics: {
    default: false,
    owner: 'analytics-team',
    description: 'Enable advanced analytics features'
  },
  enableMessagingAdmin: {
    default: true,
    owner: 'messaging-team',
    description: 'Enable messaging admin functionality'
  },
  enableFileScanning: {
    default: true,
    owner: 'security-team',
    description: 'Enable virus scanning for uploaded files'
  },
  enableAuditLogging: {
    default: true,
    owner: 'compliance-team',
    description: 'Enable comprehensive audit logging'
  },
  enableRateLimiting: {
    default: true,
    owner: 'infrastructure-team',
    description: 'Enable API rate limiting'
  },
  enableChaosMode: {
    default: false,
    owner: 'qa-team',
    sunset: '2025-06-01',
    description: 'Enable chaos engineering mode for testing'
  }
};

/**
 * Get feature flag value with environment override support
 */
export function getFeatureFlag(flagName: string): boolean {
  // Check environment variable override first
  const envKey = `FEATURE_${flagName.toUpperCase()}`;
  const envValue = process.env[envKey];
  
  if (envValue !== undefined) {
    return envValue.toLowerCase() === 'true';
  }

  // Fall back to default value
  const flag = SERVER_FLAGS[flagName];
  if (!flag) {
    console.warn(`Unknown feature flag: ${flagName}`);
    return false;
  }

  // Check if flag is past sunset date
  if (flag.sunset) {
    const sunsetDate = new Date(flag.sunset);
    if (new Date() > sunsetDate) {
      console.warn(`Feature flag ${flagName} is past sunset date: ${flag.sunset}`);
      return false;
    }
  }

  return flag.default;
}

/**
 * Get all feature flags with their current values
 */
export function getAllFeatureFlags(): Record<string, boolean> {
  const flags: Record<string, boolean> = {};
  
  for (const flagName of Object.keys(SERVER_FLAGS)) {
    flags[flagName] = getFeatureFlag(flagName);
  }
  
  return flags;
}

/**
 * Check if a feature is enabled for a specific user/context
 */
export function isFeatureEnabledForUser(
  flagName: string, 
  userId?: string,
  userRole?: string
): boolean {
  const baseEnabled = getFeatureFlag(flagName);
  
  if (!baseEnabled) {
    return false;
  }

  // Add user-specific or role-specific logic here
  // For example, beta features might only be enabled for admins
  if (flagName.includes('beta') || flagName.includes('experimental')) {
    return userRole === 'admin' || userRole === 'developer';
  }

  // Gradual rollout logic could go here
  // For example, enable for percentage of users based on user ID hash
  
  return true;
}

/**
 * Log feature flag usage for analytics
 */
export function trackFeatureFlagUsage(
  flagName: string, 
  enabled: boolean, 
  context?: {
    userId?: string;
    userRole?: string;
    requestId?: string;
  }
): void {
  if (getFeatureFlag('enableAuditLogging')) {
    console.log(JSON.stringify({
      type: 'feature_flag_usage',
      timestamp: new Date().toISOString(),
      flagName,
      enabled,
      context: context || {}
    }));
  }
}
