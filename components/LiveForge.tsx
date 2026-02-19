
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

export const LiveForge: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{ role: string, text: string }[]>([]);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          const source = audioContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(audioContextRef.current!.destination);
          setIsActive(true);
        },
        onmessage: async (msg) => {
          if (msg.serverContent?.outputTranscription) {
            setTranscript(prev => [...prev, { role: 'ai', text: msg.serverContent!.outputTranscription!.text }]);
          }
          const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audioBase64) {
            const ctx = outputAudioContextRef.current!;
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
        onclose: () => setIsActive(false),
        onerror: (e) => console.error("Live session error", e)
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: 'You are a real-time academic assistant. You help users refine their curricula through natural conversation. Speak concisely.',
        outputAudioTranscription: {}
      }
    });
    sessionRef.current = sessionPromise;
  };

  const stopSession = () => {
    sessionRef.current?.then((s: any) => s.close());
    setIsActive(false);
  };

  return (
    <div className="bg-indigo-900 rounded-2xl shadow-2xl p-8 text-white">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-4">
          <h3 className="text-3xl font-black">Native Voice Sync</h3>
          <p className="text-indigo-200">
            Have a real-time, low-latency conversation with CurricuForge to brainstorm course ideas or module structures.
          </p>
          <div className="flex gap-4">
            {!isActive ? (
              <button 
                onClick={startSession}
                className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all flex items-center gap-2"
              >
                <i className="fas fa-microphone"></i> Start Conversation
              </button>
            ) : (
              <button 
                onClick={stopSession}
                className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <i className="fas fa-stop"></i> Stop Session
              </button>
            )}
          </div>
        </div>

        <div className="w-full md:w-64 aspect-square bg-indigo-800/50 rounded-full border-4 border-indigo-700/50 flex items-center justify-center relative overflow-hidden">
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-indigo-400/20 rounded-full animate-ping"></div>
              <div className="absolute w-40 h-40 bg-indigo-400/10 rounded-full animate-ping [animation-delay:0.5s]"></div>
            </div>
          )}
          <i className={`fas fa-brain text-5xl ${isActive ? 'text-white animate-pulse' : 'text-indigo-700'}`}></i>
        </div>
      </div>

      {isActive && transcript.length > 0 && (
        <div className="mt-8 bg-black/20 rounded-xl p-4 h-32 overflow-y-auto">
          {transcript.map((t, i) => (
            <p key={i} className="text-sm text-indigo-100 mb-1">
              <span className="font-bold uppercase text-[10px] opacity-50 mr-2">{t.role}:</span>
              {t.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
