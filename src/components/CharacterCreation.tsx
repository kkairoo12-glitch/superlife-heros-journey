
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, User, Sparkles, Wand2, Palette, Zap } from 'lucide-react';
import { Character, Appearance, Stats, Sexuality, Power, COUNTRIES, POWERS_CATEGORIES, TALENTS_LIST, Archetype, RoyaltyTitle, NOBILITY_RANKS, ROYAL_COUNTRIES } from '../types';
import { cn } from '../lib/utils';
import { CharacterAvatar } from './CharacterAvatar';

interface CharacterCreationProps {
  onComplete: (character: Character) => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: 'identity', title: 'Identity', icon: User },
  { id: 'appearance', title: 'Appearance', icon: Palette },
  { id: 'attributes', title: 'Attributes', icon: Sparkles },
  { id: 'talents', title: 'Talents', icon: Wand2 },
  { id: 'powers', title: 'Superpowers', icon: Zap },
];

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [city, setCity] = useState(COUNTRIES[0].cities[0]);
  const [sexuality, setSexuality] = useState<Sexuality>('Straight');
  const [royaltyTitle, setRoyaltyTitle] = useState<RoyaltyTitle>('None');
  
  const [archetype, setArchetype] = useState<Archetype>('Civilian');
  
  const [appearance, setAppearance] = useState<Appearance>({
    eyes: 'Blue',
    skin: 'Fair',
    brows: 'Natural',
    hair: 'Black',
    facialHair: 'None',
  });

  const [stats, setStats] = useState<Stats>({
    happiness: 50,
    health: 50,
    intelligence: 50,
    attractiveness: 50,
    powerLevel: 0,
    wealth: 100,
    karma: 50,
    willpower: 50,
    discipline: 50,
    fertility: 50,
    stress: 0,
    acting: 0,
    athleticism: 50,
    popularity: 50,
    mentalStrain: 0,
    exposure: 0,
    powerControl: 10,
    suspicion: 0,
  });

  const [selectedTalents, setSelectedTalents] = useState<string[]>([]);
  const [selectedPowers, setSelectedPowers] = useState<string[]>([]);
  const [activePowerCategory, setActivePowerCategory] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const finalPowers: Power[] = selectedPowers.map(p => ({
        id: p.toLowerCase().replace(/\s+/g, '-'),
        name: p,
        level: 1,
        maxLevel: 10,
        description: `Your mastery over ${p}.`
      }));

      onComplete({
        name: name || 'Hero',
        gender,
        country: selectedCountry.name,
        city,
        appearance,
        stats,
        sexuality,
        archetype,
        royaltyTitle,
        talents: selectedTalents,
        powers: finalPowers,
        age: 0,
        daysLived: 0,
        isAlive: true,
        job: null,
        educationLevel: 'None',
        educationYears: 0,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const toggleTalent = (talent: string) => {
    if (selectedTalents.includes(talent)) {
      setSelectedTalents(selectedTalents.filter(t => t !== talent));
    } else if (selectedTalents.length < 3) {
      setSelectedTalents([...selectedTalents, talent]);
    }
  };

  const togglePower = (power: string) => {
    if (selectedPowers.includes(power)) {
      setSelectedPowers(selectedPowers.filter(p => p !== power));
    } else {
      setSelectedPowers([...selectedPowers, power]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-center mb-4 tracking-tighter bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent italic">
          Create Your Super Life
        </h1>
        <p className="text-slate-500 text-center text-[10px] uppercase tracking-[0.3em] font-bold">Begin your extraordinary journey</p>
      </div>

      {/* Progress Stepper */}
      <div className="flex justify-between items-center mb-12 relative px-4">
        <div className="absolute left-8 right-8 h-px bg-white/5 top-1/2 -translate-y-1/2 z-0" />
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border",
                  isActive ? "bg-purple-600 border-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.3)]" : 
                  isCompleted ? "bg-emerald-600 border-emerald-400" : "bg-[#161618] border-white/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive || isCompleted ? "text-white" : "text-slate-600")} />
              </div>
              <span className={cn(
                "mt-2 text-[10px] font-bold uppercase tracking-wider",
                isActive ? "text-purple-400" : isCompleted ? "text-emerald-500" : "text-slate-700"
              )}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#161618] border border-white/5 rounded-3xl p-8 backdrop-blur-sm shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-indigo-600" />
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-[0.2em] pl-1">Full Name</label>
              <input
                type="text"
                placeholder="Enter your name..."
                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-purple-500 transition-colors text-white placeholder:text-slate-800"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-[0.2em] pl-1">Life Path (Archetype)</label>
                <div className="flex flex-wrap gap-2">
                  {(['Civilian', 'Hero', 'Villain', 'Anti-Hero', 'Anti-Villain'] as Archetype[]).map(path => (
                    <button
                      key={path}
                      onClick={() => setArchetype(path)}
                      className={cn(
                        "px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-tight italic transition-all",
                        archetype === path 
                          ? "bg-purple-600 border-purple-400 text-white shadow-lg" 
                          : "bg-black/40 border-white/5 text-slate-600 hover:text-slate-400"
                      )}
                    >
                      {path.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-[0.2em] pl-1">Gender</label>
                <select
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option className="bg-[#161618]">Male</option>
                  <option className="bg-[#161618]">Female</option>
                  <option className="bg-[#161618]">Non-binary</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-[0.2em] pl-1">Sexuality</label>
                <select
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white"
                  value={sexuality}
                  onChange={(e) => setSexuality(e.target.value as Sexuality)}
                >
                  <option className="bg-[#161618]">Straight</option>
                  <option className="bg-[#161618]">Bisexual</option>
                  <option className="bg-[#161618]">Gay</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-[0.2em] pl-1">Country</label>
                <select
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white"
                  value={selectedCountry.name}
                  onChange={(e) => {
                    const country = COUNTRIES.find(c => c.name === e.target.value)!;
                    setSelectedCountry(country);
                    setCity(country.cities[0]);
                    if (!ROYAL_COUNTRIES.includes(country.name)) setRoyaltyTitle('None');
                  }}
                >
                  {COUNTRIES.map(c => <option key={c.name} className="bg-[#161618]">{c.name}</option>)}
                </select>
              </div>
              {ROYAL_COUNTRIES.includes(selectedCountry.name) && (
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-[0.2em] pl-1">Royalty Status</label>
                  <select
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white"
                    value={royaltyTitle}
                    onChange={(e) => setRoyaltyTitle(e.target.value as RoyaltyTitle)}
                  >
                    <option className="bg-[#161618]" value="None">None</option>
                    {NOBILITY_RANKS.map(rank => (
                      <option key={rank} className="bg-[#161618]" value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-[0.2em] pl-1">Place of Birth</label>
                <select
                  className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                >
                  {selectedCountry.cities.map(c => <option key={c} className="bg-[#161618]">{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center p-6 bg-black/20 rounded-2xl border border-white/5">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-6 font-bold italic">Simulated Adult Projection (Age 18)</p>
              <CharacterAvatar appearance={appearance} gender={gender} className="w-48 h-96" />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {(Object.keys(appearance) as Array<keyof Appearance>).map(key => (
                <div key={key}>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-[0.2em] pl-1">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <select
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 outline-none focus:border-purple-500 text-white"
                    value={appearance[key]}
                    onChange={(e) => setAppearance({ ...appearance, [key]: e.target.value })}
                  >
                    {key === 'eyes' && ['Blue', 'Green', 'Brown', 'Hazel', 'Grey'].map(o => <option key={o} className="bg-[#161618]">{o}</option>)}
                    {key === 'skin' && ['Fair', 'Light', 'Medium', 'Tan', 'Dark'].map(o => <option key={o} className="bg-[#161618]">{o}</option>)}
                    {key === 'brows' && ['Natural', 'Thin', 'Thick', 'Arched'].map(o => <option key={o} className="bg-[#161618]">{o}</option>)}
                    {key === 'hair' && ['Black', 'Brown', 'Blonde', 'Red', 'Bald', 'Grey'].map(o => <option key={o} className="bg-[#161618]">{o}</option>)}
                    {key === 'facialHair' && ['None', 'Stubble', 'Beard', 'Mustache', 'Goatee'].map(o => <option key={o} className="bg-[#161618]">{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {(Object.keys(stats) as Array<keyof Stats>).filter(k => k !== 'powerLevel' && k !== 'wealth').map(key => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-[0.2em]">
                    {key}
                  </label>
                  <span className="text-[10px] font-mono text-purple-400 font-bold">{stats[key]}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full h-1.5 bg-black rounded-lg appearance-none cursor-pointer accent-purple-500"
                  value={stats[key]}
                  onChange={(e) => setStats({ ...stats, [key]: parseInt(e.target.value) })}
                />
              </div>
            ))}
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold text-center mb-6 italic">Select up to 3 Special Talents</p>
            <div className="grid grid-cols-3 gap-3">
              {TALENTS_LIST.map(talent => (
                <button
                  key={talent}
                  onClick={() => toggleTalent(talent)}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-300 text-[10px] font-black uppercase tracking-tight italic",
                    selectedTalents.includes(talent)
                      ? "bg-purple-600/20 border-purple-500 text-purple-100 shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                      : "bg-black/40 border-white/5 text-slate-500 hover:border-slate-700 hover:text-slate-200"
                  )}
                >
                  {talent}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6">
            <header className="flex justify-between items-end mb-4">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold italic mb-1">Power Manifestation</p>
                <div className="flex gap-2">
                   {POWERS_CATEGORIES.map((cat, idx) => (
                     <button
                       key={cat.title}
                       onClick={() => setActivePowerCategory(idx)}
                       className={cn(
                         "text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded transition-all italic border",
                         activePowerCategory === idx 
                          ? "bg-purple-600 border-purple-400 text-white" 
                          : "bg-black/20 border-white/5 text-slate-600 hover:text-slate-400"
                       )}
                     >
                       {cat.title}
                     </button>
                   ))}
                </div>
              </div>
              <div className="text-right">
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manifested</span>
                 <p className="text-xl font-black text-purple-400 italic leading-none">{selectedPowers.length}</p>
              </div>
            </header>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activePowerCategory}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-3 gap-2 h-[340px] overflow-y-auto pr-2 custom-scrollbar content-start"
              >
                {POWERS_CATEGORIES[activePowerCategory].powers.map(power => (
                  <button
                    key={power}
                    onClick={() => togglePower(power)}
                    className={cn(
                      "p-3 rounded-xl border transition-all duration-200 text-[10px] text-left px-4 group flex items-center justify-between font-bold uppercase tracking-tight italic min-h-[50px]",
                      selectedPowers.includes(power)
                        ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                        : "bg-black/40 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300"
                    )}
                  >
                    <span className="leading-tight pr-2">{power}</span>
                    {selectedPowers.includes(power) && <Zap className="w-3 h-3 fill-current shrink-0" />}
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-12 flex justify-between">
          {currentStep === 0 && onCancel ? (
             <button
              onClick={onCancel}
              className="px-6 py-3 rounded-xl flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-all text-slate-500 hover:text-white"
             >
               <ChevronLeft className="w-4 h-4" /> Cancel
             </button>
          ) : (
             <button
                onClick={handleBack}
                className={cn(
                  "px-6 py-3 rounded-xl flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest transition-all",
                  currentStep === 0 ? "opacity-0 pointer-events-none" : "text-slate-500 hover:text-white"
                )}
             >
                <ChevronLeft className="w-4 h-4" /> Back
             </button>
          )}
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center gap-2 text-xs font-black uppercase italic shadow-lg shadow-purple-600/20 transition-all active:scale-95 tracking-tight"
          >
            {currentStep === STEPS.length - 1 ? 'Start Your Life' : 'Continue'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
