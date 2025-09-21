import { PatientRPMDashboard } from "../pages/PatientRPMDashboard";

export async function registerRPMWithBuilder() {
  const mod: any = await import("@builder.io/react").catch(() => null);
  if (!mod?.Builder) return;
  mod.Builder.registerComponent(PatientRPMDashboard, {
    name: "RPM_PatientDashboard",
    inputs: [
      { name: "patientId", type: "string", required: true },
      { name: "days", type: "number", defaultValue: 7 },
      { name: "showAlerts", type: "boolean", defaultValue: true },
    ],
  });
}
