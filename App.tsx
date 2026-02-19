
import React, { useState } from 'react';
import { CurriculumForm } from './components/CurriculumForm';
import { CurriculumDisplay } from './components/CurriculumDisplay';
import { ImageForge } from './components/ImageForge';
import { LiveForge } from './components/LiveForge';
import { Chatbot } from './components/Chatbot';
import { generateCurriculum, generateSpeech } from './services/geminiService';
import { Curriculum, GenerationParams } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'forge' | 'visual' | 'live'>('forge');
  const [curriculum, setCurriculum] = React.useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGenerate = async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateCurriculum(params);
      setCurriculum(result);
      setTimeout(() => {
        document.getElementById('curriculum-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError("Failed to generate curriculum. Please check your API key and network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTTS = async (text: string) => {
    try {
      const base64 = await generateSpeech(text);
      const audio = new Audio(`data:audio/pcm;base64,${base64}`);
      // Note: Browsers usually need a user gesture to play, but here it's triggered by button click
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (e) {
      console.error("TTS failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <i className="fas fa-graduation-cap text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">CURRICU<span className="text-indigo-600">FORGE</span></h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Generative AI Design System</p>
            </div>
          </div>
          <nav className="flex items-center gap-1 md:gap-4 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('forge')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'forge' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Curriculum Forge
            </button>
            <button 
              onClick={() => setActiveTab('visual')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'visual' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Visual Forge
            </button>
            <button 
              onClick={() => setActiveTab('live')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'live' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Live Sync
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'forge' && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                Architect Your <span className="text-indigo-600">Learning Path</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Powered by Gemini 3 Pro with Search Grounding and Deep Thinking.
              </p>
            </div>
            <div className="max-w-4xl mx-auto mb-20">
              <CurriculumForm onSubmit={handleGenerate} isLoading={isLoading} />
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-3">
                  <i className="fas fa-exclamation-circle"></i>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
            </div>
            <div id="curriculum-results">
              {isLoading && <LoadingState />}
              {curriculum && (
                <div className="relative">
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={() => handleTTS(`${curriculum.title}. ${curriculum.description}`)}
                      className="bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all"
                      title="Listen to summary"
                    >
                      <i className="fas fa-volume-up"></i>
                    </button>
                  </div>
                  <CurriculumDisplay curriculum={curriculum} />
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'visual' && <ImageForge />}
        {activeTab === 'live' && <LiveForge />}
      </main>

      <Chatbot />
      
      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <i className="fas fa-graduation-cap text-xl"></i>
            </div>
            <h1 className="text-xl font-black tracking-tight">CURRICU<span className="text-indigo-400">FORGE</span></h1>
          </div>
          <div className="text-slate-500 text-sm">
            &copy; 2024 CurricuForge. Powered by Gemini 3 & 2.5 Series.
          </div>
        </div>
      </footer>
    </div>
  );
}

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-20 space-y-6">
    <div className="relative">
      <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="fas fa-brain text-indigo-600 text-2xl animate-pulse"></i>
      </div>
    </div>
    <div className="text-center">
      <p className="text-xl font-bold text-slate-800">Synthesizing Educational Content...</p>
      <p className="text-slate-500 text-sm">Deep Thinking enabled. Grounding with Google Search.</p>
    </div>
  </div>
);

export default App;
