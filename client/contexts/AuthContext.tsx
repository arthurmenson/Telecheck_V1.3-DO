import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthService, UserService } from "../services/api.service";
import type { User as ApiUser } from "../services/api.service";

export type UserRole =
  | "patient"
  | "doctor"
  | "nurse"
  | "caregiver"
  | "pharmacist"
  | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  permissions: string[];
  organization?: string;
  license?: string;
  specialization?: string;
  lastLogin?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  switchRole: (newRole: UserRole) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper function to get permissions for a role
const getPermissionsForRole = (role: string): string[] => {
  const rolePermissions: Record<string, string[]> = {
    patient: [
      "view_own_records",
      "book_appointments",
      "order_medications",
      "view_lab_results",
    ],
    doctor: [
      "view_all_patients",
      "prescribe_medications",
      "review_labs",
      "telehealth_consults",
      "approve_treatments",
    ],
    nurse: [
      "view_all_patients",
      "patient_assessment",
      "vital_monitoring",
      "care_coordination",
      "medication_administration",
      "patient_education",
      "wound_management",
      "rpm_monitoring",
    ],
    pharmacist: [
      "dispense_medications",
      "review_prescriptions",
      "drug_interactions",
      "inventory_management",
      "patient_counseling",
    ],
    admin: [
      "full_access",
      "user_management",
      "system_settings",
      "audit_logs",
      "platform_analytics",
      "security_controls",
    ],
  };
  return rolePermissions[role] || [];
};

// Mock users removed - now using real API authentication

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapApiUserToAuthUser = (apiUser: ApiUser): User => {
    const resolvedRole = apiUser.role as UserRole;
    const displayName =
      apiUser.name?.trim() ||
      [apiUser.firstName, apiUser.lastName].filter(Boolean).join(" ") ||
      apiUser.email;

    return {
      id: apiUser.id,
      email: apiUser.email,
      name: displayName,
      role: resolvedRole,
      permissions: getPermissionsForRole(resolvedRole),
      avatar: apiUser.avatar,
      isActive: apiUser.isActive ?? true,
      lastLogin: apiUser.lastLoginAt ?? new Date().toISOString(),
    };
  };

  useEffect(() => {
    let isMounted = true;

    const bootstrapSession = async () => {
      const storedUser = localStorage.getItem("telecheck_user");
      const storedToken = localStorage.getItem("auth_token");
      const storedRefreshToken = localStorage.getItem("refresh_token");

      if (!storedUser) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const parsedUser: User = JSON.parse(storedUser);

        if (storedToken) {
          if (isMounted) {
            setUser(parsedUser);
            setIsLoading(false);
          }
          return;
        }

        if (storedRefreshToken) {
          try {
            const refreshResponse =
              await AuthService.refreshToken(storedRefreshToken);
            if (refreshResponse.success && refreshResponse.data?.token) {
              localStorage.setItem("auth_token", refreshResponse.data.token);
              if (isMounted) {
                setUser(parsedUser);
                setIsLoading(false);
              }
              return;
            }
          } catch (error) {
            console.error("[AuthContext] Failed to refresh token", error);
          }
        }

        localStorage.removeItem("telecheck_user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("[AuthContext] Failed to parse stored user", error);
        localStorage.removeItem("telecheck_user");
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (
    email: string,
    password: string,
    role: UserRole,
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Call the real API
      const response = await AuthService.login(email, password);

      if (response.success && response.data) {
        const { user: apiUser, token, refreshToken } = response.data;

        // Check if the user's role matches the requested role
        if (apiUser.role !== role) {
          console.warn(
            `[AuthContext] Role mismatch: expected ${role}, got ${apiUser.role}`,
          );
          setIsLoading(false);
          return false;
        }

        // Transform API user to frontend User format
        const authUser = mapApiUserToAuthUser(apiUser);

        setUser(authUser);
        localStorage.setItem("telecheck_user", JSON.stringify(authUser));
        localStorage.setItem("auth_token", token);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        } else {
          localStorage.removeItem("refresh_token");
        }
        setIsLoading(false);
        return true;
      } else {
        console.error("[AuthContext] Login failed:", response);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error("[AuthContext] Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      // Call the real API logout endpoint
      await AuthService.logout();
    } catch (error) {
      console.error("[AuthContext] Logout API call failed:", error);
      // Continue with local logout even if API call fails
    }

    setUser(null);
    localStorage.removeItem("telecheck_user");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return (
      user.permissions.includes(permission) ||
      user.permissions.includes("full_access")
    );
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const switchRole = async (newRole: UserRole): Promise<boolean> => {
    // Only admins can switch roles for testing purposes
    if (!user || user.role !== "admin") return false;

    // For now, just update the current user's role
    // In a real implementation, this would require additional backend support
    const updatedUser = {
      ...user,
      role: newRole,
      permissions: getPermissionsForRole(newRole),
    };
    setUser(updatedUser);
    localStorage.setItem("telecheck_user", JSON.stringify(updatedUser));
    return true;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
    hasPermission,
    hasRole,
    switchRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
