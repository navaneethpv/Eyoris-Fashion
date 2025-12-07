import { GoogleGenAI } from "@google/genai";
import { Buffer } from "buffer";
import dotenv from "dotenv";

const loadEnvIfMissing = () => {
  if (!process.env.GEMINI_API_KEY) {
    dotenv.config(); // 👈 Load .env
  }
};

loadEnvIfMissing();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper to convert Buffer to Part object for Gemini
function bufferToGenerativePart(buffer: Buffer, mimeType: string) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

// Interface for the desired JSON output from Gemini
interface GeminiColorResponse {
  dominant_color_name: string;
  dominant_color_hex: string;
}

/**
 * Sends an image to Gemini and requests the color of the *main garment*.
 * Gemini is instructed to respond in a clean JSON format.
 */
export async function getGarmentColorFromGemini(
  imageBuffer: Buffer,
  mimeType: string
): Promise<GeminiColorResponse> {
  const imagePart = bufferToGenerativePart(imageBuffer, mimeType);

  // The core of the prompt: instruct Gemini to focus on the clothing item
  const prompt = `Analyze the main clothing item in this image (e.g., T-shirt, hoodie, dress). Ignore the background, skin, and other non-clothing items. Provide only a JSON object with the dominant color of the main garment.
    
    Format: {"dominant_color_name": "exact color name, e.g., Black", "dominant_color_hex": "The color's approximate HEX code, e.g., #1A1A1A"}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        // The response schema helps guide Gemini to output valid JSON
        responseSchema: {
          type: "object",
          properties: {
            dominant_color_name: { type: "string" },
            dominant_color_hex: { type: "string" },
          },
          required: ["dominant_color_name", "dominant_color_hex"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }
    const jsonText = text
      .trim()
      .replace(/^```json|```$/g, "")
      .trim();
    return JSON.parse(jsonText) as GeminiColorResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(
      "Gemini failed to analyze the image. Check API key/limits."
    );
  }
}
