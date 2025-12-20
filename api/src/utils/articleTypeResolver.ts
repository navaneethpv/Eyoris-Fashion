// Universal database-backed article type resolver
// Resolve all search and image inputs to DB-backed articleTypes for exact matching

import { Product } from '../models/Product';

// Cache for article types (refresh periodically or on app start)
let cachedArticleTypes: string[] = [];
let lastFetched = 0;
const CACHE_TTL = 3600000; // 1 hour

/**
 * Fetch all distinct article types from database
 * This is the single source of truth for what products exist
 */
export async function getAllArticleTypes(): Promise<string[]> {
    const now = Date.now();

    // Return cached if still valid
    if (cachedArticleTypes.length > 0 && (now - lastFetched) < CACHE_TTL) {
        return cachedArticleTypes;
    }

    try {
        // Fetch all unique article types from DB
        const types = await Product.distinct('category').exec();
        cachedArticleTypes = types.filter(Boolean); // Remove nulls
        lastFetched = now;

        console.log(`[ARTICLE TYPES] Loaded ${cachedArticleTypes.length} types from database`);
        return cachedArticleTypes;
    } catch (error) {
        console.error('[ARTICLE TYPES] Error fetching from DB:', error);
        return cachedArticleTypes; // Return cached on error
    }
}

/**
 * Resolve user input to actual article types that exist in database
 * Uses fuzzy matching to handle variations
 * 
 * @param input - User search query or AI-detected category
 * @param articleTypes - List of all article types from database
 * @returns Array of matching article types, empty if no match
 */
export function resolveArticleTypes(input: string, articleTypes: string[]): string[] {
    if (!input || !articleTypes || articleTypes.length === 0) {
        return [];
    }

    const normalized = input.toLowerCase().trim();

    // Find all article types that match (bidirectional partial matching)
    const matches = articleTypes.filter(type => {
        const typeLower = type.toLowerCase();
        return typeLower.includes(normalized) || normalized.includes(typeLower);
    });

    console.log(`[ARTICLE RESOLVER] "${input}" → [${matches.join(', ')}]`);

    return matches;
}

/**
 * Special broad term mapping for terms that span multiple article types
 * E.g., "footwear" should match all shoe types
 */
export function resolveBroadTerms(input: string, articleTypes: string[]): string[] {
    const normalized = input.toLowerCase().trim();

    // Footwear encompasses all shoe types
    if (normalized.includes('footwear') || normalized.includes('chappals') || normalized.includes('chappal')) {
        return articleTypes.filter(type => {
            const typeLower = type.toLowerCase();
            return typeLower.includes('shoe') || typeLower.includes('sandal') ||
                typeLower.includes('heel') || typeLower.includes('flat') ||
                typeLower.includes('flip') || typeLower.includes('boot');
        });
    }

    // Bags encompasses all bag types
    if (normalized.includes('bags') && !normalized.includes('handbag')) {
        return articleTypes.filter(type => type.toLowerCase().includes('bag'));
    }

    // Jewelry/Jewellery encompasses all jewelry types
    if (normalized.includes('jewelry') || normalized.includes('jewellery')) {
        return articleTypes.filter(type => {
            const typeLower = type.toLowerCase();
            return typeLower.includes('jewel') || typeLower.includes('necklace') ||
                typeLower.includes('earring') || typeLower.includes('bracelet') ||
                typeLower.includes('ring') || typeLower.includes('bangle');
        });
    }

    // Accessories
    if (normalized.includes('accessories') || normalized.includes('accessory')) {
        return articleTypes.filter(type => {
            const typeLower = type.toLowerCase();
            return typeLower.includes('watch') || type Lower.includes('sunglass') ||
                typeLower.includes('belt') || typeLower.includes('cap') ||
                typeLower.includes('hat') || typeLower.includes('scarf');
        });
    }

    return [];
}
