import { GoogleGenAI } from "@google/genai";
import { Buffer } from "buffer";
import axios from 'axios';
import dotenv from "dotenv";

dotenv.config();

// 1. Init Client (Uses your existing API Key)
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Helper: Download Image
async function downloadImage(url: string): Promise<string> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        return Buffer.from(response.data).toString('base64');
    } catch (err) {
        throw new Error(`Failed to download image: ${url}`);
    }
}

export async function generateVirtualTryOn(
    userImageBase64: string,
    productImageUrl: string,
    productType: string
): Promise<{ generatedImageUrl: string }> {
    try {
        console.log("🍌 [Try-On] Starting 'Nano Banana' Image Generation...");

        // 2. Prepare Images
        // Clean the user image base64 if it has the header prefix
        const userClean = userImageBase64.includes(',')
            ? userImageBase64.split(',')[1]
            : userImageBase64;

        const productBase64 = await downloadImage(productImageUrl);

        // 3. The Generative Prompt
        const prompt = `
        ACT AS: Professional Fashion Retoucher.
        TASK: Create a photorealistic image of the person in the FIRST image wearing the jewelry from the SECOND image.

        DETAILS:
        - Product Type: ${productType}
        - PLACEMENT: Place the jewelry anatomically correctly (e.g., if it's a bangle, wrap it around the wrist).
        - LIGHTING: Match the lighting, shadows, and reflections of the user's photo exactly.
        - REALISM: The jewelry should cast realistic shadows on the skin.
        - PRESERVE: Keep the user's skin tone and background exactly as they are.

        OUTPUT:
        - Return ONLY the generated image.
        `;

        // 4. Call Gemini 2.0 Flash (The "Nano Banana" Model)
        const response = await client.models.generateContent({
            model: 'gemini-2.0-flash-exp', // <--- This is the only model that can do this!
            contents: [
                {
                    parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: userClean } },
                        { inlineData: { mimeType: 'image/jpeg', data: productBase64 } },
                        { text: prompt }
                    ]
                }
            ],
            config: {
                // 🛑 CRITICAL: We are asking for an IMAGE response, not JSON
                responseMimeType: 'image/jpeg'
            }
        });

        // 5. Extract the Image Data
        // The new SDK returns the binary image data inside inlineData
        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.[0];

        if (part && 'inlineData' in part && part.inlineData?.data) {
            console.log("🍌 [Try-On] Success! Image generated.");
            // Return as data URL format
            const base64Data = part.inlineData.data;
            return {
                generatedImageUrl: `data:image/jpeg;base64,${base64Data}`
            };
        }

        // If we get text instead (usually a safety refusal), throw an error
        if (part && 'text' in part && part.text) {
            console.error("🍌 Model refused:", part.text);
            throw new Error("AI Refusal: " + part.text);
        }

        throw new Error("No image returned from AI.");

    } catch (error: any) {
        // Handle Quota Errors (429) gracefully
        if (error.message?.includes('429')) {
            console.error("❌ Quota Exceeded for Gemini 2.0");
            throw new Error("Try-On is busy (Quota Exceeded). Please try again in a minute.");
        }
        console.error("❌ [Try-On] Error:", error);
        throw new Error(`AI Failed: ${error.message || 'Unknown error'}`);
    }
}