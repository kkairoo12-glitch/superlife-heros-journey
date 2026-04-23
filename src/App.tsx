/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CharacterCreation } from './components/CharacterCreation';
import { Game } from './components/Game';
import { MainMenu } from './components/MainMenu';
import { Character } from './types';
import { loadGame, clearCurrentSaveId } from './lib/saveSystem';

type AppView = 'menu' | 'creation' | 'game';

export default function App() {
  const [character, setCharacter] = useState<Character | null>(null);
  const [view, setView] = useState<AppView>('menu');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there's an active/recent save and boot if we want a seamless experience,
    // or just let them stay on the menu. For now, since user explicitly wants a load menu,
    // we'll default to the menu unless they explicitly had a seamless continuation desire.
    // Let's check for old single-save migration, but keep the user on the MainMenu by default.
    loadGame(); // This will migrate old single save to multi-saves transparently in the background.
    setIsLoading(false);
  }, []);

  const startNewGame = (newCharacter: Character) => {
    setCharacter(newCharacter);
    setView('game');
  };

  const loadSave = (savedCharacter: Character) => {
    setCharacter(savedCharacter);
    setView('game');
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-white italic font-black">INITIALIZING SIMULATION...</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-indigo-500/30">
      <AnimatePresence mode="wait">
        {view === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MainMenu 
               onNewGame={() => {
                 clearCurrentSaveId();
                 setView('creation');
               }} 
               onLoadGame={loadSave} 
            />
          </motion.div>
        )}

        {view === 'creation' && (
          <motion.div key="creation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <CharacterCreation onComplete={startNewGame} onCancel={() => setView('menu')} />
          </motion.div>
        )}

        {view === 'game' && character && (
          <motion.div key="game" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <Game initialCharacter={character} onExitToMenu={() => setView('menu')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
