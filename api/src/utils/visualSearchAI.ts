import { GoogleGenAI } from "@google/genai";
import { Buffer } from "buffer";
import dotenv from "dotenv";

dotenv.config();

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

export interface VisualAnalysisResult {
    category: string;
    aiTags: string[];
    dominantColor: {
        name: string;
        hex: string;
        rgb: [number, number, number];
    };
}

const ALL_CATEGORIES = [
    "T-Shirts", "Shirts", "Jeans", "Dresses", "Jackets",
    "Kurtis", "Sarees", "Footwear", "Accessories", "Shoes"
];

const ANALYSIS_SCHEMA = {
    type: "object",
    properties: {
        category: {
            type: "string",
            description: `Must be exactly one from: ${ALL_CATEGORIES.join(", ")}`
        },
        aiTags: {
            type: "array",
            items: { type: "string" },
            description: "Semantic attributes like pattern (floral, solid), style (casual, formal), type (maxi, slim-fit)"
        },
        dominantColor: {
            type: "object",
            properties: {
                name: { type: "string" },
                hex: { type: "string" }
            },
            required: ["name", "hex"]
        }
    },
    required: ["category", "aiTags", "dominantColor"]
};

const hexToRgb = (hex: string): [number, number, number] => {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b];
};

export async function analyzeImageForVisualSearch(
    imageBuffer: Buffer,
    mimeType: string
): Promise<VisualAnalysisResult> {
    try {
        const imagePart = bufferToGenerativePart(imageBuffer, mimeType);

        const prompt = `Analyze this fashion image and extract metadata for visual search. 
    Focus on the main garment. 
    Identify the broad category (ONLY from the allowed list), key semantic attributes (style, pattern, material), and the dominant color of the item itself.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: "user", parts: [imagePart, { text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: ANALYSIS_SCHEMA as any,
                temperature: 0.1,
            },
        });

        const parsed = JSON.parse(response.text!);

        return {
            category: parsed.category,
            aiTags: parsed.aiTags,
            dominantColor: {
                name: parsed.dominantColor.name,
                hex: parsed.dominantColor.hex,
                rgb: hexToRgb(parsed.dominantColor.hex)
            }
        };
    } catch (err) {
        console.error("Visual Analysis Error:", err);
        throw new Error("Failed to analyze image for visual search.");
    }
}
