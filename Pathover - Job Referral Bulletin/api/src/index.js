import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import apiRouter from './routes/index.js';
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

const logStream = fs.createWriteStream(path.resolve("server-logs/access.log"), { flags: "a" });
app.use(morgan("combined", { stream: logStream }));

const corsOpts = {
  origin: 'http://localhost:4200',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOpts));
app.use(morgan("dev"));

app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use('/', apiRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
}); 