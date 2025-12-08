import { GoogleGenAI } from "@google/genai";
import { Buffer } from "buffer";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// This defines the output structure we want from Gemini
const GEMINI_JSON_SCHEMA = {
  type: "object",
  properties: {
    dominant_color_name: {
      type: "string",
      description:
        "The most noticeable color name (e.g., 'Navy Blue', 'Forest Green').",
    },
    style_tags: {
      type: "array",
      items: { type: "string" },
      description:
        "3 to 5 style tags for the product (e.g., 'Streetwear', 'Minimalist', 'Athleisure').",
    },
    material_tags: {
      type: "array",
      items: { type: "string" },
      description:
        "1 to 3 predicted material tags (e.g., 'Cotton', 'Polyester-Blend', 'Denim').",
    },
  },
  required: ["dominant_color_name", "style_tags"],
};

export const VALID_CATEGORIES = [
  "T-Shirts",
  "Dresses",
  "Jeans",
  "Sweaters",
  "Jackets",
  "Skirts",
  "Shorts",
  "Activewear",
  "Swimwear",
  "Underwear",
  "Socks",
  "Accessories",
];

const CATEGORY_SCHEMA = {
  type: "object",
  properties: {
    suggested_category: {
      type: "string",
      description: "The single most appropriate category for the item.",
    },
  },
  required: ["suggested_category"],
};

function bufferToGenerativePart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

/**
 * Analyzes an image buffer using Gemini Vision Pro and returns structured tags.
 * @param imageBuffer - The image data buffer (from Multer).
 * @param mimeType - The MIME type (e.g., 'image/jpeg').
 * @returns JSON object with color, style, and material tags.
 */
export async function getProductTagsFromGemini(
  imageBuffer: Buffer,
  mimeType: string
) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("⚠️ Gemini API Key missing. Skipping AI tagging.");
    return {
      dominant_color_name: "Default",
      style_tags: ["basic", "new-upload"],
      material_tags: ["fabric"],
    };
  }

  const imagePart = bufferToGenerativePart(imageBuffer, mimeType);
  const prompt =
    "Analyze the clothing item in this image. Do not include price or brand. Describe its color, style, and material for e-commerce tags. Respond in JSON format strictly following the provided schema.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: GEMINI_JSON_SCHEMA,
        temperature: 0.1,
      },
    });

    if (!response.text) {
      console.error("Gemini Tagging Error: Response text is undefined.");
      return {
        dominant_color_name: "Error",
        style_tags: ["ai-fail"],
        material_tags: ["unknown"],
      };
    }
    // The response text is a stringified JSON object
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Gemini Tagging Error:", error);
    return {
      dominant_color_name: "Error",
      style_tags: ["ai-fail"],
      material_tags: ["unknown"],
    };
  }
}
export async function getSuggestedCategory(
  imageBuffer: Buffer,
  mimeType: string
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "T-Shirts"; // Default fallback
  }

  const imagePart = bufferToGenerativePart(imageBuffer, mimeType);
  const prompt = `Analyze the clothing item in this image. Select the SINGLE most appropriate category from the list: ${VALID_CATEGORIES.join(
    ", "
  )}. Respond strictly in the required JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: CATEGORY_SCHEMA,
        temperature: 0.2,
      },
    });
    if (!response.text) {
      console.error(
        "Gemini Category Prediction Error: Response text is undefined."
      );
      return VALID_CATEGORIES[0]; // Fallback to the first category
    }

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);

    return result.suggested_category || VALID_CATEGORIES[0];
  } catch (error) {
    console.error("Gemini Category Prediction Error:", error);
    return VALID_CATEGORIES[0]; // Return the first category as a safe fallback
  }
}
