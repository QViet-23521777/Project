import cors from "cors";
import express from "express";
import morgan from "morgan";

import { errorHandler } from "./middleware/error";
import { notFoundHandler } from "./middleware/notFound";
import { healthRouter } from "./routes/health";
import { authRouter } from "./routes/auth";
import { employeesRouter } from "./routes/employees";
import { contractsRouter } from "./routes/contracts";
import { payrollsRouter } from "./routes/payrolls";
import { reportsRouter } from "./routes/reports";

export function createApp() {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || "*";
  app.use(
    cors({
      origin: corsOrigin === "*" ? true : corsOrigin,
      credentials: corsOrigin !== "*",
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/employees", employeesRouter);
  app.use("/api/contracts", contractsRouter);
  app.use("/api/payrolls", payrollsRouter);
  app.use("/api/reports", reportsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

