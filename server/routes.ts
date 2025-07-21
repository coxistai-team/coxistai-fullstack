import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPresentationSchema, insertNoteSchema, insertDocumentSchema, updateUserProfileSchema, insertPresentationSchema as insertCalendarEventSchema, community_posts } from "@shared/schema";
import multer from "multer";
import { exec, spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";

// --- AUTH & EMAIL UTILS ---
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
// @ts-ignore // If you see a type error, run: npm install resend
import { Resend } from 'resend';

// Extend Express Request type to include 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_EXPIRES_IN = "7d";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

function signJwt(payload: object, options?: jwt.SignOptions) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, ...options });
}
function verifyJwt(token: string) {
  return jwt.verify(token, JWT_SECRET);
}
async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

const resend = new Resend(RESEND_API_KEY);

const signupSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});
const loginSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(8).max(128),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

// --- AUTH MIDDLEWARE ---
function getTokenFromRequest(req: Request) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  if (req.headers.cookie) {
    const cookies = Object.fromEntries(req.headers.cookie.split(';').map(c => c.trim().split('=')));
    if (cookies.token) return cookies.token;
  }
  return null;
}
function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = getTokenFromRequest(req);
  if (!token) return res.status(401).json({ error: "Missing or invalid authorization" });
  try {
    req.user = verifyJwt(token);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// --- AUTH ENDPOINTS ---
export async function registerAuthRoutes(app: Express) {
  // Signup
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const parse = signupSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ error: "Please provide a valid username, email, and password." });
      }
      const { username, email, password } = parse.data;
      const existing = await storage.getUserByUsername(username);
      if (existing) return res.status(409).json({ error: "Username already exists." });
      const hashed = await hashPassword(password);
      const user = await storage.createUser({ username, password: hashed });
      await storage.updateUserProfile(user.id, { email });
      const token = signJwt({ id: user.id, username });
      res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
      res.status(201).json({ success: true });
    } catch {
      res.status(500).json({ error: "Signup failed. Please try again later." });
    }
  });
  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parse = loginSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ error: "Please provide a valid username and password." });
      }
      const { username, password } = parse.data;
      const user = await storage.getUserByUsername(username);
      if (!user) return res.status(401).json({ error: "Incorrect credentials." });
      const valid = await comparePassword(password, user.password);
      if (!valid) return res.status(401).json({ error: "Incorrect credentials." });
      const token = signJwt({ id: user.id, username });
      res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Login failed. Please try again later." });
    }
  });
  // Logout
  app.post("/api/auth/logout", requireAuth, (req: Request, res: Response) => {
    try {
      res.setHeader("Set-Cookie", `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Logout failed. Please try again later." });
    }
  });
  // Forgot Password
  app.post("/api/auth/forgot-password", async (req: Request, res: Response) => {
    try {
      const parse = forgotPasswordSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ error: "Please provide a valid email address." });
      }
      const { email } = parse.data;
      const user = await storage.getUserByEmail(email);
      if (user) {
        // Generate a JWT reset token (expires in 1 hour)
        const token = signJwt({ id: user.id, email }, { expiresIn: '1h' });
        const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
        const html = `<p>Hello,</p><p>You requested a password reset for your account. Click the link below to reset your password:</p><p><a href='${resetUrl}'>Reset Password</a></p><p>If you did not request this, you can safely ignore this email.</p>`;
        try {
          await resend.emails.send({
            from: `Support <${RESEND_FROM_EMAIL}>`,
            to: [email],
            subject: 'Reset your password',
            html,
          });
        } catch (err) {
          // Log error but do not leak to user
          console.error('[Resend Error]', err);
        }
      }
      // Always return generic message
      res.json({ message: "If an account with that email exists, a reset link has been sent." });
    } catch {
      res.status(500).json({ error: "Failed to process reset request. Please try again later." });
    }
  });
  // Reset Password
  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const parse = resetPasswordSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ error: "Please provide a valid token and password (min 8 characters)." });
      }
      const { token, password } = parse.data;
      let payload;
      try { payload = verifyJwt(token); } catch { return res.status(400).json({ error: "Invalid or expired token." }); }
      const userId = (payload as any).id;
      if (!userId) return res.status(400).json({ error: "Invalid token." });
      const hashed = await hashPassword(password);
      await storage.updateUserPassword(userId, hashed);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to reset password. Please try again later." });
    }
  });
  // Me
  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ error: "User not found." });
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch {
      res.status(500).json({ error: "Failed to fetch user info. Please try again later." });
    }
  });
}

const execAsync = promisify(exec);

async function executeCode(code: string, language: string, input: string, tempDir: string, executionId: string) {
  const timeout = 10000; // 10 seconds timeout
  
  try {
    switch (language) {
      case "python":
        return await executePython(code, input, tempDir, executionId, timeout);
      case "javascript":
        return await executeJavaScript(code, input, tempDir, executionId, timeout);
      case "c":
        return await executeC(code, input, tempDir, executionId, timeout);
      case "cpp":
        return await executeCpp(code, input, tempDir, executionId, timeout);
      case "java":
        return await executeJava(code, input, tempDir, executionId, timeout);
      default:
        throw new Error(`Unsupported language: ${language}`);
    }
  } catch (error) {
    return {
      output: "",
      error: error instanceof Error ? error.message : "Execution failed",
      executionTime: 0
    };
  }
}

async function executePython(code: string, input: string, tempDir: string, executionId: string, timeout: number) {
  const fileName = `${executionId}.py`;
  const filePath = path.join(tempDir, fileName);
  
  await fs.writeFile(filePath, code);
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    const child = spawn("python3", [filePath], {
      cwd: tempDir,
      stdio: ["pipe", "pipe", "pipe"]
    });
    
    let output = "";
    let errorOutput = "";
    
    child.stdout.on("data", (data) => {
      output += data.toString();
    });
    
    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });
    
    // Send input if provided
    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }
    
    const timeoutId = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({
        output: output,
        error: "Execution timeout (10 seconds)",
        executionTime: Date.now() - startTime
      });
    }, timeout);
    
    child.on("close", (code) => {
      clearTimeout(timeoutId);
      fs.unlink(filePath).catch(() => {}); // Clean up file
      
      resolve({
        output: output,
        error: errorOutput || (code !== 0 ? `Process exited with code ${code}` : ""),
        executionTime: Date.now() - startTime
      });
    });
  });
}

async function executeJavaScript(code: string, input: string, tempDir: string, executionId: string, timeout: number) {
  const fileName = `${executionId}.js`;
  const filePath = path.join(tempDir, fileName);
  
  // Wrap code to handle input
  const wrappedCode = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputLines = \`${input}\`.split('\\n').filter(line => line.trim() !== '');
let inputIndex = 0;

// Override console.log to handle input simulation
const originalLog = console.log;
global.prompt = function(question) {
  if (inputIndex < inputLines.length) {
    const answer = inputLines[inputIndex++];
    originalLog(question + answer);
    return answer;
  }
  return '';
};

${code}

rl.close();
`;
  
  await fs.writeFile(filePath, wrappedCode);
  
  return new Promise((resolve) => {
    const startTime = Date.now();
    const child = spawn("node", [filePath], {
      cwd: tempDir,
      stdio: ["pipe", "pipe", "pipe"]
    });
    
    let output = "";
    let errorOutput = "";
    
    child.stdout.on("data", (data) => {
      output += data.toString();
    });
    
    child.stderr.on("data", (data) => {
      errorOutput += data.toString();
    });
    
    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }
    
    const timeoutId = setTimeout(() => {
      child.kill("SIGKILL");
      resolve({
        output: output,
        error: "Execution timeout (10 seconds)",
        executionTime: Date.now() - startTime
      });
    }, timeout);
    
    child.on("close", (code) => {
      clearTimeout(timeoutId);
      fs.unlink(filePath).catch(() => {});
      
      resolve({
        output: output,
        error: errorOutput || (code !== 0 ? `Process exited with code ${code}` : ""),
        executionTime: Date.now() - startTime
      });
    });
  });
}

async function executeC(code: string, input: string, tempDir: string, executionId: string, timeout: number) {
  const fileName = `${executionId}.c`;
  const executableName = `${executionId}_exec`;
  const filePath = path.join(tempDir, fileName);
  const execPath = path.join(tempDir, executableName);
  
  await fs.writeFile(filePath, code);
  
  try {
    // Compile the C code
    await execAsync(`gcc "${filePath}" -o "${execPath}"`, { cwd: tempDir, timeout: 5000 });
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      const child = spawn(execPath, [], {
        cwd: tempDir,
        stdio: ["pipe", "pipe", "pipe"]
      });
      
      let output = "";
      let errorOutput = "";
      
      child.stdout.on("data", (data) => {
        output += data.toString();
      });
      
      child.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });
      
      if (input) {
        child.stdin.write(input);
        child.stdin.end();
      }
      
      const timeoutId = setTimeout(() => {
        child.kill("SIGKILL");
        resolve({
          output: output,
          error: "Execution timeout (10 seconds)",
          executionTime: Date.now() - startTime
        });
      }, timeout);
      
      child.on("close", (code) => {
        clearTimeout(timeoutId);
        // Clean up files
        fs.unlink(filePath).catch(() => {});
        fs.unlink(execPath).catch(() => {});
        
        resolve({
          output: output,
          error: errorOutput || (code !== 0 ? `Process exited with code ${code}` : ""),
          executionTime: Date.now() - startTime
        });
      });
    });
  } catch (compileError) {
    // Clean up source file
    fs.unlink(filePath).catch(() => {});
    return {
      output: "",
      error: `Compilation error: ${compileError}`,
      executionTime: 0
    };
  }
}

