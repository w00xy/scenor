import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import swaggerUi from "swagger-ui-express";
import type { Express } from "express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.resolve(__dirname, "swagger-output.json");

export const setupSwagger = (app: Express): void => {
  if (!fs.existsSync(swaggerPath)) {
    app.get("/api/docs", (_req, res) => {
      res.status(500).json({
        message: "Swagger spec not found. Run `npm run swagger:generate` first.",
      });
    });

    return;
  }

  const swaggerSpec = JSON.parse(fs.readFileSync(swaggerPath, "utf-8"));
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
