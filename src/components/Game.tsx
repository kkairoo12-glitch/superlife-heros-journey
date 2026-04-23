
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Brain, User, Zap, Wallet, 
  Briefcase, GraduationCap, Users, 
  Activity, LayoutGrid, Share2, TrendingUp,
  History, Plus
} from 'lucide-react';
import { Character, GameState, Asset, Relationship, TimeInterval, NPC } from '../types';
import { generateYearlyEvent } from '../lib/gemini';
import { cn } from '../lib/utils';
import { saveGame, loadGame } from '../lib/saveSystem';
import { generateInitialNPCs, generateGender, generateNpcName, generatePersonStats, generateInitialRelationships } from '../lib/npcs';

// Sub-components
import { Dashboard } from './game/Dashboard';
import { JobsView } from './game/JobsView';
import { ActivitiesView } from './game/ActivitiesView';
import { AssetsView } from './game/AssetsView';
import { SocialView } from './game/SocialView';
import { SchoolView } from './game/SchoolView';
import { SocialMediaView } from './game/SocialMediaView';
import { EducationModal } from './game/EducationModal';
import { generateSchool } from '../lib/school';
import { generateHigherEd } from '../lib/higherEd';
import { EducationTier, MajorType } from '../types';

interface GameProps {
  initialCharacter: Character;
  onExitToMenu: () => void;
}

