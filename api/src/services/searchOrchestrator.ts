import { searchProductsByVector, VectorSearchResult } from './vectorSearchService';

export type SearchDecision =
    | { type: 'VECTOR'; data: VectorSearchResult[] }
    | { type: 'FALLBACK' };

interface SmartSearchOptions {
    limit?: number;
    category?: string;
    gender?: string;
}

const MIN_RESULTS_THRESHOLD = 5;
const SIMILARITY_THRESHOLD = 0.75; // Cosine similarity: 1.0 is identical, 0.0 is orthogonal

/**
 * Smart Search Orchestrator
 * Decides whether to use Vector Search based on result quality, or fallback to keyword search.
 */
export const searchProductsSmart = async (
    queryEmbedding: number[] | undefined,
    options: SmartSearchOptions = {}
): Promise<SearchDecision> => {
    try {
        // 1. Safety Check: No embedding -> Fallback immediately
        if (!queryEmbedding || queryEmbedding.length === 0) {
            console.log("[SMART SEARCH] No embedding provided. Using FALLBACK.");
            return { type: 'FALLBACK' };
        }

        // 2. Execute Vector Search
        console.log("[SMART SEARCH] Executing Vector Search...");
        const vectorResults = await searchProductsByVector(queryEmbedding, options);

        // 3. Evaluate Results
        const resultCount = vectorResults.length;

        // Check 1: Enough results?
        if (resultCount < MIN_RESULTS_THRESHOLD) {
            console.log(`[SMART SEARCH] Low result count (${resultCount} < ${MIN_RESULTS_THRESHOLD}). Using FALLBACK.`);
            return { type: 'FALLBACK' };
        }

        // Check 2: Quality/Relevance (checking the top result's score)
        // Note: Atlas Vector Search scores for 'cosine' are 0 to 1 (1 being best).
        const topScore = vectorResults[0]?.searchScore || 0;

        if (topScore < SIMILARITY_THRESHOLD) {
            console.log(`[SMART SEARCH] Top result relevance low (${topScore.toFixed(2)} < ${SIMILARITY_THRESHOLD}). Using FALLBACK.`);
            return { type: 'FALLBACK' };
        }

        // If thresholds passed
        console.log(`[SMART SEARCH] ✅ Vector Search accepted. Count: ${resultCount}, Top Score: ${topScore.toFixed(4)}`);
        return { type: 'VECTOR', data: vectorResults };

    } catch (error) {
        console.error("[SMART SEARCH] Error during orchestrator execution:", error);
        // Safety: Always fallback on error
        return { type: 'FALLBACK' };
    }
};
