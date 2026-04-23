import { GameState } from '../types';

const MULTI_SAVE_KEY = 'superlife_hero_multi_saves';
const AUTO_SAVE_ID_KEY = 'superlife_current_save_id';

export interface SaveSlot {
  id: string;
  name: string;
  age: number;
  archetype: string;
  lastPlayed: number;
  data: GameState;
}

export const getAllSaves = (): SaveSlot[] => {
  try {
    const raw = localStorage.getItem(MULTI_SAVE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Load saves failed:', err);
    return [];
  }
};

export const saveGameToSlot = (id: string, state: GameState) => {
  try {
    const saves = getAllSaves();
    const idx = saves.findIndex(s => s.id === id);
    const newSave: SaveSlot = {
      id,
      name: state.character?.name || 'Unknown',
      age: state.character?.age || 0,
      archetype: state.character?.archetype || 'Civilian',
      lastPlayed: Date.now(),
      data: state
    };

    if (idx >= 0) {
      saves[idx] = newSave;
    } else {
      saves.push(newSave);
    }

    localStorage.setItem(MULTI_SAVE_KEY, JSON.stringify(saves));
  } catch (err) {
    console.error('Save failed:', err);
  }
};

export const loadGameFromSlot = (id: string): GameState | null => {
  const saves = getAllSaves();
  const save = saves.find(s => s.id === id);
  return save ? save.data : null;
};

export const deleteSaveSlot = (id: string) => {
  const saves = getAllSaves().filter(s => s.id !== id);
  localStorage.setItem(MULTI_SAVE_KEY, JSON.stringify(saves));
};

export const getCurrentSaveId = (): string | null => {
  return localStorage.getItem(AUTO_SAVE_ID_KEY);
};

export const setCurrentSaveId = (id: string) => {
  localStorage.setItem(AUTO_SAVE_ID_KEY, id);
};

export const clearCurrentSaveId = () => {
  localStorage.removeItem(AUTO_SAVE_ID_KEY);
};

// Backwards compatibility for the autosave loop inside Game.tsx
export const saveGame = (state: GameState) => {
  const currentId = getCurrentSaveId();
  if (currentId) {
    saveGameToSlot(currentId, state);
  } else {
    // If somehow we don't have an ID, generate one and save
    const newId = `save_${Date.now()}`;
    setCurrentSaveId(newId);
    saveGameToSlot(newId, state);
  }
  return true;
};

// Kept purely for the old initial load check, though we should transition away from it in App.tsx
export const loadGame = (): GameState | null => {
  const currentId = getCurrentSaveId();
  if (currentId) {
    return loadGameFromSlot(currentId);
  }
  
  // Backwards compatibility for very old saves that were just one big blob
  const oldSave = localStorage.getItem('superlife_hero_journey_save');
  if (oldSave) {
    try {
      const parsed = JSON.parse(oldSave);
      const newId = `save_${Date.now()}`;
      setCurrentSaveId(newId);
      saveGameToSlot(newId, parsed);
      localStorage.removeItem('superlife_hero_journey_save'); // Clear old save
      return parsed;
    } catch {}
  }

  return null;
};

export const clearSave = () => {
  const currentId = getCurrentSaveId();
  if (currentId) {
     deleteSaveSlot(currentId);
     clearCurrentSaveId();
  }
};
