import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type UserRole = "patient" | "doctor" | "nurse" | "caregiver" | "pharmacist" | "admin";

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
  logout: () => void;
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

// Mock user database with different roles
const mockUsers: Record<string, User> = {
  "patient@telecheck.com": {
    id: "1",
    email: "patient@telecheck.com",
    name: "John Patient",
    role: "patient",
    avatar: "/avatars/patient.jpg",
    permissions: [
      "view_own_records",
      "book_appointments",
      "order_medications",
      "view_lab_results",
    ],
    isActive: true,
    lastLogin: new Date().toISOString(),
  },
  "doctor@telecheck.com": {
    id: "2",
    email: "doctor@telecheck.com",
    name: "Dr. Sarah Wilson",
    role: "doctor",
    avatar: "/avatars/doctor.jpg",
    permissions: [
      "view_all_patients",
      "prescribe_medications",
      "review_labs",
      "telehealth_consults",
      "approve_treatments",
    ],
    organization: "Telecheck Medical Center",
    license: "MD-123456",
    specialization: "Internal Medicine",
    isActive: true,
    lastLogin: new Date().toISOString(),
  },
  "pharmacist@telecheck.com": {
    id: "3",
    email: "pharmacist@telecheck.com",
    name: "PharmD Mike Chen",
    role: "pharmacist",
    avatar: "/avatars/pharmacist.jpg",
    permissions: [
      "dispense_medications",
      "review_prescriptions",
      "drug_interactions",
      "inventory_management",
      "patient_counseling",
    ],
    organization: "Telecheck Pharmacy",
    license: "PharmD-789012",
    specialization: "Clinical Pharmacy",
    isActive: true,
    lastLogin: new Date().toISOString(),
  },
  "nurse@telecheck.com": {
    id: "4",
    email: "nurse@telecheck.com",
    name: "Nurse Jennifer Smith",
    role: "nurse",
    avatar: "/avatars/nurse.jpg",
    permissions: [
      "view_all_patients",
      "patient_assessment",
      "vital_monitoring",
      "care_coordination",
      "medication_administration",
      "patient_education",
      "wound_management",
      "rpm_monitoring",
    ],
    organization: "Telecheck Medical Center",
    license: "RN-345678",
    specialization: "Critical Care Nursing",
    isActive: true,
    lastLogin: new Date().toISOString(),
  },
  "caregiver@telecheck.com": {
    id: "5",
    email: "caregiver@telecheck.com",
    name: "Maria Rodriguez",
    role: "caregiver",
    avatar: "/avatars/caregiver.jpg",
    permissions: [
      "view_assigned_patients",
      "submit_vitals",
      "medication_tracking",
      "appointment_scheduling",
      "family_communication",
      "basic_patient_care",
      "rpm_data_entry",
    ],
    organization: "Family Care Services",
    specialization: "Home Health Aide",
    isActive: true,
    lastLogin: new Date().toISOString(),
  },
  "admin@telecheck.com": {
    id: "6",
    email: "admin@telecheck.com",
    name: "Admin User",
    role: "admin",
    avatar: "/avatars/admin.jpg",
    permissions: [
      "full_access",
      "user_management",
      "system_settings",
      "audit_logs",
      "platform_analytics",
      "security_controls",
    ],
    organization: "Telecheck Platform",
    isActive: true,
    lastLogin: new Date().toISOString(),
  },
};

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
            exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
          };
          const mockToken = btoa(JSON.stringify(tokenPayload));
          console.log(`[AuthContext] Generated startup token for ${parsedUser.email}:`, {
            tokenPayload,
            tokenLength: mockToken.length
          });
          localStorage.setItem("auth_token", mockToken);
        } else {
          console.log(`[AuthContext] Using existing token for ${parsedUser.email}:`, {
            tokenLength: storedToken.length,
            tokenPreview: storedToken.substring(0, 50) + '...'
          });
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

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = mockUsers[email];

    if (user && user.role === role && user.isActive) {
      // Update last login
      user.lastLogin = new Date().toISOString();

      // Generate a mock JWT token for API requests
      const tokenPayload = {
        userId: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      const mockToken = btoa(JSON.stringify(tokenPayload));

      console.log(`[AuthContext] Generated token for user ${user.email}:`, {
        tokenPayload,
        tokenLength: mockToken.length,
        tokenPreview: mockToken.substring(0, 50) + '...'
      });

      setUser(user);
      localStorage.setItem("telecheck_user", JSON.stringify(user));
      localStorage.setItem("auth_token", mockToken); // Store token for API client
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("telecheck_user");
    localStorage.removeItem("auth_token"); // Remove token on logout
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

    const targetUser = Object.values(mockUsers).find((u) => u.role === newRole);
    if (targetUser) {
      setUser({ ...targetUser });
      localStorage.setItem("telecheck_user", JSON.stringify(targetUser));
      return true;
    }
    return false;
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
