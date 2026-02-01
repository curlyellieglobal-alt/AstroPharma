import express, { Request, Response } from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { storagePut } from "../storage";
import { generateSitemap } from "../sitemap";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, and audio
    const allowedMimes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'video/mp4', 'video/webm', 'video/ogg',
      'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Disable caching for API responses only
  app.use((req: Request, res: Response, next: any) => {
    // Only apply no-cache headers to API endpoints
    if (req.path.startsWith('/api/') || req.path.startsWith('/trpc')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
    }
    next();
  });
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // File upload endpoint with automatic image compression
  app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      
      let uploadBuffer = file.buffer;
      let uploadMimeType = file.mimetype;
      let compressionInfo = null;

      // Compress images automatically
      if (file.mimetype.startsWith('image/')) {
        try {
          const { compressImage } = await import('../imageCompression');
          const compressed = await compressImage(file.buffer, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 80,
            format: 'webp'
          });
          
          uploadBuffer = compressed.buffer;
          uploadMimeType = 'image/webp';
          compressionInfo = {
            originalSize: compressed.originalSize,
            compressedSize: compressed.size,
            compressionRatio: compressed.compressionRatio,
            width: compressed.width,
            height: compressed.height,
            format: compressed.format
          };
          
          console.log(`[Image Compression] ${file.originalname}: ${compressed.compressionRatio}% reduction`);
        } catch (compressionError) {
          console.warn('[Image Compression] Failed to compress, uploading original:', compressionError);
        }
      }
      
      const fileKey = `uploads/${timestamp}-${randomSuffix}-${sanitizedFilename}`;

      // Upload to S3
      const { url } = await storagePut(fileKey, uploadBuffer, uploadMimeType);

      res.json({ 
        success: true, 
        url, 
        fileKey,
        fileName: file.originalname,
        mimeType: uploadMimeType,
        size: uploadBuffer.length,
        originalSize: file.size,
        compression: compressionInfo
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed", message: error.message || "Unknown error" });
    }
  });

  // Error handler for multer
  app.use((err: any, req: Request, res: Response, next: any) => {
    if (err instanceof multer.MulterError) {
      res.status(400).json({ error: "Upload error", message: err.message });
    } else if (err) {
      res.status(500).json({ error: "Server error", message: err.message });
    } else {
      next();
    }
  });


  // Binary media upload endpoint (for voice, video, etc.)
  app.post("/api/upload/media", express.raw({ type: 'application/octet-stream', limit: '20mb' }), async (req: Request, res: Response) => {
    try {
      const conversationId = req.headers['x-conversation-id'];
      const fileName = req.headers['x-file-name'];
      let mimeType = req.headers['x-mime-type'] as string;
      
      // Normalize MIME type by removing codec parameters
      if (mimeType) {
        mimeType = mimeType.split(';')[0].trim().toLowerCase();
      }
      
      if (!conversationId || !fileName || !mimeType) {
        return res.status(400).json({ error: 'Missing required headers' });
      }
      
      const buffer = req.body;
      const maxSize = 20 * 1024 * 1024;
      if (buffer.length > maxSize) {
        return res.status(413).json({ error: 'File too large' });
      }
      
      // Validate MIME type
      const allowedMimes = [
        'audio/webm', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3',
        'video/webm', 'video/mp4', 'video/ogg',
        'image/jpeg', 'image/png', 'image/gif', 'image/webp'
      ];
      if (!allowedMimes.includes(mimeType)) {
        return res.status(400).json({ error: `Invalid MIME type: ${mimeType}` });
      }
      
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `chat/${conversationId}/${timestamp}-${randomSuffix}-${fileName}`;
      
      const { url } = await storagePut(fileKey, buffer, mimeType);
      res.json({ mediaUrl: url, deduplicated: false });
    } catch (err: any) {
      console.error('Upload error:', err);
      res.status(500).json({ error: 'Upload failed' });
    }
  });

  // Multiple files upload endpoint
  app.post("/api/upload-multiple", upload.array("files", 10), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ error: "No files uploaded" });
        return;
      }

      const uploadedFiles = [];
      for (const file of files) {
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileKey = `uploads/${timestamp}-${randomSuffix}-${sanitizedFilename}`;

        const { url } = await storagePut(fileKey, file.buffer, file.mimetype);
        uploadedFiles.push({
          url,
          fileKey,
          fileName: file.originalname,
          mimeType: file.mimetype,
          size: file.size
        });
      }

      res.json({ success: true, files: uploadedFiles });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message || "Upload failed" });
    }
  });
  
  // Sitemap endpoint
  app.get("/sitemap.xml", async (req: Request, res: Response) => {
    try {
      const protocol = req.protocol || "https";
      const host = req.get("host") || "curlyshop.com";
      const baseUrl = `${protocol}://${host}`;
      
      const sitemap = await generateSitemap(baseUrl);
      res.type("application/xml");
      res.send(sitemap);
    } catch (error: any) {
      console.error("Sitemap generation error:", error);
      res.status(500).json({ error: "Failed to generate sitemap" });
    }
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "3000");

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch(console.error);
