
import React from 'react';

const SubmissionStatus: React.FC = () => {
  const currentUrl = window.location.origin;
  const SECRET_API_KEY = "sk_guvi_evaluation_2026"; // THE KEY YOU GIVE TO EVALUATORS

  const readiness = {
    prob1: [
      { id: 1, label: "Accepts Base64 MP3 input", status: true },
      { id: 2, label: "Strict JSON Response Schema", status: true },
      { id: 3, label: "x-api-key Header Verification", status: true }
    ],
    prob2: [
      { id: 1, label: "Autonomous Agent Behavior", status: true },
      { id: 2, label: "GUVI Callback implementation", status: true },
      { id: 3, label: "Multi-turn intelligence extraction", status: true }
    ]
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold">Hackathon Endpoint Details</h2>
              <p className="text-slate-400 text-sm">Provide these details to the GUVI evaluation system.</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
             <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest block">Deployment Status</span>
             <span className="text-sm font-bold text-slate-100">Live & Listening (Port 8080)</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Public API Endpoint URL</label>
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-white/10">
              <code className="text-xs text-indigo-400 font-mono truncate mr-4">{currentUrl}</code>
              <button onClick={() => navigator.clipboard.writeText(currentUrl)} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase transition-colors">Copy</button>
            </div>
            <p className="text-[10px] text-slate-600 leading-tight">This URL should be submitted as your official hackathon entry.</p>
          </div>

          <div className="bg-slate-950 p-6 rounded-2xl border border-white/5 space-y-4">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Evaluation API Key (x-api-key)</label>
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-white/10">
              <code className="text-xs text-amber-400 font-mono">{SECRET_API_KEY}</code>
              <button onClick={() => navigator.clipboard.writeText(SECRET_API_KEY)} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase transition-colors">Copy</button>
            </div>
            <p className="text-[10px] text-slate-600 leading-tight">The evaluation bot will use this key in the request headers.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              P1: Voice Detection
            </h3>
            <div className="space-y-3">
              {readiness.prob1.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-xs">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="text-emerald-500 font-bold">READY</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
              P2: Agentic Honey-Pot
            </h3>
            <div className="space-y-3">
              {readiness.prob2.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl text-xs">
                  <span className="text-slate-300">{item.label}</span>
                  <span className="text-emerald-500 font-bold">READY</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionStatus;