export const Game: React.FC<GameProps> = ({ initialCharacter, onExitToMenu }) => {
  const [showEduModal, setShowEduModal] = useState(false);
  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadGame() as any;
    if (saved) {
      // Migration for Character
      if (saved.character) {
        if (!saved.character.powers) saved.character.powers = [];
        if (!saved.character.archetype) saved.character.archetype = 'Civilian';
        if (saved.character.daysLived === undefined) saved.character.daysLived = saved.character.age * 365;
        if (saved.character.isAlive === undefined) saved.character.isAlive = true;
      }

      // Migration for old saves - Character Stats
      if (saved.character && !saved.character.stats?.happiness) {
        // Character stats existed but might be old style or missing new fields
        // In this game, 'stats' was always there but let's be super safe
        if (!saved.character.stats) {
           saved.character.stats = {
             happiness: 50, health: 50, intelligence: 50, attractiveness: 50,
             powerLevel: 0, wealth: 100, karma: 50, willpower: 50,
             discipline: 50, fertility: 50, stress: 0, acting: 0, athleticism: 50, popularity: 50,
             mentalStrain: 0, exposure: 0, powerControl: 10, suspicion: 0
           };
        } else {
           // Migration for existing stats missing new power fields
           if (saved.character.stats.mentalStrain === undefined) saved.character.stats.mentalStrain = 0;
           if (saved.character.stats.exposure === undefined) saved.character.stats.exposure = 0;
           if (saved.character.stats.powerControl === undefined) saved.character.stats.powerControl = 10;
           if (saved.character.stats.suspicion === undefined) saved.character.stats.suspicion = 0;
        }
      }

      // Migration for Gender
      if (saved.character && !saved.character.gender) {
        saved.character.gender = 'Male';
      }

      // Migration for NPCs (stats and gender)
      if (saved.npcs) {
        saved.npcs = saved.npcs.map((npc: any) => ({
          ...npc,
          powers: npc.powers || [],
          archetype: npc.archetype || 'Civilian',
          gender: npc.gender || 'Male',
          stats: npc.stats || {
            happiness: 50, health: 50, intelligence: 50, attractiveness: 50, wealth: 1000,
            craziness: 50,
            maritalStatus: npc.age < 18 ? 'Single' : 'Married',
            occupation: 'NPC',
            education: 'High School'
          }
        }));
      }

      // Migration for Relationships
      if (saved.relationships) {
        saved.relationships = saved.relationships.map((rel: any) => ({
          ...rel,
          powers: rel.powers || [],
          archetype: rel.archetype || 'Civilian',
          gender: rel.gender || 'Male'
        }));
      }

      // Migration for School (Teachers/Students)
      if (saved.character?.school) {
        const school = saved.character.school;
        if (school.teachers) {
          school.teachers = school.teachers.map((t: any, i: number) => {
            if (!t.fullName || t.name.includes('/') || t.name.startsWith('Teacher')) {
               const gender = t.gender || generateGender();
               const fullName = generateNpcName(gender);
               const lastName = fullName.split(' ')[1];
               const prefix = gender === 'Male' ? 'Mr.' : gender === 'Female' ? 'Ms.' : 'Mx.';
               return {
                 ...t,
                 gender,
                 fullName,
                 name: `${prefix} ${lastName}`,
                 stats: t.stats || generatePersonStats(40)
               };
            }
            return t;
          });
        }
        if (school.classmates) {
          school.classmates = school.classmates.map((c: any, i: number) => {
            if (!c.fullName || c.name.startsWith('Student')) {
              const gender = c.gender || generateGender();
              const fullName = generateNpcName(gender);
              return {
                ...c,
                gender,
                fullName,
                name: fullName,
                stats: c.stats || generatePersonStats(16, true)
              };
            }
            return c;
          });
        }
      }

      // Migration for Social Media
      if (!saved.socialMediaAccounts) {
        saved.socialMediaAccounts = [
          { platform: 'InstaLife', followers: saved.socialMedia?.followers || 0, isVerified: false, totalPosts: 0, isDeleted: false }
        ];
      }
      return saved;
    }
    return {
      character: initialCharacter,
      logs: [`Born in ${initialCharacter.city}, ${initialCharacter.country}!`],
      assets: [],
      relationships: generateInitialRelationships(initialCharacter.name),
      npcs: generateInitialNPCs(20),
      education: 'None',
      currentYear: 2026,
      socialMediaAccounts: [
        { platform: 'InstaLife', followers: 0, isVerified: false, totalPosts: 0, isDeleted: false }
      ]
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAging, setIsAging] = useState(false);
  const [timeInterval, setTimeInterval] = useState<TimeInterval>('Year');

  // Auto-save whenever gameState changes
  useEffect(() => {
    saveGame(gameState);
  }, [gameState]);

  const ageUp = async () => {
    if (isAging || !gameState.character) return;
    setIsAging(true);

    const char = gameState.character;
    let daysToAdd = 0;
    if (timeInterval === 'Day') daysToAdd = 1;
    if (timeInterval === 'Week') daysToAdd = 7;
    if (timeInterval === 'Month') daysToAdd = 30;
    if (timeInterval === 'Year') daysToAdd = 365;

    const decayRatio = daysToAdd / 365;
    const newDaysLived = char.daysLived + daysToAdd;
    const nextAge = Math.floor(newDaysLived / 365);
    
    // Power Glitch Logic
    let glitchLog = "";
    if (char.stats.mentalStrain > 70 && Math.random() < 0.2) {
       glitchLog = "Your mental strain is too high! You momentarily lost control of your powers, causing a minor shockwave in your neighborhood.";
    } else if (char.stats.exposure > 50 && Math.random() < 0.1) {
       glitchLog = "Someone recognized you from a 'strange event' video online. Your exposure is growing.";
    }

    // Only generate AI event on Year or if it's a big jump
    let eventLog = "";
    if (timeInterval === 'Year' || (Math.floor(char.daysLived / 365) !== nextAge)) {
      eventLog = await generateYearlyEvent(gameState);
    } else {
      eventLog = `You spent a ${timeInterval.toLowerCase()} focused on your life.`;
    }

    if (glitchLog) eventLog = glitchLog + " " + eventLog;

    setGameState(prev => {
      const c = prev.character!;
      const newStats = { ...c.stats };
      
      // Health decay and aging effects based on interval
      newStats.health = Math.max(0, newStats.health - (c.age > 60 ? 2 * decayRatio : 0.5 * decayRatio));
      
      // Power Stat Decays
      newStats.mentalStrain = Math.max(0, newStats.mentalStrain - (5 * decayRatio));
      newStats.suspicion = Math.max(0, newStats.suspicion - (10 * decayRatio));
      newStats.exposure = Math.max(0, newStats.exposure - (2 * decayRatio));
      
      // Alignment Logic based on Karma
      let newArchetype = c.archetype;
      if (newStats.karma < 30) newArchetype = 'Villain';
      else if (newStats.karma > 70) newArchetype = 'Hero';

      // Income based on interval
      if (prev.character?.job) {
        newStats.wealth += (prev.character.job.salary * decayRatio);
      }

      // Power leveling chance scaled by time
      const newPowers = c.powers.map(p => {
        if (Math.random() > (1 - (0.3 * decayRatio)) && p.level < p.maxLevel) {
          return { ...p, level: p.level + 1 };
        }
        return p;
      });

      // School Enrollment & Progression
      let newSchool = c.school;
      let newEduLevel = c.educationLevel;
      let newEduYears = c.educationYears;

      if (nextAge >= 5 && nextAge < 14 && !newSchool) {
        newSchool = generateSchool('Elementary');
        newEduLevel = 'Elementary';
      } else if (nextAge >= 14 && nextAge < 18 && (newSchool?.tier === 'Elementary' || !newSchool)) {
        newSchool = generateSchool('High School');
        newEduLevel = 'High School';
      } else if (nextAge === 18 && char.age === 17 && newSchool?.tier === 'High School') {
        // Just graduated High School
        newSchool = null; // High School finished
        setTimeout(() => setShowEduModal(true), 1000); // Trigger popup
      }

      if (newSchool && timeInterval === 'Year') {
        newEduYears += 1;
        // Check for graduation in higher ed
        if (newSchool.yearsRemaining !== undefined) {
          newSchool.yearsRemaining -= 1;
          if (newSchool.yearsRemaining <= 0) {
            newSchool = null; // Graduated
            // Log graduation
          }
        }
        
        if (newSchool) {
          const studyMult = newSchool.studyLevel === 'Intense' ? 2 : newSchool.studyLevel === 'Normal' ? 1 : newSchool.studyLevel === 'Light' ? 0.5 : 0;
          
          // Improve grades slightly by just attending
          newSchool.subjects = newSchool.subjects.map(s => {
             const teachingMeAndSleeping = newSchool!.teachers?.some(t => t.sleepingWithPlayer && t.subject === s.name);
             const teachingMeAndFavorite = newSchool!.teachers?.some(t => t.favoriteStudent && t.subject === s.name);
             
             if (teachingMeAndSleeping) return { ...s, grade: 100 };
             
             let gain = (Math.random() * 2 + 1) * studyMult;
             
             // Teacher personality effects
             const subjectTeacher = newSchool!.teachers?.find(t => t.subject === s.name && t.isTeachingPlayer);
             if (subjectTeacher) {
                if (subjectTeacher.personality === 'Inspiring') gain *= 1.5;
                if (subjectTeacher.personality === 'Strict') gain *= 0.8;
                if (teachingMeAndFavorite) gain += 2;
             }

             return { ...s, grade: Math.min(100, Math.max(0, s.grade + gain - (studyMult === 0 ? 5 : 0))) };
          });

          // Stress gain based on study intensity
          const stressGain = (newSchool.studyLevel === 'Intense' ? 10 : newSchool.studyLevel === 'Normal' ? 2 : 0) * (timeInterval === 'Year' ? 1 : decayRatio * 5);
          newSchool.stress = Math.min(100, (newSchool.stress || 0) + stressGain);
          
          // Clique Bonuses
          if (newSchool.clique === 'Nerds') newSchool.subjects = newSchool.subjects.map(s => ({ ...s, grade: Math.min(100, s.grade + 2) }));
          if (newSchool.clique === 'Popular') newSchool.popularity = Math.min(100, newSchool.popularity + 5);
          if (newSchool.clique === 'Rebels') {
             newStats.craziness = Math.min(100, newStats.craziness + 5);
             newSchool.reputation = Math.min(100, (newSchool.reputation || 0) + 5);
          }

          if (newSchool.subjects.length > 0) {
             newSchool.overallGrade = Math.round(newSchool.subjects.reduce((sum, s) => sum + s.grade, 0) / newSchool.subjects.length);
          }
          
          let logNotice = '';

          // Evaluate School Year Success/Failure (only on Year scale or if age changes)
          if (timeInterval === 'Year' || (Math.floor(char.daysLived / 365) !== nextAge)) {
            if (newSchool.punishmentLevel === 'Expelled' || (newSchool.behavior !== undefined && newSchool.behavior < 20)) {
                newSchool = null; // Expelled
                logNotice = 'You have been expelled from school for horrendous behavior!';
            } else {
               if (newSchool.overallGrade < 50) {
                   // Fail year
                   newEduYears = Math.max(0, newEduYears - 1); 
                   newSchool.stress = Math.min(100, (newSchool.stress || 0) + 20);
                   logNotice = 'You failed the year! You will have to repeat these classes. Stress drastically increased.';
               } else {
                   logNotice = 'You successfully passed the school year.';
                   // reset stress a bit on summer break
                   newSchool.stress = Math.max(0, (newSchool.stress || 0) - 20);
               }

               // Escalate punishments if behavior is low
               if (newSchool && newSchool.behavior !== undefined) {
                   if (newSchool.behavior < 40) {
                       newSchool.punishmentLevel = 'Suspension';
                       logNotice += ' You were also suspended this year for bad behavior.';
                       newSchool.overallGrade = Math.max(0, newSchool.overallGrade - 10);
                   } else if (newSchool.behavior < 60) {
                       newSchool.punishmentLevel = 'Detention';
                       logNotice += ' You received multiple detentions this year.';
                   } else if (newSchool.behavior < 80) {
                       newSchool.punishmentLevel = 'Warning';
                   } else {
                       newSchool.punishmentLevel = 'None';
                   }
               }
            }
          }
          // Prepend the school report to the randomly generated event
          if (logNotice) {
              eventLog = logNotice + " " + eventLog;
          }
        }
      }

      newStats.powerLevel = newPowers.length > 0 
        ? Math.round(newPowers.reduce((acc, p) => acc + (p.level * 10), 0) / newPowers.length)
        : 0;

      // Passive popularity gains
      let popBoost = 0;
      if (newPowers.length > 0) {
        // High power levels boost popularity 
        popBoost += 5 * decayRatio;
      }
      if (newStats.athleticism > 60) {
        // Being good at sports improves popularity
        popBoost += ((newStats.athleticism - 50) / 10) * decayRatio;
      }

      if (newSchool && newSchool.activities) {
          newSchool.activities.forEach(activity => {
              if (activity.isMember) {
                  if (activity.type === 'Team') {
                      newStats.athleticism = Math.min(100, newStats.athleticism + 5);
                      newStats.health = Math.min(100, newStats.health + 2);
                      popBoost += 5;
                  } else {
                      newStats.intelligence = Math.min(100, newStats.intelligence + 5);
                      popBoost += 2;
                  }
              }
          });
      }
      
      newStats.popularity = Math.min(100, Math.floor((newStats.popularity || 0) + popBoost));
      if (newSchool) {
        newSchool.popularity = Math.min(100, Math.floor((newSchool.popularity || 0) + popBoost));
      }

      return {
        ...prev,
        character: {
          ...c,
          archetype: newArchetype,
          age: nextAge,
          daysLived: newDaysLived,
          stats: newStats,
          powers: newPowers,
          school: newSchool,
          educationLevel: newEduLevel,
          educationYears: newEduYears
        },
        logs: [eventLog, ...prev.logs].slice(0, 50)
      };
    });

    setIsAging(false);
  };

  const manifestPower = () => {
    setGameState(prev => {
      const c = prev.character!;
      const availablePowers = [
        { name: 'Telepathy', description: 'Read and influence thoughts.' },
        { name: 'Mind Control', description: 'Directly control others.' },
        { name: 'Telekinesis', description: 'Move objects with your mind.' },
        { name: 'Super Strength', description: 'Physical power beyond limits.' },
        { name: 'Healing', description: 'Repair biological tissue.' },
        { name: 'Time Manipulation', description: 'Bending the flow of time.' },
      ];
      
      const currentPowerNames = c.powers.map(p => p.name);
      const grantable = availablePowers.filter(p => !currentPowerNames.includes(p.name));
      
      if (grantable.length === 0) return prev;
      
      const randomPower = grantable[Math.floor(Math.random() * grantable.length)];
      const newPower = {
        id: Math.random().toString(36).substr(2, 9),
        name: randomPower.name,
        level: 1,
        maxLevel: 10,
        description: randomPower.description,
        isPassive: false
      };
      
      return {
        ...prev,
        character: {
          ...c,
          powers: [...c.powers, newPower]
        },
        logs: [`Manifestation: A strange energy surges through you. You have gained the power of ${newPower.name}!`, ...prev.logs].slice(0, 50)
      };
    });
  };

  const TABS = [
    { id: 'dashboard', label: 'Main Life', icon: LayoutGrid, emoji: '🏠' },
    { id: 'jobs', label: 'Careers', icon: Briefcase, emoji: '💼' },
    { id: 'school', label: 'Education', icon: GraduationCap, emoji: '🎓' },
    { id: 'assets', label: 'Assets', icon: Wallet, emoji: '💎' },
    { id: 'relationships', label: 'Relationships', icon: Users, emoji: '❤️' },
    { id: 'social_media', label: 'Influencer', icon: Share2, emoji: '📱' },
    { id: 'activities', label: 'Activities', icon: Activity, emoji: '⚡' },
  ];

  const STAT_CONFIGS = {
    happiness: { color: 'text-emerald-400', bar: 'bg-emerald-500' },
    health: { color: 'text-rose-400', bar: 'bg-rose-500' },
    intelligence: { color: 'text-sky-400', bar: 'bg-sky-500' },
    attractiveness: { color: 'text-pink-400', bar: 'bg-pink-500' },
    stress: { color: 'text-orange-400', bar: 'bg-orange-500' },
  };

  const handleEduSelect = (tier: EducationTier, major: MajorType, funding: 'scholarship' | 'parents' | 'loan' | 'none') => {
    const school = generateHigherEd(tier, major);
    if (funding === 'loan') {
      school.loanBalance = school.tuition || 20000;
    }
    
    setGameState(prev => ({
      ...prev,
      character: {
        ...prev.character!,
        school,
        educationLevel: tier
      },
      logs: [`Enrolled in ${school.name} for ${major}! Funding: ${funding === 'none' ? 'City Funded' : funding}`, ...prev.logs].slice(0, 50)
    }));
    setShowEduModal(false);
    setActiveTab('school');
  };

  return (
    <div className="max-w-7xl mx-auto min-h-screen p-4 md:p-8 flex flex-col gap-6 relative">
      <header className="flex justify-between items-center bg-[#161618] border border-white/5 p-4 rounded-3xl">
         <div className="flex items-center gap-3">
             <div className="text-xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500 uppercase">SuperLife</div>
             <div className="w-1 h-1 bg-white/20 rounded-full" />
             <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{gameState.character?.name}</div>
         </div>
         <button onClick={onExitToMenu} className="px-5 py-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all border border-purple-500/30">
           Save & Quit
         </button>
      </header>

      <AnimatePresence>
        {showEduModal && gameState.character && (
          <EducationModal 
            onClose={() => setShowEduModal(false)}
            onSelect={handleEduSelect}
            characterStats={gameState.character.stats}
          />
        )}
      </AnimatePresence>
      {/* Top Stat Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {(Object.entries(STAT_CONFIGS) as [keyof typeof STAT_CONFIGS, any][]).map(([key, config]) => (
          <div key={key} className="bg-[#161618] border border-white/5 rounded-xl p-4 flex flex-col justify-center">
            <span className={cn("text-[10px] uppercase tracking-widest mb-1 font-bold", config.color)}>{key}</span>
            <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${gameState.character?.stats[key] ?? 0}%` }}
                className={cn("h-full", config.bar)}
              />
            </div>
          </div>
        ))}
        {/* Power Level Card */}
        <div className="bg-[#161618] border border-purple-500/30 rounded-xl p-4 flex flex-col justify-center shadow-[0_0_20px_rgba(139,92,246,0.1)]">
           <span className="text-[10px] uppercase tracking-widest text-purple-400 mb-1 font-bold">Power Level</span>
           <div className="flex items-end gap-2">
             <span className="text-2xl font-black text-white italic">
               {gameState.character?.stats.powerLevel.toLocaleString()}
             </span>
             <span className="text-[10px] text-purple-300 pb-1 uppercase font-mono tracking-tighter">
               Rank: Tier {Math.floor((gameState.character?.stats.powerLevel ?? 0) / 20) + 1}
             </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-[600px]">
        {/* Sidebar Navigation */}
        <div className="md:col-span-3 flex flex-col gap-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full p-4 transition-all rounded-xl flex items-center gap-3 text-left",
                activeTab === tab.id 
                  ? "bg-[#161618] border-l-4 border-purple-500 text-white rounded-l-none" 
                  : "hover:bg-[#161618] text-slate-400"
              )}
            >
              {activeTab === tab.id ? (
                <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#8B5CF6]" />
              ) : (
                <div className="w-5 text-center text-xs">{tab.emoji}</div>
              )}
              <span className="font-bold text-sm tracking-tight capitalize">{tab.label}</span>
            </button>
          ))}
          
          <div className="mt-auto p-4 bg-purple-900/10 border border-purple-500/20 rounded-2xl text-center">
            <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest mb-2">Character Profile</div>
            <div className="text-lg font-black text-white italic">{gameState.character?.name}</div>
            <div className="text-xs text-slate-400">Age: {gameState.character?.age} • {gameState.character?.city}, {gameState.character?.country}</div>
          </div>
        </div>

        {/* Main Gameplay Feed */}
        <div className="md:col-span-6 flex flex-col gap-6 relative">
          <div className="flex-1 bg-[#161618] border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-20">
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && <Dashboard gameState={gameState} setGameState={setGameState} ageUp={ageUp} isAging={isAging} />}
                {activeTab === 'jobs' && <JobsView gameState={gameState} setGameState={setGameState} />}
                {activeTab === 'activities' && <ActivitiesView gameState={gameState} setGameState={setGameState} />}
                {activeTab === 'assets' && <AssetsView gameState={gameState} setGameState={setGameState} />}
                {activeTab === 'school' && (
                  <SchoolView 
                    gameState={gameState} 
                    setGameState={setGameState} 
                    onEnroll={() => setShowEduModal(true)}
                  />
                )}
                {activeTab === 'relationships' && (
                   <SocialView gameState={gameState} setGameState={setGameState} />
                )}
                {activeTab === 'social_media' && (
                   <SocialMediaView gameState={gameState} setGameState={setGameState} />
                )}
              </AnimatePresence>
            </div>

            {/* Content Action Overlay (Age Button) */}
            <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2">
              <div className="flex gap-2 justify-center mb-1">
                 {(['Day', 'Week', 'Month', 'Year'] as TimeInterval[]).map(interval => (
                   <button
                    key={interval}
                    onClick={() => setTimeInterval(interval)}
                    className={cn(
                      "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border italic transition-all",
                      timeInterval === interval 
                        ? "bg-purple-600 border-purple-400 text-white" 
                        : "bg-black/20 border-white/5 text-slate-500 hover:text-slate-300"
                    )}
                   >
                     {interval}
                   </button>
                 ))}
              </div>
              <button
                onClick={ageUp}
                disabled={isAging}
                className={cn(
                  "w-full bg-white text-black font-black py-4 rounded-2xl text-xl hover:bg-slate-200 transition-all active:scale-95 shadow-xl",
                  isAging && "opacity-50 cursor-not-allowed"
                )}
              >
                {isAging ? "PROCESSING..." : `ADVANCE ${timeInterval.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>

        {/* Powers & Stats Panel */}
        <div className="md:col-span-3 flex flex-col gap-4">
          <div className="bg-[#161618] border border-white/5 rounded-2xl p-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Active Powers</div>
            <div className="space-y-4">
              {(gameState.character?.powers || []).map(power => (
                <div key={power.id} className="flex flex-col">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{power.name}</span>
                    <span className="text-purple-400 font-mono">Lvl {power.level}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(power.level / power.maxLevel) * 100}%` }}
                      className="bg-purple-500 h-full"
                    />
                  </div>
                </div>
              ))}
              {(gameState.character?.powers || []).length === 0 && (
                <p className="text-xs text-slate-600 italic">No powers manifest yet...</p>
              )}
            </div>
            <button 
                onClick={manifestPower}
                className="w-full mt-4 py-2 border border-purple-500/30 rounded-lg text-[10px] uppercase font-bold text-purple-400 hover:bg-purple-500/10 transition-colors italic"
            >
              Manifest Power
            </button>
          </div>

          <div className="bg-[#161618] border border-white/5 rounded-2xl p-4">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Attributes</div>
            <div className="grid grid-cols-2 gap-y-3">
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-tighter">Willpower</div>
                <div className="text-sm font-bold">{gameState.character?.stats.willpower}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-tighter">Discipline</div>
                <div className="text-sm font-bold">{gameState.character?.stats.discipline}%</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-tighter">Karma</div>
                <div className={cn("text-sm font-bold", (gameState.character?.stats.karma ?? 0) < 50 ? "text-red-400" : "text-green-400")}>
                  {gameState.character?.stats.karma}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 uppercase tracking-tighter">Fertility</div>
                <div className="text-sm font-bold">{gameState.character?.stats.fertility}%</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-950/20 to-[#161618] border border-indigo-500/20 rounded-2xl p-4 mt-auto">
            <div className="text-[10px] font-bold text-indigo-400 uppercase mb-1 tracking-widest">Net Worth</div>
            <div className="text-2xl font-black text-white tracking-tight italic">
              ${gameState.character?.stats.wealth.toLocaleString()}
            </div>
            <div className="text-[10px] text-indigo-300 mt-1 flex items-center gap-1 font-mono uppercase">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Liquidity Stable
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Label */}
      <div className="mt-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-600 font-mono tracking-widest gap-2">
        <div>SIMULATION CORE V4.2 - SUPERHUMAN VARIANT</div>
        <div className="flex gap-4">
          <span>SEED: AIS-{Math.random().toString(36).substring(7).toUpperCase()}</span>
          <span>TIMELINE: 2026-ALPHA</span>
        </div>
      </div>
    </div>
  );
};
