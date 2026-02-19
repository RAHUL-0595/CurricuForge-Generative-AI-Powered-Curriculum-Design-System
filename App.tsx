import React, { useState } from 'react';
import { CurriculumForm } from './components/CurriculumForm';
import { CurriculumDisplay } from './components/CurriculumDisplay';
import { ImageForge } from './components/ImageForge';
import { LiveForge } from './components/LiveForge';
import { Chatbot } from './components/Chatbot';
import { generateCurriculum, generateSpeech, fastChat } from './services/geminiService';
import { Curriculum, GenerationParams } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<'forge' | 'visual' | 'live' | 'chat'>('forge');
  const [curriculum, setCurriculum] = React.useState<Curriculum | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [quickSearch, setQuickSearch] = useState('');
  const [quickResult, setQuickResult] = useState('');
  const [isQuickLoading, setIsQuickLoading] = useState(false);

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
      setError("Strategic synthesis failed. Please verify connectivity or credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    setIsQuickLoading(true);
    try {
      const res = await fastChat(`Define this academic/industry term briefly: ${quickSearch}`);
      setQuickResult(res);
    } catch (err) {
      setQuickResult("Lookup failed.");
    } finally {
      setIsQuickLoading(false);
    }
  };

  const handleTTS = async (text: string) => {
    try {
      const base64 = await generateSpeech(text);
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
    <div className="min-h-screen bg-[#B39DDB] flex flex-col">
      <header className="bg-glass border-b border-slate-200 sticky top-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="gradient-header p-3 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <i className="fas fa-graduation-cap text-2xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#263238] tracking-tight">
                Curricu<span className="text-[#3F51B5]">Forge</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Enterprise Academic Architect</p>
            </div>
          </div>
          
          <nav className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {[
              { id: 'forge', label: 'Architect', icon: 'fa-pen-ruler' },
              { id: 'visual', label: 'Visuals', icon: 'fa-wand-magic-sparkles' },
              { id: 'live', label: 'Voice', icon: 'fa-microphone-lines' },
              { id: 'chat', label: 'Advisor', icon: 'fa-brain-circuit' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === tab.id 
                  ? 'bg-white text-[#3F51B5] shadow-md ring-1 ring-slate-200' 
                  : 'text-slate-500 hover:text-[#3F51B5] hover:bg-white/50'
                }`}
              >
                <i className={`fas ${tab.icon} ${activeTab === tab.id ? 'text-[#00E5FF]' : 'opacity-60'}`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        {activeTab === 'forge' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-16">
              <span className="bg-[#3F51B5]/10 text-[#3F51B5] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block ring-1 ring-[#3F51B5]/20">
                Industry Standard Engineering
              </span>
              <h2 className="text-5xl md:text-6xl font-[800] text-[#263238] mb-6 tracking-tight">
                Next-Gen <span className="text-[#3F51B5] relative">Learning Architect<span className="absolute -bottom-1 left-0 w-full h-1 bg-[#00E5FF] opacity-30 rounded-full"></span></span>
              </h2>
              
              {/* Flash-Lite Quick Lookup */}
              <div className="max-w-xl mx-auto mt-8">
                <form onSubmit={handleQuickLookup} className="relative group">
                   <input 
                    type="text" 
                    placeholder="Quick terminology lookup (Flash-Lite powered)..." 
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3 text-sm font-medium focus:ring-2 focus:ring-[#00E5FF]/20 focus:border-[#00E5FF] outline-none transition-all pr-12"
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                   />
                   <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#3F51B5] hover:text-[#00E5FF] transition-colors p-2">
                     {isQuickLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-bolt-lightning"></i>}
                   </button>
                </form>
                {quickResult && (
                  <div className="mt-3 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-left animate-in slide-in-from-top-2">
                    <p className="text-xs font-bold text-[#3F51B5] uppercase mb-1">Instant Synthesis</p>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{quickResult}</p>
                    <button onClick={() => setQuickResult('')} className="text-[10px] font-bold text-slate-400 mt-2 hover:text-red-400">Clear Result</button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="max-w-4xl mx-auto mb-24">
              <CurriculumForm onSubmit={handleGenerate} isLoading={isLoading} />
              {error && (
                <div className="mt-8 p-5 bg-red-50 border border-red-100 text-red-800 rounded-2xl flex items-center gap-4 shadow-sm animate-in zoom-in-95">
                  <div className="bg-red-100 p-2 rounded-lg"><i className="fas fa-circle-exclamation text-red-600"></i></div>
                  <span className="text-sm font-semibold">{error}</span>
                </div>
              )}
            </div>

            <div id="curriculum-results">
              {isLoading && <LoadingState />}
              {curriculum && (
                <div className="relative group">
                  <div className="absolute top-6 right-6 z-10 flex gap-3">
                    <button 
                      onClick={() => handleTTS(`${curriculum.title}. ${curriculum.description}`)}
                      className="glow-button bg-white text-[#3F51B5] p-4 rounded-2xl shadow-xl hover:shadow-[#00E5FF]/20 transition-all ring-1 ring-slate-100"
                    >
                      <i className="fas fa-volume-high"></i>
                    </button>
                  </div>
                  <CurriculumDisplay curriculum={curriculum} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'visual' && <ImageForge />}
        {activeTab === 'live' && <LiveForge />}
        {activeTab === 'chat' && <Chatbot embedded={true} />}
      </main>

      {/* Floating helpbot is hidden when the main chat tab is active to avoid redundancy */}
      {activeTab !== 'chat' && <Chatbot />}
      
      <footer className="bg-[#263238] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="gradient-header p-3 rounded-2xl"><i className="fas fa-graduation-cap text-xl"></i></div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Curricu<span className="text-[#00E5FF]">Forge</span></h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Intelligent Academic Labs</p>
            </div>
          </div>
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest text-right leading-relaxed">
            exynos@2026Currcuforge TEAM PVT LIMITED
          </div>
        </div>
      </footer>
    </div>
  );
}

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-32 space-y-8 animate-in fade-in duration-1000">
    <div className="relative">
      <div className="w-24 h-24 border-4 border-slate-100 border-t-[#3F51B5] rounded-full animate-spin"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <i className="fas fa-microchip text-[#00E5FF] text-3xl animate-pulse"></i>
      </div>
    </div>
    <div className="text-center space-y-2">
      <p className="text-2xl font-extrabold text-[#263238]">Synthesizing Academic Framework...</p>
      <p className="text-slate-500 font-medium">Deep pedagogical analysis and search grounding in progress.</p>
    </div>
  </div>
);

export default App;