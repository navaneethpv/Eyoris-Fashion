// /api/scripts/seed_kaggle_imagekit.ts

import fs from "fs";
import path from "path";
import csv from "csv-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import slugify from "slugify";
import ImageKit from "imagekit"; // Use defaults
import { connectDB } from "../src/config/db";
import { ProductV2 } from "../src/models/ProductV2"; // IMPORT ProductV2

dotenv.config();

const DATASET_FILE = path.join(__dirname, "..", "dataset", "styles.csv");
const IMAGES_FOLDER = path.join(__dirname, "..", "dataset", "images");
const MAX_PER_CATEGORY = 800;

const BATCH_SIZE = 10;
let DISABLE_GEMINI_FOR_INGESTION = false;
const API_DELAY_MS = 13000;

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

interface KaggleRow {
    id: string;
    gender: string;
    masterCategory: string;
    subCategory: string;
    articleType: string;
    baseColour: string;
    season: string;
    year: string;
    usage: string;
    productDisplayName: string;
}

let geminiModel: any = null;
if (!DISABLE_GEMINI_FOR_INGESTION) {
    try {
        const { GoogleGenAI } = require("@google/genai");
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        geminiModel = genAI.getGenerativeModel({
            model: "gemini-pro",
        });
        console.log("✅ Gemini client initialized successfully.");
    } catch (e: any) {
        console.error("❌ Failed to initialize Gemini client:", e?.message || e);
        DISABLE_GEMINI_FOR_INGESTION = true;
    }
}

const categoryCount: Record<string, number> = {};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Normalize gender 
function normalizeGender(gender: string): string {
    const normalized = gender?.toLowerCase().trim();

    if (normalized === "men" || normalized === "man") return "Men";
    if (normalized === "women" || normalized === "woman") return "Women";
    if (normalized === "boys" || normalized === "girls" || normalized === "kids" || normalized === "children") return "Kids";
    if (normalized === "unisex" || normalized === "neutral") return "Men";

    return "Men";
}

// Normalize color
function normalizeColor(color: string): string {
    const colorMap: Record<string, string> = {
        "Navy Blue": "#001f3f",
        "Blue": "#1e40af",
        "Black": "#000000",
        "White": "#ffffff",
        "Grey": "#6b7280",
        "Gray": "#6b7280",
        "Red": "#dc2626",
        "Green": "#15803d",
        "Yellow": "#ca8a04",
        "Pink": "#db2777",
        "Purple": "#7c3aed",
        "Brown": "#78350f",
        "Beige": "#f5f5dc",
        "Copper": "#b87333",
        "Silver": "#9ca3af",
        "Gold": "#d4af37",
        "Orange": "#ea580c",
        "Maroon": "#7f1d1d"
    };

    const normalizedColor = colorMap[color?.trim()];
    return normalizedColor || "#9ca3af";
}

function generateRandomVariants(
    productId: string,
    masterCategory: string,
    baseColour: string
) {
    const variants = [];
    let sizes: string[] = [];
    switch (masterCategory) {
        case "Apparel":
            sizes = ["S", "M", "L", "XL"];
            break;
        case "Footwear":
            sizes = ["6", "7", "8", "9", "10"];
            break;
        default:
            return [
                {
                    size: "One Size",
                    color: baseColour,
                    sku: `${productId}-OS`,
                    stock: Math.floor(Math.random() * 100) + 10,
                },
            ];
    }
    for (const size of sizes) {
        variants.push({
            size,
            color: baseColour,
            sku: `${productId}-${size}`,
            stock: Math.floor(Math.random() * 100) + 10,
        });
    }
    return variants;
}

// REPLACED: Upload using ImageKit
async function uploadToImageKit(
    localPath: string,
    fileName: string,
    category: string
): Promise<string | null> {
    try {
        const fileBuffer = fs.readFileSync(localPath);
        const response = await imagekit.upload({
            file: fileBuffer, // Upload buffer
            fileName: fileName,
            folder: `eyoris/${category}`,
            useUniqueFileName: false,
        });
        return response.url; // Public URL
    } catch (err) {
        console.error(
            `❌ ImageKit upload failed for ${localPath}:`,
            (err as any).message || err
        );
        return null;
    }
}

