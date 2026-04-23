
import { GoogleGenAI } from "@google/genai";
import { Character, GameState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateYearlyEvent(gameState: GameState) {
  const { character } = gameState;
  if (!character || !character.stats) return "You spent the year quietly.";

  const prompt = `
    You are a narrator for a text-based life simulation game called "SuperLife: Hero's Journey".
    The player is ${character.age} years old and living in ${character.city}, ${character.country}.
    Their stats are: Happiness ${character.stats.happiness}, Health ${character.stats.health}, Intelligence ${character.stats.intelligence}, Attractiveness ${character.stats.attractiveness}, Power Level ${character.stats.powerLevel}.
    They have these superpowers: ${(character.powers || []).map(p => p.name).join(', ')}.
    They have these talents: ${(character.talents || []).join(', ')}.
    Current Job: ${character.job?.name || 'None'}.
    Education: ${character.educationLevel}.

    Generate 1-3 sentences describing a significant event that happened this year. 
    It can be a normal life event or a superhero/supervillain related event.
    Make it punchy, humorous, or dramatic, similar to BitLife.
    Return as a raw string.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Nothing much happened this year.";
  } catch (error) {
    console.error("Gemini event generation error:", error);
    return "Another year passes by.";
  }
}
