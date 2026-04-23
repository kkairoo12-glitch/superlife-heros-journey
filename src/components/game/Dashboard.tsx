
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, Zap, ChevronUp, Crown, RefreshCw, Info, X } from 'lucide-react';
import { GameState, Power, Archetype, PersonStats } from '../../types';
import { cn } from '../../lib/utils';
import { CharacterAvatar } from '../CharacterAvatar';
import { PersonStatsCard } from './PersonStatsCard';

interface DashboardProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  ageUp: () => void;
  isAging: boolean;
}

const PowerStatCard: React.FC<{ label: string, value: number, color: string, bar: string, description: string }> = ({ label, value, color, bar, description }) => (
  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 group relative">
    <div className="flex items-center gap-2 mb-2">
      <span className={cn("text-[10px] font-bold uppercase tracking-widest", color)}>{label}</span>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-xl font-black text-white italic">{value}%</span>
      <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden mb-1.5">
        <div className={cn("h-full transition-all", bar)} style={{ width: `${value}%` }} />
      </div>
    </div>
    <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center p-4 text-[8px] text-slate-400 font-bold uppercase tracking-tight text-center leading-relaxed pointer-events-none">
      {description}
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ gameState, setGameState }) => {
  const { logs, character } = gameState;
  const [showIdentity, setShowIdentity] = useState(false);

  const playerPersonStats: PersonStats = {
    happiness: character?.stats?.happiness || 0,
    health: character?.stats?.health || 0,
    intelligence: character?.stats?.intelligence || 0,
    attractiveness: character?.stats?.attractiveness || 0,
    wealth: character?.stats?.wealth || 0,
    craziness: 50, // Default for player simulation
    maritalStatus: 'Single',
    occupation: character?.job?.name || (character?.school ? 'Student' : 'Unemployed'),
    education: character?.educationLevel || 'None'
  };

  const changeArchetype = () => {
    const archetypes: Archetype[] = ['Civilian', 'Hero', 'Villain', 'Anti-Hero', 'Anti-Villain'];
    const currentIdx = archetypes.indexOf(character!.archetype);
    const nextIdx = (currentIdx + 1) % archetypes.length;
    const nextPath = archetypes[nextIdx];

    setGameState(prev => ({
      ...prev,
      character: { ...prev.character!, archetype: nextPath },
      logs: [`Identity Shift: You are now acting as a ${nextPath}.`, ...prev.logs].slice(0, 50)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Character Profile Header */}
      <section className="p-6 bg-white/5 rounded-3xl border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <CharacterAvatar appearance={character!.appearance} gender={character!.gender} className="w-24 h-48" />
        </div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center p-2">
                 <CharacterAvatar appearance={character!.appearance} gender={character!.gender} className="w-full h-full" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">
                  {character?.name}
                </h3>
                <div className="flex gap-2 items-center">
                  {character?.royaltyTitle !== 'None' && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[8px] font-black italic text-amber-400 uppercase tracking-widest">
                       <Crown className="w-2 h-2" /> {character?.royaltyTitle}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">Age {character?.age}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Capital</p>
              <div className="text-xl font-black text-emerald-400 italic font-mono tracking-tighter text-right">
                ${character?.stats.wealth.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Identity Path</p>
                <div className={cn(
                  "text-[10px] font-black uppercase italic tracking-widest",
                  character?.archetype === 'Hero' ? "text-blue-400" :
                  character?.archetype === 'Villain' ? "text-red-400" :
                  character?.archetype === 'Civilian' ? "text-slate-400" :
                  "text-purple-400"
                )}>
                  {character?.archetype}
                </div>
              </div>
              <button 
                onClick={changeArchetype}
                className="p-2 hover:bg-white/5 rounded-lg text-slate-600 hover:text-white transition-all group"
                title="Shift Archetype"
              >
                <RefreshCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            <div className="p-3 bg-black/20 rounded-xl border border-white/5">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Employment</p>
              <div className="text-[10px] font-black text-white italic uppercase truncate">
                {character?.job ? character.job.name : "UNEMPLOYED"}
              </div>
            </div>
            <div className="p-3 bg-black/20 rounded-xl border border-white/5 flex items-center justify-between">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold mb-1">Detailed Profile</p>
              <button 
                onClick={() => setShowIdentity(true)}
                className="flex items-center gap-2 px-3 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase text-white transition-all italic tracking-tighter"
              >
                <Info className="w-3 h-3 text-purple-400" />
                View Identity
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Identity Modal */}
      <AnimatePresence>
        {showIdentity && character && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIdentity(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-[#161618] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4 items-center">
                   <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center p-2">
                      <CharacterAvatar appearance={character!.appearance} gender={character!.gender} className="w-full h-full" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">{character.name}</h3>
                     <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Identity Sheet</p>
                   </div>
                </div>
                <button onClick={() => setShowIdentity(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <PersonStatsCard stats={playerPersonStats} age={character.age} gender={character.gender as any} />
                
                <div className="mt-8 space-y-4">
                   <h4 className="text-[10px] font-black text-purple-400 uppercase italic tracking-widest pl-1">Superpower Identity</h4>
                   <div className="grid grid-cols-2 gap-3">
                      <PowerStatCard 
                        label="Mental Strain" 
                        value={character.stats.mentalStrain} 
                        color="text-amber-400" 
                        bar="bg-amber-500" 
                        description="High strain risks loss of control."
                      />
                      <PowerStatCard 
                        label="Exposure" 
                        value={character.stats.exposure} 
                        color="text-blue-400" 
                        bar="bg-blue-500" 
                        description="How known your powers are."
                      />
                      <PowerStatCard 
                        label="Power Control" 
                        value={character.stats.powerControl} 
                        color="text-purple-400" 
                        bar="bg-purple-500" 
                        description="Precision with your abilities."
                      />
                      <PowerStatCard 
                        label="Suspicion" 
                        value={character.stats.suspicion} 
                        color="text-rose-400" 
                        bar="bg-rose-500" 
                        description="Targets sensing manipulation."
                      />
                   </div>
                </div>

                <div className="mt-8 p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl">
                   <h4 className="text-[10px] font-black text-purple-400 uppercase italic tracking-widest mb-2">Character Narrative</h4>
                   <p className="text-[10px] text-slate-400 italic leading-relaxed">
                      You are a {character.age}-year-old {character.gender.toLowerCase()} living in {character.city}, {character.country}. 
                      Your path is currently defined as a {character.archetype}.
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Log */}
      <section className="space-y-3">
        <div className="text-[10px] font-mono text-slate-500 mb-6 uppercase tracking-widest flex items-center gap-2">
          <History className="w-3 h-3" /> Latest Simulation Events
        </div>
        <div className="space-y-4">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 items-start group"
            >
              <div className={cn(
                "w-2 h-2 rounded-full mt-2 transition-shadow shrink-0",
                i === 0 ? "bg-purple-500 shadow-[0_0_8px_#8B5CF6]" : "bg-slate-700"
              )} />
              <div className={cn(
                "text-sm leading-relaxed transition-colors",
                i === 0 ? "text-white font-medium" : "text-slate-400"
              )}>
                {log}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};