async function processRow(
    row: KaggleRow,
    existingSlugs: Set<string>
): Promise<any | null> {
    const id = row.id?.toString().trim();
    if (!id) return null;

    const displayName = row.productDisplayName?.trim() || "Untitled Product";
    const slug =
        slugify(displayName, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
        }) + `-${id}`;

    if (existingSlugs.has(slug)) {
        return null;
    }

    const normalizedGender = normalizeGender(row.gender);
    const category = (row.articleType || row.masterCategory || "Apparel").trim();
    const masterCategory = (row.masterCategory || "Apparel").trim();

    if ((categoryCount[category] || 0) >= MAX_PER_CATEGORY) {
        return null;
    }

    const imagePath = path.join(IMAGES_FOLDER, `${id}.jpg`);
    if (!fs.existsSync(imagePath)) return null;

    try {
        // ImageKit Upload
        const imageUrl = await uploadToImageKit(imagePath, `${id}.jpg`, category);
        if (!imageUrl) return null;

        const normalizedHex = normalizeColor(row.baseColour);
        const dominantColorData = {
            name: row.baseColour?.trim() || "Unknown",
            hex: normalizedHex,
            rgb: []
        };


        let aiTagsData: {
            semanticColor?: string;
            style_tags?: string[];
            material_tags?: string[];
        } = {};

        if (!DISABLE_GEMINI_FOR_INGESTION && geminiModel) {
            const prompt = `Analyze this clothing description: "${displayName}". It's a ${row.baseColour} ${row.articleType} for ${normalizedGender}. Respond with a clean JSON object containing: "semanticColor", "style_tags" (array), and "material_tags" (array).`;
            try {

                const result = await geminiModel.generateContent([prompt]);
                const responseText = result.response.text();
                const cleaned = responseText
                    .replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();
                const aiData = JSON.parse(cleaned);
                aiTagsData = {
                    semanticColor: aiData.semanticColor?.toLowerCase(),
                    style_tags: aiData.style_tags,
                    material_tags: aiData.material_tags,
                };
            } catch (geminiError) {
                console.warn(`⚠️ Gemini call/parsing failed for ID ${id}.`);
            }
        }

        const priceInRupees = Math.floor(199 + Math.random() * 801);

        const variants = generateRandomVariants(id, masterCategory, row.baseColour);
        const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

        const productDocument = {
            name: displayName,
            slug: slug,
            brand: "Eyoris Basics",
            category,
            subCategory: row.subCategory || row.articleType,
            gender: normalizedGender,
            masterCategory,
            isFashionItem: true,
            description: `A stylish ${row.baseColour} ${row.articleType} for the ${row.season} season.`,
            price: priceInRupees,
            price_cents: priceInRupees * 100,
            price_before_cents: Math.round(priceInRupees * 1.35) * 100,
            images: [imageUrl],
            variants: variants,
            stock: totalStock,
            dominantColor: dominantColorData,
            aiTags: aiTagsData,
            rating: parseFloat((Math.random() * (5 - 3.8) + 3.8).toFixed(1)),
            reviewsCount: Math.floor(Math.random() * 200),
            isPublished: true,
        };

        if (!categoryCount[category]) categoryCount[category] = 0;
        categoryCount[category]++;
        console.log(`[SUCCESS] Added "${displayName}" to "${category}"`);
        return productDocument;
    } catch (error) {
        console.error(
            `[ERROR] Critical failure on product ID ${id}. Reason: ${(error as Error).message
            }`
        );
        return null;
    }
}

async function run() {
    console.log("--- Starting Incremental Seeder for ProductV2 (ImageKit) ---");
    await connectDB();
    console.log("✅ Connected to MongoDB");

    // Read from ProductV2
    console.log("🔎 Checking database for existing products in ProductV2...");
    const existingProducts = await ProductV2.find(
        {},
        { slug: 1, category: 1, _id: 0 }
    ).lean();
    const existingSlugs = new Set(existingProducts.map((p) => p.slug));

    for (const product of existingProducts) {
        if (!categoryCount[product.category]) categoryCount[product.category] = 0;
        categoryCount[product.category]++;
    }
    console.log(`Found ${existingSlugs.size} existing products in ProductV2.`);
    console.log("Initial category counts:", categoryCount);

    const productBatch: any[] = [];
    let newProductsAdded = 0;
    // Ensure DATASET_FILE exists
    if (!fs.existsSync(DATASET_FILE)) {
        console.error(`Dataset file not found at ${DATASET_FILE}`);
        process.exit(1);
    }

    const stream = fs.createReadStream(DATASET_FILE).pipe(csv());

    for await (const row of stream) {
        stream.pause();
        const productDoc = await processRow(row as KaggleRow, existingSlugs);

        if (productDoc) {
            productBatch.push(productDoc);
            newProductsAdded++;
        }
        if (productBatch.length >= BATCH_SIZE) {
            // Write to ProductV2
            await ProductV2.insertMany(productBatch);
            console.log(
                `--- 📦 DB INSERT: Wrote batch to ProductV2. New products added: ${newProductsAdded} ---`
            );
            productBatch.length = 0;
        }
        if (!DISABLE_GEMINI_FOR_INGESTION) {
            await delay(API_DELAY_MS);
        }
        stream.resume();
    }

    if (productBatch.length > 0) {
        await ProductV2.insertMany(productBatch);
        console.log(
            `--- 📦 DB INSERT: Wrote final batch to ProductV2. New products added: ${newProductsAdded} ---`
        );
    }

    console.log("\n🎉 Incremental Seeding Complete for ProductV2!");
    console.log(`✅ Total new products added: ${newProductsAdded}`);
    console.log("📊 Final category breakdown:", categoryCount);
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error("❌ Seeding process failed:", err);
    process.exit(1);
});
