import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // Load .env variables

const app = express();

// --- CORRECTED & DYNAMIC CORS CONFIGURATION ---

// 1. Read origins from the environment variable.
// Fallback to a default for local development if the variable is not set.
const allowedOriginsString = process.env.ALLOWED_ORIGINS || "http://localhost:5173";
const allowedOrigins = allowedOriginsString.split(',').map(origin => origin.trim());

console.log("Allowed CORS Origins:", allowedOrigins);

// 2. Define CORS options with a dynamic origin function.
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like server-to-server calls or REST clients)
    if (!origin) {
      return callback(null, true);
    }
    // Check if the incoming origin is in our list of allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Error: Origin ${origin} not allowed.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // This is crucial for sending cookies or auth headers
};

// 3. Use the single, correctly configured CORS middleware for ALL requests.
// This will automatically handle preflight OPTIONS requests correctly.
app.use(cors(corsOptions));

// 4. THE PRIMARY FIX: The redundant app.options() handler has been REMOVED.
// The app.use(cors(corsOptions)) above is now the single source of truth for all CORS handling.

// Add a route to check CORS configuration
app.get('/api/cors-check', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    configured_origins: allowedOrigins,
    request_origin: req.headers.origin,
    cors_headers: {
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'access-control-allow-credentials': res.getHeader('Access-Control-Allow-Credentials'),
      'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods'),
      'access-control-allow-headers': res.getHeader('Access-Control-Allow-Headers')
    }
  });
});

// Add health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'configured' : 'not configured'
  });
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

  server.listen({ port, host }, () => {
    console.log(`Server running at http://${host}:${port}`);
  });
})();