import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Dumbbell, Scissors, Skull, Dice6, Trophy, Heart, 
  Stethoscope, ShoppingBag, Palmtree, Ghost, Zap, 
  BookOpen, Music, Users, Baby, Brain
} from 'lucide-react';
import { GameState } from '../../types';
import { cn } from '../../lib/utils';
import { DatingView } from './DatingView';

interface ActivitiesViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const CATEGORIES = [
  { id: 'mindbody', label: 'Mind & Body', icon: Dumbbell, color: 'text-emerald-400' },
  { id: 'salon', label: 'Salon & Spa', icon: Scissors, color: 'text-pink-400' },
  { id: 'underworld', label: 'Black Market', icon: Skull, color: 'text-red-500' },
  { id: 'gambling', label: 'Casino & Betting', icon: Dice6, color: 'text-amber-400' },
  { id: 'travel', label: 'Vacation', icon: Palmtree, color: 'text-cyan-400' },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag, color: 'text-indigo-400' },
  { id: 'doctor', label: 'Doctor', icon: Stethoscope, color: 'text-blue-400' },
  { id: 'love', label: 'Love & Dating', icon: Heart, color: 'text-rose-400' },
  { id: 'nightlife', label: 'Nightlife', icon: Music, color: 'text-purple-400' },
  { id: 'other', label: 'Miscellaneous', icon: Users, color: 'text-neutral-400' },
];

