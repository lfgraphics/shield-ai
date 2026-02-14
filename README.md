# ShieldAI Security Suite

## Overview

ShieldAI is a production‑ready reference implementation for two security workflows: (1) voice forensics that classifies an uploaded or recorded MP3 as human or AI generated across multiple Indian languages, and (2) an agentic honeypot that engages with suspected scam messages to extract actionable intelligence (UPI IDs, account numbers, URLs, phone numbers, keywords). It exposes a typed Express API consumed by a Vite/React UI. Google’s Generative AI is integrated with strict JSON schema enforcement to keep responses predictable and machine‑consumable. The backend is stateless and deployable to serverless platforms; the frontend serves as an operator console for testing and demonstrations. When extraction completes, the system can automatically POST a compact intelligence payload to an external evaluation endpoint.

## Problem It Solves

- Classifying AI voice samples manually is slow and inconsistent. This API returns a clear verdict, confidence, and rationale for each MP3.
- Scam intelligence extraction typically needs human conversation. The honeypot automates multi‑turn engagement and outputs structured, deduplicated indicators.
- Downstream systems fail on brittle LLM outputs. Schema‑constrained responses eliminate ad‑hoc parsing and stabilize integrations.

## Target Users

- Security engineering and fraud operations teams who need a simple API to classify voice samples and extract scam signals.
- Developers looking for a minimal, typed, deployable example of integrating Google GenAI with predictable JSON outputs.
- Internal evaluators or hackathon judges who require fixed routes, deterministic headers, and automatic result callbacks.

## Architecture & Technical Design

- Backend structure
  - Express application with JSON endpoints defined in [server.ts](/server.ts): POST /api/voice-detection and POST /api/honeypot. The app is exported for serverless via [api/index.ts](/api/index.ts).
  - Service layer in [services/geminiService.ts](/services/geminiService.ts) encapsulates model calls:
    - Voice: gemini-3-flash-preview with responseMimeType "application/json" and a responseSchema for classification, confidenceScore, and explanation.
    - Honeypot: gemini-3-pro-preview returning a structured reply, isFinished, and extracted indicators.
  - Authentication middleware in [server.ts](/server.ts) validates x-api-key per request. Request logging and JSON error handling are included.
  - In dev and production builds, the server statically serves the built UI and provides an SPA fallback.
- Frontend structure
  - Vite + React UI in [App.tsx](/App.tsx) with feature components: [VoiceDetector.tsx](/components/VoiceDetector.tsx), [ScamHoneypot.tsx](/components/ScamHoneypot.tsx), [ApiDocs.tsx](/components/ApiDocs.tsx), [SubmissionStatus.tsx](/components/SubmissionStatus.tsx). Tailwind is loaded via CDN in [index.html](/index.html).
  - Dev proxy (UI → API) is configured in [vite.config.ts](/vite.config.ts) to forward /api to <http://localhost:8080>.
- Database design approach
  - No database. The system is stateless. The client generates a sessionId for correlation and callback purposes only.
- Key integrations
  - Google GenAI (@google/genai) for audio classification and agent replies.
  - Optional external callback to submit final intelligence after engagement completes.
- Patterns used
  - Layered architecture: routing (Express) → service (GeminiService) → external APIs. Typed contracts are defined in [types.ts](/types.ts). Environment variables are injected via Vite define and dotenv.
- Scalability considerations
  - Stateless API supports horizontal scaling and serverless deployment (rewrites in [vercel.json](/vercel.json)). Schema‑constrained outputs reduce failure handling. UI and API can scale independently.

## Key Features

- Voice forensics API returning classification (AI_GENERATED or HUMAN), confidence score, and explanation from base64 MP3 input.
- Agentic honeypot API that engages multi‑turn, extracting UPI IDs, accounts, URLs, phone numbers, and keywords into a stable schema.
- Automatic result callback that posts a compact intelligence payload when the agent is finished or when strong indicators are found.
- Strong typing and JSON schemas to keep responses predictable and downstream processing simple.
- Compact operator console to test both endpoints without external tools.

