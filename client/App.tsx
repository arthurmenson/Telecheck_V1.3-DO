import "./global.css";

import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Home } from "./pages/Home";
import { Labs } from "./pages/Labs";
import { Chat } from "./pages/Chat";
import { Dashboard } from "./pages/Dashboard";
import { DoctorDashboard } from "./pages/DoctorDashboard";
import { NurseDashboard } from "./pages/NurseDashboard";
import { CaregiverDashboard } from "./pages/CaregiverDashboard";
import { PharmacistDashboard } from "./pages/PharmacistDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Medications } from "./pages/Medications";
import { AIInsights } from "./pages/AIInsights";
import { Pharmacy } from "./pages/Pharmacy";
import { Pharmacopia } from "./pages/Pharmacopia";
import { Wellness } from "./pages/Wellness";
import { Trends } from "./pages/Trends";
import { Analytics } from "./pages/Analytics";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { HowItWorks } from "./pages/HowItWorks";
import { Schedule } from "./pages/Schedule";
import { AlgorithmConfig } from "./pages/AlgorithmConfig";
import { EHR } from "./pages/EHR";
import { Intake } from "./pages/ehr/Intake";
import { AIScribe } from "./pages/ehr/AIScribe";
import { PatientPortal } from "./pages/ehr/PatientPortal";
import { Providers } from "./pages/ehr/Providers";
import { Programs } from "./pages/ehr/Programs";
import { Affiliate } from "./pages/ehr/Affiliate";
import { AdminSettings } from "./pages/AdminSettings";
import { DoctorSettings } from "./pages/DoctorSettings";
import { PatientConsultation } from "./pages/PatientConsultation";
import { ClinicalCharting } from "./pages/ehr/ClinicalCharting";
import { CarePlans } from "./pages/ehr/CarePlans";
import { ClinicalTools } from "./pages/ehr/ClinicalTools";
import { Scheduling } from "./pages/ehr/Scheduling";
import { Reporting } from "./pages/ehr/Reporting";
import { Telehealth } from "./pages/ehr/Telehealth";
import { Messaging } from "./pages/ehr/Messaging";
import { Journaling } from "./pages/ehr/Journaling";
import { WorkflowAutomation } from "./pages/WorkflowAutomation";
import { QuestionnaireBuilder } from "./pages/QuestionnaireBuilder";
import { ProductCatalog } from "./components/ProductCatalog";
import { InventoryDashboard } from "./components/InventoryDashboard";
import { SubscriptionManager } from "./components/SubscriptionManager";
import { ShoppingCart as ShoppingCartComponent } from "./components/ShoppingCart";
import { CheckoutSystem } from "./components/CheckoutSystem";
import { OrderManager } from "./components/OrderManager";
import { AdminProductManager } from "./components/AdminProductManager";
import { InventoryAlerts } from "./components/InventoryAlerts";
import { AIProductSearch } from "./components/AIProductSearch";
import { EcommerceAnalytics } from "./components/EcommerceAnalytics";
import { Marketing } from "./pages/Marketing";
import { SocialMediaHub } from "./pages/marketing/SocialMediaHub";
import { AutomationFlows } from "./pages/marketing/AutomationFlows";
import { EmailCampaigns } from "./pages/marketing/EmailCampaigns";
import { SMSMarketing } from "./pages/marketing/SMSMarketing";
import { CustomerJourney } from "./pages/marketing/CustomerJourney";
import { USSD } from "./pages/USSD";
import { PatientRPMDashboard } from "./pages/PatientRPMDashboard";
import { RPMCommandCenter } from "./pages/RPMCommandCenter";
import { CCMWorkflow } from "./pages/CCMWorkflow";
import { VitalSubmission } from "./pages/VitalSubmission";
import { DiabetesRPMDashboard } from "./pages/DiabetesRPMDashboard";
import { PatientRegistry } from "./pages/PatientRegistry";
import { PatientRecords } from "./pages/PatientRecords";

