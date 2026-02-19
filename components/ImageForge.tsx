
import React, { useState } from 'react';
import { editImage } from '../services/geminiService';

export const ImageForge: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleForge = async () => {
    if (!image || !prompt) return;
    setLoading(true);
    try {
      const edited = await editImage(image, prompt);
      setResult(edited);
    } catch (e) {
      alert("Image transformation process failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="frosted-card rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 p-10">
      <div className="mb-10 flex items-center gap-6">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-[#3F51B5] text-xl">
          <i className="fas fa-image"></i>
        </div>
        <div>
          <h3 className="text-3xl font-black text-[#263238] tracking-tight">Visual Asset Forge</h3>
          <p className="text-slate-500 font-medium">Professional image modification via Gemini Flash 2.5 Image Vision.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="space-y-3">
             <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Material</label>
            <div 
              className="border-2 border-dashed border-slate-200 rounded-[2rem] h-80 flex flex-col items-center justify-center bg-slate-50/50 cursor-pointer hover:bg-white hover:border-[#3F51B5]/40 transition-all overflow-hidden relative group"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
              {image ? (
                <>
                  <img src={image} className="w-full h-full object-cover" alt="Source" />
                  <div className="absolute inset-0 bg-[#263238]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white font-bold uppercase text-xs tracking-widest">Replace Component</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-300 mb-4">
                    <i className="fas fa-arrow-up-from-bracket text-xl"></i>
                  </div>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Ingest Image File</p>
                </>
              )}
              <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleFile} />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Transformation Protocol</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. 'Synthesize a high-contrast blueprint style' or 'Remove peripheral anomalies'..."
              className="w-full h-32 p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:bg-white focus:ring-2 focus:ring-[#3F51B5]/10 focus:border-[#3F51B5] outline-none transition-all font-semibold text-[#263238] resize-none"
            />
          </div>

          <button
            onClick={handleForge}
            disabled={loading || !image}
            className={`w-full py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all glow-button shadow-xl ${
              loading || !image ? 'bg-indigo-300' : 'gradient-header'
            }`}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-wand-magic-sparkles"></i>}
            Execute Transformation
          </button>
        </div>

        <div className="bg-[#263238] rounded-[2.5rem] flex flex-col items-center justify-center p-8 min-h-[500px] shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <i className="fas fa-microchip text-[200px] text-white"></i>
           </div>
          {result ? (
            <div className="space-y-6 w-full relative z-10 animate-in zoom-in-95 duration-500">
              <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                <img src={result} className="w-full" alt="Result" />
              </div>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = result;
                  link.download = 'forged-asset.png';
                  link.click();
                }}
                className="w-full py-4 bg-white/5 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 border border-white/10 transition-all flex items-center justify-center gap-3"
              >
                <i className="fas fa-download"></i>
                Export Forged Asset
              </button>
            </div>
          ) : (
            <div className="text-center space-y-4 relative z-10">
              <div className="w-20 h-20 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center mx-auto mb-6">
                <i className="fas fa-atom text-[#00E5FF] text-3xl animate-spin-slow"></i>
              </div>
              <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">Output Terminal Offline</p>
              <p className="text-slate-500 text-xs font-medium max-w-[200px] mx-auto">Initiate a protocol to visualize architectural assets.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
