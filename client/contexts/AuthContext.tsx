import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthService, UserService } from "../services/api.service";

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

  useEffect(() => {
    // Check for stored authentication
    const storedUser = localStorage.getItem("telecheck_user");
    const storedToken = localStorage.getItem("auth_token");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Generate auth token if it doesn't exist
        if (!storedToken) {
          const tokenPayload = {
            userId: parsedUser.id,
            email: parsedUser.email,
            role: parsedUser.role,
            permissions: parsedUser.permissions,
            exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          };
          const mockToken = btoa(JSON.stringify(tokenPayload));
          console.log(
            `[AuthContext] Generated startup token for ${parsedUser.email}:`,
            {
              tokenPayload,
              tokenLength: mockToken.length,
            },
          );
          localStorage.setItem("auth_token", mockToken);
        } else {
          console.log(
            `[AuthContext] Using existing token for ${parsedUser.email}:`,
            {
              tokenLength: storedToken.length,
              tokenPreview: storedToken.substring(0, 50) + "...",
            },
          );
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("telecheck_user");
        localStorage.removeItem("auth_token");
      }
    }
    setIsLoading(false);
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
        const { user: apiUser, token } = response.data;

        // Check if the user's role matches the requested role
        if (apiUser.role !== role) {
          console.warn(
            `[AuthContext] Role mismatch: expected ${role}, got ${apiUser.role}`,
          );
          setIsLoading(false);
          return false;
        }

        // Transform API user to frontend User format
        const user: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: `${apiUser.firstName} ${apiUser.lastName}`,
          role: apiUser.role as UserRole,
          permissions: getPermissionsForRole(apiUser.role),
          isActive: true,
          lastLogin: new Date().toISOString(),
        };

        console.log(`[AuthContext] Login successful for ${user.email}:`, {
          userId: user.id,
          role: user.role,
          tokenLength: token.length,
        });

        setUser(user);
        localStorage.setItem("telecheck_user", JSON.stringify(user));
        localStorage.setItem("auth_token", token);
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
