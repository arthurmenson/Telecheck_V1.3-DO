import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../contexts/AuthContext";
import { Card, CardContent } from "./ui/card";
import { AlertTriangle, Shield, Lock } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  requiredPermissions = [],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, isAuthenticated, hasPermission, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center aurora-bg">
        <Card className="glass-morphism border border-border/20 p-8">
          <CardContent className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Verifying access...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center aurora-bg">
        <Card className="glass-morphism border border-red-200 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Access Denied
            </h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this area. This portal is
              restricted to {allowedRoles.join(", ")} roles.
            </p>
            <div className="text-sm text-muted-foreground">
              Current role: <span className="font-medium">{user?.role}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((permission) =>
      hasPermission(permission),
    );

    if (!hasAllPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center aurora-bg">
          <Card className="glass-morphism border border-yellow-200 max-w-md">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Insufficient Permissions
              </h2>
              <p className="text-muted-foreground mb-4">
                You don't have the required permissions to access this feature.
              </p>
              <div className="text-sm text-muted-foreground">
                Required: {requiredPermissions.join(", ")}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
}

// Higher-order component for quick role checking
export function withRoleProtection(
  Component: React.ComponentType<any>,
  allowedRoles: UserRole[],
) {
  return function ProtectedComponent(props: any) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Permission-based wrapper
export function withPermissionProtection(
  Component: React.ComponentType<any>,
  requiredPermissions: string[],
) {
  return function ProtectedComponent(props: any) {
    return (
      <ProtectedRoute requiredPermissions={requiredPermissions}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
