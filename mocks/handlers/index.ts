import { authHandlers } from "./auth";
import { memberHandlers } from "./members";
import { crmHandlers } from "./crm";
import { analyticsHandlers } from "./analytics";
import { enquiryHandlers } from "./enquiries";
import { smartLeadsHandlers } from "./smart-leads";
import { socialListeningHandlers } from "./social-listening";
import { dashboardHandlers } from "./dashboard";
import { outreachHandlers } from "./outreach";

export const handlers = [
  ...authHandlers,
  ...memberHandlers,
  ...crmHandlers,
  ...analyticsHandlers,
  ...enquiryHandlers,
  ...smartLeadsHandlers,
  ...socialListeningHandlers,
  ...dashboardHandlers,
  ...outreachHandlers,
];

