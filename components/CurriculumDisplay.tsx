import React, { useState } from 'react';
import { Curriculum, Module, Topic } from '../types';

interface Props {
  curriculum: Curriculum;
}

const ModuleCard: React.FC<{ module: Module, index: number }> = ({ module: initialModule, index }) => {
  const [module, setModule] = useState<Module>(initialModule);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const updateKeyPoint = (topicIdx: number, pointIdx: number, newValue: string) => {
    const updatedTopics = [...module.topics];
    updatedTopics[topicIdx].keyPoints[pointIdx] = newValue;
    setModule({ ...module, topics: updatedTopics });
  };

  const addKeyPoint = (topicIdx: number) => {
    const updatedTopics = [...module.topics];
    updatedTopics[topicIdx].keyPoints.push("New requirement");
    setModule({ ...module, topics: updatedTopics });
  };

  const removeKeyPoint = (topicIdx: number, pointIdx: number) => {
    const updatedTopics = [...module.topics];
    updatedTopics[topicIdx].keyPoints.splice(pointIdx, 1);
    setModule({ ...module, topics: updatedTopics });
  };

  const updateTopicDescription = (topicIdx: number, newValue: string) => {
    const updatedTopics = [...module.topics];
    updatedTopics[topicIdx].description = newValue;
    setModule({ ...module, topics: updatedTopics });
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    setDraggingIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggingIdx === null || draggingIdx === idx) return;

    const newTopics = [...module.topics];
    const itemToMove = newTopics[draggingIdx];
    newTopics.splice(draggingIdx, 1);
    newTopics.splice(idx, 0, itemToMove);
    
    setDraggingIdx(idx);
    setModule({ ...module, topics: newTopics });
  };

  const handleDragEnd = () => {
    setDraggingIdx(null);
  };

  return (
    <div className="frosted-card rounded-3xl overflow-hidden mb-12 print:shadow-none">
      <div className="gradient-header px-8 py-6 flex justify-between items-center print:bg-white print:border-b-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70 block mb-1">Structural Phase 0{index + 1}</span>
          <h3 className="text-2xl font-bold text-white">
            {module.title}
          </h3>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 text-white text-xs font-black tracking-widest">
          {module.topics.length} CORE UNITS
        </div>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-xs font-black text-[#FFB7B2] uppercase tracking-[0.2em] flex items-center gap-2">
              <i className="fas fa-layer-group"></i> Unit Progression
            </h4>
            <div className="space-y-6">
              {module.topics.map((topic, tidx) => (
                <div 
                  key={topic.id} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, tidx)}
                  onDragOver={(e) => handleDragOver(e, tidx)}
                  onDragEnd={handleDragEnd}
                  className={`bg-slate-50/50 p-6 rounded-2xl border transition-all group flex gap-5 ${
                    draggingIdx === tidx 
                      ? 'bg-red-50 border-[#FFB7B2] border-dashed scale-[0.99] shadow-inner' 
                      : 'border-slate-100 hover:border-[#FFB7B2]/30 hover:bg-white hover:shadow-xl hover:shadow-[#FFB7B2]/5'
                  }`}
                >
                  <div className="flex flex-col items-center justify-start cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-[#FFB7B2]/50 mt-1 print:hidden">
                    <i className="fas fa-grip-vertical"></i>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="text-lg font-extrabold text-[#263238]">{tidx + 1}. {topic.title}</h5>
                      <div className="bg-red-50 px-2.5 py-1 rounded-lg text-[10px] font-black text-[#FFB7B2] uppercase tracking-wider flex items-center gap-1.5">
                        <i className="far fa-clock"></i> {topic.duration}
                      </div>
                    </div>
                    
                    <textarea 
                      className="w-full text-sm text-slate-500 font-medium mb-4 bg-transparent border-none focus:ring-1 focus:ring-red-100 rounded p-1 resize-none"
                      value={topic.description}
                      onChange={(e) => updateTopicDescription(tidx, e.target.value)}
                      rows={2}
                    />

                    <div className="flex flex-wrap gap-2.5 items-center">
                      {topic.keyPoints.map((point, pidx) => (
                        <div key={pidx} className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 group/point hover:border-[#FFB7B2] transition-all shadow-sm">
                          <input 
                            className="text-[11px] font-bold text-[#263238] border-none bg-transparent focus:ring-0 w-auto min-w-[80px]"
                            value={point}
                            onChange={(e) => updateKeyPoint(tidx, pidx, e.target.value)}
                            style={{ width: `${Math.max(point.length, 8)}ch` }}
                          />
                          <button 
                            onClick={() => removeKeyPoint(tidx, pidx)}
                            className="ml-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/point:opacity-100 print:hidden"
                          >
                            <i className="fas fa-circle-xmark text-[10px]"></i>
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => addKeyPoint(tidx)}
                        className="text-[11px] font-black text-[#FFB7B2] hover:text-[#FFB7B2]/80 p-2 flex items-center gap-1.5 transition-colors print:hidden"
                      >
                        <i className="fas fa-circle-plus"></i> Add Spec
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-[#F9FAFC] p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group/outcomes">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/outcomes:scale-125 transition-transform">
                <i className="fas fa-bullseye text-6xl text-[#FFB7B2]"></i>
              </div>
              <h4 className="text-xs font-black text-[#FFB7B2] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                Learning Milestones
              </h4>
              <ul className="space-y-4">
                {module.learningOutcomes.map((outcome) => (
                  <li key={outcome.id} className="text-sm font-semibold text-slate-600 flex gap-4">
                    <span className="flex-shrink-0 mt-1 text-[#FFB7B2] text-[10px]"><i className="fas fa-circle-check"></i></span>
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
    <div className="space-y-16 animate-in fade-in duration-700">
      <div className="frosted-card p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 gradient-header opacity-5 blur-[100px] pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-12">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-black text-[#263238] mb-4 tracking-tight leading-tight">{curriculum.title}</h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">{curriculum.description}</p>
          </div>
          <div className="flex flex-col gap-3 min-w-[240px] print:hidden">
            <div className="bg-white px-5 py-3 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Cohort</span>
              <span className="text-sm font-bold text-[#FFB7B2]">{curriculum.targetAudience}</span>
            </div>
            <div className="bg-white px-5 py-3 rounded-2xl flex items-center justify-between border border-slate-100 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commitment</span>
              <span className="text-sm font-bold text-[#FFB7B2]">{curriculum.totalDuration}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="gradient-header p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 text-white/10 text-9xl transform -rotate-12 transition-transform group-hover:scale-110">
              <i className="fas fa-bolt"></i>
            </div>
            <h4 className="text-xl font-extrabold mb-4 flex items-center gap-3">
              <i className="fas fa-shield-halved"></i> Global Integrity
            </h4>
            <p className="text-white/80 text-sm font-medium leading-relaxed relative z-10">
              Curriculum architecture cross-references global academic benchmarks and current tier-1 industry requirements.
            </p>
          </div>

          <div className="md:col-span-2 bg-[#263238] p-8 rounded-[2rem] text-white shadow-xl overflow-hidden relative">
             <div className="absolute top-0 right-0 p-6 opacity-10">
                <i className="fas fa-brain text-8xl text-[#FFB7B2]"></i>
             </div>
            <h4 className="text-xl font-extrabold mb-6 flex items-center gap-3 text-[#FFB7B2]">
              <i className="fas fa-microchip"></i> Architectural Enhancements
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
              {curriculum.academicOptimizationTips.map((tip, i) => (
                <div key={i} className="flex gap-4 items-start bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                  <span className="text-[#FFB7B2] font-black text-xs pt-0.5">0{i+1}</span>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-3xl font-black text-[#263238] flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center text-[#FFB7B2]">
              <i className="fas fa-stream"></i>
            </div>
            Educational Blueprint
          </h3>
        </div>
        
        <div className="space-y-4">
          {curriculum.modules.map((module, idx) => (
            <ModuleCard key={module.id} module={module} index={idx} />
          ))}
        </div>
      </div>
      
      <div className="flex justify-center pb-24 print:hidden">
        <button 
          onClick={() => window.print()}
          className="glow-button bg-[#263238] text-white px-10 py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-3"
        >
          <i className="fas fa-file-pdf text-lg text-[#FFB7B2]"></i>
          Generate System Export
        </button>
      </div>
    </div>
  );
};