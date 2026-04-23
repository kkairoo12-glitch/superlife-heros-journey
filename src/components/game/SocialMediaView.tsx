import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Facebook, Instagram, MessageCircle, Video, 
  Twitter, Youtube, Radio, Users, Heart, 
  Trash2, Send, CheckCircle, Share2, Flame, 
  UserPlus, MessageSquare, AlertCircle, Eye,
  Zap, Smile, Shield, Brain, HeartPulse, Sparkles,
  Wallet, GraduationCap, Briefcase, Landmark
} from 'lucide-react';
import { GameState, SocialPlatform, SocialMediaAccount, NPC } from '../../types';
import { cn } from '../../lib/utils';

interface SocialMediaViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const PLATFORM_CONFIG: Record<SocialPlatform, { icon: any, color: string, actions: string[] }> = {
  'Facebook': { icon: Facebook, color: 'text-blue-600', actions: ['Post Update', 'Join Group', 'Poke Friend', 'Follow Person'] },
  'InstaLife': { icon: Instagram, color: 'text-pink-500', actions: ['Thirst Trap', 'Life Update', 'Product Promo', 'DM Celeb', 'Follow Celeb'] },
  'OnlyFans': { icon: Heart, color: 'text-sky-400', actions: ['Sexy Photo', 'Feet Pic', 'Custom Video', 'Reply to Message'] },
  'Podcast': { icon: Radio, color: 'text-purple-400', actions: ['Interview Guest', 'Solo Rant', 'Review Tech', 'Promote Sponsor'] },
  'TikTok': { icon: Video, color: 'text-teal-400', actions: ['Dance Trend', 'Reaction', 'Life Hack', 'Follow Creator'] },
  'Twitch': { icon: Video, color: 'text-indigo-500', actions: ['Gaming Stream', 'Just Chatting', 'Subathon', 'Reply to Chat'] },
  'Twitter': { icon: Twitter, color: 'text-sky-500', actions: ['Hot Take', 'Troll Celeb', 'Retweet Outrage', 'DM Request'] },
  'YouTube': { icon: Youtube, color: 'text-red-600', actions: ['Video Essay', 'Vlog', 'Tutorial', 'Reply to Comments'] },
};

