export const VALID_CATEGORIES = [
    "Clothes",
    "Shoes",
    "Shirts",
    "Jeans",
    "Belt",
    "Watch",
    "News", // From Navbar
];

export const VALID_SUBCATEGORIES: Record<string, string[]> = {
    Clothes: [
        "Formal Shirts",
        "Formal Trousers",
        "Hat",
        "Loungewear",
        "Formal Accessories",
        "Jackets & Coats",
        "Jumpers & Knitwear",
        "Pyjamas & Nightwear",
        "All Winter Wear",
        "Sweatshirts & Hoodies",
        "Coats & Jackets",
        "Trousers & Pants",
        "Shorts & Skirts",
        // Cross-listing these found in navbar to be safe, though they are also top-level keys often
        "Jeans",
        "Shirts"
    ],
    Shoes: [
        "Formal Shoes",
        "Casual Shoes",
        "Sports Shoes",
        "Heels",
        "Flats",
        "Sandals",
        "Flip Flops",
        "Boots",
        "Sports Sandals", // from categoryNormalizer
    ],
    Shirts: [
        "Formal Shirts",
        "Casual Shirts",
        "T-Shirts", // Common subcategories
    ],
    Jeans: [
        "Skinny Fit",
        "Slim Fit",
        "Regular Fit",
        "Relaxed Fit", // Common jeans types
    ],
    Belt: [
        "Leather Belts",
        "Formal Belts",
        "Casual Belts",
    ],
    Watch: [
        "Analog",
        "Digital",
        "Smartwatch",
    ],
    News: [],
};

// Helper to normalize input (e.g. "  Clothes  " -> "Clothes")
export const normalizeCategoryInput = (input: string): string => {
    if (!input) return "";
    const trimmed = input.trim();
    // Case-insensitive lookup
    const match = VALID_CATEGORIES.find(c => c.toLowerCase() === trimmed.toLowerCase());
    return match || trimmed; // Return matched pascal/title case or original trimmed
};

export const normalizeSubCategoryInput = (input: string): string => {
    if (!input) return "";
    return input.trim();
    // We don't force case here as strongly unless we want to map "formal shirts" -> "Formal Shirts"
    // But for DB consistency, Title Case is preferred.
};
