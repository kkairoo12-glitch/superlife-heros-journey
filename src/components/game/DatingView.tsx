import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Users, Zap, Search, Star, 
  Smartphone, MapPin, Shield, Info,
  Check, X, DollarSign, Brain, Sparkles, AlertCircle, Eye
} from 'lucide-react';
import { GameState, NPC, Relationship, Gender, Archetype, PersonStats } from '../../types';
import { cn } from '../../lib/utils';
import { generateNPC, generateNpcName, generatePersonStats } from '../../lib/npcs';

interface DatingViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

type DatingType = 'Celeb' | 'App' | 'GayApp' | 'Standard' | 'Hookup' | 'MailOrder' | 'Threesome';

export const DatingView: React.FC<DatingViewProps> = ({ gameState, setGameState }) => {
  const [activeView, setActiveView] = useState<'menu' | 'filters' | 'match'>('menu');
  const [selectedType, setSelectedType] = useState<DatingType | null>(null);
  const [currentMatch, setCurrentMatch] = useState<(NPC & { metMethod?: string, protection?: boolean, birthControl?: boolean }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    ageRange: [18, 40],
    gender: 'Female' as Gender,
    celebType: 'Actor' as string,
    minNetWorth: 0,
    location: gameState.character?.city || 'Local'
  });

  const datingOptions = [
    { id: 'Standard', label: 'Find a Date', icon: Heart, desc: 'Find love in the corridors of reality.', cost: 0 },
    { id: 'App', label: 'Dating App', icon: Smartphone, desc: 'Swiping through the local grid.', cost: 0 },
    { id: 'Celeb', label: 'Celeb Dating App', icon: Star, desc: 'Exclusive access to the elite.', cost: 100000 },
    { id: 'GayApp', label: 'Gay Dating App', icon: Users, desc: 'Specific algorithms for same-sex connections.', cost: 0 },
    { id: 'Hookup', label: 'Hook Up', icon: Zap, desc: 'Casual, no-strings-attached sparks.', cost: 0 },
    { id: 'MailOrder', label: 'Mail Order Bride', icon: MapPin, desc: 'International agencies for life partners.', cost: 25000 },
    { id: 'Threesome', label: 'Threesome', icon: Users, desc: 'Expand your circle with a third party.', cost: 0 },
  ];

  const ILLEGAL_GAY_COUNTRIES = ['Saudi Arabia', 'Iran', 'Afghanistan', 'United Arab Emirates', 'Qatar', 'Yemen', 'Nigeria'];

  const generateMatch = (type: DatingType) => {
    setError(null);
    
    if (type === 'GayApp' && ILLEGAL_GAY_COUNTRIES.includes(gameState.character?.country || '')) {
       const risk = Math.random();
       if (risk > 0.3) {
         setGameState(prev => ({
           ...prev,
           logs: [`The authorities flagged your use of a restricted dating app. You were fined $1,000.`, ...prev.logs].slice(0, 50),
           character: { ...prev.character!, stats: { ...prev.character!.stats, wealth: Math.max(0, prev.character!.stats.wealth - 1000) } }
         }));
         setActiveView('menu');
         return;
       }
    }

    if (type === 'Threesome') {
       const hasPartner = gameState.relationships.some(r => r.type === 'Partner');
       if (!hasPartner) {
         setError("You need a significant other to coordinate a structured threesome.");
         setActiveView('menu');
         return;
       }
    }

    let age = Math.floor(Math.random() * (filters.ageRange[1] - filters.ageRange[0])) + filters.ageRange[0];
    let gender = filters.gender;
    
    // Sexuality-aware initial gender
    if (type === 'Standard' || type === 'Hookup' || type === 'App') {
       if (gameState.character?.sexuality === 'Straight') {
         gender = gameState.character.gender === 'Male' ? 'Female' : 'Male';
       } else if (gameState.character?.sexuality === 'Gay') {
         gender = gameState.character.gender === 'Male' ? 'Male' : 'Female';
       }
    }

    if (type === 'GayApp') {
       gender = gameState.character?.gender === 'Male' ? 'Male' : 'Female';
    }

    const npc = generateNPC(age);
    npc.gender = gender;
    npc.name = generateNpcName(gender);
    
    if (type === 'Celeb') {
      npc.stats.wealth = Math.floor(Math.random() * 10000000) + 1000000;
      npc.stats.occupation = filters.celebType;
    }

    if (type === 'MailOrder') {
      const otherCountries = ['Russia', 'Ukraine', 'Thailand', 'Philippines', 'Colombia', 'Brazil', 'Vietnam'];
      npc.country = otherCountries[Math.floor(Math.random() * otherCountries.length)];
    }

    const metMethods = {
      Standard: ['at a rooftop bar', 'through a mutual contact', 'at a charity event', 'at a local cafe'],
      App: ['by swiping right on a dating app', 'through a digital match'],
      Celeb: ['on the ultra-exclusive elite app'],
      GayApp: ['on a specialized queer platform'],
      Hookup: ['at a late-night club', 'through a casual connection app', 'at a private house party'],
      MailOrder: ['through an international matchmaking agency'],
      Threesome: ['via a double-match coordination']
    };

    const methodList = metMethods[type] || ['randomly'];
    const method = methodList[Math.floor(Math.random() * methodList.length)];

    setCurrentMatch({
      ...npc,
      metMethod: method,
      birthControl: Math.random() > 0.5,
      protection: true
    });
    setActiveView('match');
  };

  const handleInteraction = (action: 'Date' | 'Reject' | 'Hookup' | 'HookupSafe' | 'HookupRaw') => {
    if (!currentMatch || !gameState.character) return;

    if (action === 'Reject') {
      setCurrentMatch(null);
      setActiveView('menu');
      return;
    }

    if (action === 'Date') {
      const newRelation: Relationship = {
        ...currentMatch,
        type: 'Partner',
        relationship: 50,
        isPlayerMet: true
      };
      setGameState(prev => ({
        ...prev,
        relationships: [newRelation, ...prev.relationships],
        logs: [`You are now dating ${currentMatch.name}! You met ${currentMatch.metMethod}.`, ...prev.logs].slice(0, 50)
      }));
    }

    if (action.startsWith('Hookup')) {
      const isSafe = action === 'HookupSafe';
      let log = `You hooked up with ${currentMatch.name}.`;
      if (!isSafe) {
        log += " Risky business: no protection used.";
      } else {
        log += " Professional behavior: protection was utilized.";
      }
      
      setGameState(prev => ({
        ...prev,
        logs: [log, ...prev.logs].slice(0, 50)
      }));
    }

    setCurrentMatch(null);
    setActiveView('menu');
  };

  return (
    <div className="space-y-6">
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 text-[10px] text-red-400 font-bold uppercase italic">
           <AlertCircle className="w-3.5 h-3.5" />
           {error}
           <button onClick={() => setError(null)} className="ml-auto opacity-50 hover:opacity-100">
             <X className="w-3 h-3" />
           </button>
        </motion.div>
      )}

      {activeView === 'menu' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {datingOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                setSelectedType(opt.id as DatingType);
                if (opt.id === 'Standard' || opt.id === 'Hookup') {
                  generateMatch(opt.id as DatingType);
                } else {
                  setActiveView('filters');
                }
              }}
              className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center group-hover:rotate-6 transition-transform">
                <opt.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white flex justify-between items-center mb-0.5">
                   {opt.label}
                   {opt.cost > 0 && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 rounded-full border border-emerald-500/20">${opt.cost.toLocaleString()}</span>}
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {activeView === 'filters' && selectedType && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#161618] border border-white/5 rounded-3xl p-6">
           <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-600/20 rounded-2xl">
                 <Search className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-white italic uppercase leading-none mb-1">Advanced Search</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none italic">{selectedType} Settings</p>
              </div>
           </div>
           
           <div className="space-y-6">
             <div>
               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Target Age Range ({filters.ageRange[1]})</label>
               <input 
                 type="range" min="18" max="100" 
                 value={filters.ageRange[1]} 
                 onChange={(e) => setFilters({...filters, ageRange: [18, parseInt(e.target.value)]})}
                 className="w-full accent-purple-600 h-1.5 bg-black rounded-full appearance-none cursor-pointer"
               />
             </div>

             <div>
               <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Gender Strategy</label>
               <div className="flex gap-2">
                 {(['Male', 'Female', 'Non-binary'] as Gender[]).map(g => (
                   <button 
                    key={g} 
                    onClick={() => setFilters({...filters, gender: g})}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-tighter border transition-all",
                      filters.gender === g ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/20 px-4" : "bg-black/40 border-white/5 text-slate-600 hover:text-slate-400"
                    )}
                   >
                     {g}
                   </button>
                 ))}
               </div>
             </div>

             {selectedType === 'Celeb' && (
                <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Target Industry</label>
                   <div className="grid grid-cols-2 gap-2">
                     {['Athlete', 'Actor', 'Musician', 'Model', 'Influencer', 'CEO'].map(t => (
                       <button 
                        key={t}
                        onClick={() => setFilters({...filters, celebType: t})}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-black uppercase italic border transition-all",
                          filters.celebType === t ? "bg-purple-600 border-purple-400 text-white px-2" : "bg-black/40 border-white/5 text-slate-600 hover:text-slate-400"
                        )}
                       >
                         {t}
                       </button>
                     ))}
                   </div>
                </div>
             )}

             {(selectedType === 'App' || selectedType === 'GayApp') && (
               <div>
                 <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Socio-Economic Filter</label>
                 <select 
                   value={filters.minNetWorth} 
                   onChange={(e) => setFilters({...filters, minNetWorth: parseInt(e.target.value)})}
                   className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-purple-600 font-bold uppercase italic"
                 >
                   <option value="0">Doesn't Matter</option>
                   <option value="100000">$100k+ Net Worth</option>
                   <option value="500000">$500k+ Net Worth</option>
                   <option value="1000000">$1M+ Net Worth</option>
                 </select>
               </div>
             )}

             <div className="pt-8 flex gap-3">
                <button onClick={() => setActiveView('menu')} className="flex-1 py-4 border border-white/10 rounded-2xl text-[10px] font-black uppercase italic text-slate-600 hover:text-slate-200">Abandon</button>
                <button 
                  onClick={() => {
                    const cost = datingOptions.find(o => o.id === selectedType)?.cost || 0;
                    if ((gameState.character?.stats.wealth || 0) < cost) {
                      setError("Inadequate liquidity for this premium search service.");
                      return;
                    }
                    if (cost > 0) {
                       setGameState(prev => ({
                         ...prev,
                         character: { ...prev.character!, stats: { ...prev.character!.stats, wealth: prev.character!.stats.wealth - cost } }
                       }));
                    }
                    generateMatch(selectedType);
                  }}
                  className="flex-1 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase italic hover:bg-slate-200 shadow-xl"
                >
                  Find Match
                </button>
             </div>
           </div>
        </motion.div>
      )}

      {activeView === 'match' && currentMatch && (
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-[#161618] border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
           <div className="h-40 bg-gradient-to-br from-purple-800 to-indigo-900 relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-5">
                 <Heart className="w-40 h-40" />
              </div>
              <div className="absolute -bottom-10 left-8">
                 <div className="w-32 h-32 rounded-3xl bg-slate-900 border-4 border-[#161618] flex items-center justify-center text-4xl shadow-2xl">
                    {currentMatch.gender === 'Male' ? '👨' : currentMatch.gender === 'Female' ? '👩' : '🧑'}
                 </div>
              </div>
              <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                 <p className="text-[9px] font-black uppercase italic text-white tracking-widest">Match found!</p>
              </div>
           </div>

           <div className="p-8 pt-14">
              <div className="mb-8 p-1 border-b border-white/5 pb-4">
                 <h3 className="text-3xl font-black text-white italic leading-none mb-2 uppercase tracking-tighter">{currentMatch.name}, {currentMatch.age}</h3>
                 <p className="text-[10px] text-purple-400 font-black uppercase tracking-[0.2em] italic flex items-center gap-2">
                    <Search className="w-3 h-3" /> Met {currentMatch.metMethod}
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                 <MatchStat icon={Sparkles} label="Looks" value={currentMatch.stats.attractiveness} color="text-pink-400" bar="bg-pink-500" />
                 <MatchStat icon={Brain} label="Smarts" value={currentMatch.stats.intelligence} color="text-sky-400" bar="bg-sky-500" />
                 <MatchStat icon={AlertCircle} label="Craziness" value={currentMatch.stats.craziness || 0} color="text-orange-400" bar="bg-orange-500" />
                 <MatchStat icon={DollarSign} label="Money" value={currentMatch.stats.wealth > 1000000 ? 100 : (currentMatch.stats.wealth / 1000000) * 100} color="text-emerald-400" bar="bg-emerald-500" />
              </div>

              <div className="space-y-1 mb-8">
                 <MatchInfo label="Identity" value={currentMatch.gender} />
                 <MatchInfo label="Sexuality" value={currentMatch.gender === gameState.character?.gender ? 'Gay' : 'Straight'} />
                 <MatchInfo label="Vocation" value={currentMatch.stats.occupation || 'Undisclosed'} />
                 <MatchInfo label="Offspring" value={currentMatch.stats.hasChildren ? `${currentMatch.stats.childrenCount} Children` : 'None'} />
                 {currentMatch.country && <MatchInfo label="Habitat" value={currentMatch.country} />}
                 {selectedType === 'Hookup' && <MatchInfo label="Contraception" value={currentMatch.birthControl ? "Active" : "None"} />}
              </div>

              <div className="flex gap-3">
                 <button 
                  onClick={() => handleInteraction('Reject')}
                  className="flex-1 py-4 border border-white/5 bg-white/5 rounded-2xl text-[10px] font-black uppercase italic text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                 >
                   {selectedType === 'Hookup' ? 'Absolutely Not' : 'No Thanks'}
                 </button>
                 
                 {selectedType === 'Hookup' ? (
                   <button 
                    onClick={() => handleInteraction('HookupSafe')}
                    className="flex-1 py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase italic hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                   >
                     Hit That (Condom)
                   </button>
                 ) : (
                   <button 
                    onClick={() => handleInteraction('Date')}
                    className="flex-1 py-4 bg-purple-600 text-white rounded-2xl text-xs font-black uppercase italic hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                   >
                     Ask on Date
                   </button>
                 )}
              </div>

              {selectedType === 'Hookup' && (
                <button 
                  onClick={() => handleInteraction('HookupRaw')}
                  className="w-full mt-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-700 hover:text-red-500 transition-colors italic flex items-center justify-center gap-2"
                >
                  <AlertCircle className="w-3 h-3" /> Raw Dog (No Protection)
                </button>
              )}
           </div>
        </motion.div>
      )}
    </div>
  );
};

const MatchStat: React.FC<{ icon: any, label: string, value: number, color: string, bar: string }> = ({ icon: Icon, label, value, color, bar }) => (
  <div className="bg-black/20 border border-white/5 rounded-2xl p-4 flex flex-col justify-between h-24">
    <div className="flex items-center gap-2">
      <Icon className={cn("w-3.5 h-3.5", color)} />
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <div>
      <div className="flex items-end justify-between mb-1">
        <span className="text-xl font-black text-white italic">{Math.round(value)}%</span>
      </div>
      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", bar)} style={{ width: `${value}%` }} />
      </div>
    </div>
  </div>
);

const MatchInfo: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    <span className="text-[10px] font-black text-white italic uppercase tracking-tight">{value}</span>
  </div>
);
