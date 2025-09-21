import { setupWorker } from "msw/browser";
import { ehrHandlers } from "./ehr.handlers";
import { rpmHandlers } from "./rpm.handlers";
import { labsHandlers } from "./labs.handlers";
import { medicationsHandlers } from "./medications.handlers";
import { pharmacyHandlers } from "./pharmacy.handlers";
import { schedulingHandlers } from "./scheduling.handlers";

export const worker = setupWorker(
  ...ehrHandlers,
  ...rpmHandlers,
  ...labsHandlers,
  ...medicationsHandlers,
  ...pharmacyHandlers,
  ...schedulingHandlers,
);
