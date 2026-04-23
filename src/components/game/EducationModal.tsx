import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, BookOpen, Wallet, Sparkles, Building2, Landmark, HeartPulse, Briefcase, Heart, Zap, Users } from 'lucide-react';
import { EducationTier, MajorType, GameState } from '../../types';
import { MAJORS, generateHigherEd } from '../../lib/higherEd';
import { cn } from '../../lib/utils';

interface EducationModalProps {
  onClose: () => void;
  onSelect: (tier: EducationTier, major: MajorType, funding: 'scholarship' | 'parents' | 'loan' | 'none') => void;
  characterStats: any;
}

export const EducationModal: React.FC<EducationModalProps> = ({ onClose, onSelect, characterStats }) => {
  const [step, setStep] = useState<'tier' | 'major' | 'funding'>('tier');
  const [selectedTier, setSelectedTier] = useState<EducationTier>('University');
  const [selectedMajor, setSelectedMajor] = useState<MajorType>('Business Administration');

  const tiers: { id: EducationTier, label: string, desc: string, icon: any }[] = [
    { id: 'College', label: 'Community College', desc: 'A 2-year path focused on vocational or associate degrees. Free of cost.', icon: Building2 },
    { id: 'University', label: 'University', desc: 'A traditional 4-year degree. High prestige but expensive.', icon: GraduationCap },
    ...(characterStats.intelligence > 60 ? [
      { id: 'Graduate' as const, label: 'Graduate School', desc: 'Master\'s or Doctoral research.', icon: BookOpen },
      { id: 'Law' as const, label: 'Law School', desc: 'Become a highly paid attorney.', icon: Building2 },
      { id: 'Medical' as const, label: 'Medical School', desc: 'Train to be a doctor or surgeon.', icon: HeartPulse },
      { id: 'Business' as const, label: 'Business School', desc: 'Lead corporations with an MBA.', icon: Briefcase },
      { id: 'Dental' as const, label: 'Dental School', desc: 'Expertise in oral health.', icon: Sparkles },
      { id: 'Nursing' as const, label: 'Nursing School', desc: 'Specialized healthcare training.', icon: Heart },
      { id: 'Pharmacy' as const, label: 'Pharmacy School', desc: 'Learn to manage pharmaceuticals.', icon: Zap },
      { id: 'Veterinary' as const, label: 'Veterinary School', desc: 'Medical training for animals.', icon: Users },
    ] : [])
  ];

  const fundingOptions = [
    { id: 'scholarship', label: 'Apply for Scholarship', desc: 'Requires high intelligence and grades.', requirement: characterStats.intelligence > 80 },
    { id: 'parents', label: 'Ask Parents', desc: 'Depends on your relationship with them.', requirement: true },
    { id: 'loan', label: 'Student Loan', desc: 'Pay it back later with interest.', requirement: true },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-[#161618] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
               <GraduationCap className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-white italic">Higher Education</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">Choose your path after graduation.</p>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {step === 'tier' && (
              <motion.div
                key="tier"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {tiers.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                        setSelectedTier(t.id);
                        setStep('major');
                    }}
                    className="p-6 bg-black/40 border border-white/5 rounded-2xl text-left hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                  >
                    <t.icon className="w-8 h-8 text-slate-500 mb-4 group-hover:text-purple-400 transition-colors" />
                    <div className="text-lg font-black text-white italic uppercase mb-1">{t.label}</div>
                    <p className="text-[10px] text-slate-500 italic leading-relaxed">{t.desc}</p>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 'major' && (
              <motion.div
                key="major"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Select Major</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                   {MAJORS.map(m => (
                     <button
                       key={m}
                       onClick={() => {
                           setSelectedMajor(m);
                           setStep(selectedTier === 'College' ? 'funding' : 'funding'); 
                           // For now both go to funding, though CC is free, maybe CC should skip or just confirm free
                       }}
                       className={cn(
                        "p-3 rounded-xl text-[10px] font-bold uppercase transition-all text-center",
                        selectedMajor === m ? "bg-purple-600 text-white" : "bg-black/40 text-slate-400 hover:text-slate-200 border border-white/5"
                       )}
                     >
                       {m}
                     </button>
                   ))}
                </div>
              </motion.div>
            )}

            {step === 'funding' && (
              <motion.div
                key="funding"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Funding Source</div>
                {selectedTier === 'College' ? (
                   <div className="p-8 text-center bg-black/40 rounded-2xl border border-emerald-500/20">
                      <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                      <div className="text-xl font-black text-white italic uppercase mb-2">It's Free!</div>
                      <p className="text-sm text-slate-400 mb-6 italic">Oakwood Community College is fully funded by the city.</p>
                      <button 
                        onClick={() => onSelect(selectedTier, selectedMajor, 'none')}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black uppercase italic shadow-lg shadow-emerald-600/20 transition-all"
                      >
                         Enroll Now
                      </button>
                   </div>
                ) : (
                  <div className="space-y-3">
                     {fundingOptions.map(opt => (
                       <button
                         key={opt.id}
                         disabled={!opt.requirement}
                         onClick={() => onSelect(selectedTier, selectedMajor, opt.id as any)}
                         className={cn(
                           "w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all border",
                           opt.requirement 
                            ? "bg-black/40 border-white/5 hover:border-blue-500/50 hover:bg-blue-500/5 cursor-pointer" 
                            : "bg-black/10 border-white/5 opacity-50 cursor-not-allowed grayscale"
                         )}
                       >
                         <div>
                            <div className="text-xs font-black text-white italic uppercase">{opt.label}</div>
                            <p className="text-[9px] text-slate-500 italic">{opt.desc}</p>
                         </div>
                         <Landmark className="w-5 h-5 text-slate-600" />
                       </button>
                     ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-6 bg-black/60 flex justify-between">
           {step !== 'tier' && (
             <button onClick={() => setStep(step === 'funding' ? 'major' : 'tier')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors">Back</button>
           )}
           <button onClick={onClose} className="text-[10px] font-black text-red-500/50 uppercase tracking-widest hover:text-red-400 transition-colors ml-auto">Decline Education</button>
        </div>
      </motion.div>
    </div>
  );
};
