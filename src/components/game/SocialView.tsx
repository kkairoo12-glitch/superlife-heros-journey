import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, User as UserIcon, Zap, Heart, Shield, X, Eye, Info, MessageSquare, Flame, Brain, ShieldAlert, Sparkles } from 'lucide-react';
import { GameState, NPC, Relationship, Archetype } from '../../types';
import { cn } from '../../lib/utils';
import { PersonStatsCard } from './PersonStatsCard';

interface SocialViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

export const SocialView: React.FC<SocialViewProps> = ({ gameState, setGameState }) => {
  const [selectedNPC, setSelectedNPC] = useState<NPC | Relationship | null>(null);
  const [activeInfoTab, setActiveInfoTab] = useState<'info' | 'powers' | 'interact'>('info');
  
  const [mainTab, setMainTab] = useState<'relationships' | 'discover'>('relationships');
  const [activeArchetype, setActiveArchetype] = useState<Archetype | 'All'>('All');
  const ARCHETYPES: Array<Archetype | 'All'> = ['All', 'Hero', 'Villain', 'Anti-Hero', 'Anti-Villain', 'Civilian'];
  const [activeRelCategory, setActiveRelCategory] = useState<'Family' | 'Friends' | 'Lovers'>('Family');

  const filteredNPCs = activeArchetype === 'All' 
    ? gameState.npcs 
    : gameState.npcs.filter(npc => npc.archetype === activeArchetype);

  const family = gameState.relationships.filter(r => ['Parent', 'Sibling', 'Child'].includes(r.type));
  const friends = gameState.relationships.filter(r => r.type === 'Friend');
  const lovers = gameState.relationships.filter(r => ['Partner', 'Ex', 'Fling', 'Side Piece'].includes(r.type));

  const loverGroups = {
    'Partners': lovers.filter(l => l.type === 'Partner'),
    'Exes': lovers.filter(l => l.type === 'Ex'),
    'Flings': lovers.filter(l => l.type === 'Fling'),
    'Side Pieces': lovers.filter(l => l.type === 'Side Piece'),
  };

  const getNPCIcon = (npc: NPC | Relationship) => {
    if (npc.archetype === 'Hero') return <Shield className="w-4 h-4" />;
    if (npc.archetype === 'Villain') return <Zap className="w-4 h-4 text-red-400" />;
    return <UserIcon className="w-4 h-4" />;
  };

  const getArchetypeColor = (npc: NPC | Relationship) => {
    switch (npc.archetype) {
      case 'Hero': return "bg-blue-600/20 text-blue-400 border-blue-500/30";
      case 'Villain': return "bg-red-600/20 text-red-400 border-red-500/30";
      case 'Anti-Hero': return "bg-indigo-600/20 text-indigo-400 border-indigo-500/30";
      case 'Anti-Villain': return "bg-orange-600/20 text-orange-400 border-orange-500/30";
      default: return "bg-slate-600/20 text-slate-400 border-white/5";
    }
  };

  const getPower = (powerName: string) => gameState.character?.powers.find(p => p.name.includes(powerName));

  const applyPowerEffects = (powerName: string, intensity: number = 1) => {
    const power = getPower(powerName);
    if (!power) return { success: false, strain: 0, exposure: 0, suspicion: 0 };
    const control = gameState.character?.stats.powerControl || 10;
    const success = Math.random() * 100 < (control + (power.level * 5));
    const baseStrain = 5 * intensity;
    const baseExposure = 2 * intensity;
    const baseSuspicion = 3 * intensity;
    const strain = Math.max(1, baseStrain - (control / 20));
    const exposure = Math.max(0, baseExposure - (control / 25));
    const suspicion = success ? Math.max(0, baseSuspicion - (control / 15)) : baseSuspicion * 2;
    return { success, strain, exposure, suspicion };
  };

  const logs = (msg: string) => {
    setGameState(prev => ({ ...prev, logs: [msg, ...prev.logs].slice(0, 50) }));
  };

  const handleTelepathy = (npc: NPC | Relationship) => {
    const effects = applyPowerEffects('Telepathy', 1);
    
    setGameState(prev => {
      const stats = { ...prev.character!.stats };
      stats.mentalStrain = Math.min(100, stats.mentalStrain + effects.strain);
      stats.exposure = Math.min(100, stats.exposure + effects.exposure);
      stats.suspicion = Math.min(100, stats.suspicion + effects.suspicion);
      return { ...prev, character: { ...prev.character!, stats } };
    });

    if (!effects.success) {
      logs(`Telepathy Failed: You tried to read ${npc.name}'s mind but hit a mental wall. You have a splitting headache.`);
      return;
    }

    const traits = [
      `Intelligence: ${npc.stats.intelligence}%`,
      `Happiness: ${npc.stats.happiness}%`,
      `Craziness: ${npc.stats.craziness}%`,
      `Relationship: ${npc.relationship}%`,
      `Archetype: ${npc.archetype}`
    ];
    logs(`Telepathy Success: You peeked into ${npc.name}'s thoughts. ${traits.join(' | ')}`);
  };

  const handleMindControl = (npc: NPC | Relationship, layer: 'Nudge' | 'Persuade' | 'Override') => {
    const intensity = layer === 'Nudge' ? 1 : layer === 'Persuade' ? 2 : 4;
    const effects = applyPowerEffects('Mind Control', intensity);
    
    setGameState(prev => {
      const stats = { ...prev.character!.stats };
      stats.mentalStrain = Math.min(100, stats.mentalStrain + effects.strain);
      stats.exposure = Math.min(100, stats.exposure + effects.exposure);
      stats.suspicion = Math.min(100, stats.suspicion + (effects.suspicion * (layer === 'Override' ? 2 : 1)));
      
      let newRel = npc.relationship;
      let msg = "";

      if (!effects.success) {
        msg = `Mind Control Disaster: ${npc.name} felt your mental fingers in their brain! They are absolutely horrified and suspicious.`;
        newRel = Math.max(0, newRel - 40);
      } else {
        if (layer === 'Nudge') {
          newRel = Math.min(100, newRel + 10);
          msg = `Nudge: You subtly adjusted ${npc.name}'s perception of you. They feel a warm, unearned trust.`;
        } else if (layer === 'Persuade') {
          newRel = Math.min(100, newRel + 25);
          msg = `Persuade: You forced ${npc.name} to agree with your current goals. Their eyes glazed over for a second.`;
        } else {
          newRel = 100;
          msg = `Override: Total Domain. ${npc.name} is now a puppet to your will. They would do anything for you.`;
        }
      }

      const updatedNpcs = prev.npcs.map(n => n.id === npc.id ? { ...n, relationship: newRel } : n);
      const updatedRels = prev.relationships.map(r => r.id === npc.id ? { ...r, relationship: newRel } : r);

      logs(msg);
      return { ...prev, character: { ...prev.character!, stats }, npcs: updatedNpcs, relationships: updatedRels };
    });
    setSelectedNPC(null);
  };

  const interactStandard = (npc: NPC | Relationship, action: string) => {
    let relChange = 10;
    let msg = `You had a ${action} with ${npc.name}.`;
    
    if (action === 'Argue') {
      relChange = -15;
      msg = `You had a heated argument with ${npc.name}.`;
    }

    setGameState(prev => {
      const updatedNpcs = prev.npcs.map(n => n.id === npc.id ? { ...n, relationship: Math.max(0, Math.min(100, n.relationship + relChange)) } : n);
      const updatedRels = prev.relationships.map(r => r.id === npc.id ? { ...r, relationship: Math.max(0, Math.min(100, r.relationship + relChange)) } : r);
      return { ...prev, npcs: updatedNpcs, relationships: updatedRels };
    });
    logs(msg);
    setSelectedNPC(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tight uppercase">Social Networking</h2>
          <p className="text-xs text-slate-500 font-medium italic">Your status in the superhuman society.</p>
        </div>
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
          <button 
            onClick={() => setMainTab('relationships')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase italic transition-all",
              mainTab === 'relationships' ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-400"
            )}
          >
            Circle
          </button>
          <button 
            onClick={() => setMainTab('discover')}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase italic transition-all",
              mainTab === 'discover' ? "bg-purple-600 text-white" : "text-slate-500 hover:text-slate-400"
            )}
          >
            People
          </button>
        </div>
      </header>

      {mainTab === 'discover' ? (
        <div className="space-y-6">
          <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            {ARCHETYPES.map(arc => (
              <button
                key={arc}
                onClick={() => setActiveArchetype(arc)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter transition-all shrink-0 border",
                  activeArchetype === arc 
                    ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/20" 
                    : "bg-white/5 border-white/5 text-slate-500 hover:text-slate-300"
                )}
              >
                {arc.replace('-', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredNPCs.map(npc => (
              <NPCButton key={npc.id} npc={npc} onClick={() => setSelectedNPC(npc)} colorClass={getArchetypeColor(npc)} icon={getNPCIcon(npc)} />
            ))}
            {filteredNPCs.length === 0 && <EmptyState icon={Users} text={`No ${activeArchetype === 'All' ? 'NPCs' : activeArchetype + 's'} encountered.`} />}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
            {(['Family', 'Friends', 'Lovers'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveRelCategory(cat)}
                className={cn(
                  "flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all",
                  activeRelCategory === cat ? "bg-white/10 text-white shadow-inner" : "text-slate-500 hover:text-slate-400"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {activeRelCategory === 'Family' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {family.length > 0 ? family.map(r => (
                  <NPCButton key={r.id} npc={r} onClick={() => setSelectedNPC(r)} colorClass={getArchetypeColor(r)} subText={r.type} icon={getNPCIcon(r)} />
                )) : <EmptyState icon={Users} text="No family records found." />}
              </div>
            )}

            {activeRelCategory === 'Friends' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {friends.length > 0 ? friends.map(r => (
                  <NPCButton key={r.id} npc={r} onClick={() => setSelectedNPC(r)} colorClass={getArchetypeColor(r)} subText="Friend" icon={getNPCIcon(r)} />
                )) : <EmptyState icon={Users} text="No friends listed." />}
              </div>
            )}

            {activeRelCategory === 'Lovers' && (
              <div className="space-y-6">
                {Object.entries(loverGroups).map(([groupName, list]) => (
                  <div key={groupName} className={cn(list.length === 0 && "hidden")}>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-l-2 border-purple-600 pl-2 ml-1">{groupName}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {list.map(r => (
                        <NPCButton key={r.id} npc={r} onClick={() => setSelectedNPC(r)} colorClass={getArchetypeColor(r)} subText={r.type} icon={getNPCIcon(r)} />
                      ))}
                    </div>
                  </div>
                ))}
                {lovers.length === 0 && <EmptyState icon={Heart} text="No romantic history yet." />}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedNPC && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNPC(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="relative w-full max-w-lg bg-[#161618] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500" />
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-4">
                    <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border", getArchetypeColor(selectedNPC))}>
                      {getNPCIcon(selectedNPC)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white italic leading-none mb-1 uppercase tracking-tight">{selectedNPC.name}</h3>
                      <div className="flex gap-2 items-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{selectedNPC.archetype}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-800" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Age {selectedNPC.age}</span>
                        {'type' in selectedNPC && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-800" />
                            <span className="text-[10px] font-black text-purple-400 uppercase">{selectedNPC.type}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedNPC(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex gap-2 mb-6">
                  <button onClick={() => setActiveInfoTab('info')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter transition-all flex items-center gap-2", activeInfoTab === 'info' ? "bg-purple-600 text-white" : "bg-white/5 text-slate-500")}>
                    <Info className="w-3.5 h-3.5" /> Identity
                  </button>
                  <button onClick={() => setActiveInfoTab('powers')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter transition-all flex items-center gap-2", activeInfoTab === 'powers' ? "bg-purple-600 text-white" : "bg-white/5 text-slate-500")}>
                    <Zap className="w-3.5 h-3.5" /> Powers
                  </button>
                  <button onClick={() => setActiveInfoTab('interact')} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter transition-all flex items-center gap-2", activeInfoTab === 'interact' ? "bg-purple-600 text-white" : "bg-white/5 text-slate-500")}>
                    <MessageSquare className="w-3.5 h-3.5" /> Interact
                  </button>
                </div>

                <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {activeInfoTab === 'info' && (
                    <PersonStatsCard stats={selectedNPC.stats} age={selectedNPC.age} gender={selectedNPC.gender} />
                  )}
                  
                  {activeInfoTab === 'powers' && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Zap className="w-3 h-3 text-purple-400" /> Superpowers
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {(selectedNPC.powers || []).map(power => (
                          <div key={power.id} className="p-3 bg-black/40 border border-white/5 rounded-xl flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-200">{power.name}</span>
                            <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">Lvl {power.level}</span>
                          </div>
                        ))}
                        {(selectedNPC.powers || []).length === 0 && <p className="text-[10px] text-slate-500 italic">No manifested powers detected.</p>}
                      </div>
                    </div>
                  )}

                  {activeInfoTab === 'interact' && (
                    <div className="space-y-6">
                       <section>
                          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Normal Actions</h4>
                          <div className="grid grid-cols-2 gap-2">
                             <button onClick={() => interactStandard(selectedNPC, 'Conversation')} className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase italic text-slate-300 hover:bg-white/10 transition-all">Spend Time</button>
                             <button onClick={() => interactStandard(selectedNPC, 'Argue')} className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] font-black uppercase italic text-red-400 hover:bg-red-500/20 transition-all">Argue</button>
                             <button onClick={() => interactStandard(selectedNPC, 'Gift')} className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase italic text-emerald-400 hover:bg-emerald-500/20 transition-all">Give Gift</button>
                             <button onClick={() => interactStandard(selectedNPC, 'Flirt')} className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl text-[10px] font-black uppercase italic text-pink-400 hover:bg-pink-500/20 transition-all">Flirt</button>
                          </div>
                       </section>

                       {(getPower('Telepathy') || getPower('Mind Control')) && (
                          <section>
                             <h4 className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-3 italic">Power Approach</h4>
                             <div className="grid grid-cols-1 gap-2">
                                {getPower('Telepathy') && (
                                   <button 
                                      onClick={() => handleTelepathy(selectedNPC)}
                                      className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-between group hover:bg-purple-600/30 transition-all"
                                   >
                                      <div className="text-left">
                                         <div className="text-[10px] font-black text-purple-200 uppercase italic">Read Thoughts</div>
                                         <div className="text-[8px] text-purple-400/70 uppercase font-black">Reveals Stats & Secrets</div>
                                      </div>
                                      <Brain className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                                   </button>
                                )}
                                {getPower('Mind Control') && (
                                   <div className="space-y-2">
                                      <button 
                                          onClick={() => handleMindControl(selectedNPC, 'Nudge')}
                                          className="w-full p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl flex items-center justify-between group hover:bg-indigo-600/30 transition-all"
                                      >
                                          <div className="text-left">
                                             <div className="text-[10px] font-black text-indigo-200 uppercase italic">Nudge (Mental Level 1)</div>
                                             <div className="text-[8px] text-indigo-400/70 uppercase font-black">Slight Influence • Low Risk</div>
                                          </div>
                                          <Sparkles className="w-4 h-4 text-indigo-400" />
                                      </button>
                                      <button 
                                          onClick={() => handleMindControl(selectedNPC, 'Persuade')}
                                          className="w-full p-3 bg-purple-600/20 border border-purple-500/30 rounded-xl flex items-center justify-between group hover:bg-purple-600/30 transition-all"
                                      >
                                          <div className="text-left">
                                             <div className="text-[10px] font-black text-purple-200 uppercase italic">Persuade (Mental Level 2)</div>
                                             <div className="text-[8px] text-purple-400/70 uppercase font-black">Moderate Control • Medium Risk</div>
                                          </div>
                                          <Zap className="w-4 h-4 text-purple-400" />
                                      </button>
                                      <button 
                                          onClick={() => handleMindControl(selectedNPC, 'Override')}
                                          className="w-full p-3 bg-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-between group hover:bg-red-600/30 transition-all"
                                      >
                                          <div className="text-left">
                                             <div className="text-[10px] font-black text-red-200 uppercase italic">Override (Mental Level 3)</div>
                                             <div className="text-[8px] text-red-400/70 uppercase font-black">Full Domain • High Risk & Consequences</div>
                                          </div>
                                          <ShieldAlert className="w-4 h-4 text-red-400" />
                                      </button>
                                   </div>
                                )}
                             </div>
                          </section>
                       )}
                    </div>
                  )}

                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Relationship</div>
                      <div className="text-xl font-black text-white italic uppercase">{selectedNPC.relationship}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NPCButton: React.FC<{ npc: NPC | Relationship, onClick: () => void, colorClass: string, icon: React.ReactNode, subText?: string }> = ({ npc, onClick, colorClass, icon, subText }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-left"
  >
    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-xl border", colorClass)}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="text-sm font-bold text-white tracking-tight">{npc.name}</div>
      <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
        {subText || npc.archetype} • Age {npc.age}
      </div>
    </div>
    <div className="text-right">
      <div className="h-1.5 w-12 bg-slate-800 rounded-full overflow-hidden mb-1">
        <div className="h-full bg-purple-500" style={{ width: `${npc.relationship}%` }} />
      </div>
      <Eye className="w-4 h-4 text-slate-600 ml-auto" />
    </div>
  </button>
);

const EmptyState: React.FC<{ icon: any, text: string }> = ({ icon: Icon, text }) => (
  <div className="col-span-full py-16 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl">
    <Icon className="w-12 h-12 text-slate-700 mx-auto mb-3 opacity-50" />
    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic px-8">{text}</p>
  </div>
);
