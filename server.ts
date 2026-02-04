
import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { geminiService } from './services/geminiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Fixed Error: Argument of type 'string | 8080' is not assignable to parameter of type 'number' by explicitly converting PORT to a number.
const PORT: number = Number(process.env.PORT) || 8080;
const SECRET_API_KEY = "sk_guvi_evaluation_2026";

// Middlewares
// Using type assertion to bypass strict type check errors on app.use when middleware signatures have minor environment-specific incompatibilities.
app.use(cors() as any);
app.use(express.json({ limit: '50mb' }) as any);
app.use(express.urlencoded({ extended: true, limit: '50mb' }) as any);

// Auth Middleware
// Explicitly typing the middleware as RequestHandler to ensure 'req.headers' and 'res.status' are correctly recognized by the TypeScript compiler.
const authenticate: RequestHandler = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== SECRET_API_KEY) {
    res.status(401).json({ status: 'error', message: 'Invalid or missing API key' });
    return;
  }
  next();
};

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'ShieldAI' });
});

// Problem 1: Voice Detection
// Wrapped in RequestHandler to ensure compatibility with Express's route handler signatures.
app.post('/api/voice-detection', authenticate, (async (req: Request, res: Response) => {
  try {
    const { language, audioBase64 } = req.body;
    if (!audioBase64) {
      res.status(400).json({ status: 'error', message: 'audioBase64 is required' });
      return;
    }
    const result = await geminiService.detectVoice(audioBase64, (language as any) || 'English');
    res.json(result);
  } catch (error: any) {
    console.error("Voice Detection Error:", error);
    res.status(500).json({ status: 'error', message: error.message || 'Internal error' });
  }
}) as RequestHandler);

// Problem 2: Honeypot
// Wrapped in RequestHandler to ensure compatibility with Express's route handler signatures.
app.post('/api/honeypot', authenticate, (async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    if (!payload.message?.text) {
      res.status(400).json({ status: 'error', message: 'message.text is required' });
      return;
    }
    const result = await geminiService.honeypotEngagement(
      payload.message.text,
      payload.conversationHistory || [],
      payload.metadata?.language || 'English'
    );
    res.json({ status: "success", reply: result.reply });

    if (result.isFinished || (result.extracted && (result.extracted.upiIds?.length > 0))) {
      geminiService.triggerGuviCallback(payload.sessionId, result, (payload.conversationHistory?.length || 0) + 1);
    }
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: 'Honeypot engine failed' });
  }
}) as RequestHandler);

// --- STATIC & FALLBACK ---

// Serve frontend from dist directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath) as any);

// Ensure API 404s return JSON
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `API endpoint ${req.method} ${req.url} not found.`
  });
});

// React Fallback
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Only start the server if not running in a Netlify environment
if (!process.env.NETLIFY) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export { app };
