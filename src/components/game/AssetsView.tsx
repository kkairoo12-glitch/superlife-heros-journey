
import React from 'react';
import { motion } from 'motion/react';
import { Wallet, Landmark, Car, Home, Trophy, Gem, LineChart, Building2 } from 'lucide-react';
import { GameState } from '../../types';

interface AssetsViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
}

const ASSET_CATEGORIES = [
  { label: 'Finances', icon: Wallet, desc: 'View bank accounts & income' },
  { label: 'Investments', icon: LineChart, desc: 'Stocks, crypto, property' },
  { label: 'Auction House', icon: Trophy, desc: 'Bid for rare artifacts' },
  { label: 'Casino', icon: Gem, desc: 'High-stakes gambling' },
  { label: 'Museum', icon: Building2, desc: 'Your collection of items' },
  { label: 'Garage', icon: Car, desc: 'Vehicles and super-rides' },
  { label: 'Belongings', icon: Home, desc: 'Personal possessions' },
];

export const AssetsView: React.FC<AssetsViewProps> = ({ gameState }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <header className="mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter italic text-white">Portfolio & Wealth</h2>
        <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Asset Management</p>
      </header>

      <div className="bg-[#161618] border border-indigo-500/20 p-6 rounded-3xl mb-8 relative overflow-hidden group shadow-lg">
        <Landmark className="absolute -right-4 -bottom-4 w-32 h-32 text-indigo-500/5 rotate-12 transition-transform group-hover:scale-110" />
        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-1 font-mono">NET_WORTH_GLOBAL</p>
        <p className="text-3xl font-black text-white italic tracking-tighter">
          ${gameState.character?.stats.wealth.toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ASSET_CATEGORIES.map(cat => (
          <button
            key={cat.label}
            className="w-full bg-[#161618] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-purple-500/50 group transition-all text-left"
          >
            <div className="bg-black/40 p-3 rounded-xl border border-white/5 group-hover:border-purple-500/50 transition-colors">
              <cat.icon className="w-5 h-5 text-purple-400 group-hover:text-purple-300" />
            </div>
            <div>
               <p className="text-xs font-bold uppercase tracking-tight text-slate-200 group-hover:text-white">{cat.label}</p>
               <p className="text-[9px] text-slate-500 tracking-wider font-mono font-bold uppercase">{cat.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};
