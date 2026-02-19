
import React from 'react';
import { Curriculum, Module } from '../types';

interface Props {
  curriculum: Curriculum;
}

const ModuleCard: React.FC<{ module: Module, index: number }> = ({ module, index }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden mb-8">
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
        <h3 className="text-xl font-bold text-indigo-900">
          Module {index + 1}: {module.title}
        </h3>
        <span className="bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold">
          {module.topics.length} Topics
        </span>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Topics & Content</h4>
            {module.topics.map((topic, tidx) => (
              <div key={topic.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100 hover:border-indigo-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-bold text-slate-800">{tidx + 1}. {topic.title}</h5>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <i className="far fa-clock"></i> {topic.duration}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-3">{topic.description}</p>
                <div className="flex flex-wrap gap-2">
                  {topic.keyPoints.map((point, pidx) => (
                    <span key={pidx} className="bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-medium">
                      • {point}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
              <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <i className="fas fa-bullseye"></i> Learning Outcomes
              </h4>
              <ul className="space-y-3">
                {module.learningOutcomes.map((outcome) => (
                  <li key={outcome.id} className="text-sm text-emerald-900 flex gap-2">
                    <span className="mt-1 text-emerald-500 text-[10px]"><i className="fas fa-check-circle"></i></span>
                    {outcome.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const CurriculumDisplay: React.FC<Props> = ({ curriculum }) => {
  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{curriculum.title}</h2>
            <p className="text-slate-600 max-w-2xl">{curriculum.description}</p>
          </div>
          <div className="flex flex-col gap-2 min-w-[200px]">
            <div className="bg-indigo-50 px-4 py-2 rounded-lg flex items-center justify-between border border-indigo-100">
              <span className="text-xs font-bold text-indigo-700 uppercase">Target</span>
              <span className="text-sm font-semibold text-slate-900">{curriculum.targetAudience}</span>
            </div>
            <div className="bg-slate-50 px-4 py-2 rounded-lg flex items-center justify-between border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase">Duration</span>
              <span className="text-sm font-semibold text-slate-900">{curriculum.totalDuration}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-indigo-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-indigo-500 text-8xl opacity-20 transform -rotate-12 transition-transform group-hover:scale-110">
              <i className="fas fa-chart-line"></i>
            </div>
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-rocket"></i> Industry Alignment
            </h4>
            <p className="text-indigo-100 text-sm leading-relaxed relative z-10">
              The curriculum is optimized for current industry standards, ensuring graduates possess market-ready technical proficiency and theoretical depth.
            </p>
          </div>

          <div className="md:col-span-2 bg-slate-900 p-6 rounded-2xl text-white shadow-lg overflow-hidden">
            <h4 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-400">
              <i className="fas fa-graduation-cap"></i> Academic Optimization Tips
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {curriculum.academicOptimizationTips.map((tip, i) => (
                <div key={i} className="flex gap-3 items-start bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <span className="text-indigo-400 font-bold text-xs">0{i+1}</span>
                  <p className="text-sm text-slate-300">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3 ml-2">
          <span className="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">
            <i className="fas fa-layer-group"></i>
          </span>
          Curriculum Blueprint
        </h3>
        {curriculum.modules.map((module, idx) => (
          <ModuleCard key={module.id} module={module} index={idx} />
        ))}
      </div>
      
      <div className="flex justify-center pb-20">
        <button 
          onClick={() => window.print()}
          className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2"
        >
          <i className="fas fa-print"></i>
          Export to PDF
        </button>
      </div>
    </div>
  );
};