async function executeCpp(code: string, input: string, tempDir: string, executionId: string, timeout: number) {
  const fileName = `${executionId}.cpp`;
  const executableName = `${executionId}_exec`;
  const filePath = path.join(tempDir, fileName);
  const execPath = path.join(tempDir, executableName);
  
  await fs.writeFile(filePath, code);
  
  try {
    // Try to compile with g++ if available, fallback to gcc
    let compileCommand = `g++ "${filePath}" -o "${execPath}"`;
    try {
      await execAsync(compileCommand, { cwd: tempDir, timeout: 5000 });
    } catch {
      // Fallback to gcc for C++ (basic support)
      compileCommand = `gcc "${filePath}" -o "${execPath}" -lstdc++`;
      await execAsync(compileCommand, { cwd: tempDir, timeout: 5000 });
    }
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      const child = spawn(execPath, [], {
        cwd: tempDir,
        stdio: ["pipe", "pipe", "pipe"]
      });
      
      let output = "";
      let errorOutput = "";
      
      child.stdout.on("data", (data) => {
        output += data.toString();
      });
      
      child.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });
      
      if (input) {
        child.stdin.write(input);
        child.stdin.end();
      }
      
      const timeoutId = setTimeout(() => {
        child.kill("SIGKILL");
        resolve({
          output: output,
          error: "Execution timeout (10 seconds)",
          executionTime: Date.now() - startTime
        });
      }, timeout);
      
      child.on("close", (code) => {
        clearTimeout(timeoutId);
        fs.unlink(filePath).catch(() => {});
        fs.unlink(execPath).catch(() => {});
        
        resolve({
          output: output,
          error: errorOutput || (code !== 0 ? `Process exited with code ${code}` : ""),
          executionTime: Date.now() - startTime
        });
      });
    });
  } catch (compileError) {
    fs.unlink(filePath).catch(() => {});
    return {
      output: "",
      error: `Compilation error: ${compileError}`,
      executionTime: 0
    };
  }
}

