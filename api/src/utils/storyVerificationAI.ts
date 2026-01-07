import { GoogleGenAI } from "@google/genai";
import { Buffer } from "buffer";
import dotenv from "dotenv";
import axios from 'axios';

// Load environment variables if not already loaded
if (!process.env.GEMINI_API_KEY) {
    dotenv.config();
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

function bufferToGenerativePart(buffer: Buffer, mimeType: string) {
    return {
        inlineData: {
            data: buffer.toString("base64"),
            mimeType,
        },
    };
}

/**
 * Downloads an image from a URL and returns as Buffer + MimeType
 */
async function downloadImage(url: string): Promise<{ buffer: Buffer; mimeType: string }> {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 10000 });
        const buffer = Buffer.from(response.data);
        const mimeType = response.headers['content-type'] || 'image/jpeg';
        return { buffer, mimeType };
    } catch (error: any) {
        console.error(`Failed to download image from ${url}:`, error.message);
        throw new Error("Failed to download verification image.");
    }
}

/**
 * Verifies if the story image contains the product from the reference image.
 * 
 * @param productImageUrl - URL of the official product image
 * @param storyImageBuffer - Buffer of the user uploaded image
 * @param storyImageMimeType - MimeType of the user uploaded image
 * @returns Promise<boolean> - true if match, false otherwise
 */
export async function verifyStoryImage(
    productImageUrl: string,
    storyImageBuffer: Buffer,
    storyImageMimeType: string
): Promise<boolean> {
    try {
        console.log("[STORY_VERIFICATION] Starting Gemini verification...");

        // 1. Download Product Image
        const productImg = await downloadImage(productImageUrl);
        const productPart = bufferToGenerativePart(productImg.buffer, productImg.mimeType);

        // 2. Prepare Story Image
        const storyPart = bufferToGenerativePart(storyImageBuffer, storyImageMimeType);

        // 3. Prompt
        const prompt = `
        You are a strict product verification AI for a standard e-commerce platform.
        
        Image 1: Reference Product Image.
        Image 2: User Uploaded Story/Review Image.

        Question: Does Image 2 clearly show the physical product depicted in Image 1?
        
        Rules:
        - The user image might be the product worn by a person, or placed on a table/bed.
        - Ignore background differences, lighting, or slight styling differences.
        - Ignore the person wearing it (faces, bodies). Focus only on the product match.
        - If the product is clearly recognizable in the second image, say YES.
        - If the second image is blurry, irrelevant, or shows a completely different object, say NO.
        - Respond with ONLY "YES" or "NO".
        `;

        // 4. Call Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        productPart,
                        storyPart,
                        { text: prompt }
                    ]
                }
            ],
            config: {
                responseMimeType: "text/plain",
                temperature: 0.0, // Strict, deterministic
            },
        });

        const text = response.text?.trim().toUpperCase();
        console.log(`[STORY_VERIFICATION] Gemini Response: ${text}`);

        return text === "YES";

    } catch (error: any) {
        console.error("[STORY_VERIFICATION] Error:", error.message);
        // Fail open or closed? 
        // User requirements: "No CLIP" implies strict verification. 
        // If AI fails, we should probably allow it? Or deny?
        // Let's deny to be safe and avoid spam, but log it.
        // Actually, if Gemini is down, blocking users from uploading stories is annoying.
        // But preventing spam is better. I'll return false.
        return false;
    }
}