## Automation & Optimization

- Automates scam engagement and intelligence extraction, replacing manual back‑and‑forth with an agent that aggregates signals over time.
- Enforces structured LLM outputs using response schemas, removing custom parsers and reducing error rates.
- Uses a stateless service and deterministic headers to simplify operational integration and evaluation.

## Installation & Setup

Prerequisites: Node.js 18+

1. Install dependencies
   - npm install
2. Configure environment
   - Set GEMINI_API_KEY in your shell or platform environment. Both the server and Vite build receive it (see [vite.config.ts](/vite.config.ts)).
3. Run locally (two terminals)
   - API: npm run dev  (Express on <http://localhost:8080>)
   - UI:  npm run dev:frontend  (Vite on <http://localhost:3000>, proxies /api)
4. Production build (serves built UI from Express)
   - npm start

Vercel

- Rewrites in [vercel.json](/vercel.json) route /api/* to the exported Express app. Set GEMINI_API_KEY in Vercel project settings.

## Example Usage

Voice detection

```bash
curl -X POST http://localhost:8080/api/voice-detection \
  -H "Content-Type: application/json" \
  -H "x-api-key: <YOUR_EVAL_API_KEY>" \
  -d '{
    "language": "English",
    "audioFormat": "mp3",
    "audioBase64": "<BASE64_MP3_DATA>"
  }'
```

Example response

```json
{
  "status": "success",
  "language": "English",
  "classification": "AI_GENERATED",
  "confidenceScore": 0.91,
  "explanation": "Robotic speech patterns detected"
}
```

Honeypot engagement

```bash
curl -X POST http://localhost:8080/api/honeypot \
  -H "Content-Type: application/json" \
  -H "x-api-key: <YOUR_EVAL_API_KEY>" \
  -d '{
    "sessionId": "session-123",
    "message": { "sender": "scammer", "text": "Pay via UPI now", "timestamp": 1700000000000 },
    "conversationHistory": [],
    "metadata": { "channel": "Chat", "language": "English", "locale": "IN" }
  }'
```

Example response (truncated)

```json
{
  "status": "success",
  "reply": "Could you share the exact UPI ID?",
  "isFinished": false,
  "extracted": {
    "upiIds": ["scammer@upi"],
    "phishingLinks": [],
    "bankAccounts": [],
    "phoneNumbers": [],
    "suspiciousKeywords": ["urgent", "payment"]
  }
}
```

When the agent is finished or strong indicators are found, the service can automatically POST a final payload to a configured evaluation endpoint with x-api-key authentication.

## Engineering Highlights

- Performance decisions
  - Uses responseMimeType and responseSchema to keep model outputs compact and machine‑readable, reducing post‑processing.
  - Keeps the service stateless and lean; Vite dev proxy avoids cross‑origin overhead during development.
- Security decisions
  - Requires x-api-key for all API routes. CORS is enabled; no persistence of PII or sessions on the server.
  - Secrets are expected via environment variables in production; rotate and store via your platform’s secret manager.
- Design trade‑offs
  - No database by design to simplify deployment and avoid storing sensitive content; add persistence if needed.
  - Tailwind via CDN keeps the UI footprint small but lacks build‑time purging; acceptable for this reference app.
  - Evaluation keys may be hardcoded during hackathons for convenience; use env vars for real deployments.
- Technology choices
  - Express for a small, explicit HTTP surface. Vite/React for fast UI iteration and a simple operator console.
  - Google GenAI for first‑class schema‑constrained outputs and multi‑modal support (audio + text).

## Future Improvements (Optional)

- Secrets management (platform KMS), and removal of any hardcoded evaluation keys.
- Persistent session store for audit/history and richer analytics.
- Rate limiting and structured observability (metrics, tracing, structured logs).
- Wider audio format support (WAV/OGG) and streaming/transcription for long recordings.
- Advanced detection heuristics (language‑specific cues) and adversarial robustness checks.
