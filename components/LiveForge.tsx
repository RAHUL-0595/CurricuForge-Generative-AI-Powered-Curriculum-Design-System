
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

export const LiveForge: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  // Fixed typo in useState destructuring.
  const [transcript, setTranscript] = useState<{ role: string, text: string }[]>([]);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const streamRef = useRef<MediaStream | null>(null);

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) int16[i] = data[i] * 32768;
    return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
  };

  const startSession = async () => {
    // Correct initialization as per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              // Ensure data is sent only after session resolves.
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
            setIsActive(true);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle output transcription (Architect's speech)
            if (msg.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev, { role: 'Architect', text: msg.serverContent!.outputTranscription!.text }]);
            }
            // Handle input transcription (User's speech)
            if (msg.serverContent?.inputTranscription) {
              setTranscript(prev => [...prev, { role: 'User', text: msg.serverContent!.inputTranscription!.text }]);
            }

            const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioBase64) {
              const ctx = outputAudioContextRef.current!;
              // Track end of previous audio chunk for gapless playback.
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsActive(false);
          },
          onerror: (e) => {
            console.error("Live session error", e);
            setIsActive(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are CurricuForge Voice Sync. You assist in real-time architectural curriculum design. Be concise, highly professional, and technical.',
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });
      sessionRef.current = sessionPromise;
    } catch (err) {
      console.error("Failed to access microphone", err);
      alert("Microphone access is required for Voice Sync.");
    }
  };

  const stopSession = async () => {
    if (sessionRef.current) {
      const session = await sessionRef.current;
      session.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
  };

  const clearTranscript = () => {
    setTranscript([]);
  };

  // Auto-scroll terminal
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  return (
    <div className="bg-[#263238] rounded-[2.5rem] shadow-2xl p-12 text-white overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#3F51B5] via-[#FFB7B2] to-[#3F51B5]"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#FFB7B2] animate-pulse' : 'bg-slate-600'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {isActive ? 'Link Established' : 'System Standby'}
            </span>
          </div>
          <h3 className="text-5xl font-black tracking-tight">Native Voice Sync</h3>
          <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
            Communicate directly with the CurricuForge cognitive engine. Your speech is transcribed in real-time for transparent design iteration.
          </p>
          <div className="flex gap-6 pt-4">
            {!isActive ? (
              <button 
                onClick={startSession}
                className="bg-white text-[#263238] px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#FFB7B2] transition-all flex items-center gap-3 glow-button"
              >
                <i className="fas fa-microphone-lines text-lg"></i> Ingest Audio Stream
              </button>
            ) : (
              <button 
                onClick={stopSession}
                className="bg-red-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all flex items-center gap-3 shadow-xl shadow-red-500/20"
              >
                <i className="fas fa-power-off text-lg"></i> Terminate Link
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:w-80 aspect-square bg-white/5 rounded-[3rem] border-4 border-white/10 flex items-center justify-center relative group">
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-[#FFB7B2]/20 rounded-full animate-ping"></div>
              <div className="absolute w-56 h-56 bg-[#FFB7B2]/10 rounded-full animate-ping [animation-delay:0.5s]"></div>
            </div>
          )}
          <div className={`w-32 h-32 rounded-[2rem] flex items-center justify-center transition-all duration-500 shadow-2xl ${isActive ? 'bg-[#3F51B5] scale-110' : 'bg-white/10'}`}>
            <i className={`fas fa-brain text-5xl ${isActive ? 'text-white' : 'text-slate-700'}`}></i>
          </div>
        </div>
      </div>

      {(isActive || transcript.length > 0) && (
        <div className="relative mt-12">
          <div className="absolute top-4 right-4 z-20">
            <button 
              onClick={clearTranscript}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-[#FFB7B2] transition-colors flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5"
            >
              <i className="fas fa-trash-can"></i> Clear Console
            </button>
          </div>
          <div 
            ref={scrollRef}
            className="bg-black/40 rounded-[2rem] p-8 h-64 overflow-y-auto border border-white/5 scroll-smooth custom-scrollbar"
          >
            <div className="space-y-4">
              {transcript.length === 0 && isActive && (
                <div className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse italic">
                  Awaiting voice input... Speak to begin architectural consultation.
                </div>
              )}
              {transcript.map((t, i) => (
                <div key={i} className="animate-in slide-in-from-left-4 duration-300">
                  <span className={`text-[10px] font-black uppercase tracking-widest mb-1 block opacity-60 ${t.role === 'User' ? 'text-white' : 'text-[#FFB7B2]'}`}>
                    {t.role}
                  </span>
                  <p className={`text-sm font-medium leading-relaxed ${t.role === 'User' ? 'text-slate-300' : 'text-slate-100'}`}>
                    {t.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