async function executeJava(code: string, input: string, tempDir: string, executionId: string, timeout: number) {
  // Extract class name from code
  const classMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : `Main${executionId}`;
  
  const fileName = `${className}.java`;
  const filePath = path.join(tempDir, fileName);
  
  // If no class found, wrap in a Main class
  let finalCode = code;
  if (!classMatch) {
    finalCode = `public class Main${executionId} {\n${code}\n}`;
  }
  
  await fs.writeFile(filePath, finalCode);
  
  try {
    // Compile Java code
    await execAsync(`javac "${filePath}"`, { cwd: tempDir, timeout: 5000 });
    
    return new Promise((resolve) => {
      const startTime = Date.now();
      const child = spawn("java", [className], {
        cwd: tempDir,
        stdio: ["pipe", "pipe", "pipe"]
      });
      
      let output = "";
      let errorOutput = "";
      
      child.stdout.on("data", (data) => {
        output += data.toString();
      });
      
      child.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });
      
      if (input) {
        child.stdin.write(input);
        child.stdin.end();
      }
      
      const timeoutId = setTimeout(() => {
        child.kill("SIGKILL");
        resolve({
          output: output,
          error: "Execution timeout (10 seconds)",
          executionTime: Date.now() - startTime
        });
      }, timeout);
      
      child.on("close", (code) => {
        clearTimeout(timeoutId);
        // Clean up files
        fs.unlink(filePath).catch(() => {});
        fs.unlink(path.join(tempDir, `${className}.class`)).catch(() => {});
        
        resolve({
          output: output,
          error: errorOutput || (code !== 0 ? `Process exited with code ${code}` : ""),
          executionTime: Date.now() - startTime
        });
      });
    });
  } catch (compileError) {
    fs.unlink(filePath).catch(() => {});
    return {
      output: "",
      error: `Compilation error: ${compileError}`,
      executionTime: 0
    };
  }
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  await registerAuthRoutes(app);
  // Document routes
  
  // Get all documents for a user
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Get a specific document
  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  // Get document by share code
  app.get("/api/shared/:shareCode", async (req: Request, res: Response) => {
    try {
      const { shareCode } = req.params;
      const document = await storage.getDocumentByShareCode(shareCode);
      
      if (!document) {
        return res.status(404).json({ error: "Shared document not found" });
      }
      
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shared document" });
    }
  });

  // Upload and create a new document
  app.post("/api/documents", upload.single("file"), async (req: Request, res: Response) => {
    try {
      const { title, tags, isPublic, userId } = req.body;
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Extract text content from file (basic implementation)
      let content = "";
      if (file.mimetype === "text/plain") {
        content = file.buffer.toString("utf-8");
      } else if (file.mimetype === "application/pdf") {
        content = "PDF content extraction not implemented - file uploaded successfully";
      } else {
        content = "File uploaded successfully - content extraction not supported for this file type";
      }

      const documentData = {
        title: title || file.originalname,
        filename: file.originalname,
        fileType: file.mimetype,
        content,
        tags: tags ? JSON.parse(tags) : [],
        isPublic: isPublic === "true",
        userId: parseInt(userId) || 1, // Default user for demo
      };

      const validatedData = insertDocumentSchema.parse(documentData);
      const document = await storage.createDocument({ ...validatedData, userId: documentData.userId });
      
      res.status(201).json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // Update a document
  app.put("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const document = await storage.updateDocument(id, updates);
      res.json(document);
    } catch (error) {
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  // Delete a document
  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteDocument(id);
      
      if (!success) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  // --- Presentations CRUD ---
  app.get("/api/presentations", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const presentations = await storage.getPresentations(userId);
      res.json(presentations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presentations" });
    }
  });

  app.get("/api/presentations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id);
      const presentation = await storage.getPresentation(id);
      if (!presentation || presentation.user_id !== userId) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      res.json(presentation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presentation" });
    }
  });

  app.post("/api/presentations", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const parse = insertPresentationSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ error: "Invalid presentation data" });
      }
      const created = await storage.createPresentation({ ...parse.data, user_id: userId });
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ error: "Failed to create presentation" });
    }
  });

  app.put("/api/presentations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id);
      const presentation = await storage.getPresentation(id);
      if (!presentation || presentation.user_id !== userId) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      // Only allow updating title and slides
      const { title, slides } = req.body;
      const updated = await storage.updatePresentation(id, { title, slides });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update presentation" });
    }
  });

  app.delete("/api/presentations/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id);
      const presentation = await storage.getPresentation(id);
      if (!presentation || presentation.user_id !== userId) {
        return res.status(404).json({ error: "Presentation not found" });
      }
      await storage.deletePresentation(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete presentation" });
    }
  });

  // --- Calendar Events CRUD ---
  app.get("/api/calendar", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const events = await storage.getCalendarEvents(userId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calendar events" });
    }
  });

  app.get("/api/calendar/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id);
      const event = await storage.getCalendarEvent(id);
      if (!event || event.user_id !== userId) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/calendar", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      // Use Zod validation if you have a schema, else basic check
      const { title, date, time, duration, type, color } = req.body;
      if (!title || !date || !time || !duration || !type || !color) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const created = await storage.createCalendarEvent({ ...req.body, user_id: userId });
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.put("/api/calendar/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id);
      const event = await storage.getCalendarEvent(id);
      if (!event || event.user_id !== userId) {
        return res.status(404).json({ error: "Event not found" });
      }
      const updated = await storage.updateCalendarEvent(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/calendar/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id);
      const event = await storage.getCalendarEvent(id);
      if (!event || event.user_id !== userId) {
        return res.status(404).json({ error: "Event not found" });
      }
      await storage.deleteCalendarEvent(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Get user profile
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      let user = await storage.getUser(id);
      
      if (!user) {
        // Create default user if doesn't exist
        const defaultUser = {
          username: `user${id}`,
          password: 'default123',
          firstName: 'Sharath',
          lastName: 'Bandaari',
          email: 'sharath.bandaari@email.com',
          phone: '+1 (555) 123-4567',
          bio: 'AI enthusiast and lifelong learner passionate about technology and education.',
          location: 'San Francisco, CA',
          timezone: 'America/Los_Angeles',
          avatar: null,
          dateOfBirth: '1995-06-15',
          occupation: 'Software Engineer',
          company: 'Tech Innovations Inc.',
          theme: 'dark',
          emailNotifications: true,
          pushNotifications: true,
          marketingEmails: false,
          weeklyDigest: true,
          language: 'en',
          publicProfile: false,
        };
        
        const { firstName, lastName, email, phone, bio, location, timezone, avatar, dateOfBirth, occupation, company, theme, emailNotifications, pushNotifications, marketingEmails, weeklyDigest, language, publicProfile, ...userCreds } = defaultUser;
        const createdUser = await storage.createUser(userCreds);
        
        // Update the user with profile data
        user = await storage.updateUserProfile(createdUser.id, {
          firstName, lastName, email, phone, bio, location, timezone, avatar, dateOfBirth, occupation, company, theme, emailNotifications, pushNotifications, marketingEmails, weeklyDigest, language, publicProfile
        });
      }
      
      // Remove password from response
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user profile" });
    }
  });

  // Update user profile
  app.put("/api/users/:id/profile", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const profileData = req.body;
      
      const validatedData = updateUserProfileSchema.parse(profileData);
      const updatedUser = await storage.updateUserProfile(id, validatedData);
      
      // Remove password from response
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Code execution endpoint
  app.post("/api/execute", async (req: Request, res: Response) => {
    try {
      const { code, language, input = "" } = req.body;
      
      if (!code || !language) {
        return res.status(400).json({ error: "Code and language are required" });
      }

      const tempDir = "/tmp/code-exec";
      await fs.mkdir(tempDir, { recursive: true });
      
      const executionId = Date.now().toString();
      const result = await executeCode(code, language, input, tempDir, executionId);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to execute code", 
        output: "", 
        stderr: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // --- Community Posts CRUD ---
  app.get("/api/community/posts", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const posts = await storage.getCommunityPosts(userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch community posts" });
    }
  });

  app.get("/api/community/posts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id);
      const post = await storage.getCommunityPost(id);
      if (!post || post.user_id !== userId) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/community/posts", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const { title, content, category, tags } = req.body;
      if (!title || !content || !category) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const created = await storage.createCommunityPost({ ...req.body, user_id: userId });
      res.status(201).json(created);
    } catch (error) {
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.put("/api/community/posts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id);
      const post = await storage.getCommunityPost(id);
      if (!post || post.user_id !== userId) {
        return res.status(404).json({ error: "Post not found" });
      }
      const updated = await storage.updateCommunityPost(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/community/posts/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id);
      const post = await storage.getCommunityPost(id);
      if (!post || post.user_id !== userId) {
        return res.status(404).json({ error: "Post not found" });
      }
      await storage.deleteCommunityPost(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  // --- Community Replies ---
  app.get("/api/community/posts/:postId/replies", requireAuth, async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      const replies = await storage.getCommunityReplies(postId);
      res.json(replies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch replies" });
    }
  });

  app.post("/api/community/posts/:postId/replies", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const postId = parseInt(req.params.postId);
      const { content, parent_reply_id } = req.body;
      if (!content) return res.status(400).json({ error: "Content required" });
      const reply = await storage.createCommunityReply({ content, parent_reply_id, user_id: userId, post_id: postId });
      res.status(201).json(reply);
    } catch (error) {
      res.status(500).json({ error: "Failed to create reply" });
    }
  });

  app.put("/api/community/replies/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id);
      const reply = await storage.getCommunityReply(id);
      if (!reply || reply.user_id !== userId) return res.status(404).json({ error: "Reply not found" });
      const updated = await storage.updateCommunityReply(id, { ...req.body, edited_at: new Date() });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update reply" });
    }
  });

  app.delete("/api/community/replies/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const id = parseInt(req.params.id);
      const reply = await storage.getCommunityReply(id);
      if (!reply || reply.user_id !== userId) return res.status(404).json({ error: "Reply not found" });
      // Soft delete
      await storage.updateCommunityReply(id, { is_deleted: true, deleted_at: new Date() });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete reply" });
    }
  });

  // --- Community Likes ---
  app.post("/api/community/posts/:postId/like", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const postId = parseInt(req.params.postId);
      const { action } = req.body; // 'like' or 'unlike'
      if (action === 'like') {
        await storage.likePost(userId, postId);
      } else {
        await storage.unlikePost(userId, postId);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  app.post("/api/community/replies/:replyId/like", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const replyId = parseInt(req.params.replyId);
      const { action } = req.body; // 'like' or 'unlike'
      if (action === 'like') {
        await storage.likeReply(userId, replyId);
      } else {
        await storage.unlikeReply(userId, replyId);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to toggle like" });
    }
  });

  // --- Community Groups ---
  app.get("/api/community/groups", requireAuth, async (_req: Request, res: Response) => {
    try {
      const groups = await storage.getCommunityGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  app.post("/api/community/groups", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ error: "Name required" });
      const group = await storage.createCommunityGroup({ name, description });
      res.status(201).json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to create group" });
    }
  });

  app.post("/api/community/groups/:groupId/join", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const groupId = parseInt(req.params.groupId);
      await storage.joinCommunityGroup(userId, groupId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to join group" });
    }
  });

  app.post("/api/community/groups/:groupId/leave", requireAuth, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.id;
      const groupId = parseInt(req.params.groupId);
      await storage.leaveCommunityGroup(userId, groupId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to leave group" });
    }
  });

  app.get("/api/community/groups/:groupId/members", requireAuth, async (req: Request, res: Response) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const members = await storage.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch group members" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
