import React from "react";
import { Link } from "react-router-dom";
import { DoctorVideoConsultations } from "../components/DoctorVideoConsultations";
import { Button } from "../components/ui/button";
import { ArrowLeft, Video } from "lucide-react";

/**
 * Dedicated page for doctor video consultations
 * Can be accessed via a dedicated route or embedded in the doctor dashboard
 */
export function DoctorVideoConsultationsPage() {
  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link to="/doctor-dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Video className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Video Consultations
              </h1>
              <p className="text-muted-foreground">
                Manage your video appointments and join consultations
              </p>
            </div>
          </div>
        </div>

        {/* Main Component */}
        <DoctorVideoConsultations
          showStats={true}
          autoRefresh={true}
          refreshInterval={30000}
        />
      </div>
    </div>
  );
}

export default DoctorVideoConsultationsPage;
