import React from "react";
import { USSDManagement } from "../components/USSDManagement";

export function USSD() {
  return (
    <div className="min-h-screen aurora-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <USSDManagement />
      </div>
    </div>
  );
}
