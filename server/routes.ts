import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, updateUserProfileSchema } from "@shared/schema";
import multer from "multer";
import { exec, spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";

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
  // Document routes
  
  // Get all documents for a user
  app.get("/api/documents", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      const documents = await storage.getDocuments(userId);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Get a specific document
  app.get("/api/documents/:id", async (req, res) => {
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
  app.get("/api/shared/:shareCode", async (req, res) => {
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
  app.post("/api/documents", upload.single("file"), async (req, res) => {
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
      console.error("Upload error:", error);
      res.status(500).json({ error: "Failed to upload document" });
    }
  });

  // Update a document
  app.put("/api/documents/:id", async (req, res) => {
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
  app.delete("/api/documents/:id", async (req, res) => {
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

  // Get user profile
  app.get("/api/users/:id", async (req, res) => {
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
  app.put("/api/users/:id/profile", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profileData = req.body;
      
      const validatedData = updateUserProfileSchema.parse(profileData);
      const updatedUser = await storage.updateUserProfile(id, validatedData);
      
      // Remove password from response
      const { password, ...userProfile } = updatedUser;
      res.json(userProfile);
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Code execution endpoint
  app.post("/api/execute", async (req, res) => {
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
      console.error("Code execution error:", error);
      res.status(500).json({ 
        error: "Failed to execute code", 
        output: "", 
        stderr: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
