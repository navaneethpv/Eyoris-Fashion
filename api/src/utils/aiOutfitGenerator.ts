// /api/src/utils/aiOutfitGenerator.ts

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// @ts-ignore
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 🛑 NEW ROLE RULES BY SUBCATEGORY
const ROLE_RULES = `
Return only roles from the allowed roles below:
- If base is a TOP (Shirt, T-Shirt, Kurti, Hoodie, Sweater, Jacket): suggest only Bottom + Shoes + Accessories (NEVER another Top).
- If base is a BOTTOM (Jeans, Pants, Trousers, Skirt, Joggers, Shorts): suggest only Top + Shoes + Accessories (NEVER another Bottom).
- If base is Shoes: suggest Top + Bottom + Accessories.
- If base is Accessories (Watches, Bags, Bracelets, Jewelry): suggest Top + Bottom + Shoes.
`;

const OUTFIT_GENERATION_RULES = `
${ROLE_RULES}

🎨 Color Rules:
- Use contrast: light top + dark bottom OR dark top + light bottom.
- Use neutral bottoms (black, white, denim, beige) with bright tops.
- Respect avoidColors from user input.

📌 VALID JSON ONLY. Do not include text outside JSON.
`;

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
          role: { type: "string" },
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

export async function generateAIOutfits(inputData: any) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API Key missing.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: JSON.stringify(inputData)}] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: OUTFIT_OUTPUT_SCHEMA,
        systemInstruction: OUTFIT_GENERATION_RULES,
        temperature: 0.4
      }
    });

    if (!response.text) return { outfitTitle: "Error", outfitItems: [], overallStyleExplanation: "No AI Response" };

    return JSON.parse(response.text.trim());

  } catch (error) {
    console.error("Gemini Outfit Generation Error:", error);
    return { outfitTitle: "Error", outfitItems: [], overallStyleExplanation: "AI Failed", tags: ["error"] };
  }
}
