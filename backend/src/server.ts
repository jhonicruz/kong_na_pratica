import "dotenv/config";
import express from "express";
import cors from "cors";
import os from "os";

const app = express();

// Basic middlewares
app.use(cors());
app.use(express.json());

// Identify this instance/container
const STARTED_AT = new Date().toISOString();
const HOSTNAME = os.hostname();
const INSTANCE_ID = process.env.INSTANCE_ID || HOSTNAME;
const PORT = parseInt(process.env.PORT || "4000", 10);
let requestCount = 0;

// Healthcheck endpoint used by Compose/Kong
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", instance: INSTANCE_ID, hostname: HOSTNAME, port: PORT, startedAt: STARTED_AT });
});

// Root endpoint for quick manual checks
app.get("/", (_req, res) => {
  res.json({
    service: "backend",
    instance: INSTANCE_ID,
    hostname: HOSTNAME,
    port: PORT,
    pid: process.pid,
    startedAt: STARTED_AT,
    now: new Date().toISOString(),
  });
});

// Business endpoint used via Kong at /api/enviar (strip_path=true)
app.get("/enviar", (_req, res) => {
  requestCount += 1;
  const payload = {
    message: "Enviando pagamento...",
    instance: INSTANCE_ID,
    hostname: HOSTNAME,
    port: PORT,
    pid: process.pid,
    requestCount,
    timestamp: new Date().toISOString(),
  };
  console.log(`[${INSTANCE_ID}] /enviar ->`, payload);
  res.json(payload);
});

app.listen(PORT, () => {
  console.log(`Backend instance ${INSTANCE_ID} running on port ${PORT} (hostname=${HOSTNAME})`);
});
