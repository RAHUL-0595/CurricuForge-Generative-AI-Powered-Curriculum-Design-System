
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
      alert("Failed to forge image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">Visual Asset Forge</h3>
        <p className="text-slate-500">Transform educational graphics using natural language prompts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div 
            className="border-2 border-dashed border-slate-200 rounded-2xl h-64 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden"
            onClick={() => document.getElementById('image-upload')?.click()}
          >
            {image ? (
              <img src={image} className="w-full h-full object-cover" alt="Source" />
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt text-4xl text-slate-300 mb-4"></i>
                <p className="text-sm text-slate-500 font-medium">Click to upload source image</p>
              </>
            )}
            <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={handleFile} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Modification Prompt</label>
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. 'Add a retro filter' or 'Remove the background text'..."
              className="w-full h-24 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <button
            onClick={handleForge}
            disabled={loading || !image}
            className={`w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all ${
              loading || !image ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
            Forge Image
          </button>
        </div>

        <div className="bg-slate-900 rounded-2xl flex flex-col items-center justify-center p-4 min-h-[400px]">
          {result ? (
            <div className="space-y-4 w-full">
              <img src={result} className="w-full rounded-lg shadow-2xl" alt="Result" />
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = result;
                  link.download = 'forged-asset.png';
                  link.click();
                }}
                className="w-full py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-all"
              >
                Download Forged Asset
              </button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-image text-slate-600 text-2xl"></i>
              </div>
              <p className="text-slate-500 text-sm">Forged output will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
