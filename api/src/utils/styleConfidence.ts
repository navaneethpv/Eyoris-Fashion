export function calculateStyleConfidence(product: any): number {
    if (!product) return 0;

    let score = 0;

    // 1. Rating (Max 30)
    // Assumes rating is 0-5.
    const rating = typeof product.rating === 'number' ? product.rating : 0;
    score += (rating / 5) * 30;

    // 2. Reviews Count (Max 15)
    // Cap at 100 reviews for max score.
    const reviews = typeof product.reviewsCount === 'number' ? product.reviewsCount : 0;
    score += Math.min(reviews / 100, 1) * 15;

    // 3. Views (Max 15)
    // Cap at 1000 views for max score.
    const views = typeof product.views === 'number' ? product.views : 0;
    score += Math.min(views / 1000, 1) * 15;

    // 4. Trend Relevance (Max 20)
    // Based on number of AI style tags. Cap at 4 tags.
    const styleTags = product.aiTags?.style_tags?.length || 0;
    score += Math.min(styleTags * 5, 20);

    // 5. Simulated Return Risk (10-20 points)
    // Deterministic "random" based on product ID to keep it consistent.
    // Using last few chars of ID converted to number.
    let riskScore = 15; // Default
    if (product._id) {
        const idStr = String(product._id);
        const num = parseInt(idStr.slice(-2), 16); // Hex to decimal
        // Normalize to range 10-20
        // num (0-255) -> (0-10) + 10
        riskScore = 10 + (num % 11);
    }
    score += riskScore;

    // Cap final score
    // Min 40, Max 95
    return Math.min(Math.max(Math.floor(score), 40), 95);
}
