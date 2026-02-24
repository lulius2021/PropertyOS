import { router } from "../trpc";
import { objekteRouter } from "./objekte";
import { einheitenRouter } from "./einheiten";
import { mieterRouter } from "./mieter";
import { vertraegeRouter } from "./vertraege";
import { sollstellungenRouter } from "./sollstellungen";
import { bankRouter } from "./bank";
import { mahnungenRouter } from "./mahnungen";
import { ticketsRouter } from "./tickets";
import { kostenRouter } from "./kosten";
import { zaehlerRouter } from "./zaehler";
import { krediteRouter } from "./kredite";
import { reportingRouter } from "./reporting";
import { authSecurityRouter } from "./auth-security";
import { planRouter } from "./plan";
import { statistikRouter } from "./statistik";
import { seedingRouter } from "./seeding";
import { dokumenteRouter } from "./dokumente";
import { userSettingsRouter } from "./userSettings";
import { dienstleisterRouter } from "./dienstleister";
import { nebenkostenabrechnungRouter } from "./nebenkostenabrechnung";
import { wartungRouter } from "./wartung";
import { sucheRouter } from "./suche";
import { feedbackRouter } from "./feedback";

export const appRouter = router({
  objekte: objekteRouter,
  einheiten: einheitenRouter,
  mieter: mieterRouter,
  vertraege: vertraegeRouter,
  sollstellungen: sollstellungenRouter,
  bank: bankRouter,
  mahnungen: mahnungenRouter,
  tickets: ticketsRouter,
  kosten: kostenRouter,
  zaehler: zaehlerRouter,
  kredite: krediteRouter,
  reporting: reportingRouter,
  authSecurity: authSecurityRouter,
  plan: planRouter,
  statistik: statistikRouter,
  seeding: seedingRouter,
  dokumente: dokumenteRouter,
  userSettings: userSettingsRouter,
  dienstleister: dienstleisterRouter,
  nebenkostenabrechnung: nebenkostenabrechnungRouter,
  wartung: wartungRouter,
  suche: sucheRouter,
  feedback: feedbackRouter,
});

export type AppRouter = typeof appRouter;
