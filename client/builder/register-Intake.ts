import { Intake } from "../pages/ehr/Intake";

export async function registerIntakeWithBuilder() {
  const mod: any = await import("@builder.io/react").catch(() => null);
  if (!mod?.Builder) return;
  mod.Builder.registerComponent(Intake, {
    name: "EHR_IntakeCard",
    inputs: [
      { name: "patientId", type: "string", required: true },
      { name: "showInsurance", type: "boolean", defaultValue: true },
      { name: "ctaLabel", type: "string", defaultValue: "Save Intake" },
    ],
  });
}