// Wrapper component to extract patientId from URL params
function PatientRecordsWrapper() {
  const { patientId } = useParams<{ patientId: string }>();
  return <PatientRecords patientId={patientId || ""} />;
}
import { PatientCareCoordination } from "./pages/PatientCareCoordination";
import { PatientCommunication } from "./pages/PatientCommunication";
import { PatientAnalytics } from "./pages/PatientAnalytics";
import { PatientManagement } from "./pages/PatientManagement";
import { ClinicalOperations } from "./pages/ClinicalOperations";
import { RemoteMonitoring } from "./pages/RemoteMonitoring";
import { Administration } from "./pages/Administration";
import NotFound from "./pages/NotFound";
import {
  Activity,
  Pill,
  Brain,
  ShoppingCart,
  Dna,
  Heart,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="telecheck-ui-theme">
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/"
                  element={
                    <Layout>
                      <Home />
                    </Layout>
                  }
                />
                <Route
                  path="/how-it-works"
                  element={
                    <Layout>
                      <HowItWorks />
                    </Layout>
                  }
                />

                {/* Patient Portal Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/labs"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Layout>
                        <Labs />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/medications"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Layout>
                        <Medications />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/medicationsafety"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Layout>
                        <Medications />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ai-insights"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Layout>
                        <AIInsights />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pharmacy"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Layout>
                        <Pharmacy />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/pharmacopia"
                  element={
                    <ProtectedRoute
                      allowedRoles={["patient", "doctor", "pharmacist"]}
                    >
                      <Layout>
                        <Pharmacopia />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wellness"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Layout>
                        <Wellness />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trends"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Layout>
                        <Trends />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chat"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Layout>
                        <Chat />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/schedule"
                  element={
                    <ProtectedRoute allowedRoles={["patient"]}>
                      <Layout>
                        <Schedule />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Doctor Portal Routes */}
                <Route
                  path="/doctor-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["doctor"]}>
                      <Layout>
                        <DoctorDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Nurse Portal Routes */}
                <Route
                  path="/nurse-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["nurse"]}>
                      <Layout>
                        <NurseDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Caregiver Portal Routes */}
                <Route
                  path="/caregiver-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["caregiver"]}>
                      <Layout>
                        <CaregiverDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Pharmacist Portal Routes */}
                <Route
                  path="/pharmacist-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["pharmacist"]}>
                      <Layout>
                        <PharmacistDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Admin Portal Routes */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout>
                        <AdminDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                      <Layout>
                        <Analytics />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/algorithm-config"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout>
                        <AlgorithmConfig />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* EHR System Routes */}
                <Route
                  path="/ehr"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <EHR />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/intake"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <Intake />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/ai-scribe"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <AIScribe />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/portal"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor"]}>
                      <Layout>
                        <PatientPortal />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/providers"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <Providers />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/programs"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <Programs />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/charting"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <ClinicalCharting />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/care-plans"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <CarePlans />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/affiliate"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout>
                        <Affiliate />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/clinical-tools"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <ClinicalTools />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/scheduling"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <Scheduling />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/reporting"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <Reporting />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/telehealth"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <Telehealth />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/messaging"
                  element={
                    <ProtectedRoute
                      allowedRoles={["admin", "doctor", "nurse", "patient"]}
                    >
                      <Layout>
                        <Messaging />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/journaling"
                  element={
                    <ProtectedRoute
                      allowedRoles={["admin", "doctor", "nurse", "patient"]}
                    >
                      <Layout>
                        <Journaling />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ehr/workflows"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <WorkflowAutomation />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/questionnaire-builder"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <QuestionnaireBuilder />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout>
                        <AdminSettings />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute allowedRoles={["doctor", "nurse", "caregiver"]}>
                      <Layout>
                        <DoctorSettings />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultation/new"
                  element={
                    <ProtectedRoute allowedRoles={["doctor", "nurse"]}>
                      <Layout>
                        <PatientConsultation />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/consultation/:patientId"
                  element={
                    <ProtectedRoute allowedRoles={["doctor", "nurse"]}>
                      <Layout>
                        <PatientConsultation />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ussd"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout>
                        <USSD />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* RPM and CCM Routes */}
                <Route
                  path="/diabetes-rpm-dashboard"
                  element={
                    <ProtectedRoute allowedRoles={["patient", "caregiver", "admin", "doctor", "nurse"]}>
                      <Layout>
                        <DiabetesRPMDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient-rpm"
                  element={
                    <ProtectedRoute allowedRoles={["patient", "caregiver", "admin", "doctor", "nurse"]}>
                      <Layout>
                        <PatientRPMDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/rpm-command-center"
                  element={
                    <ProtectedRoute allowedRoles={["doctor", "nurse", "admin"]}>
                      <Layout>
                        <RPMCommandCenter />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/ccm-workflow"
                  element={
                    <ProtectedRoute allowedRoles={["doctor", "nurse", "admin"]}>
                      <Layout>
                        <CCMWorkflow />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/vital-submission"
                  element={
                    <ProtectedRoute allowedRoles={["patient", "caregiver", "admin", "doctor", "nurse"]}>
                      <Layout>
                        <VitalSubmission />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* E-commerce Routes */}
                <Route
                  path="/catalog"
                  element={
                    <ProtectedRoute
                      allowedRoles={["patient", "admin", "doctor", "nurse"]}
                    >
                      <Layout>
                        <ProductCatalog />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "pharmacist"]}>
                      <Layout>
                        <InventoryDashboard />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/subscriptions"
                  element={
                    <ProtectedRoute allowedRoles={["patient", "admin"]}>
                      <Layout>
                        <SubscriptionManager />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "pharmacist"]}>
                      <Layout>
                        <OrderManager />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <Layout>
                        <AdminProductManager />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics/ecommerce"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "pharmacist"]}>
                      <Layout>
                        <EcommerceAnalytics />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory/alerts"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "pharmacist"]}>
                      <Layout>
                        <InventoryAlerts />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/marketing"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "pharmacist"]}>
                      <Layout>
                        <Marketing />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/marketing/social"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "pharmacist"]}>
                      <Layout>
                        <SocialMediaHub />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/marketing/automation"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "pharmacist"]}>
                      <Layout>
                        <AutomationFlows />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/marketing/email"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "pharmacist"]}>
                      <Layout>
                        <EmailCampaigns />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/marketing/sms"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "pharmacist"]}>
                      <Layout>
                        <SMSMarketing />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/marketing/journey"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "pharmacist"]}>
                      <Layout>
                        <CustomerJourney />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Patient Management Routes */}
                <Route
                  path="/patient-registry"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <PatientRegistry />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient-records/:patientId"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse", "patient"]}>
                      <Layout>
                        <PatientRecordsWrapper />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient-care-coordination/:patientId?"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse", "caregiver"]}>
                      <Layout>
                        <PatientCareCoordination />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient-communication/:patientId?"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse", "patient", "caregiver"]}>
                      <Layout>
                        <PatientCommunication />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient-analytics"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <PatientAnalytics />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Consolidated Management Pages */}
                <Route
                  path="/patient-management"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <PatientManagement />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clinical-operations"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <ClinicalOperations />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/remote-monitoring"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <RemoteMonitoring />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/administration"
                  element={
                    <ProtectedRoute allowedRoles={["admin", "doctor", "nurse"]}>
                      <Layout>
                        <Administration />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all route */}
                <Route
                  path="*"
                  element={
                    <Layout>
                      <NotFound />
                    </Layout>
                  }
                />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

const container = document.getElementById("root")!;
let root = (container as any).__reactRoot;

if (!root) {
  root = createRoot(container);
  (container as any).__reactRoot = root;
}

root.render(<App />);