export const SocialMediaView: React.FC<SocialMediaViewProps> = ({ gameState, setGameState }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform | null>(null);

  const logs = (msg: string) => {
    setGameState(prev => ({
      ...prev,
      logs: [msg, ...prev.logs].slice(0, 50)
    }));
  };

  const handleCreateAccount = (platform: SocialPlatform) => {
    setGameState(prev => ({
      ...prev,
      socialMediaAccounts: [
        ...(prev.socialMediaAccounts || []),
        { platform, followers: 0, isVerified: false, totalPosts: 0, isDeleted: false }
      ]
    }));
    logs(`Created a new ${platform} account!`);
  };

  const performAction = (platform: SocialPlatform, action: string) => {
    const roll = Math.random();
    let followerGain = 0;
    let incomeGain = 0;
    let msg = "";

    const userAttraction = gameState.character?.stats.attractiveness || 50;

    if (action === 'Thirst Trap') {
        followerGain = Math.floor(roll * 500) + userAttraction;
        msg = `You posted a suggestive thirst trap! Your followers are going crazy. (+${followerGain} followers)`;
    } else if (action === 'Troll Celeb' || action === 'Troll') {
        const backfire = roll < 0.4;
        if (backfire) {
            followerGain = -Math.floor(roll * 100);
            msg = `You tried to troll a high-profile target and got community-noted. (-${Math.abs(followerGain)} followers)`;
        } else {
            followerGain = Math.floor(roll * 300);
            msg = `Your burn went viral! You're the talk of the town. (+${followerGain} followers)`;
        }
    } else if (action === 'Product Promo' || action === 'Promote Sponsor') {
        const acc = gameState.socialMediaAccounts.find(a => a.platform === platform);
        const revenue = Math.floor((acc?.followers || 0) * 0.05 * roll);
        incomeGain = revenue;
        msg = `You promoted a brand! You earned $${revenue.toLocaleString()} from the sponsored post.`;
    } else if (action === 'Sexy Photo' || action === 'Custom Video') {
        followerGain = Math.floor(roll * 100);
        incomeGain = Math.floor(roll * 1000) + userAttraction * 10;
        msg = `You posted exclusive content on OnlyFans. Earnings: $${incomeGain.toLocaleString()}!`;
    } else if (action === 'DM Celeb') {
        const success = roll > 0.95;
        if (success) {
            followerGain = 5000;
            msg = `A major celebrity actually replied to your DM and shared your profile! (+5,000 followers)`;
        } else {
            msg = `The celebrity left you on 'Read'. Ouch.`;
        }
    } else {
        followerGain = Math.floor(roll * 50);
        msg = `You did: ${action} on ${platform}. (+${followerGain} followers)`;
    }

    setGameState(prev => {
        const newStats = { ...prev.character!.stats };
        newStats.wealth += incomeGain;
        
        return {
            ...prev,
            character: { ...prev.character!, stats: newStats },
            socialMediaAccounts: (prev.socialMediaAccounts || []).map(acc => 
                acc.platform === platform ? { 
                    ...acc, 
                    followers: Math.max(0, acc.followers + followerGain),
                    totalPosts: acc.totalPosts + 1
                } : acc
            )
        };
    });
    logs(msg);
  };

  const deleteAccount = (platform: SocialPlatform) => {
    if (confirm(`Are you sure you want to delete your ${platform} account?`)) {
      setGameState(prev => ({
        ...prev,
        socialMediaAccounts: (prev.socialMediaAccounts || []).filter(acc => acc.platform !== platform)
      }));
      logs(`Deleted your ${platform} account.`);
      setSelectedPlatform(null);
    }
  };

  const requestVerification = (platform: SocialPlatform) => {
    const acc = (gameState.socialMediaAccounts || []).find(a => a.platform === platform);
    if (!acc) return;

    if (acc.followers < 100000) {
        logs(`Verification rejected. You need at least 100k followers on ${platform}.`);
    } else {
        setGameState(prev => ({
            ...prev,
            socialMediaAccounts: (prev.socialMediaAccounts || []).map(a => 
                a.platform === platform ? { ...a, isVerified: true } : a
            )
        }));
        logs(`Congratulations! Your ${platform} account is now VERIFIED.`);
    }
  };

  const accounts = gameState.socialMediaAccounts || [];

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter italic text-white italic">Social Hub</h2>
        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Influence and Reputation</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(PLATFORM_CONFIG).map(([platform, config]) => {
          const acc = accounts.find(a => a.platform === platform);
          return (
            <div key={platform} className="bg-[#161618] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all flex flex-col relative overflow-hidden">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-3 rounded-xl bg-black/40 border border-white/5", config.color)}>
                       <config.icon className="w-5 h-5" />
                    </div>
                    <div>
                       <div className="flex items-center gap-1.5">
                          <span className="text-sm font-black text-white italic uppercase tracking-tight">{platform}</span>
                          {acc?.isVerified && <CheckCircle className="w-3 h-3 text-blue-400" />}
                       </div>
                       <p className="text-[10px] text-slate-500 font-bold tracking-widest">
                          {acc ? `${acc.followers.toLocaleString()} Followers` : 'Not Registered'}
                       </p>
                    </div>
                  </div>
                  {acc ? (
                     <button onClick={() => setSelectedPlatform(platform as SocialPlatform)} className="text-[10px] font-black uppercase italic text-purple-400 hover:text-purple-300">Manage</button>
                  ) : (
                     <button onClick={() => handleCreateAccount(platform as SocialPlatform)} className="px-3 py-1 bg-white/5 border border-white/10 hover:border-white/20 text-white rounded-lg text-[10px] font-black uppercase transition-all">Sign Up</button>
                  )}
               </div>
               
               {acc && (
                  <div className="grid grid-cols-2 gap-2 mt-auto">
                     {config.actions.slice(0, 2).map(act => (
                        <button 
                           key={act} 
                           onClick={() => performAction(platform as SocialPlatform, act)}
                           className="py-2 bg-black/40 border border-white/5 hover:border-white/20 rounded-xl text-[9px] font-bold uppercase transition-all"
                        >
                           {act}
                        </button>
                     ))}
                  </div>
               )}

               <div className="absolute -bottom-4 -right-4 opacity-5 rotate-12 scale-150">
                   <config.icon className="w-16 h-16 text-white" />
               </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
         {selectedPlatform && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
               <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full max-w-md bg-[#161618] border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
               >
                  <div className="flex justify-between items-start mb-8">
                     <div className="flex items-center gap-4">
                        <div className={cn("p-4 rounded-2xl bg-black/40 border border-white/5", PLATFORM_CONFIG[selectedPlatform].color)}>
                            {(() => {
                                const Icon = PLATFORM_CONFIG[selectedPlatform].icon;
                                return <Icon className="w-8 h-8" />;
                            })()}
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">{selectedPlatform}</h3>
                           <p className="text-xs text-slate-500 font-bold tracking-widest uppercase">Account Management</p>
                        </div>
                     </div>
                     <button onClick={() => setSelectedPlatform(null)} className="text-slate-500 hover:text-white transition-colors">
                        <Trash2 onClick={() => deleteAccount(selectedPlatform)} className="w-5 h-5 text-red-500/50 hover:text-red-500 cursor-pointer" />
                     </button>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Post & Interact</div>
                    <div className="grid grid-cols-2 gap-2">
                       {PLATFORM_CONFIG[selectedPlatform].actions.map(act => (
                          <button 
                            key={act}
                            onClick={() => {
                                performAction(selectedPlatform, act);
                                setSelectedPlatform(null);
                            }}
                            className="p-3 bg-black/40 border border-white/5 rounded-xl hover:border-purple-500/50 transition-all text-left flex items-center gap-3 group"
                          >
                             <Send className="w-3 h-3 text-slate-500 group-hover:text-purple-400" />
                             <span className="text-[10px] font-black text-white uppercase italic tracking-tighter">{act}</span>
                          </button>
                       ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                     <button 
                        onClick={() => requestVerification(selectedPlatform)}
                        className="w-full py-4 bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/20 text-blue-400 rounded-2xl text-[10px] font-black uppercase italic transition-all flex items-center justify-center gap-2"
                     >
                        <CheckCircle className="w-4 h-4" />
                        Request Verification
                     </button>
                     <button 
                        onClick={() => setSelectedPlatform(null)}
                        className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-400 rounded-2xl text-[10px] font-black uppercase italic transition-all"
                     >
                        Cancel
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
};
