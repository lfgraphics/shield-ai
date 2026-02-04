
import React, { useState } from 'react';
import VoiceDetector from './components/VoiceDetector';
import ScamHoneypot from './components/ScamHoneypot';
import ApiDocs from './components/ApiDocs';
import SubmissionStatus from './components/SubmissionStatus';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'voice' | 'honeypot' | 'docs' | 'submission'>('voice');

  const navItems = [
    { id: 'voice', label: 'Voice Detection', icon: '🎙️' },
    { id: 'honeypot', label: 'Agentic Honey-Pot', icon: '🍯' },
    { id: 'docs', label: 'API Documentation', icon: '📜' },
    { id: 'submission', label: 'Submission Ready', icon: '✅' },
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-950/50 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => setActiveTab('voice')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
              <span className="text-xl font-bold">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Shield<span className="text-indigo-400">AI</span></h1>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black leading-none">Security Ops Center</p>
            </div>
          </div>

          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-500 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
               <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Network</span>
               <div className="flex items-center space-x-1.5">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></span>
                  <span className="text-[10px] font-mono text-emerald-500 uppercase font-bold">Encrypted</span>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Mobile Nav */}
        <div className="mb-8 md:hidden overflow-x-auto pb-4 flex space-x-2 no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex-none px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                activeTab === item.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-500 border border-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative">
          {activeTab === 'voice' && <VoiceDetector />}
          {activeTab === 'honeypot' && <ScamHoneypot />}
          {activeTab === 'docs' && <ApiDocs />}
          {activeTab === 'submission' && <SubmissionStatus />}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-950 py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">ShieldAI • Forensic Intelligence Platform v2.4.0</p>
          <div className="flex space-x-6">
             <a href="#" className="text-[10px] font-bold text-slate-600 hover:text-indigo-400 uppercase tracking-widest transition-colors">Privacy</a>
             <a href="#" className="text-[10px] font-bold text-slate-600 hover:text-indigo-400 uppercase tracking-widest transition-colors">Ethics</a>
             <a href="#" className="text-[10px] font-bold text-slate-600 hover:text-indigo-400 uppercase tracking-widest transition-colors">Research</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
