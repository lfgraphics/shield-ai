
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { VoiceDetectionResponse, Language } from '../types';

const LANGUAGES: Language[] = ['English', 'Tamil', 'Hindi', 'Malayalam', 'Telugu'];

const VoiceDetector: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('English');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [result, setResult] = useState<VoiceDetectionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const base64 = await blobToBase64(audioBlob);
        processAudio(base64);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      setError(null);
      setResult(null);
    } catch (err) {
      setError("Microphone access denied. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== 'audio/mpeg' && !file.name.endsWith('.mp3')) {
      setError('Please upload a valid MP3 file.');
      return;
    }
    const base64 = await blobToBase64(file);
    processAudio(base64);
  };

  const processAudio = async (base64: string) => {
    setIsProcessing(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch('/api/voice-detection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'sk_guvi_evaluation_2026'
        },
        body: JSON.stringify({
          language: selectedLanguage,
          audioBase64: base64
        })
      });

      const detectionResult = await response.json();
      if (detectionResult.status === 'error') {
        throw new Error(detectionResult.message);
      }
      setResult(detectionResult);
    } catch (err: any) {
      setError(err.message || 'Analysis engine encountered an error.');
    } finally {
      setIsProcessing(false);
    }
  };

  const blobToBase64 = (blob: Blob | File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">Voice Forensics</h2>
            <p className="text-slate-400 text-sm">Automated evaluation-ready AI detection.</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Target Language:</span>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as Language)}
              className="bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500"
            >
              {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div
            onClick={() => !isRecording && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isProcessing ? 'border-indigo-500/50 bg-indigo-500/5 pointer-events-none' : 'border-white/10 hover:border-indigo-500 hover:bg-white/5'
              }`}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".mp3" className="hidden" />
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 bg-indigo-600/10 rounded-full flex items-center justify-center mb-3 text-indigo-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">Upload MP3</p>
            </div>
          </div>

          <div
            onClick={isRecording ? stopRecording : startRecording}
            className={`border-2 rounded-xl p-8 text-center cursor-pointer transition-all ${isRecording ? 'border-red-500 bg-red-500/5 ring-4 ring-red-500/10' : 'border-white/10 hover:border-red-500 hover:bg-red-500/5'
              }`}
          >
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-red-500/10 text-red-500'}`}>
                {isRecording ? <div className="w-3 h-3 bg-white rounded-sm"></div> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
              </div>
              <p className="text-xs font-bold uppercase tracking-widest">{isRecording ? 'Stop' : 'Live Record'}</p>
              {isRecording && <span className="text-[10px] font-mono mt-1 text-red-500">{Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, '0')}</span>}
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4 flex items-center justify-center space-x-3 py-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
            <div className="w-4 h-4 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Neural Decoding...</span>
          </div>
        )}

        {error && <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold">{error}</div>}
      </div>

      {result && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-5 shadow-xl overflow-hidden relative">
              <div className={`absolute top-0 right-0 p-2 text-[10px] font-bold uppercase ${result.classification === 'AI_GENERATED' ? 'text-red-500' : 'text-green-500'}`}>
                {result.classification}
              </div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Verdict</h3>
              <div className="text-2xl font-black">{result.classification === 'AI_GENERATED' ? '🤖 Synthetic' : '👤 Human'}</div>
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-500">Confidence</span>
                  <span>{(result.confidenceScore * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${result.classification === 'HUMAN' ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${result.confidenceScore * 100}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-2xl border border-white/10 p-5 shadow-xl col-span-2">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">API Response Logic</h3>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">{result.explanation}</p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowJson(!showJson)}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
                >
                  {showJson ? 'Hide JSON Payload' : 'View JSON Payload'}
                </button>
              </div>
            </div>
          </div>

          {showJson && (
            <div className="bg-slate-950 border border-white/5 rounded-2xl p-4 font-mono text-[11px] overflow-x-auto">
              <pre className="text-emerald-400">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceDetector;
