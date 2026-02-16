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
});

export type AppRouter = typeof appRouter;
