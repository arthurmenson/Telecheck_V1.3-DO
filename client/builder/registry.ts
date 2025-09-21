import { ensureBuilder } from "../../lib/builder";
import { registerIntakeWithBuilder } from "./register-Intake";
import { registerRPMWithBuilder } from "./register-PatientRPMDashboard";

void ensureBuilder();
void registerIntakeWithBuilder();
void registerRPMWithBuilder();
