
import React from 'react';

const ApiDocs: React.FC = () => {
  const currentUrl = window.location.origin;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">API Specifications</h2>
          <p className="text-slate-400 text-sm">Strictly following Guvi Problem Statement definitions.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-bold text-slate-500">v1.0.4-STABLE</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Voice Detection Docs */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-indigo-600/10 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">POST /api/voice-detection</span>
              <span className="text-[10px] font-mono text-slate-500">Problem 1</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">cURL Request</h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-[11px] text-slate-300 overflow-x-auto whitespace-pre">
{`curl -X POST ${currentUrl}/api/voice-detection \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: sk_guvi_evaluation_2026" \\
  -d '{
    "language": "Tamil",
    "audioFormat": "mp3",
    "audioBase64": "SUQzBA..."
  }'`}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Expected Success Response</h4>
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-[11px] text-emerald-400/80 overflow-x-auto whitespace-pre">
{`{
  "status": "success",
  "language": "Tamil",
  "classification": "AI_GENERATED",
  "confidenceScore": 0.91,
  "explanation": "Robotic speech patterns detected"
}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Honeypot Docs */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="bg-amber-600/10 px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Agentic Lifecycle</span>
              <span className="text-[10px] font-mono text-slate-500">Problem 2</span>
            </div>
            <div className="p-6 space-y-6">
              <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Automated Callback Rules</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Upon completion of agentic engagement (scamDetected=true), ShieldAI sends the intelligence payload automatically to the GUVI evaluation endpoint.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intelligence Schema</h4>
                <pre className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-[11px] text-slate-400 overflow-x-auto">
{`{
  "sessionId": "abc-123",
  "scamDetected": true,
  "extractedIntelligence": {
    "bankAccounts": ["XXXX-XXXX-XXXX"],
    "upiIds": ["scammer@upi"],
    "phishingLinks": ["http://malicious.link"]
  },
  "agentNotes": "Summary of tactics used"
}`}
                </pre>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-white/5 p-3 rounded-lg">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Mandatory Callback Header: x-api-key Verification Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
