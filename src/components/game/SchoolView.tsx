import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Users, User, Heart, ShieldAlert, HeartPulse, 
  BookOpen, Trophy, School, UserPlus, MessageSquare, Gift, 
  Flame, Zap, Trash2, Search, Dumbbell, Coffee, Info, X
} from 'lucide-react';
import { GameState, Teacher, Student, SchoolActivity, CLIQUES } from '../../types';
import { cn } from '../../lib/utils';
import { PersonStatsCard } from './PersonStatsCard';

interface SchoolViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  onEnroll: () => void;
}

interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  choices: {
    label: string;
    onApply: () => void;
  }[];
}

export const SchoolView: React.FC<SchoolViewProps> = ({ gameState, setGameState, onEnroll }) => {
  const [activeSubTab, setActiveSubTab] = useState<'class' | 'faculty' | 'nurse' | 'activities' | 'cliques' | 'grades'>('grades');
  const [selectedPerson, setSelectedPerson] = useState<Teacher | Student | null>(null);
  const [activeInfoTab, setActiveInfoTab] = useState<'info' | 'actions'>('actions');
  const [activeEvent, setActiveEvent] = useState<SchoolEvent | null>(null);

  const school = gameState.character?.school;

  if (!school) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <GraduationCap className="w-16 h-16 text-slate-700 opacity-50 mb-2" />
        <div className="text-center">
            <h2 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Education Hub</h2>
            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mb-8">You are not currently enrolled in any institution.</p>
            
            {gameState.character && gameState.character.age >= 18 && (
                <button 
                    onClick={onEnroll}
                    className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-xs font-black uppercase italic shadow-lg shadow-purple-600/20 transition-all active:scale-95 flex items-center gap-3"
                >
                    <BookOpen className="w-4 h-4" />
                    Seek Higher Education
                </button>
            )}
            
            {gameState.character && gameState.character.age < 18 && gameState.character.age >= 5 && (
                 <p className="text-xs text-red-400 font-bold uppercase italic">Enrollment will happen automatically as you age.</p>
            )}
        </div>
      </div>
    );
  }

  const logs = (msg: string) => {
    setGameState(prev => ({
      ...prev,
      logs: [msg, ...prev.logs].slice(0, 50)
    }));
  };

  const triggerRandomEvent = () => {
    const events: SchoolEvent[] = [
      {
        id: 'pop_quiz',
        title: 'Pop Quiz!',
        description: 'Your teacher suddenly announces a pop quiz. You are not prepared.',
        choices: [
          { label: 'Try your best', onApply: () => {
             setGameState(prev => {
                const s = { ...prev.character!.school! };
                s.subjects = s.subjects.map(sub => ({ ...sub, grade: Math.max(0, Math.min(100, sub.grade - 2)) }));
                s.stress = Math.min(100, (s.stress || 0) + 5);
                return { ...prev, character: { ...prev.character!, school: s } };
             });
             logs("You tried your best on the pop quiz but it was tough.");
             setActiveEvent(null);
          }},
          { label: 'Cheat off neighbor', onApply: () => {
             if (Math.random() < 0.5) {
                logs("You got caught cheating on the pop quiz!");
                setGameState(prev => {
                   const s = { ...prev.character!.school! };
                   s.behavior = Math.max(0, (s.behavior || 100) - 15);
                   s.subjects = s.subjects.map(sub => ({ ...sub, grade: Math.max(0, Math.min(100, sub.grade - 5)) }));
                   return { ...prev, character: { ...prev.character!, school: s } };
                });
             } else {
                logs("You successfully cheated on the pop quiz.");
             }
             setActiveEvent(null);
          }}
        ]
      },
      {
         id: 'bully',
         title: 'Hallway Confrontation',
         description: 'A rumor is spreading about you, and a classmate confronts you in the hallway.',
         choices: [
           { label: 'Fight them', onApply: () => {
              logs("You got into a fight in the hallway!");
              setGameState(prev => {
                 const s = { ...prev.character!.school! };
                 s.behavior = Math.max(0, (s.behavior || 100) - 20);
                 s.popularity = Math.min(100, s.popularity + 5);
                 s.reputation = Math.min(100, (s.reputation || 0) + 10);
                 return { ...prev, character: { ...prev.character!, school: s } };
              });
              setActiveEvent(null);
           }},
           { label: 'De-escalate', onApply: () => {
              logs("You managed to talk your way out of the confrontation.");
              setActiveEvent(null);
           }}
         ]
       },
       {
         id: 'teacher_target',
         title: 'Teacher Targeting',
         description: 'A strict teacher seems to be targeting you today, watching your every move.',
         choices: [
           { label: 'Keep Head Down', onApply: () => {
              logs("You stayed as quiet as possible. They found nothing to punish.");
              setActiveEvent(null);
           }},
           { label: 'Talk Back', onApply: () => {
              logs("You snapped at the teacher. Detention was immediate.");
              setGameState(prev => {
                const s = { ...prev.character!.school! };
                s.behavior = Math.max(0, (s.behavior || 100) - 10);
                s.punishmentLevel = 'Detention';
                return { ...prev, character: { ...prev.character!, school: s } };
              });
              setActiveEvent(null);
           }}
         ]
       }
    ];

    setActiveEvent(events[Math.floor(Math.random() * events.length)]);
  };

  const getPower = (powerName: string) => gameState.character?.powers.find(p => p.name.includes(powerName));

  const applyPowerEffects = (powerName: string, intensity: number = 1) => {
    const power = getPower(powerName);
    if (!power) return { success: false, strain: 0, exposure: 0, suspicion: 0 };

    const control = gameState.character?.stats.powerControl || 10;
    // Success is easier if control is high. Intensity increases risk.
    const success = Math.random() * 100 < (control + (power.level * 5));
    
    // Risk calculations
    const baseStrain = 5 * intensity;
    const baseExposure = 2 * intensity;
    const baseSuspicion = 3 * intensity;

    // High control reduces exposure and suspicion
    const strain = Math.max(1, baseStrain - (control / 20));
    const exposure = Math.max(0, baseExposure - (control / 25));
    const suspicion = success ? Math.max(0, baseSuspicion - (control / 15)) : baseSuspicion * 2;

    return { success, strain, exposure, suspicion };
  };

  const performSchoolAction = (actionName: string, usePower?: string) => {
    let statChanges = { grades: 0, behavior: 0, popularity: 0, stress: 0, intelligence: 0, relChange: 0, reputation: 0, mentalStrain: 0, exposure: 0, suspicion: 0 };
    let msg = "";

    if (usePower) {
       const effects = applyPowerEffects(usePower, usePower === 'Telepathy' ? 1 : 1.5);
       statChanges.mentalStrain = effects.strain;
       statChanges.exposure = effects.exposure;
       statChanges.suspicion = effects.suspicion;

       if (!effects.success) {
          msg = `You tried to use ${usePower} but lost control! You have a massive headache and people are looking at you strangely.`;
          statChanges.mentalStrain += 10;
          statChanges.exposure += 5;
          statChanges.stress = 10;
       } else {
          switch (actionName) {
            case 'Study':
               if (usePower === 'Telepathy') {
                  statChanges.grades = 10;
                  statChanges.intelligence = 3;
                  msg = "Using Telepathy, you absorbed years of knowledge from the scholars around you in minutes.";
               }
               break;
            case 'Cheat on Exam':
               if (usePower === 'Telepathy') {
                  statChanges.grades = 15;
                  msg = "You read the top student's mind like an open book. Every answer was perfect.";
               } else if (usePower === 'Time Manipulation') {
                  statChanges.grades = 20;
                  msg = "You froze time, walked to the teacher's desk, and checked the answer key. Flawless.";
               }
               break;
            case 'Act Out':
               if (usePower === 'Telekinesis') {
                  statChanges.behavior = -30;
                  statChanges.popularity = 20;
                  msg = "You made lockers fly across the hall with your mind. Chaos erupted, and your legend grew.";
               }
               break;
          }
       }
    } else {
      switch (actionName) {
        case 'Study':
          statChanges.grades = 2;
          statChanges.stress = 5;
          statChanges.intelligence = 1;
          msg = "You spent hours studying. Your brain hurts but you feel prepared.";
          break;
        case 'Do Homework':
          statChanges.grades = 1;
          statChanges.stress = 2;
          statChanges.behavior = 1;
          statChanges.relChange = 2;
          msg = "You completed your homework on time.";
          break;
        case 'Skip Class':
          statChanges.grades = -5;
          statChanges.behavior = -15;
          statChanges.stress = -10;
          statChanges.relChange = -10;
          msg = "You skipped class. You feel relaxed, but you're falling behind.";
          break;
        case 'Act Out':
          statChanges.behavior = -20;
          statChanges.popularity = 5;
          statChanges.relChange = -15;
          msg = "You caused a huge disruption in class. The kids laughed, but the teacher was furious.";
          break;
        case 'Respect Teacher':
          statChanges.behavior = 5;
          statChanges.popularity = -2;
          statChanges.relChange = 10;
          msg = "You paid attention and answered questions politely.";
          break;
        case 'Sleep in Class':
          statChanges.stress = -15;
          statChanges.grades = -3;
          statChanges.behavior = -5;
          statChanges.relChange = -8;
          msg = "You had a nice nap, but missed the entire lecture.";
          break;
        case 'Vandalize School':
          if (Math.random() < 0.6) {
             statChanges.behavior = -40;
             statChanges.relChange = -30;
             msg = "You were caught vandalizing the school! You are in massive trouble.";
          } else {
             statChanges.popularity = 15;
             statChanges.reputation = 20;
             msg = "You vandalized the school and got away with it! Legends are spreading.";
          }
          break;
        case 'Cheat on Exam':
           if (Math.random() < 0.4) {
               statChanges.grades = -10;
               statChanges.behavior = -30;
               statChanges.relChange = -50;
               msg = "You got caught cheating on a major exam! Automatic zero and detention.";
           } else {
               statChanges.grades = 10;
               statChanges.stress = 2;
               msg = "You successfully cheated and aced the exam.";
           }
           break;
      }
    }

    setGameState(prev => {
       const newSchool = { ...prev.character!.school! };
       
       newSchool.subjects = newSchool.subjects.map(s => ({ ...s, grade: Math.max(0, Math.min(100, s.grade + statChanges.grades)) }));
       if (newSchool.subjects.length > 0) {
           newSchool.overallGrade = Math.round(newSchool.subjects.reduce((sum, s) => sum + s.grade, 0) / newSchool.subjects.length);
       }
       
       newSchool.behavior = Math.max(0, Math.min(100, (newSchool.behavior !== undefined ? newSchool.behavior : 100) + statChanges.behavior));
       newSchool.popularity = Math.max(0, Math.min(100, newSchool.popularity + statChanges.popularity));
       newSchool.stress = Math.max(0, Math.min(100, (newSchool.stress || 0) + statChanges.stress));
       newSchool.reputation = Math.max(-100, Math.min(100, (newSchool.reputation || 0) + (statChanges.reputation || 0)));
       
       // Update relations with teachers currently teaching
       newSchool.teachers = newSchool.teachers.map(t => {
          if (t.isTeachingPlayer) {
              return { ...t, relationship: Math.max(0, Math.min(100, t.relationship + statChanges.relChange)) };
          }
          return t;
       });

       let stats = { ...prev.character!.stats };
       stats.intelligence = Math.min(100, stats.intelligence + statChanges.intelligence);
       stats.mentalStrain = Math.max(0, Math.min(100, stats.mentalStrain + statChanges.mentalStrain));
       stats.exposure = Math.max(0, Math.min(100, stats.exposure + statChanges.exposure));
       stats.suspicion = Math.max(0, Math.min(100, stats.suspicion + statChanges.suspicion));

       return { ...prev, character: { ...prev.character!, stats, school: newSchool } };
    });
    logs(msg);

    if (Math.random() < 0.3) {
        triggerRandomEvent();
    }
  }

  const handleStudy = (subjectName?: string) => {
    setGameState(prev => {
      const newSchool = { ...prev.character!.school! };
      const stats = { ...prev.character!.stats };
      
      if (subjectName) {
        newSchool.subjects = newSchool.subjects.map(s => 
          s.name === subjectName ? { ...s, grade: Math.min(100, s.grade + 5) } : s
        );
      } else {
        newSchool.subjects = newSchool.subjects.map(s => ({ ...s, grade: Math.min(100, s.grade + 2) }));
        stats.intelligence = Math.min(100, stats.intelligence + 1);
      }
      return {
        ...prev,
        character: { ...prev.character!, school: newSchool, stats },
      };
    });
    logs(`You studied hard ${subjectName ? `for ${subjectName}` : 'overall'}.`);
  };

  const handleCheat = () => {
    const caught = Math.random() < 0.3;
    if (caught) {
      setGameState(prev => {
        const newSchool = { ...prev.character!.school! };
        newSchool.disciplineScore = Math.min(100, newSchool.disciplineScore + 20);
        return {
          ...prev,
          character: { ...prev.character!, school: newSchool },
        };
      });
      logs("You got caught cheating! Detention assigned.");
    } else {
      setGameState(prev => {
        const newSchool = { ...prev.character!.school! };
        newSchool.subjects = newSchool.subjects.map(s => ({ ...s, grade: Math.min(100, s.grade + 10) }));
        return {
          ...prev,
          character: { ...prev.character!, school: newSchool },
        };
      });
      logs("You successfully cheated on a test. Grades up!");
    }
  };

  const handleNurse = () => {
    const roll = Math.random();
    if (roll < 0.1) {
      logs("The nurse says it's severe! You're being sent to the hospital.");
    } else if (roll < 0.3) {
      logs("Nurse called your parents. You're going home early.");
    } else {
      logs("The nurse gave you an ice pack. You're feeling a bit better.");
    }
  };

  const handleActivityTryout = (activity: SchoolActivity) => {
    const athleticism = gameState.character?.stats.athleticism || 0;
    const success = athleticism > 65 || (athleticism > 40 && Math.random() < 0.5) || Math.random() < 0.1;

    if (success) {
      setGameState(prev => {
        const newSchool = { ...prev.character!.school! };
        newSchool.activities = newSchool.activities.map(a => 
          a.id === activity.id ? { ...a, isMember: true } : a
        );
        
        let popBoostMsg = '';
        if (activity.type === 'Team') {
           newSchool.popularity = Math.min(100, (newSchool.popularity || 0) + 15);
           popBoostMsg = ' Your popularity increased for being an athlete!';
        }
        
        return {
          ...prev,
          character: { ...prev.character!, school: newSchool }
        };
      });
      logs(`Success! You made the ${activity.name} ${activity.type}.${activity.type === 'Team' ? ' Your popularity increased for being an athlete!' : ''}`);
    } else {
      logs(`You failed the tryouts for ${activity.name}.`);
    }
  };

  const interactTeacher = (teacher: Teacher, action: string) => {
    let relChange = 0;
    let discChange = 0;
    let msg = "";

    switch (action.toLowerCase()) {
      case 'sleep with':
        let baseChance = 0.90;
        let meetsReqs = teacher.relationship > 70 && gameState.character!.stats.popularity > 70 && gameState.character!.stats.attractiveness > 70;
        let isMindControlled = false;

        const hasMindControl = gameState.character!.powers.some(p => p.name.includes("Mind Control") || p.name.includes("Telepathy"));
        
        if (hasMindControl && action.toLowerCase() === 'sleep with (mind control)') {
           isMindControlled = true;
           meetsReqs = true; // Mind control bypasses normal requirements
           baseChance = 1.0; 
        }

        if (gameState.character!.stats.attractiveness === 100) {
           baseChance = 0.99;
        }

        if (meetsReqs) {
          if (Math.random() < baseChance) {
            relChange = 20;
            if (isMindControlled) {
               msg = `You used your powers to plant a suggestion in ${teacher.name}'s mind. They are now completely obsessed with you and you are sleeping together.`;
            } else {
               msg = `You seduced ${teacher.name}! You're now sleeping with them. Your grades are guaranteed to pass!`;
            }
          } else {
            relChange = -50;
            discChange = 40;
            msg = `You tried to seduce ${teacher.name}, but they rejected you and reported it. You're in huge trouble!`;
          }
        } else {
           relChange = -80;
           discChange = 60;
           msg = `You embarrassingly tried to seduce ${teacher.name}. They were disgusted and sent you straight to the principal.`;
        }
        break;
      case 'sleep with (mind control)': // Handled above, but falling through from switch requires capturing it
        let mcChance = 1.0;
        relChange = 20;
        msg = `You used your powers to plant a suggestion in ${teacher.name}'s mind. They are now completely obsessed with you and you are sleeping together.`;
        break;
      case 'implant idea (mind control)':
        relChange = 5;
        msg = `You used your powers to subtly implant an idea into ${teacher.name}'s mind. Their grading towards you seems biased now.`;
        break;
      case 'make fall in love (mind control)':
        relChange = 100;
        msg = `You forced ${teacher.name} to fall deeply and helplessly in love with you using your powers.`;
        break;
      case 'continue sleeping with':
        relChange = 5;
        msg = `You secretly spent some private time with ${teacher.name}. Your grade in their class looks great.`;
        break;
      case 'acted up in class of':
        relChange = -10;
        discChange = 10;
        msg = `You acted up in ${teacher.name}'s class. They were not amused.`;
        break;
      case 'disrespected':
        relChange = -20;
        discChange = 15;
        msg = `You openly disrespected ${teacher.name}. Detention assigned!`;
        break;
      case 'complimented':
        relChange = 5;
        msg = `You complimented ${teacher.name}'s teaching style.`;
        break;
      case 'sucked up to':
        relChange = 10;
        msg = `You sucked up to ${teacher.name}. They seem to like the attention.`;
        break;
      case 'spied on':
        const caught = Math.random() < 0.3;
        if (caught) {
          discChange = 20;
          msg = `You got caught spying on ${teacher.name}! This is very bad.`;
        } else {
          msg = `You spied on ${teacher.name} and found out they are ${teacher.personality}.`;
        }
        break;
      default:
        relChange = 2;
        msg = `You interacted with ${teacher.name}.`;
    }

    setGameState(prev => {
      const newSchool = { ...prev.character!.school! };
      let newRelationships = [...prev.relationships];
      
      const teacherIndex = newSchool.teachers.findIndex(t => t.id === teacher.id);
      if (teacherIndex >= 0) {
        const t = newSchool.teachers[teacherIndex];
        const newRel = Math.max(0, Math.min(100, t.relationship + relChange));
        let isSleeping = t.sleepingWithPlayer;
        
        if ((action.toLowerCase() === 'sleep with' || action.toLowerCase() === 'sleep with (mind control)' || action.toLowerCase() === 'make fall in love (mind control)') && relChange > 0) {
          if (action.includes('sleep with')) {
             isSleeping = true;
          }
          // Add to relationships if not already there
          if (!newRelationships.some(r => r.id === t.id)) {
            newRelationships.push({
               id: t.id,
               name: t.name,
               fullName: t.fullName,
               archetype: 'Civilian',
               gender: t.gender,
               age: t.age,
               isFriend: false,
               isDating: action.includes('fall in love'),
               isAlive: true,
               job: null,
               educationLevel: 'University',
               educationYears: 4,
               school: null,
               type: action.includes('fall in love') ? 'Partner' : 'Fling'
            });
          } else {
             // Update relationship type if it was fling and now falling in love
             if (action.includes('fall in love')) {
                 newRelationships = newRelationships.map(r => r.id === t.id ? { ...r, type: 'Partner', isDating: true } : r);
             }
          }
        }

        newSchool.teachers[teacherIndex] = { ...t, relationship: newRel, sleepingWithPlayer: isSleeping };

        // Perks: If sleeping with them, their class is guaranteed pass (100)
        if (isSleeping && (action.toLowerCase() === 'sleep with' || action.toLowerCase() === 'continue sleeping with')) {
           newSchool.subjects = newSchool.subjects.map(s => 
             s.name === t.subject ? { ...s, grade: 100 } : s
           );
           if (newSchool.subjects.length > 0) {
              newSchool.overallGrade = Math.round(newSchool.subjects.reduce((sum, s) => sum + s.grade, 0) / newSchool.subjects.length);
           }
        }
      }

      newSchool.disciplineScore = Math.max(0, Math.min(100, newSchool.disciplineScore + discChange));
      return { ...prev, character: { ...prev.character!, school: newSchool }, relationships: newRelationships };
    });
    logs(msg);
    setSelectedPerson(null);
  };

  const interactStudent = (student: Student, action: string) => {
    let relChange = 0;
    let popChange = 0;
    let msg = "";

    switch (action.toLowerCase()) {
      case 'sleep with':
      case 'seduce':
        let baseChance = 0.50; // Students are easier by default than teachers but still need some luck
        if (gameState.character!.stats.attractiveness > 80) baseChance = 0.8;
        if (gameState.character!.stats.attractiveness === 100) baseChance = 0.99;
        
        const hasMindControl = gameState.character!.powers.some(p => p.name.includes("Mind Control") || p.name.includes("Telepathy"));
        let isMC = hasMindControl && action.includes('mind control');
        if (isMC) baseChance = 1.0;

        if (Math.random() < baseChance) {
           relChange = 30;
           popChange = 5;
           if (isMC) {
             msg = `You used mind control to make ${student.name} fall into your bed. They are obsessed with you.`;
           } else {
             msg = `You successfully seduced ${student.name}!`;
           }
        } else {
           relChange = -30;
           popChange = -10;
           msg = `You tried to seduce ${student.name} and got rejected completely. It's so embarrassing.`;
        }
        break;
      case 'implant idea (mind control)':
        relChange = 5;
        msg = `You used your powers to subtly implant an idea into ${student.name}'s mind. They think it was their own idea.`;
        break;
      case 'make fall in love (mind control)':
        relChange = 100;
        msg = `You forced ${student.name} to fall deeply and helplessly in love with you using your powers.`;
        break;
      case 'tried to befriend':
        relChange = 10;
        popChange = 2;
        msg = `You hung out with ${student.name}. You're becoming friends!`;
        break;
      case 'flirted with':
        relChange = 15;
        msg = `You flirted with ${student.name}. They blushed.`;
        break;
      case 'had a chat with':
        relChange = 5;
        msg = `You had a pleasant conversation with ${student.name}.`;
        break;
      case 'insulted':
        relChange = -15;
        popChange = -5;
        msg = `You insulted ${student.name} in front of everyone.`;
        break;
      case 'spied on':
        msg = `You spied on ${student.name} and confirmed they are in the ${student.clique} clique.`;
        break;
      default:
        relChange = 2;
        msg = `You interacted with ${student.name}.`;
    }

    setGameState(prev => {
      const newSchool = { ...prev.character!.school! };
      let newRelationships = [...prev.relationships];

      if ((action.toLowerCase() === 'sleep with' || action.toLowerCase() === 'seduce' || action.includes('mind control')) && relChange > 0) {
          if (!newRelationships.some(r => r.id === student.id)) {
            newRelationships.push({
               id: student.id,
               name: student.name,
               fullName: student.fullName,
               archetype: 'Civilian',
               gender: student.gender,
               age: student.age,
               isFriend: false,
               isDating: action.includes('fall in love'),
               isAlive: true,
               job: null,
               educationLevel: 'High School',
               educationYears: 2,
               school: null,
               type: action.includes('fall in love') ? 'Partner' : (action.includes('sleep') || action.includes('seduce') ? 'Fling' : 'Friend')
            });
          } else {
             if (action.includes('fall in love') || action.includes('sleep') || action.includes('seduce')) {
                 newRelationships = newRelationships.map(r => r.id === student.id ? { 
                    ...r, 
                    type: action.includes('fall in love') ? 'Partner' : (r.type === 'Partner' ? 'Partner' : 'Fling'), 
                    isDating: action.includes('fall in love') || r.isDating 
                 } : r);
             }
          }
      }

      newSchool.classmates = newSchool.classmates.map(c => 
        c.id === student.id ? { ...c, relationship: Math.max(0, Math.min(100, c.relationship + relChange)) } : c
      );
      newSchool.popularity = Math.max(0, Math.min(100, newSchool.popularity + popChange));
      return { ...prev, character: { ...prev.character!, school: newSchool }, relationships: newRelationships };
    });
    logs(msg);
    setSelectedPerson(null);
  };

  const tabs = [
    { id: 'grades', label: 'Dashboard', icon: School },
    { id: 'class', label: 'Class', icon: Users },
    { id: 'faculty', label: 'Faculty', icon: User },
    { id: 'nurse', label: 'Nurse', icon: HeartPulse },
    ...(school.tier !== 'Elementary' ? [
      { id: 'activities', label: 'Activities', icon: Trophy },
      { id: 'cliques', label: 'Cliques', icon: Users },
    ] : [])
  ];

  return (
    <div className="space-y-6">
      <header className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-4">
        <div>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">{school.name}</h2>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{school.tier}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Grades</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500" style={{ width: `${school.overallGrade}%` }} />
                </div>
                <span className="text-[10px] font-mono text-blue-400 font-bold">{school.overallGrade}%</span>
              </div>
           </div>
           <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Behavior</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-emerald-500" style={{ width: `${school.behavior ?? (100 - (school.disciplineScore || 0))}%` }} />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{school.behavior ?? (100 - (school.disciplineScore || 0))}%</span>
              </div>
           </div>
           <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Popularity</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-purple-500" style={{ width: `${school.popularity}%` }} />
                </div>
                <span className="text-[10px] font-mono text-purple-400 font-bold">{school.popularity}%</span>
              </div>
           </div>
           <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Stress</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-1.5 flex-1 bg-slate-800 rounded-full overflow-hidden">
                   <div className="h-full bg-red-500" style={{ width: `${school.stress || 0}%` }} />
                </div>
                <span className="text-[10px] font-mono text-red-400 font-bold">{school.stress || 0}%</span>
              </div>
           </div>
        </div>
      </header>

      {/* Internal Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter transition-all shrink-0",
              activeSubTab === tab.id ? "bg-purple-600 text-white" : "bg-white/5 text-slate-500 hover:text-slate-300"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
        {school.tier !== 'Elementary' && (
          <button
            onClick={() => setActiveSubTab('skip' as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter transition-all shrink-0",
              activeSubTab === 'skip' ? "bg-red-600 text-white" : "bg-white/5 text-slate-500 hover:text-slate-300"
            )}
          >
            <Flame className="w-3.5 h-3.5" />
            Skip School
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSubTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white/5 border border-white/5 rounded-3xl p-6"
        >
          {activeSubTab === 'grades' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Subject Performance</h4>
                  {(school.subjects || []).map(s => (
                    <div key={s.name} className="flex flex-col gap-1">
                       <div className="flex justify-between text-[10px] font-bold text-slate-300">
                          <span>{s.name}</span>
                          <span>{s.grade}%</span>
                       </div>
                       <div className="h-1 w-full bg-black/40 rounded-full overflow-hidden">
                          <div className={cn(
                            "h-full transition-all",
                            s.grade > 80 ? "bg-emerald-500" : s.grade > 60 ? "bg-purple-500" : "bg-red-500"
                          )} style={{ width: `${s.grade}%` }} />
                       </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">School Year Actions</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-2">
                      <button onClick={() => performSchoolAction('Study')} className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-left hover:bg-white/5 transition-all flex items-center justify-between group">
                         <span className="text-[10px] font-black text-indigo-400 uppercase italic">Study Hard</span>
                         <BookOpen className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
                      </button>
                      {getPower('Telepathy') && (
                        <button onClick={() => performSchoolAction('Study', 'Telepathy')} className="p-2 bg-purple-500/20 border border-purple-500/40 rounded-xl text-left hover:bg-purple-500/30 transition-all flex items-center justify-between group">
                          <span className="text-[9px] font-black text-purple-400 uppercase italic">Study (Telepathy)</span>
                          <Zap className="w-3 h-3 text-purple-400 fill-current" />
                        </button>
                      )}
                    </div>
                    
                    <button onClick={() => performSchoolAction('Do Homework')} className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-left hover:bg-white/5 transition-all flex items-center justify-between group h-full">
                       <span className="text-[10px] font-black text-blue-400 uppercase italic">Homework</span>
                       <BookOpen className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
                    </button>

                    <button onClick={() => performSchoolAction('Respect Teacher')} className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-left hover:bg-white/5 transition-all flex items-center justify-between group">
                       <span className="text-[10px] font-black text-emerald-400 uppercase italic">Attend Class</span>
                       <User className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    </button>

                    <button onClick={() => performSchoolAction('Sleep in Class')} className="p-3 bg-slate-500/10 border border-slate-500/30 rounded-xl text-left hover:bg-white/5 transition-all flex items-center justify-between group">
                       <span className="text-[10px] font-black text-slate-400 uppercase italic">Sleep in Class</span>
                       <Coffee className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                    </button>

                    <button onClick={() => performSchoolAction('Skip Class')} className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-left hover:bg-white/5 transition-all flex items-center justify-between group">
                       <span className="text-[10px] font-black text-orange-400 uppercase italic">Skip Class</span>
                       <Flame className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                    </button>

                    <div className="flex flex-col gap-2">
                       <button onClick={() => performSchoolAction('Act Out')} className="p-3 bg-pink-500/10 border border-pink-500/30 rounded-xl text-left hover:bg-white/5 transition-all flex items-center justify-between group">
                          <span className="text-[10px] font-black text-pink-400 uppercase italic">Act Out</span>
                          <Zap className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
                       </button>
                       {getPower('Telekinesis') && (
                          <button onClick={() => performSchoolAction('Act Out', 'Telekinesis')} className="p-2 bg-purple-500/20 border border-purple-500/40 rounded-xl text-left hover:bg-purple-500/30 transition-all flex items-center justify-between group">
                             <span className="text-[9px] font-black text-purple-400 uppercase italic">Act (Telekinesis)</span>
                             <Zap className="w-3 h-3 text-purple-400 fill-current" />
                          </button>
                       )}
                    </div>

                    <div className="flex flex-col gap-2">
                       <button onClick={() => performSchoolAction('Cheat on Exam')} className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-left hover:bg-white/5 transition-all flex items-center justify-between group">
                          <span className="text-[10px] font-black text-red-400 uppercase italic">Cheat</span>
                          <Search className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
                       </button>
                       {getPower('Telepathy') && (
                          <button onClick={() => performSchoolAction('Cheat on Exam', 'Telepathy')} className="p-2 bg-purple-500/20 border border-purple-500/40 rounded-xl text-left hover:bg-purple-500/30 transition-all flex items-center justify-between group">
                             <span className="text-[9px] font-black text-purple-400 uppercase italic">Cheat (Telepathy)</span>
                             <Zap className="w-3 h-3 text-purple-400 fill-current" />
                          </button>
                       )}
                       {getPower('Time Manipulation') && (
                          <button onClick={() => performSchoolAction('Cheat on Exam', 'Time Manipulation')} className="p-2 bg-purple-500/20 border border-purple-500/40 rounded-xl text-left hover:bg-purple-500/30 transition-all flex items-center justify-between group">
                             <span className="text-[9px] font-black text-purple-400 uppercase italic">Cheat (Time)</span>
                             <Zap className="w-3 h-3 text-purple-400 fill-current" />
                          </button>
                       )}
                    </div>
                    <button onClick={() => performSchoolAction('Vandalize School')} className="p-3 bg-red-600/10 border border-red-600/30 rounded-xl text-left hover:bg-white/5 transition-all flex items-center justify-between group">
                       <span className="text-[10px] font-black text-red-500 uppercase italic">Vandalize</span>
                       <Trash2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                     <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Study Intensity</h4>
                     <div className="flex gap-1">
                        {(['None', 'Light', 'Normal', 'Intense'] as const).map(lvl => (
                           <button
                              key={lvl}
                              onClick={() => {
                                 setGameState(prev => {
                                    const s = { ...prev.character!.school! };
                                    s.studyLevel = lvl;
                                    return { ...prev, character: { ...prev.character!, school: s } };
                                 });
                              }}
                              className={cn(
                                 "flex-1 p-2 rounded-lg text-[10px] font-black uppercase italic transition-all border",
                                 school.studyLevel === lvl ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/20" : "bg-white/5 border-white/5 text-slate-500 hover:text-slate-300"
                              )}
                           >
                              {lvl}
                           </button>
                        ))}
                     </div>
                     <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest italic">
                        {school.studyLevel === 'None' && "No stress, but grades will tank."}
                        {school.studyLevel === 'Light' && "Low effort, unstable grades."}
                        {school.studyLevel === 'Normal' && "Balanced grades and stress."}
                        {school.studyLevel === 'Intense' && "Guaranteed A, but very high stress."}
                     </p>
                  </div>
                  {(school.punishmentLevel && school.punishmentLevel !== 'None') && (
                    <div className="mt-4 p-3 bg-red-600/10 border border-red-600/30 rounded-xl">
                       <div className="text-[8px] text-red-500 uppercase font-black mb-1">Disciplinary Action</div>
                       <p className="text-[10px] text-slate-400">Status: {school.punishmentLevel}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'class' && (
            <div className="space-y-6">
              <section>
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Teachers</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {school.teachers.filter(t => t.isTeachingPlayer).map(t => (
                      <button key={t.id} onClick={() => setSelectedPerson(t)} className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl hover:border-purple-500/50 transition-all text-left group">
                         <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-purple-400" />
                         </div>
                         <div>
                            <div className="text-xs font-bold text-white">{t.name}</div>
                            <div className="text-[8px] text-slate-500 uppercase tracking-widest">{t.subject} • {t.personality} • Age {t.age}</div>
                         </div>
                      </button>
                    ))}
                 </div>
              </section>
              <section>
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Classmates</h4>
                 <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {school.classmates.map(c => (
                      <button key={c.id} onClick={() => setSelectedPerson(c)} className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl hover:border-purple-500/50 transition-all text-left">
                         <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-400" />
                         </div>
                         <div className="truncate">
                            <div className="text-[10px] font-bold text-white truncate">{c.name}</div>
                            <div className="text-[8px] text-slate-500 uppercase tracking-widest truncate">{c.clique} • Age {c.age}</div>
                         </div>
                      </button>
                    ))}
                 </div>
              </section>
            </div>
          )}

          {activeSubTab === 'faculty' && (
            <div className="space-y-6">
              <section>
                 <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Teaching Staff</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {school.teachers.filter(t => t.isTeachingPlayer).map(t => (
                      <button key={t.id} onClick={() => setSelectedPerson(t)} className="flex items-center gap-3 p-3 bg-black/40 border border-white/5 rounded-xl hover:border-purple-500/50 transition-all text-left group">
                         <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <GraduationCap className="w-5 h-5 text-purple-400" />
                         </div>
                         <div>
                            <div className="text-xs font-bold text-white leading-none mb-1">{t.name}</div>
                            <div className="text-[8px] text-slate-500 uppercase tracking-widest leading-none">
                                {t.subject} • {t.personality} • Strict: {t.strictness}%
                            </div>
                         </div>
                         {t.favoriteStudent && <div className="ml-auto px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[6px] font-black uppercase text-amber-500 italic">Favorite</div>}
                      </button>
                    ))}
                 </div>
              </section>
            </div>
          )}

          {activeSubTab === 'nurse' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
               <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <HeartPulse className="w-8 h-8 text-emerald-500" />
               </div>
               <div className="text-center space-y-4 font-bold">
                  <div>
                    <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">Medical Center</h4>
                    <p className="text-[10px] text-slate-500 uppercase italic mt-1 font-black">Health: {gameState.character.stats.health}% • Stress: {school.stress}%</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full max-w-xs mx-auto">
                    <button 
                      onClick={() => {
                        logs("You went to the nurse feeling genuinely ill. You were sent home to rest.");
                        setGameState(prev => ({
                           ...prev,
                           character: { 
                              ...prev.character!, 
                              stats: { ...prev.character!.stats, health: Math.min(100, prev.character!.stats.health + 10) },
                              school: { ...prev.character!.school!, stress: Math.max(0, prev.character!.school!.stress - 15) }
                           }
                        }));
                      }}
                      className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-[10px] font-black uppercase italic text-emerald-400 hover:bg-emerald-500/20 transition-all text-center"
                    >
                       Genuine Checkup
                    </button>
                    <button 
                      onClick={() => {
                         const caught = Math.random() < 0.4;
                         if (caught) {
                            logs("The nurse realizes you are faking! You've been sent back to class with a warning.");
                            setGameState(prev => ({ ...prev, character: { ...prev.character!, school: { ...prev.character!.school!, behavior: Math.max(0, (prev.character!.school!.behavior || 0) - 5) } } }));
                         } else {
                            logs("You successfully faked an illness! You get to skip the rest of the day.");
                            setGameState(prev => ({ ...prev, character: { ...prev.character!, school: { ...prev.character!.school!, stress: Math.max(0, (prev.character!.school!.stress || 0) - 20) } } }));
                         }
                      }}
                      className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-[10px] font-black uppercase italic text-orange-400 hover:bg-orange-500/20 transition-all text-center"
                    >
                       Fake Illness
                    </button>
                  </div>
               </div>
            </div>
          )}

          {activeSubTab === 'activities' && (
            <div className="space-y-6">
               <section>
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Competitions & Hobbies</h4>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                     {(school.activities || []).map(a => (
                        <div key={a.id} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center group">
                           <div className={cn(
                             "p-3 rounded-xl mb-3",
                             a.isMember ? "bg-purple-500/20" : "bg-black/60"
                           )}>
                              {a.type === 'Club' ? <Coffee className="w-5 h-5 text-slate-400" /> : <Dumbbell className="w-5 h-5 text-slate-400" />}
                           </div>
                           <div className="text-[10px] font-black text-white uppercase italic mb-1 leading-none">{a.name}</div>
                           
                           {a.isMember ? (
                              <div className="w-full space-y-2">
                                <div className="h-1 w-full bg-black/60 rounded-full overflow-hidden">
                                   <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${a.performance}%` }} />
                                </div>
                                <div className="flex justify-between items-center text-[8px] font-bold uppercase tracking-widest">
                                   <span className="text-purple-400">Perf: {a.performance}%</span>
                                   {a.isCaptain && <span className="text-amber-400 flex items-center gap-0.5"><Trophy className="w-2 h-2" /> Captain</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                   <button 
                                     onClick={() => {
                                       setGameState(prev => {
                                         const s = { ...prev.character!.school! };
                                         s.activities = s.activities.map(act => act.id === a.id ? { ...act, performance: Math.min(100, act.performance + 3) } : act);
                                         return { ...prev, character: { ...prev.character!, school: s } };
                                       });
                                       logs(`You practiced for ${a.name}. Consistency is key.`);
                                     }}
                                     className="py-1.5 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg text-[6px] font-black uppercase text-purple-400 border border-purple-500/20"
                                   >
                                      Practice
                                   </button>
                                   <button 
                                     onClick={() => {
                                        const win = Math.random() < (a.performance / 100);
                                        if (win) {
                                           logs(`You WON the ${a.name} competition! Your reputation soared.`);
                                           setGameState(prev => {
                                              const s = { ...prev.character!.school! };
                                              s.reputation = Math.min(100, (s.reputation || 0) + 10);
                                              s.popularity = Math.min(100, s.popularity + 5);
                                              return { ...prev, character: { ...prev.character!, school: s } };
                                           });
                                        } else {
                                           logs(`You lost the ${a.name} match. Keep working at it.`);
                                        }
                                     }}
                                     className="py-1.5 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-[6px] font-black uppercase text-amber-500 border border-amber-500/20"
                                   >
                                      Compete
                                   </button>
                                </div>
                                <button 
                                   onClick={() => {
                                      setGameState(prev => {
                                         const s = { ...prev.character!.school! };
                                         s.activities = s.activities.map(act => act.id === a.id ? { ...act, isMember: false } : act);
                                         return { ...prev, character: { ...prev.character!, school: s } };
                                      });
                                      logs(`You quit the ${a.name}.`);
                                   }}
                                   className="w-full text-[6px] text-slate-500 uppercase font-black hover:text-red-400 transition-colors"
                                >
                                   Quit Activity
                                </button>
                              </div>
                           ) : (
                             <button onClick={() => handleActivityTryout(a)} className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] font-black uppercase transition-all">
                                Try Out
                             </button>
                           )}
                        </div>
                     ))}
                  </div>
               </section>
            </div>
          )}

          {activeSubTab === 'cliques' && (
             <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                   {CLIQUES.map(c => (
                      <button 
                        key={c} 
                        onClick={() => {
                          let popBoostFlag = false;
                          setGameState(prev => {
                             const newSchool = { ...prev.character!.school!, clique: c, cliqueRank: 0 };
                             if (school.clique !== c && ['Popular kids', 'Jocks', 'Cheerleaders'].includes(c)) {
                               newSchool.popularity = Math.min(100, (newSchool.popularity || 0) + 20);
                               popBoostFlag = true;
                             }
                             return { ...prev, character: { ...prev.character!, school: newSchool } };
                          });
                          logs(`You started hanging out with the ${c}.${popBoostFlag ? ' Your popularity surged!' : ''}`);
                        }}
                        className={cn(
                          "p-4 bg-black/40 border rounded-xl hover:border-purple-500/50 transition-all text-center",
                          school.clique === c ? "border-purple-500 bg-purple-500/10 shadow-[0_0_15px_-5px_rgba(168,85,247,0.4)]" : "border-white/5"
                        )}
                      >
                         <div className="text-[10px] font-black text-white uppercase italic">{c}</div>
                         <div className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">
                            {school.clique === c ? "Active Clique" : "Join"}
                         </div>
                      </button>
                   ))}
                </div>
                
                {school.clique && (
                   <div className="p-6 bg-purple-900/10 border border-purple-500/20 rounded-2xl relative overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="text-[10px] font-black text-white uppercase italic tracking-widest">Internal Hierarchy: {school.clique}</h4>
                           <span className="text-[10px] text-purple-400 font-black italic uppercase">Rank: {school.cliqueRank || 0}/100</span>
                        </div>
                        <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden mb-6">
                           <div className="h-full bg-purple-500 transition-all duration-1000 shadow-[0_0_10px_#a855f7]" style={{ width: `${school.cliqueRank || 0}%` }} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <button 
                             onClick={() => {
                                setGameState(prev => {
                                   const s = { ...prev.character!.school! };
                                   s.cliqueRank = Math.min(100, (s.cliqueRank || 0) + 5);
                                   s.stress = Math.min(100, s.stress + 2);
                                   return { ...prev, character: { ...prev.character!, school: s } };
                                });
                                logs(`You helped out your ${school.clique} friends. Your status is rising.`);
                             }}
                             className="py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[8px] font-black uppercase italic text-white transition-all"
                           >
                              Do Favors
                           </button>
                           <button 
                              onClick={() => {
                                 const win = Math.random() < 0.3;
                                 if (win) {
                                    logs(`You asserted dominance! Huge rank boost.`);
                                    setGameState(prev => {
                                       const s = { ...prev.character!.school! };
                                       s.cliqueRank = Math.min(100, (s.cliqueRank || 0) + 15);
                                       return { ...prev, character: { ...prev.character!, school: s } };
                                    });
                                 } else {
                                    logs(`You tried to show off but just looked stupid.`);
                                    setGameState(prev => {
                                       const s = { ...prev.character!.school! };
                                       s.cliqueRank = Math.max(0, (s.cliqueRank || 0) - 10);
                                       return { ...prev, character: { ...prev.character!, school: s } };
                                    });
                                 }
                              }}
                              className="py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[8px] font-black uppercase italic text-white transition-all"
                           >
                              Rise in Rank
                           </button>
                        </div>
                      </div>
                   </div>
                )}
             </div>
          )}

          {activeSubTab === 'skip' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
               <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Flame className="w-10 h-10 text-red-500" />
               </div>
               <div className="text-center">
                 <h4 className="text-lg font-black text-white italic uppercase mb-2">Truancy Hub</h4>
                 <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6 italic font-bold">Thinking of ducking out? Choose your destination, but watch out for the principal.</p>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        const caught = Math.random() < 0.4;
                        if (caught) {
                          setGameState(prev => ({ ...prev, character: { ...prev.character!, school: { ...prev.character!.school!, behavior: Math.max(0, (prev.character!.school!.behavior || 0) - 30) } } }));
                          logs("CAUGHT! You were spotted at the Arcade. Suspension pending.");
                        } else {
                          logs("You spent the day at the Arcade. Stress down, but grades might slip.");
                          setGameState(prev => ({ ...prev, character: { ...prev.character!, school: { ...prev.character!.school!, stress: Math.max(0, (prev.character!.school!.stress || 0) - 15) } } }));
                        }
                      }}
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[8px] font-black uppercase text-white hover:bg-white/10"
                    >
                       Mall / Arcade
                    </button>
                    <button 
                      onClick={() => logs("You stayed home and played video games. Stealth level: high.")}
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[8px] font-black uppercase text-white hover:bg-white/10"
                    >
                       Stay Home
                    </button>
                 </div>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Person Interaction Modal */}
      <AnimatePresence>
        {selectedPerson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPerson(null)}
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
                    <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center">
                       {'subject' in selectedPerson ? <GraduationCap className="w-8 h-8 text-purple-400" /> : <User className="w-8 h-8 text-blue-400" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">{selectedPerson.fullName || selectedPerson.name}</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
                        {'subject' in selectedPerson ? `Professor of ${selectedPerson.subject}` : `${selectedPerson.clique}`}
                      </p>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 {/* Sub-tabs for Interaction vs Info */}
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setActiveInfoTab('actions')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter transition-all flex items-center gap-2",
                        activeInfoTab === 'actions' ? "bg-purple-600 text-white" : "bg-white/5 text-slate-500 hover:text-slate-300"
                      )}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Actions
                    </button>
                    <button 
                      onClick={() => setActiveInfoTab('info')}
                      className={cn(
                        "px-4 py-2 rounded-xl text-[10px] font-black uppercase italic tracking-tighter transition-all flex items-center gap-2",
                        activeInfoTab === 'info' ? "bg-purple-600 text-white" : "bg-white/5 text-slate-500 hover:text-slate-300"
                      )}
                    >
                      <Info className="w-3.5 h-3.5" />
                      Identity
                    </button>
                 </div>

                 <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {activeInfoTab === 'info' ? (
                      <PersonStatsCard stats={selectedPerson.stats} age={selectedPerson.age} gender={selectedPerson.gender} />
                    ) : (
                      <div className="space-y-6">
                        <div>
                           <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                              <span>Relationship</span>
                              <span>{selectedPerson.relationship}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 transition-all" style={{ width: `${selectedPerson.relationship}%` }} />
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                           {/* Common Actions */}
                           <InteractionBtn icon={MessageSquare} label="Conversation" onClick={() => {'subject' in selectedPerson ? interactTeacher(selectedPerson, 'conversed with') : interactStudent(selectedPerson, 'had a chat with')}} color="text-sky-400" />
                           <InteractionBtn icon={Zap} label="Compliment" onClick={() => {'subject' in selectedPerson ? interactTeacher(selectedPerson, 'complimented') : interactStudent(selectedPerson, 'complimented')}} color="text-amber-400" />
                           <InteractionBtn icon={Gift} label="Gift" onClick={() => {'subject' in selectedPerson ? interactTeacher(selectedPerson, 'gave gift to') : interactStudent(selectedPerson, 'gave gift to')}} color="text-emerald-400" />
                           <InteractionBtn icon={ShieldAlert} label="Insult" onClick={() => {'subject' in selectedPerson ? interactTeacher(selectedPerson, 'insulted') : interactStudent(selectedPerson, 'insulted')}} color="text-red-400" />
                           
                           {'subject' in selectedPerson ? (
                              <>
                                <InteractionBtn icon={Flame} label="Act Up" onClick={() => interactTeacher(selectedPerson, 'acted up in class of')} color="text-orange-500" />
                                <InteractionBtn icon={Trash2} label="Disrespect" onClick={() => interactTeacher(selectedPerson, 'disrespected')} color="text-red-600" />
                                <InteractionBtn icon={Search} label="Spy" onClick={() => interactTeacher(selectedPerson, 'spied on')} color="text-indigo-400" />
                                <InteractionBtn icon={Zap} label="Suck Up" onClick={() => interactTeacher(selectedPerson, 'sucked up to')} color="text-yellow-400" />
                                {school.tier !== 'Elementary' && (
                                  <InteractionBtn 
                                    icon={Heart} 
                                    label="Flirt" 
                                    onClick={() => {
                                      if (selectedPerson.relationship > 80) {
                                        logs(`You flirted with ${selectedPerson.name}. They seemed conflicted but didn't stop you.`);
                                      } else {
                                        logs(`${selectedPerson.name} rejected your advances and reported you to the principal!`);
                                        setGameState(prev => ({ ...prev, character: { ...prev.character!, school: { ...prev.character!.school!, disciplineScore: Math.min(100, prev.character!.school!.disciplineScore + 40) } } }));
                                      }
                                      setSelectedPerson(null);
                                    }} 
                                    color="text-rose-400" 
                                  />
                                )}
                                {school.tier === 'High School' && (
                                   selectedPerson.sleepingWithPlayer ? (
                                      <InteractionBtn 
                                        icon={HeartPulse} 
                                        label="Sneak to Bed" 
                                        onClick={() => interactTeacher(selectedPerson, 'continue sleeping with')} 
                                        color="text-rose-500" 
                                      />
                                   ) : (
                                      <>
                                        <InteractionBtn 
                                          icon={HeartPulse} 
                                          label="Seduce" 
                                          onClick={() => interactTeacher(selectedPerson, 'sleep with')} 
                                          color="text-rose-600" 
                                        />
                                        {gameState.character?.powers.some(p => p.name.includes("Mind Control") || p.name.includes("Telepathy")) && (
                                          <>
                                            <InteractionBtn icon={Zap} label="MC: Horny" onClick={() => interactTeacher(selectedPerson, 'sleep with (mind control)')} color="text-purple-400" />
                                            <InteractionBtn icon={Zap} label="MC: Implant Idea" onClick={() => interactTeacher(selectedPerson, 'implant idea (mind control)')} color="text-purple-300" />
                                            <InteractionBtn icon={Zap} label="MC: Make Love You" onClick={() => interactTeacher(selectedPerson, 'make fall in love (mind control)')} color="text-purple-500" />
                                          </>
                                        )}
                                      </>
                                   )
                                )}
                              </>
                           ) : (
                              <>
                                <InteractionBtn icon={UserPlus} label="Befriend" onClick={() => interactStudent(selectedPerson, 'tried to befriend')} color="text-emerald-500" />
                                <InteractionBtn icon={Heart} label="Flirt" onClick={() => interactStudent(selectedPerson, 'flirted with')} color="text-rose-400" />
                                <InteractionBtn icon={Search} label="Spy" onClick={() => interactStudent(selectedPerson, 'spied on')} color="text-indigo-400" />
                                {school.tier !== 'Elementary' && (
                                   <InteractionBtn icon={HeartPulse} label="Seduce" onClick={() => interactStudent(selectedPerson, 'seduce')} color="text-rose-600" />
                                )}
                                {gameState.character?.powers.some(p => p.name.includes("Mind Control") || p.name.includes("Telepathy")) && (
                                  <>
                                    <InteractionBtn icon={Zap} label="MC: Implant Idea" onClick={() => interactStudent(selectedPerson, 'implant idea (mind control)')} color="text-purple-300" />
                                    <InteractionBtn icon={Zap} label="MC: Make Love You" onClick={() => interactStudent(selectedPerson, 'make fall in love (mind control)')} color="text-purple-400" />
                                    {school.tier !== 'Elementary' && (
                                       <InteractionBtn icon={Zap} label="MC: Horny" onClick={() => interactStudent(selectedPerson, 'sleep with (mind control)')} color="text-purple-500" />
                                    )}
                                  </>
                                )}
                              </>
                           )}
                        </div>
                      </div>
                    )}
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Modal Overlay */}
      <AnimatePresence>
         {activeEvent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-900 border border-white/10 p-6 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden"
               >
                  {/* Decorative Header Background */}
                  <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-purple-500/20 to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col pt-4">
                     <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 mx-auto border border-purple-500/30">
                        <Zap className="w-6 h-6 text-purple-400" />
                     </div>
                     <h3 className="text-xl font-black text-white uppercase italic tracking-tighter text-center mb-2">{activeEvent.title}</h3>
                     <p className="text-sm text-slate-400 text-center mb-8 leading-relaxed">{activeEvent.description}</p>
                     
                     <div className="space-y-3">
                        {activeEvent.choices.map((choice, i) => (
                           <button
                              key={i}
                              onClick={choice.onApply}
                              className="w-full p-4 bg-white/5 hover:bg-purple-600 border border-white/10 hover:border-purple-500 text-white rounded-xl text-xs font-black uppercase italic tracking-widest transition-all group relative overflow-hidden"
                           >
                              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                              <span className="relative z-10">{choice.label}</span>
                           </button>
                        ))}
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};

const InteractionBtn: React.FC<{ icon: any, label: string, onClick: () => void, color: string }> = ({ icon: Icon, label, onClick, color }) => (
  <button onClick={onClick} className="p-3 bg-black/40 border border-white/5 rounded-xl hover:border-white/20 transition-all text-left flex items-center gap-3 group">
     <Icon className={cn("w-4 h-4", color, "group-hover:scale-110 transition-transform")} />
     <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">{label}</span>
  </button>
);
