
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Course Subject</label>
          <input
            type="text"
            required
            placeholder="e.g. Advanced Machine Learning"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={params.subject}
            onChange={(e) => setParams({ ...params, subject: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Educational Level</label>
          <select
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
            value={params.level}
            onChange={(e) => setParams({ ...params, level: e.target.value as any })}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
            <option>Expert</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Industry Alignment</label>
          <input
            type="text"
            placeholder="e.g. Fintech, Healthcare IT"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={params.industryAlignment}
            onChange={(e) => setParams({ ...params, industryAlignment: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Duration (Weeks)</label>
          <input
            type="number"
            min="1"
            max="52"
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={params.durationWeeks}
            onChange={(e) => setParams({ ...params, durationWeeks: parseInt(e.target.value) })}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-semibold text-slate-700">Additional Context / Requirements</label>
          <textarea
            placeholder="Mention specific libraries, methodologies, or outcomes..."
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24"
            value={params.additionalContext}
            onChange={(e) => setParams({ ...params, additionalContext: e.target.value })}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`mt-8 w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
          isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 shadow-xl'
        }`}
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin"></i>
            Designing Curriculum...
          </>
        ) : (
          <>
            <i className="fas fa-wand-magic-sparkles"></i>
            Forge Curriculum
          </>
        )}
      </button>
    </form>
  );
};
