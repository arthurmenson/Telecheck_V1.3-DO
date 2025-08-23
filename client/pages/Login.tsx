import React, { useState } from "react";
import { Navigate, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth, UserRole } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import {
  User,
  Stethoscope,
  Pill,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Heart,
  HeartPulse,
  UserCheck,
} from "lucide-react";

const roleConfigs = {
  patient: {
    icon: User,
    title: "Patient Portal",
    description:
      "Access your health records, lab results, and telehealth consultations",
    color: "bg-blue-500",
    redirectPath: "/dashboard",
    features: [
      "Health Records",
      "Lab Results",
      "Telehealth",
      "Pharmacy Orders",
    ],
  },
  doctor: {
    icon: Stethoscope,
    title: "Doctor Portal",
    description:
      "Manage patients, review consultations, and prescribe treatments",
    color: "bg-green-500",
    redirectPath: "/doctor-dashboard",
    features: [
      "Patient Management",
      "Consultations",
      "Prescriptions",
      "AI Insights",
    ],
  },
  nurse: {
    icon: HeartPulse,
    title: "Nurse Portal",
    description:
      "Patient care coordination, vital monitoring, and clinical workflows",
    color: "bg-teal-500",
    redirectPath: "/nurse-dashboard",
    features: [
      "Patient Care",
      "Vital Monitoring",
      "RPM Management",
      "Care Coordination",
    ],
  },
  caregiver: {
    icon: UserCheck,
    title: "Caregiver Portal",
    description:
      "Family care management, vital submission, and patient communication",
    color: "bg-pink-500",
    redirectPath: "/caregiver-dashboard",
    features: [
      "Patient Care",
      "Vital Submission",
      "Family Portal",
      "Care Communication",
    ],
  },
  pharmacist: {
    icon: Pill,
    title: "Pharmacist Portal",
    description:
      "Dispense medications, review prescriptions, and manage inventory",
    color: "bg-purple-500",
    redirectPath: "/pharmacist-dashboard",
    features: [
      "Prescription Review",
      "Drug Dispensing",
      "Inventory",
      "Patient Counseling",
    ],
  },
  admin: {
    icon: Shield,
    title: "Admin Portal",
    description:
      "Platform administration, user management, and system analytics",
    color: "bg-red-500",
    redirectPath: "/admin-dashboard",
    features: [
      "User Management",
      "System Analytics",
      "Security Controls",
      "Platform Settings",
    ],
  },
};

export function Login() {
  const { isAuthenticated, login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const from =
    location.state?.from?.pathname || roleConfigs[selectedRole].redirectPath;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await login(email, password, selectedRole);

      if (success) {
        toast({
          title: "Login Successful",
          description: `Welcome to ${roleConfigs[selectedRole].title}`,
        });
        navigate(from, { replace: true });
      } else {
        toast({
          title: "Login Failed",
          description:
            "Invalid credentials or role mismatch. Please check your details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (role: UserRole) => {
    const credentials = {
      patient: "patient@telecheck.com",
      doctor: "doctor@telecheck.com",
      nurse: "nurse@telecheck.com",
      caregiver: "caregiver@telecheck.com",
      pharmacist: "pharmacist@telecheck.com",
      admin: "admin@telecheck.com",
    };

    setSelectedRole(role);
    setEmail(credentials[role]);
    setPassword("demo123");
  };

  const currentRoleConfig = roleConfigs[selectedRole];
  const RoleIcon = currentRoleConfig.icon;

  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Role Selection Panel */}
        <div className="space-y-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">Telecheck</h1>
            </div>
            <p className="text-muted-foreground text-lg">
              Choose your portal to access role-specific features
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(
              Object.entries(roleConfigs) as [
                UserRole,
                typeof roleConfigs.patient,
              ][]
            ).map(([role, config]) => {
              const Icon = config.icon;
              const isSelected = selectedRole === role;

              return (
                <Card
                  key={role}
                  className={`cursor-pointer transition-all hover-lift ${
                    isSelected
                      ? "glass-morphism border-2 border-primary bg-primary/5"
                      : "glass-morphism border border-border/20 hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`w-10 h-10 ${config.color} rounded-lg flex items-center justify-center`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {config.title}
                        </h3>
                        <Badge
                          variant={isSelected ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {config.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {config.features.slice(0, 2).map((feature) => (
                        <Badge
                          key={feature}
                          variant="outline"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                      {config.features.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{config.features.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Demo Credentials */}
          <Card className="glass-morphism border border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                  Demo Access
                </h4>
              </div>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                Try different roles with demo credentials
              </p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(roleConfigs) as UserRole[]).map((role) => (
                  <Button
                    key={role}
                    variant="outline"
                    size="sm"
                    onClick={() => fillDemoCredentials(role)}
                    className="text-xs"
                  >
                    Demo {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Login Form */}
        <div className="flex flex-col justify-center">
          <Card className="glass-morphism border border-border/20">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <div
                  className={`w-12 h-12 ${currentRoleConfig.color} rounded-xl flex items-center justify-center`}
                >
                  <RoleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {currentRoleConfig.title}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Sign in to access your portal
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-bg text-white border-0 hover-lift"
                  disabled={isSubmitting || isLoading}
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Sign In to {currentRoleConfig.title}
                    </>
                  )}
                </Button>
              </form>

              {/* Portal Features */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">
                  Portal Features:
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {currentRoleConfig.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center space-x-2 text-sm"
                    >
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Register Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-primary hover:underline font-medium"
                  >
                    Create a patient account
                  </Link>
                </p>
              </div>

              {/* Security Notice */}
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Secure Access
                  </span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  All portal access is encrypted and HIPAA compliant
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
