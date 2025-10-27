/**
 * Keycloak Authentication Context
 *
 * Provides authentication state and methods using Keycloak
 * This replaces the legacy JWT-based AuthContext
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  initKeycloak,
  login as keycloakLogin,
  logout as keycloakLogout,
  isAuthenticated as checkAuthenticated,
  getUserInfo,
  getUserRoles,
  hasRole,
  hasAnyRole,
  getAuthorizationHeader,
  getToken,
} from "../lib/keycloak";

export type UserRole =
  | "PATIENT"
  | "DOCTOR"
  | "NURSE"
  | "CAREGIVER"
  | "PHARMACIST"
  | "ADMIN"
  | "PROVIDER"
  | "FIELD_NURSE";

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  roles: string[];
  primaryRole: UserRole;
  emailVerified?: boolean;
  isActive: boolean;
}

interface KeycloakAuthContextType {
  user: User | null;
  login: (redirectUri?: string) => void;
  logout: (redirectUri?: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | string) => boolean;
  hasAnyRole: (roles: (UserRole | string)[]) => boolean;
  getAuthHeader: () => { Authorization: string } | {};
  getToken: () => string | undefined;
}

const KeycloakAuthContext = createContext<KeycloakAuthContextType | undefined>(
  undefined,
);

export function useKeycloakAuth() {
  const context = useContext(KeycloakAuthContext);
  if (context === undefined) {
    throw new Error(
      "useKeycloakAuth must be used within a KeycloakAuthProvider",
    );
  }
  return context;
}

// Role hierarchy for determining primary role
const ROLE_PRIORITY: Record<string, number> = {
  ADMIN: 100,
  DOCTOR: 80,
  PROVIDER: 75,
  NURSE: 60,
  FIELD_NURSE: 55,
  PHARMACIST: 50,
  CAREGIVER: 40,
  PATIENT: 10,
};

function determinePrimaryRole(roles: string[]): UserRole {
  // Find the highest priority role
  let primaryRole: UserRole = "PATIENT";
  let highestPriority = -1;

  for (const role of roles) {
    const normalizedRole = role.toUpperCase();
    const priority = ROLE_PRIORITY[normalizedRole] || 0;

    if (priority > highestPriority) {
      highestPriority = priority;
      primaryRole = normalizedRole as UserRole;
    }
  }

  return primaryRole;
}

// Role-to-permission mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  PATIENT: [
    "view_own_records",
    "book_appointments",
    "order_medications",
    "view_lab_results",
    "view_prescriptions",
  ],
  DOCTOR: [
    "view_all_patients",
    "prescribe_medications",
    "review_labs",
    "telehealth_consults",
    "approve_treatments",
    "create_medical_records",
    "update_medical_records",
    "view_analytics",
  ],
  PROVIDER: [
    "view_all_patients",
    "prescribe_medications",
    "review_labs",
    "telehealth_consults",
    "approve_treatments",
    "create_medical_records",
    "update_medical_records",
  ],
  NURSE: [
    "view_all_patients",
    "update_patient_vitals",
    "view_medical_records",
    "telehealth_consults",
    "care_coordination",
  ],
  FIELD_NURSE: [
    "view_all_patients",
    "update_patient_vitals",
    "view_medical_records",
    "care_coordination",
  ],
  PHARMACIST: [
    "dispense_medications",
    "review_prescriptions",
    "drug_interactions",
    "inventory_management",
    "patient_counseling",
  ],
  CAREGIVER: [
    "view_patient_records",
    "submit_vitals",
    "view_care_plan",
    "family_communication",
  ],
  ADMIN: ["*"], // All permissions
};

interface KeycloakAuthProviderProps {
  children: ReactNode;
}

export function KeycloakAuthProvider({ children }: KeycloakAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize Keycloak on mount
    initKeycloak()
      .then((authenticated) => {
        setIsAuthenticated(authenticated);

        if (authenticated) {
          // Load user information
          const userInfo = getUserInfo();
          if (userInfo) {
            const roles = getUserRoles();
            const primaryRole = determinePrimaryRole(roles);

            setUser({
              id: userInfo.id || "",
              email: userInfo.email || "",
              name:
                userInfo.name || `${userInfo.firstName} ${userInfo.lastName}`,
              firstName: userInfo.firstName,
              lastName: userInfo.lastName,
              username: userInfo.username,
              roles: roles,
              primaryRole: primaryRole,
              emailVerified: userInfo.emailVerified,
              isActive: true,
            });
          }
        }
      })
      .catch((error) => {
        console.error("Failed to initialize authentication:", error);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const login = (redirectUri?: string) => {
    keycloakLogin(redirectUri);
  };

  const logout = (redirectUri?: string) => {
    keycloakLogout(redirectUri);
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Admin has all permissions
    if (user.primaryRole === "ADMIN") return true;

    // Check if user's primary role has the permission
    const rolePermissions = ROLE_PERMISSIONS[user.primaryRole] || [];
    return (
      rolePermissions.includes(permission) || rolePermissions.includes("*")
    );
  };

  const hasRoleCheck = (role: UserRole | string): boolean => {
    if (!user) return false;
    return hasRole(role);
  };

  const hasAnyRoleCheck = (roles: (UserRole | string)[]): boolean => {
    if (!user) return false;
    return hasAnyRole(roles);
  };

  const getAuthHeader = () => {
    return getAuthorizationHeader();
  };

  const value: KeycloakAuthContextType = {
    user,
    login,
    logout,
    isAuthenticated,
    isLoading,
    hasPermission,
    hasRole: hasRoleCheck,
    hasAnyRole: hasAnyRoleCheck,
    getAuthHeader,
    getToken,
  };

  return (
    <KeycloakAuthContext.Provider value={value}>
      {children}
    </KeycloakAuthContext.Provider>
  );
}

// Export for backward compatibility with existing code
export { KeycloakAuthProvider as AuthProvider, useKeycloakAuth as useAuth };
