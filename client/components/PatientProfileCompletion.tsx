import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { PatientService } from "@/services/api.service";
import { useAuth } from "@/contexts/AuthContext";

interface PatientProfileCompletionProps {
  onComplete?: () => void;
}

export function PatientProfileCompletion({ onComplete }: PatientProfileCompletionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "",
    allergies: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceGroupNumber: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender || null,
        allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
        emergencyContacts: {
          name: formData.emergencyContactName || null,
          phone: formData.emergencyContactPhone || null,
          relationship: formData.emergencyContactRelationship || null,
        },
        insuranceInfo: {
          provider: formData.insuranceProvider || null,
          policyNumber: formData.insurancePolicyNumber || null,
          groupNumber: formData.insuranceGroupNumber || null,
        },
      };

      const response = await PatientService.updatePatient(user.id, updateData);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onComplete?.();
        }, 2000);
      } else {
        setError("Failed to update profile. Please try again.");
      }
    } catch (err: any) {
      console.error("Profile update error:", err);
      setError("An error occurred while updating your profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-700 mb-2">Profile Updated!</h2>
              <p className="text-gray-600">Your patient profile has been successfully updated.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Patient Profile</CardTitle>
          <p className="text-gray-600">
            Please fill out your patient profile to get the most out of your healthcare experience.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                <Input
                  id="allergies"
                  placeholder="e.g., Penicillin, Shellfish, Latex"
                  value={formData.allergies}
                  onChange={(e) => handleInputChange("allergies", e.target.value)}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    placeholder="Full name"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                  <Input
                    id="emergencyContactPhone"
                    placeholder="(555) 123-4567"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                <Select value={formData.emergencyContactRelationship} onValueChange={(value) => handleInputChange("emergencyContactRelationship", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spouse">Spouse</SelectItem>
                    <SelectItem value="parent">Parent</SelectItem>
                    <SelectItem value="child">Child</SelectItem>
                    <SelectItem value="sibling">Sibling</SelectItem>
                    <SelectItem value="friend">Friend</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Insurance Information</h3>
              
              <div>
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  placeholder="e.g., Blue Cross Blue Shield"
                  value={formData.insuranceProvider}
                  onChange={(e) => handleInputChange("insuranceProvider", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insurancePolicyNumber">Policy Number</Label>
                  <Input
                    id="insurancePolicyNumber"
                    placeholder="Policy number"
                    value={formData.insurancePolicyNumber}
                    onChange={(e) => handleInputChange("insurancePolicyNumber", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="insuranceGroupNumber">Group Number</Label>
                  <Input
                    id="insuranceGroupNumber"
                    placeholder="Group number"
                    value={formData.insuranceGroupNumber}
                    onChange={(e) => handleInputChange("insuranceGroupNumber", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onComplete?.()}
                disabled={isLoading}
              >
                Skip for Now
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
