import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      "https://www.coxistai.com",
      "https://coxist-chatbot.onrender.com",
      "https://coxistai-ui-tm8n.vercel.app",
      "https://coxistai-ui.vercel.app",
      "https://coxistai-ui-2.vercel.app",
      "https://coxistai-ui-3.vercel.app",
      "https://coxistai-ui-44444444444.vercel.app"
    ];


const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(null, true);
    }
    
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const normalizedAllowedOrigins = allowedOrigins.map(o => o.endsWith('/') ? o.slice(0, -1) : o);
    
    if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    } else {
      return callback(new Error(`CORS: Origin ${normalizedOrigin} not allowed`), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

// Enhanced preflight handler to ensure CORS headers are properly set
app.options(/\/api\/.*/, (req: Request, res: Response) => {
  // Let CORS middleware handle the response
  const corsMiddleware = cors(corsOptions);
  corsMiddleware(req, res, () => {
    res.sendStatus(200);
  });
});

app.get('/api/cors-check', (req: Request, res: Response) => {
  const responseData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    request_info: {
      origin: req.headers.origin,
      user_agent: req.headers['user-agent']?.substring(0, 100),
      method: req.method,
      path: req.path
    },
    cors_config: {
      allowed_origins: allowedOrigins,
      credentials_enabled: true
    },
    response_headers: {
      'access-control-allow-origin': res.getHeader('Access-Control-Allow-Origin'),
      'access-control-allow-credentials': res.getHeader('Access-Control-Allow-Credentials'),
      'access-control-allow-methods': res.getHeader('Access-Control-Allow-Methods'),
      'access-control-allow-headers': res.getHeader('Access-Control-Allow-Headers')
    }
  };
  
  res.json(responseData);
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    cors_origins_count: allowedOrigins.length
  });
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  const origin = req.headers.origin;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      const corsHeaders = {
        origin: res.getHeader('Access-Control-Allow-Origin'),
        credentials: res.getHeader('Access-Control-Allow-Credentials')
      };
      
      let logLine = `📤 ${req.method} ${path} ${res.statusCode} (${duration}ms) | CORS: ${JSON.stringify(corsHeaders)}`;
      
      if (capturedJsonResponse && res.statusCode >= 400) {
        logLine += ` | Error: ${JSON.stringify(capturedJsonResponse)}`;
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    
    res.status(status).json({ message });
    throw err;
  });

  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost";

  server.listen({ port, host }, () => {
    console.log(`🚀 Server running at http://${host}:${port}`);
  });
})();