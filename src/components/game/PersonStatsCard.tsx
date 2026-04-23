import React from 'react';
import { 
  Smile, HeartPulse, Brain, Sparkles, 
  Wallet, GraduationCap, Briefcase, Landmark,
  Heart, User
} from 'lucide-react';
import { PersonStats, Gender } from '../../types';
import { cn } from '../../lib/utils';

interface PersonStatsCardProps {
  stats: PersonStats;
  age: number;
  gender: Gender;
}

export const PersonStatsCard: React.FC<PersonStatsCardProps> = ({ stats, age, gender }) => {
  if (!stats) {
    return (
      <div className="p-4 bg-black/40 border border-white/5 rounded-2xl text-center">
        <p className="text-xs text-slate-500 italic">Information unavailable for this individual.</p>
      </div>
    );
  }

  const statItems = [
    { label: 'Happiness', value: stats.happiness || 0, icon: Smile, color: 'text-emerald-400', bar: 'bg-emerald-500' },
    { label: 'Health', value: stats.health || 0, icon: HeartPulse, color: 'text-rose-400', bar: 'bg-rose-500' },
    { label: 'Intelligence', value: stats.intelligence || 0, icon: Brain, color: 'text-sky-400', bar: 'bg-sky-500' },
    { label: 'Attractiveness', value: stats.attractiveness || 0, icon: Sparkles, color: 'text-pink-400', bar: 'bg-pink-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="bg-black/40 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <item.icon className={cn("w-3.5 h-3.5", item.color)} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-xl font-black text-white italic">{item.value}%</span>
              <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden mb-1.5">
                <div className={cn("h-full transition-all", item.bar)} style={{ width: `${item.value}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Info */}
      <div className="grid grid-cols-1 gap-2">
        <InfoItem icon={User} label="Age" value={age?.toString() || 'Unknown'} />
        <InfoItem icon={User} label="Gender" value={gender} />
        <InfoItem icon={Wallet} label="Wealth" value={`$${stats.wealth.toLocaleString()}`} />
        {age >= 18 && <InfoItem icon={Heart} label="Marital Status" value={stats.maritalStatus} />}
        {stats.occupation && stats.occupation !== 'None' && (
          <InfoItem icon={Briefcase} label="Occupation" value={stats.occupation} />
        )}
        {stats.education && stats.education !== 'None' && (
          <InfoItem icon={GraduationCap} label="Education" value={stats.education} />
        )}
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ icon: any, label: string, value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-slate-500" />
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
    <span className="text-xs font-bold text-white italic uppercase tracking-tight">{value}</span>
  </div>
);
