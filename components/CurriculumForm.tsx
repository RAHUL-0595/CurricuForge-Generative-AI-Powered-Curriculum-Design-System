import React from 'react';
import { GenerationParams } from '../types';

interface Props {
  onSubmit: (params: GenerationParams) => void;
  isLoading: boolean;
}

export const CurriculumForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [params, setParams] = React.useState<GenerationParams>({
    subject: '',
    level: 'Beginner',
    industryAlignment: 'Software Engineering',
    durationWeeks: 12,
    additionalContext: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(params);
  };

  return (
    <form onSubmit={handleSubmit} className="frosted-card rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 p-10 border border-slate-100 transition-all">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Architectural Domain</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FFB7B2] transition-colors">
              <i className="fas fa-book-open text-sm"></i>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Advanced AI Safety Protocols"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#FFB7B2]/10 focus:border-[#FFB7B2] outline-none transition-all font-semibold text-[#263238]"
              value={params.subject}
              onChange={(e) => setParams({ ...params, subject: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Proficiency</label>
          <div className="relative group">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FFB7B2] transition-colors pointer-events-none">
              <i className="fas fa-signal text-sm"></i>
            </div>
            <select
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#FFB7B2]/10 focus:border-[#FFB7B2] outline-none transition-all font-semibold text-[#263238] appearance-none"
              value={params.level}
              onChange={(e) => setParams({ ...params, level: e.target.value as any })}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Industry Vertical</label>
           <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FFB7B2] transition-colors">
              <i className="fas fa-briefcase text-sm"></i>
            </div>
            <input
              type="text"
              placeholder="e.g. Aerospace Engineering"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#FFB7B2]/10 focus:border-[#FFB7B2] outline-none transition-all font-semibold text-[#263238]"
              value={params.industryAlignment}
              onChange={(e) => setParams({ ...params, industryAlignment: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Duration (Weeks)</label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FFB7B2] transition-colors">
              <i className="fas fa-calendar-days text-sm"></i>
            </div>
            <input
              type="number"
              min="1"
              max="52"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#FFB7B2]/10 focus:border-[#FFB7B2] outline-none transition-all font-semibold text-[#263238]"
              value={params.durationWeeks}
              onChange={(e) => setParams({ ...params, durationWeeks: parseInt(e.target.value) })}
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Structural Constraints & Context</label>
          <textarea
            placeholder="Specify advanced technical requirements, pedagogical preferences, or regulatory standards..."
            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:bg-white focus:ring-2 focus:ring-[#FFB7B2]/10 focus:border-[#FFB7B2] outline-none transition-all font-semibold text-[#263238] h-32"
            value={params.additionalContext}
            onChange={(e) => setParams({ ...params, additionalContext: e.target.value })}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`mt-12 w-full py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all glow-button shadow-xl ${
          isLoading ? 'bg-indigo-300 cursor-not-allowed' : 'gradient-header hover:shadow-[#FFB7B2]/40 active:scale-95'
        }`}
      >
        {isLoading ? (
          <>
            <i className="fas fa-cog fa-spin"></i>
            Initiating Synthesis...
          </>
        ) : (
          <>
            <i className="fas fa-wand-sparkles"></i>
            Forge Architecture
          </>
        )}
      </button>
    </form>
  );
};