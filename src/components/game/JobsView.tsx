import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Shield, Star, Hammer, Users, Banknote, Search, X, TrendingUp, Sparkles, UserCheck } from 'lucide-react';
import { GameState, Job } from '../../types';
import { cn } from '../../lib/utils';
import { CAREERS, FREELANCE_JOBS, PART_TIME_JOBS } from '../../data/careers';

interface JobsViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const JobsView: React.FC<JobsViewProps> = ({ gameState, setGameState }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<any | null>(null);

  const applyForCareer = (career: any) => {
    const initialStage = career.stages[0];
    
    if (initialStage.requirements.education && gameState.education !== initialStage.requirements.education) {
      if (initialStage.requirements.education === 'University' && gameState.education === 'None') {
        alert("You need a University degree for this career!");
        return;
      }
    }

    const newJob: Job = {
      name: initialStage.title,
      company: "Simulation Corp",
      tier: 0,
      salary: initialStage.salary,
      category: career.category,
      experienceYears: 0,
      performance: 50,
    };

    setGameState(prev => ({
      ...prev,
      character: { ...prev.character!, job: newJob },
      logs: [`You started a new career as a ${newJob.name}!`, ...prev.logs].slice(0, 50)
    }));
    setActiveCategory(null);
    setSelectedCareer(null);
  };

  const workFreelance = (job: any) => {
    const rate = Math.floor(Math.random() * (job.maxRate - job.minRate + 1)) + job.minRate;
    const hours = Math.floor(Math.random() * 8) + 1;
    let pay = rate * hours;
    
    let tip = 0;
    if (Math.random() > 0.7) {
      tip = Math.floor(Math.random() * 50) + 1;
      pay += tip;
    }

    setGameState(prev => ({
      ...prev,
      character: { 
        ...prev.character!, 
        stats: { ...prev.character!.stats, wealth: prev.character!.stats.wealth + pay } 
      },
      logs: [`You worked as a ${job.name} for ${hours} hours and earned $${pay}${tip > 0 ? ` (incl. $${tip} tip!)` : ''}.`, ...prev.logs].slice(0, 50)
    }));
  };

  const hireRecruiter = () => {
    if (gameState.character!.stats.wealth < 200) {
      alert("You can't afford a recruiter!");
      return;
    }

    setGameState(prev => ({
      ...prev,
      character: { 
        ...prev.character!, 
        stats: { ...prev.character!.stats, wealth: prev.character!.stats.wealth - 200 } 
      },
      logs: [`You paid $200 to a job recruiter.`, ...prev.logs].slice(0, 50)
    }));

    setTimeout(() => {
      if (Math.random() > 0.4) {
        const randomCareer = CAREERS[Math.floor(Math.random() * CAREERS.length)];
        alert(`A recruiter found you an opening for: ${randomCareer.stages[0].title}!`);
        applyForCareer(randomCareer);
      } else {
        alert("The recruiter couldn't find any suitable positions for you.");
      }
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <header className="mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter italic text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-500" /> Career Bureau
        </h2>
        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase italic">Employment & Freelance Markets</p>
      </header>

      {gameState.character?.job && (
        <div className="bg-purple-500/10 border border-purple-500/30 p-5 rounded-2xl flex justify-between items-center mb-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-20 h-20" />
          </div>
          <div className="relative z-10">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] mb-1 block">Active Career</span>
            <p className="text-xl font-black text-white italic tracking-tight uppercase leading-none mb-1">{gameState.character.job.name}</p>
            <div className="flex gap-4">
              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">
                Level: {gameState.character.job.tier + 1} • Perf: {gameState.character.job.performance}%
              </div>
              <div className="text-[9px] text-purple-400 font-mono uppercase tracking-widest font-bold">
                ${gameState.character.job.salary.toLocaleString()}/yr • ${(gameState.character.job.salary / 12).toLocaleString(undefined, {maximumFractionDigits: 0})}/mo • ${(gameState.character.job.salary / 52).toLocaleString(undefined, {maximumFractionDigits: 0})}/wk
              </div>
            </div>
          </div>
          <button 
            onClick={() => setGameState(p => ({ ...p, character: { ...p.character!, job: null } }))}
            className="relative z-10 px-4 py-2 bg-red-600/20 text-red-500 border border-red-500/30 rounded-xl text-[10px] font-black uppercase italic hover:bg-red-600 hover:text-white transition-all active:scale-95"
          >
            QUIT
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { id: 'Full-time', label: 'Full-time', icon: Briefcase, color: 'text-purple-400' },
          { id: 'freelance', label: 'Freelance', icon: Hammer, color: 'text-emerald-400' },
          { id: 'Military', label: 'Military', icon: Shield, color: 'text-blue-400' },
          { id: 'part-time', label: 'Part-time', icon: Users, color: 'text-pink-400' },
          { id: 'special', label: 'Special', icon: Star, color: 'text-amber-400' },
          { id: 'recruiter', label: 'Recruiter', icon: Search, color: 'text-sky-400' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => cat.id === 'recruiter' ? hireRecruiter() : setActiveCategory(cat.id)}
            className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col items-center gap-2 hover:bg-white/10 hover:border-purple-500/50 transition-all group"
          >
            <cat.icon className={cn("w-6 h-6 mb-1 transition-transform group-hover:scale-110", cat.color)} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">{cat.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {activeCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveCategory(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="relative w-full max-w-xl bg-[#161618] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <header className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">
                    {activeCategory.replace('-', ' ')} Listings
                  </h3>
                  <button onClick={() => setActiveCategory(null)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </header>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {(activeCategory === 'Full-time' || activeCategory === 'Military') && 
                    CAREERS.filter(c => c.category === activeCategory).map(career => (
                      <button
                        key={career.id}
                        onClick={() => setSelectedCareer(career)}
                        className="w-full p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between hover:border-purple-500 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-purple-500/10 rounded-lg">
                            <career.icon className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{career.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Starts at ${career.stages[0].salary.toLocaleString()}/yr</p>
                          </div>
                        </div>
                        <UserCheck className="w-4 h-4 text-slate-700" />
                      </button>
                    ))
                  }

                  {activeCategory === 'freelance' && 
                    FREELANCE_JOBS.map(job => (
                      <button
                        key={job.id}
                        onClick={() => workFreelance(job)}
                        className="w-full p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between hover:border-emerald-500 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Hammer className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase">{job.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono tracking-widest italic">Est. Rate: ${job.minRate}-${job.maxRate}/hr + Tips</p>
                          </div>
                        </div>
                        <Banknote className="w-4 h-4 text-emerald-600" />
                      </button>
                    ))
                  }

                  {activeCategory === 'part-time' && 
                    PART_TIME_JOBS.map(job => (
                      <button
                        key={job}
                        className="w-full p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between hover:border-pink-500 transition-colors text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-pink-500/10 rounded-lg">
                            <Users className="w-5 h-5 text-pink-400" />
                          </div>
                          <p className="text-sm font-bold text-white uppercase">{job}</p>
                        </div>
                        <Sparkles className="w-4 h-4 text-pink-600" />
                      </button>
                    ))
                  }
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedCareer && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCareer(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-md bg-[#1d1d21] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-2xl">
                    <selectedCareer.icon className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{selectedCareer.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">{selectedCareer.category} Career Path</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCareer(null)} className="p-2 text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mb-2 border-b border-white/5 pb-1">Progression Stages</p>
                {selectedCareer.stages.map((stage: any) => (
                  <div key={stage.title} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-800 group-hover:bg-purple-500 transition-colors" />
                       <span className="text-xs font-bold text-slate-300 group-hover:text-white">{stage.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase font-bold items-end flex flex-col">
                      <span>${stage.salary.toLocaleString()}/yr</span>
                      <span className="text-[8px] opacity-60 italic">${Math.floor(stage.salary/52).toLocaleString()}/wk</span>
                    </span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => applyForCareer(selectedCareer)}
                className="w-full bg-white text-black font-black py-4 rounded-2xl text-lg hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5 italic"
              >
                APPLY_FOR_POSITION
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
