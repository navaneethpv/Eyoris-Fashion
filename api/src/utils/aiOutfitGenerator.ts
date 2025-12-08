// api/src/utils/aiOutfitGenerator.ts

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// @ts-ignore
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The complex set of rules and constraints defined in your prompt
const OUTFIT_GENERATION_RULES = `
  --- 👗 REQUIRED OUTFIT LOGIC ---
  1. If base is Kurti (women_ethnic): Try kurti + leggings + dupatta. Color logic: If kurti is light/pastel → suggest white/off-white/cream leggings and a soft complementary dupatta. If kurti is dark/bright → suggest neutral bottom (black, beige, cream) and dupatta that repeats or complements kurti color.
  2. If base is Shirt (men_western or women_western): Try shirt + pants + shoes. Color logic: White shirt → black / navy / charcoal pants + black / brown shoes. Light blue shirt → navy / charcoal / beige pants. Black shirt → grey / beige / white pants for contrast. Shoes: Formal: black or dark brown. Casual: white sneakers or loafers.
  3. If base is Crop Top (women_western): Try crop top + skirt + bag. Color logic: If crop top is plain color → skirt can be printed in a matching or complementary color. If crop top is patterned → skirt should be solid neutral. Bag: matching the skirt or neutral (black, tan, white).
  
  --- 🎨 GENERAL COLOR RULES ---
  Follow these rules: Neutrals (black, white, grey, beige, navy) go with almost everything. Use contrast: light top + dark bottom OR dark top + light bottom. Avoid making everything dark + heavy unless the occasion is party/night. When the base color is: White/Off-white → pair with almost any color. Black → pair with grey, white, beige, or one accent colour (red, blue, green). Pastel → pair with white, off-white, beige, light denim, or another pastel. Bright/Neon → balance with neutral bottoms (black, white, beige, denim).

  --- 📏 RULES & CONSTRAINTS ---
  * Always include the base item in the outfit as one of the outfitItems.
  * Use max 3–4 items.
  * Make sure the occasion matches (Office: neutral/simple, Party: bolder, Casual: comfortable).
  * Respect userPreferences.avoidColors and never use those colors.
`;

// Output Schema (Simplified from your prompt for easy implementation)
const OUTFIT_OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    outfitTitle: { type: "string" },
    baseItemId: { type: "string" },
    outfitItems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          role: { type: "string", description: "e.g., top, bottom, shoes, dupatta, layer" },
          suggestedType: { type: "string" },
          colorSuggestion: { type: "string" },
          colorHexSuggestion: { type: "string" },
          patternSuggestion: { type: "string" },
          reason: { type: "string" }
        },
        required: ["role", "suggestedType", "colorSuggestion"]
      }
    },
    overallStyleExplanation: { type: "string" },
    tags: { type: "array", items: { type: "string" } }
  },
  required: ["outfitTitle", "outfitItems"]
};


/**
 * Calls Gemini to generate a complete outfit based on the input item and rules.
 * @param inputData - The entire JSON object defining the base item and user prefs.
 * @returns Structured JSON response from Gemini.
 */
export async function generateAIOutfits(inputData: any) {
  if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API Key missing. Cannot generate outfit.");
  }
  
  const systemInstruction = `You are an AI fashion stylist. Your goal is to suggest a complete, matching outfit based on the provided base item and user preferences. Follow all rules and return only valid JSON. ${OUTFIT_GENERATION_RULES}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: JSON.stringify(inputData) }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: OUTFIT_OUTPUT_SCHEMA,
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    if (!response.text) {
      console.error("Gemini Outfit Generation Error: Response text is empty.");
      // Return a structured error response
      return { outfitTitle: "Error Generating Outfit", outfitItems: [], overallStyleExplanation: "The AI stylist failed to generate a suggestion because the response was empty.", tags: ["error"] };
    }
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Gemini Outfit Generation Error:", error);
    // Return a structured error response
    return { outfitTitle: "Error Generating Outfit", outfitItems: [], overallStyleExplanation: "The AI stylist failed to generate a suggestion. Please try again.", tags: ["error"] };
  }
}