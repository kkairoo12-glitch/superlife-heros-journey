import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Play, Plus, Trash2, Shield } from 'lucide-react';
import { getAllSaves, SaveSlot, setCurrentSaveId, deleteSaveSlot } from '../lib/saveSystem';
import { cn } from '../lib/utils';
import { Character } from '../types';

interface MainMenuProps {
  onNewGame: () => void;
  onLoadGame: (character: Character) => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onNewGame, onLoadGame }) => {
  const [saves, setSaves] = useState<SaveSlot[]>(() => {
    // Sort from newest to oldest
    return getAllSaves().sort((a, b) => b.lastPlayed - a.lastPlayed);
  });
  const [showLoadSection, setShowLoadSection] = useState(false);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this life?")) {
      deleteSaveSlot(id);
      setSaves(getAllSaves().sort((a, b) => b.lastPlayed - a.lastPlayed));
    }
  };

  const handleLoad = (save: SaveSlot) => {
    setCurrentSaveId(save.id);
    onLoadGame(save.data.character!);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden px-4">
       {/* Background */}
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black z-0" />
       
       <div className="relative z-10 max-w-xl w-full text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">Super</span>Life
            </h1>
            <p className="text-sm md:text-base text-slate-400 font-bold tracking-[0.4em] uppercase mb-16">The Hero Journey</p>
          </motion.div>

          {!showLoadSection ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-xs mx-auto">
              <button 
                onClick={onNewGame}
                className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase italic tracking-widest transition-all shadow-xl shadow-purple-600/20 active:scale-95"
              >
                <Plus className="w-5 h-5" /> Start New Life
              </button>

              <button 
                onClick={() => setShowLoadSection(true)}
                disabled={saves.length === 0}
                className={cn(
                  "w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase italic tracking-widest transition-all",
                  saves.length > 0 ? "bg-white/5 hover:bg-white/10 text-white border border-white/10" : "bg-white/5 text-slate-600 border border-transparent cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5" /> Load Previous Life
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full text-left bg-[#161618] border border-white/5 p-6 rounded-3xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase italic tracking-tight text-white">Select Save</h2>
                <button onClick={() => setShowLoadSection(false)} className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest">Back</button>
              </div>

              {saves.length > 0 ? (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                  {saves.map(save => (
                    <div 
                      key={save.id}
                      onClick={() => handleLoad(save)}
                      className="group cursor-pointer bg-black/40 border border-white/5 p-4 rounded-2xl hover:bg-white/5 hover:border-purple-500/50 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center">
                            {save.archetype === 'Hero' || save.archetype === 'Anti-Hero' ? <Shield className="w-6 h-6 text-indigo-400" /> : <User className="w-6 h-6 text-slate-400" />}
                         </div>
                         <div>
                           <h3 className="text-lg font-black text-white italic tracking-tight uppercase">{save.name}</h3>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{save.archetype} • Age {save.age}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block mr-4">
                          <p className="text-[10px] text-slate-500 font-medium">Last played</p>
                          <p className="text-xs text-slate-300 font-bold">{new Date(save.lastPlayed).toLocaleDateString()}</p>
                        </div>
                        <button 
                          onClick={(e) => handleDelete(save.id, e)}
                          className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                   No saved lives found
                </div>
              )}
            </motion.div>
          )}

       </div>
    </div>
  );
};