const SUB_ACTIVITIES: Record<string, { name: string, effect: () => void }[]> = {
  mindbody: [
    { name: 'Acting Lessons', effect: () => {} },
    { name: 'Read Book', effect: () => {} },
    { name: 'Dieting', effect: () => {} },
    { name: 'Gym', effect: () => {} },
    { name: 'Instrument Lessons', effect: () => {} },
    { name: 'Martial Arts', effect: () => {} },
    { name: 'Meditation', effect: () => {} },
    { name: 'Modeling Lessons', effect: () => {} },
    { name: 'Voice Lessons', effect: () => {} },
    { name: 'Walk', effect: () => {} },
  ],
  salon: [
    { name: 'Barber', effect: () => {} },
    { name: 'Dye Job', effect: () => {} },
    { name: 'Massage', effect: () => {} },
    { name: 'Nail Salon', effect: () => {} },
    { name: 'Tanning Salon', effect: () => {} },
    { name: 'Waxing Salon', effect: () => {} },
  ],
  gambling: [
    { name: 'Casino', effect: () => {} },
    { name: 'Lottery', effect: () => {} },
    { name: 'Horse Races', effect: () => {} },
    { name: 'Racing', effect: () => {} },
  ],
  other: [
    { name: 'Adoption', effect: () => {} },
    { name: 'Accessories', effect: () => {} },
    { name: 'Emigrate', effect: () => {} },
    { name: 'Fertility Clinic', effect: () => {} },
    { name: 'Movie Theater', effect: () => {} },
    { name: 'Rehab', effect: () => {} },
  ]
};

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({ gameState, setGameState }) => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

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

  const performActivity = (act: string, powerUsed?: string) => {
    setGameState(prev => {
      const stats = { ...prev.character!.stats };
      let logs = [...prev.logs];
      
      if (powerUsed) {
         const effects = applyPowerEffects(powerUsed, act === 'Heal Self' ? 3 : 2);
         stats.mentalStrain = Math.min(100, stats.mentalStrain + effects.strain);
         stats.exposure = Math.min(100, stats.exposure + effects.exposure);
         stats.suspicion = Math.min(100, stats.suspicion + effects.suspicion);

         if (!effects.success) {
            logs = [`Power Failure: Your attempt to use ${powerUsed} during ${act} backfired! You took mental damage.`, ...logs];
            stats.happiness = Math.max(0, stats.happiness - 10);
            return { ...prev, character: { ...prev.character!, stats }, logs: logs.slice(0, 50) };
         }
      }

      switch (act) {
        case 'Heal Self':
          stats.health = 100;
          logs = [`You bathed yourself in healing energy. Total cellular restoration.`, ...logs];
          break;
        case 'Intimidate':
          stats.karma = Math.max(0, stats.karma - 10);
          logs = [`You used your Super Strength to effortlessly lift a car. The witness is terrified and will do whatever you say.`, ...logs];
          break;
        case 'Control Training':
          stats.powerControl = Math.min(100, stats.powerControl + 5);
          logs = [`You spent hours focusing your energy. Power Control increased to ${stats.powerControl}%!`, ...logs];
          break;
        case 'Acting Lessons':
          const dramaMember = prev.character?.school?.activities.find(a => a.name === 'Drama' && a.isMember);
          const gain = dramaMember ? 10 : 5;
          stats.acting = Math.min(100, stats.acting + gain);
          logs = [`You took acting lessons. Your acting skill is now ${stats.acting}%!`, ...logs];
          break;
        case 'Gym':
          stats.athleticism = Math.min(100, stats.athleticism + 5);
          stats.health = Math.min(100, stats.health + 2);
          logs = [`You hit the gym and feel stronger.`, ...logs];
          break;
        case 'Read Book':
          stats.intelligence = Math.min(100, stats.intelligence + 3);
          logs = [`You read a book and feel smarter.`, ...logs];
          break;
        default:
          logs = [`You did: ${act}`, ...logs];
      }

      return {
        ...prev,
        character: {
          ...prev.character!,
          stats
        },
        logs: logs.slice(0, 50)
      };
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <header className="mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter italic text-white">City Hub</h2>
        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Explore the world</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className="bg-[#161618] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-purple-500/50 transition-all text-center relative group overflow-hidden h-28"
          >
             <cat.icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", cat.color)} />
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-200">{cat.label}</p>
             <div className="absolute -bottom-2 -right-2 opacity-5 scale-150 rotate-12">
                <cat.icon className="w-12 h-12 text-white" />
             </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedCat && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl p-6 flex flex-col items-center justify-center"
          >
            <div className="max-w-md w-full bg-[#161618] border border-white/5 rounded-3xl p-8 shadow-2xl overflow-y-auto custom-scrollbar max-h-[80vh]">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-black/40 rounded-2xl border border-white/5">
                             {(() => {
                                 const Icon = CATEGORIES.find(c => c.id === selectedCat)?.icon || Users;
                                 return <Icon className={cn("w-6 h-6", CATEGORIES.find(c => c.id === selectedCat)?.color)} />;
                             })()}
                        </div>
                        <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">
                            {CATEGORIES.find(c => c.id === selectedCat)?.label}
                        </h3>
                    </div>
                    <button onClick={() => setSelectedCat(null)} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-white px-2 py-1">Close</button>
                </div>

                {selectedCat === 'love' ? (
                   <DatingView gameState={gameState} setGameState={setGameState} />
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                       {/* Normal Sub Activities */}
                       {(SUB_ACTIVITIES[selectedCat] || [{ name: 'System restricted temporarily', effect: () => {} }]).map(act => (
                           <button
                               key={act.name}
                               onClick={() => {
                                   performActivity(act.name);
                                   setSelectedCat(null);
                               }}
                               className="w-full bg-black/40 border border-white/5 p-4 rounded-xl flex items-center justify-between hover:border-purple-500 hover:bg-purple-500/5 transition-all text-left group"
                           >
                               <span className="text-xs font-bold uppercase tracking-wide text-slate-300 group-hover:text-white">{act.name}</span>
                               <Zap className="w-4 h-4 text-slate-800 group-hover:text-purple-500 transition-colors" />
                           </button>
                       ))}

                       {/* Power Options */}
                       {selectedCat === 'doctor' && getPower('Healing') && (
                          <button
                            onClick={() => {
                                performActivity('Heal Self', 'Healing');
                                setSelectedCat(null);
                            }}
                            className="w-full bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl flex items-center justify-between hover:bg-emerald-500/20 transition-all text-left"
                          >
                             <div>
                                <span className="block text-xs font-black uppercase italic text-emerald-400">Divine Healing</span>
                                <span className="text-[8px] text-emerald-500/70 font-bold uppercase">Heal to 100% Instantly</span>
                             </div>
                             <Heart className="w-5 h-5 text-emerald-400" />
                          </button>
                       )}

                       {selectedCat === 'underworld' && getPower('Super Strength') && (
                          <button
                            onClick={() => {
                                performActivity('Intimidate', 'Super Strength');
                                setSelectedCat(null);
                            }}
                            className="w-full bg-purple-500/10 border border-purple-500/30 p-4 rounded-xl flex items-center justify-between hover:bg-purple-500/20 transition-all text-left"
                          >
                             <div>
                                <span className="block text-xs font-black uppercase italic text-purple-400">Brute Intimidation</span>
                                <span className="text-[8px] text-purple-500/70 font-bold uppercase">Force Co-operation</span>
                             </div>
                             <Dumbbell className="w-5 h-5 text-purple-400" />
                          </button>
                       )}

                       {selectedCat === 'mindbody' && (
                          <button
                            onClick={() => {
                                performActivity('Control Training');
                                setSelectedCat(null);
                            }}
                            className="w-full bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl flex items-center justify-between hover:bg-indigo-500/20 transition-all text-left"
                          >
                             <div>
                                <span className="block text-xs font-black uppercase italic text-indigo-400">Power Focus</span>
                                <span className="text-[8px] text-indigo-500/70 font-bold uppercase">Increase Power Control</span>
                             </div>
                             <Brain className="w-5 h-5 text-indigo-400" />
                          </button>
                       )}
                  </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
