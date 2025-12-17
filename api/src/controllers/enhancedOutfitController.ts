import { Request, Response } from "express";
import { Product } from "../models/Product";

type Gender = "Men" | "Women" | "Kids";

type OutfitPlanItem = {
  role: "top" | "bottom" | "footwear" | "accessory";
  categories: string[];
};

type OutfitPlan = OutfitPlanItem[];

// Allowed base categories per gender (case-insensitive matching will be applied)
const BASE_CATEGORIES: Record<Gender, string[]> = {
  Men: [
    "Shirts",
    "T-Shirts",
    "Tops",
    "Jeans",
    "Pants",
    "Trousers",
    "Shorts",
    "Watches",
    "Belts",
    "Shoes",
    "Sneakers",
  ],
  Women: [
    "Dresses",
    "Kurtis",
    "Tops",
    "Skirts",
    "Jeans",
    "Pants",
    "Leggings",
    "Watches",
    "Bangles",
    "Earrings",
    "Necklaces",
    "Handbags",
    "Footwear",
    "Shoes",
    "Sandals",
    "Heels",
    "Flats",
  ],
  Kids: [
    "Tops",
    "Bottoms",
    "Dresses",
    "Shoes",
    "Accessories",
  ],
};

// Deterministic outfit rules per gender and base category
const OUTFIT_RULES: Record<Gender, Record<string, OutfitPlan>> = {
  Men: {
    Shirts: [
      { role: "bottom", categories: ["Jeans", "Pants", "Trousers", "Shorts"] },
      { role: "footwear", categories: ["Sneakers", "Shoes"] },
      { role: "accessory", categories: ["Watches", "Belts"] },
    ],
    "T-Shirts": [
      { role: "bottom", categories: ["Jeans", "Pants", "Shorts"] },
      { role: "footwear", categories: ["Sneakers"] },
      { role: "accessory", categories: ["Watches", "Belts"] },
    ],
    Tops: [
      { role: "bottom", categories: ["Jeans", "Pants", "Trousers", "Shorts"] },
      { role: "footwear", categories: ["Sneakers", "Shoes"] },
      { role: "accessory", categories: ["Watches", "Belts"] },
    ],
    Jeans: [
      { role: "top", categories: ["Shirts", "T-Shirts", "Tops"] },
      { role: "footwear", categories: ["Sneakers"] },
      { role: "accessory", categories: ["Watches", "Belts"] },
    ],
    Pants: [
      { role: "top", categories: ["Shirts", "T-Shirts", "Tops"] },
      { role: "footwear", categories: ["Sneakers", "Shoes"] },
      { role: "accessory", categories: ["Watches", "Belts"] },
    ],
    Trousers: [
      { role: "top", categories: ["Shirts", "T-Shirts", "Tops"] },
      { role: "footwear", categories: ["Sneakers", "Shoes"] },
      { role: "accessory", categories: ["Watches", "Belts"] },
    ],
    Shorts: [
      { role: "top", categories: ["T-Shirts", "Tops"] },
      { role: "footwear", categories: ["Sneakers"] },
      { role: "accessory", categories: ["Watches"] },
    ],
    Watches: [
      { role: "top", categories: ["Shirts", "T-Shirts", "Tops"] },
      { role: "bottom", categories: ["Jeans", "Pants", "Trousers", "Shorts"] },
    ],
    Belts: [
      { role: "top", categories: ["Shirts", "T-Shirts", "Tops"] },
      { role: "bottom", categories: ["Jeans", "Pants", "Trousers", "Shorts"] },
    ],
    Shoes: [
      { role: "top", categories: ["Shirts", "T-Shirts", "Tops"] },
      { role: "bottom", categories: ["Jeans", "Pants", "Trousers", "Shorts"] },
      { role: "accessory", categories: ["Watches", "Belts"] },
    ],
    Sneakers: [
      { role: "top", categories: ["Shirts", "T-Shirts", "Tops"] },
      { role: "bottom", categories: ["Jeans", "Pants", "Trousers", "Shorts"] },
      { role: "accessory", categories: ["Watches", "Belts"] },
    ],
  },
  Women: {
    Dresses: [
      { role: "footwear", categories: ["Flats", "Heels", "Sandals", "Footwear"] },
      { role: "accessory", categories: ["Earrings", "Handbags", "Bangles", "Necklaces"] },
    ],
    Kurtis: [
      { role: "bottom", categories: ["Leggings", "Jeans", "Pants"] },
      { role: "footwear", categories: ["Flats", "Sandals"] },
      { role: "accessory", categories: ["Bangles", "Earrings", "Handbags"] },
    ],
    Tops: [
      { role: "bottom", categories: ["Leggings", "Jeans", "Pants", "Skirts"] },
      { role: "footwear", categories: ["Flats", "Sandals", "Footwear"] },
      { role: "accessory", categories: ["Bangles", "Earrings", "Handbags", "Watches"] },
    ],
    Skirts: [
      { role: "top", categories: ["Tops", "Kurtis"] },
      { role: "footwear", categories: ["Flats", "Sandals", "Footwear"] },
      { role: "accessory", categories: ["Earrings", "Handbags", "Bangles"] },
    ],
    Jeans: [
      { role: "top", categories: ["Tops", "Kurtis"] },
      { role: "footwear", categories: ["Flats", "Sandals", "Footwear"] },
      { role: "accessory", categories: ["Handbags", "Watches"] },
    ],
    Pants: [
      { role: "top", categories: ["Tops", "Kurtis"] },
      { role: "footwear", categories: ["Flats", "Sandals", "Footwear"] },
      { role: "accessory", categories: ["Handbags", "Watches"] },
    ],
    Leggings: [
      { role: "top", categories: ["Kurtis", "Tops"] },
      { role: "footwear", categories: ["Flats", "Sandals", "Footwear"] },
      { role: "accessory", categories: ["Bangles", "Earrings", "Handbags"] },
    ],
    Watches: [
      { role: "top", categories: ["Tops", "Kurtis", "Dresses"] },
      { role: "bottom", categories: ["Jeans", "Pants", "Leggings", "Skirts"] },
    ],
    Bangles: [
      { role: "top", categories: ["Kurtis", "Dresses", "Tops"] },
      { role: "footwear", categories: ["Flats", "Sandals", "Footwear"] },
    ],
    Earrings: [
      { role: "top", categories: ["Kurtis", "Dresses", "Tops"] },
      { role: "footwear", categories: ["Flats", "Sandals", "Footwear"] },
    ],
    Necklaces: [
      { role: "top", categories: ["Kurtis", "Dresses", "Tops"] },
      { role: "footwear", categories: ["Flats", "Sandals", "Footwear"] },
    ],
    Handbags: [
      { role: "top", categories: ["Kurtis", "Dresses", "Tops"] },
      { role: "bottom", categories: ["Jeans", "Pants", "Leggings", "Skirts"] },
    ],
    Footwear: [
      { role: "top", categories: ["Kurtis", "Dresses", "Tops"] },
      { role: "bottom", categories: ["Jeans", "Pants", "Leggings", "Skirts"] },
      { role: "accessory", categories: ["Handbags", "Bangles", "Earrings"] },
    ],
    Shoes: [
      { role: "top", categories: ["Kurtis", "Dresses", "Tops"] },
      { role: "bottom", categories: ["Jeans", "Pants", "Leggings", "Skirts"] },
      { role: "accessory", categories: ["Handbags", "Bangles", "Earrings"] },
    ],
    Sandals: [
      { role: "top", categories: ["Kurtis", "Dresses", "Tops"] },
      { role: "bottom", categories: ["Jeans", "Pants", "Leggings", "Skirts"] },
      { role: "accessory", categories: ["Handbags", "Bangles", "Earrings"] },
    ],
    Heels: [
      { role: "top", categories: ["Kurtis", "Dresses", "Tops"] },
      { role: "bottom", categories: ["Jeans", "Pants", "Leggings", "Skirts"] },
      { role: "accessory", categories: ["Handbags", "Earrings"] },
    ],
    Flats: [
      { role: "top", categories: ["Kurtis", "Dresses", "Tops"] },
      { role: "bottom", categories: ["Jeans", "Pants", "Leggings", "Skirts"] },
      { role: "accessory", categories: ["Handbags", "Bangles", "Earrings"] },
    ],
  },
  Kids: {
    Tops: [
      { role: "bottom", categories: ["Bottoms"] },
      { role: "footwear", categories: ["Shoes", "Footwear"] },
      { role: "accessory", categories: ["Accessories"] },
    ],
    Bottoms: [
      { role: "top", categories: ["Tops"] },
      { role: "footwear", categories: ["Shoes", "Footwear"] },
      { role: "accessory", categories: ["Accessories"] },
    ],
    Dresses: [
      { role: "footwear", categories: ["Shoes", "Footwear"] },
      { role: "accessory", categories: ["Accessories"] },
    ],
    Shoes: [
      { role: "top", categories: ["Tops"] },
      { role: "bottom", categories: ["Bottoms"] },
      { role: "accessory", categories: ["Accessories"] },
    ],
    Accessories: [
      { role: "top", categories: ["Tops"] },
      { role: "bottom", categories: ["Bottoms"] },
      { role: "footwear", categories: ["Shoes", "Footwear"] },
    ],
  },
};

// Style vibe preferences (ordering influence, not hard filters)
const STYLE_VIBE_CATEGORY_PREFS: Record<string, string[]> = {
  office_casual: ["Shirts", "Trousers", "Pants", "Watches", "Shoes"],
  casual: ["T-Shirts", "Tops", "Jeans", "Shorts", "Sneakers"],
  festive: ["Dresses", "Kurtis", "Earrings", "Bangles", "Necklaces", "Handbags", "Heels"],
};

// Color groups for deterministic harmony
const NEUTRALS = [
  "black",
  "white",
  "grey",
  "gray",
  "navy",
  "navy blue",
  "beige",
  "cream",
  "ivory",
  "charcoal",
];
const WARM = ["red", "orange", "copper", "maroon", "burgundy", "mustard", "coral"];
const COOL = ["blue", "navy", "green", "teal", "aqua", "turquoise"];

function normalize(str: string | undefined | null): string {
  return (str || "").trim().toLowerCase();
}

function isNeutral(color: string) {
  const c = normalize(color);
  return NEUTRALS.some((n) => c.includes(n));
}

function isWarm(color: string) {
  const c = normalize(color);
  return WARM.some((n) => c.includes(n));
}

function isCool(color: string) {
  const c = normalize(color);
  return COOL.some((n) => c.includes(n));
}

// Returns a score (higher is better) for color compatibility
function colorCompatibilityScore(baseColor: string | null | undefined, candidateColor: string | null | undefined): number {
  const base = normalize(baseColor);
  const cand = normalize(candidateColor);
  if (!cand) return 0;

  const baseNeutral = isNeutral(base);
  const candNeutral = isNeutral(cand);

  // Neutral pairs with anything
  if (baseNeutral || candNeutral) {
    return 2;
  }

  // Avoid identical non-neutral colors
  if (base && cand && base === cand) {
    return 0.5;
  }

  const baseWarm = isWarm(base);
  const baseCool = isCool(base);
  const candWarm = isWarm(cand);
  const candCool = isCool(cand);

  // Warm pairs best with neutrals (handled), next with warm
  if (baseWarm && candWarm) return 1.5;

  // Cool pairs with cool (if not neutral)
  if (baseCool && candCool) return 1.5;

  // Cross warm/cool gets lower score
  if ((baseWarm && candCool) || (baseCool && candWarm)) return 0.8;

  // Fallback modest score
  return 1;
}

function normalizeCategories(categories: string[]): string[] {
  return categories.map((c) => c.trim()).filter(Boolean);
}

// Accessory priority groups with keywords for matching
// Each group contains keywords that should match against category, subCategory, or name
const ACCESSORY_PRIORITY: Record<Gender, string[][]> = {
  Women: [
    // Priority 1: Earrings (highest)
    ["earrings", "earring", "ear ring"],
    // Priority 2: Bangles / Jewelry
    ["bangles", "bangle", "bracelets", "bracelet", "jewelry", "jewellery", "jewels"],
    // Priority 3: Watches
    ["watches", "watch", "timepiece"],
    // Priority 4: Necklaces
    ["necklaces", "necklace", "pendant", "chain"],
    // Priority 5: Handbags
    ["handbags", "handbag", "clutch", "purse", "tote"],
    // Priority 6: Backpacks / Bags (lowest - fallback only)
    ["backpacks", "backpack", "bags", "bag", "rucksack"],
  ],
  Men: [
    // Priority 1: Watches (highest)
    ["watches", "watch", "timepiece"],
    // Priority 2: Belts / Wallets
    ["belts", "belt", "wallets", "wallet"],
    // Priority 3: Caps / Hats
    ["caps", "cap", "hats", "hat", "baseball cap"],
    // Priority 4: Sunglasses
    ["sunglasses", "sunglass", "shades"],
    // Priority 5: Backpacks / Bags (lowest - fallback only)
    ["backpacks", "backpack", "bags", "bag", "rucksack", "messenger bag"],
  ],
  Kids: [
    // Kids accessories - simpler priority
    ["watches", "watch"],
    ["caps", "cap", "hats", "hat"],
    ["bags", "bag", "backpacks", "backpack"],
  ],
};

// Check if a product matches any keyword in a priority group
function matchesAccessoryPriority(product: any, keywords: string[]): boolean {
  const name = normalize(product.name || "");
  const category = normalize(product.category || "");
  const subCategory = normalize(product.subCategory || "");
  const masterCategory = normalize(product.masterCategory || "");

  const searchFields = [name, category, subCategory, masterCategory].filter(Boolean);

  return keywords.some((keyword) => {
    // Check each field for the keyword
    return searchFields.some((field) => {
      // Exact match
      if (field === keyword) return true;
      
      // Contains match (case-insensitive, already normalized)
      // The priority order ensures higher priority items are checked first,
      // so even if "bag" matches "handbag", handbags will be selected in their priority group first
      if (field.includes(keyword)) return true;
      
      return false;
    });
  });
}

// Priority-based accessory selection
async function pickAccessoryWithPriority(
  baseProduct: any,
  gender: Gender,
  usedProductIds: Set<string>,
  usedCategories: Set<string>,
  styleVibe?: string,
): Promise<any | null> {
  const priorityGroups = ACCESSORY_PRIORITY[gender] || [];
  const baseColor = baseProduct?.dominantColor?.name;

  // Try each priority group in order
  for (const keywords of priorityGroups) {
    // Build query for this priority group
    const query: any = {
      isPublished: true,
      isFashionItem: true,
      gender,
      _id: { $ne: baseProduct._id.toString() },
      $or: [
        { subCategory: { $regex: keywords.join("|"), $options: "i" } },
        { category: { $regex: keywords.join("|"), $options: "i" } },
        { masterCategory: { $regex: keywords.join("|"), $options: "i" } },
        { name: { $regex: keywords.join("|"), $options: "i" } },
      ],
    };

    let candidates = await Product.find(query).lean();

    // Filter by keyword matching (more precise than regex)
    candidates = candidates.filter((p: any) => matchesAccessoryPriority(p, keywords));

    // Remove already used products and duplicate categories
    candidates = candidates.filter((p: any) => {
      const cat = normalize(p.subCategory || p.category || "");
      return !usedProductIds.has(String(p._id)) && !usedCategories.has(cat);
    });

    // If we have candidates, sort and pick the best one
    if (candidates.length > 0) {
      // Sort deterministically: color compatibility desc, style pref desc, price asc, rating desc
      candidates.sort((a: any, b: any) => {
        const aColorScore = colorCompatibilityScore(baseColor, a.dominantColor?.name || a.aiTags?.dominant_color_name);
        const bColorScore = colorCompatibilityScore(baseColor, b.dominantColor?.name || b.aiTags?.dominant_color_name);

        if (bColorScore !== aColorScore) return bColorScore - aColorScore;

        const aStyle = applyStylePreferenceWeight(a.subCategory || a.category || "", styleVibe);
        const bStyle = applyStylePreferenceWeight(b.subCategory || b.category || "", styleVibe);
        if (bStyle !== aStyle) return bStyle - aStyle;

        const aPrice = a.price_cents ?? Number.MAX_SAFE_INTEGER;
        const bPrice = b.price_cents ?? Number.MAX_SAFE_INTEGER;
        if (aPrice !== bPrice) return aPrice - bPrice;

        const aRating = a.rating ?? 0;
        const bRating = b.rating ?? 0;
        return bRating - aRating;
      });

      const picked = candidates[0];
      if (picked) {
        usedProductIds.add(String(picked._id));
        const pickedCategory = normalize(picked.subCategory || picked.category || "");
        usedCategories.add(pickedCategory);
        return picked;
      }
    }
  }

  // No accessory found in any priority group
  return null;
}

function buildQuery(
  categories: string[],
  gender: Gender,
  baseProductId: string,
) {
  const normalized = normalizeCategories(categories);
  return {
    isPublished: true,
    isFashionItem: true,
    gender,
    _id: { $ne: baseProductId },
    $or: [
      { subCategory: { $in: normalized } },
      { category: { $in: normalized } },
      { masterCategory: { $in: normalized } },
    ],
  };
}

function applyStylePreferenceWeight(category: string, styleVibe?: string): number {
  if (!styleVibe) return 0;
  const prefs = STYLE_VIBE_CATEGORY_PREFS[styleVibe];
  if (!prefs) return 0;
  const idx = prefs.findIndex((c) => c.toLowerCase() === category.toLowerCase());
  if (idx === -1) return 0;
  // Earlier items get slightly higher weight
  return Math.max(0, prefs.length - idx);
}

async function pickProductForPlan(
  plan: OutfitPlanItem,
  baseProduct: any,
  gender: Gender,
  usedProductIds: Set<string>,
  usedCategories: Set<string>,
  styleVibe?: string,
) {
  // Use priority-based selection for accessories
  if (plan.role === "accessory") {
    return await pickAccessoryWithPriority(
      baseProduct,
      gender,
      usedProductIds,
      usedCategories,
      styleVibe,
    );
  }

  // For non-accessory items, use the original logic
  const baseColor = baseProduct?.dominantColor?.name;
  const query = buildQuery(plan.categories, gender, baseProduct._id.toString());
  let candidates = await Product.find(query).lean();

  // Remove already used products and duplicate categories
  candidates = candidates.filter((p: any) => {
    const cat = normalize(p.subCategory || p.category || "");
    return !usedProductIds.has(String(p._id)) && !usedCategories.has(cat);
  });

  // Sort deterministically: color compatibility desc, style pref desc, price asc, rating desc
  candidates.sort((a: any, b: any) => {
    const aColorScore = colorCompatibilityScore(baseColor, a.dominantColor?.name || a.aiTags?.dominant_color_name);
    const bColorScore = colorCompatibilityScore(baseColor, b.dominantColor?.name || b.aiTags?.dominant_color_name);

    if (bColorScore !== aColorScore) return bColorScore - aColorScore;

    const aStyle = applyStylePreferenceWeight(a.subCategory || a.category || "", styleVibe);
    const bStyle = applyStylePreferenceWeight(b.subCategory || b.category || "", styleVibe);
    if (bStyle !== aStyle) return bStyle - aStyle;

    const aPrice = a.price_cents ?? Number.MAX_SAFE_INTEGER;
    const bPrice = b.price_cents ?? Number.MAX_SAFE_INTEGER;
    if (aPrice !== bPrice) return aPrice - bPrice;

    const aRating = a.rating ?? 0;
    const bRating = b.rating ?? 0;
    return bRating - aRating;
  });

  const picked = candidates[0];
  if (!picked) return null;

  usedProductIds.add(String(picked._id));
  const pickedCategory = normalize(picked.subCategory || picked.category || "");
  usedCategories.add(pickedCategory);

  return picked;
}

function findPlanForBase(gender: Gender, baseCategory: string): OutfitPlan | null {
  const plans = OUTFIT_RULES[gender];
  if (!plans) return null;
  const exact = plans[baseCategory];
  if (exact) return exact;

  // Try case-insensitive match
  const key = Object.keys(plans).find((k) => k.toLowerCase() === baseCategory.toLowerCase());
  return key ? plans[key] : null;
}

function isBaseCategoryAllowed(gender: Gender, baseCategory: string): boolean {
  const allowed = BASE_CATEGORIES[gender] || [];
  return allowed.some((c) => c.toLowerCase() === baseCategory.toLowerCase());
}

export const generateEnhancedOutfit = async (req: Request, res: Response) => {
  try {
    const { productId, userPreferences } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "productId required" });
    }

    const baseProduct = await Product.findById(productId).lean();
    if (!baseProduct) {
      return res.status(404).json({ message: "Base product not found." });
    }

    // Validate fashion item and gender
    const gender = (baseProduct.gender as Gender) || null;
    if (!gender || !["Men", "Women", "Kids"].includes(gender)) {
      return res.status(400).json({ message: "Unsupported or missing gender for base product." });
    }

    if (baseProduct.isFashionItem !== true) {
      return res.status(400).json({ message: "AI outfit suggestions are only available for fashion items." });
    }

    const baseCategory = baseProduct.subCategory || baseProduct.category;
    if (!baseCategory) {
      return res.status(400).json({ message: "Base product must have a category or subCategory." });
    }

    const plan = findPlanForBase(gender, baseCategory);
    if (!plan) {
      // If no specific plan exists, allow request to proceed but return empty outfit
      // This enables future expansion without blocking valid fashion items
      return res.json({
        base: baseProduct,
        outfitTitle: `Styled outfit for ${baseProduct.name}`,
        outfitItems: [],
        overallStyleExplanation: `Outfit generation rules for "${baseCategory}" are being expanded. Please try again later.`,
      });
    }

    const usedProductIds = new Set<string>();
    const usedCategories = new Set<string>([normalize(baseCategory)]);
    const matchedItems: any[] = [];
    const styleVibe = userPreferences?.styleVibe;

    for (const planItem of plan) {
      const picked = await pickProductForPlan(
        planItem,
        baseProduct,
        gender,
        usedProductIds,
        usedCategories,
        styleVibe,
      );
      if (picked) {
        matchedItems.push({
          role: planItem.role,
          suggestedType: planItem.categories[0],
          colorSuggestion: picked.dominantColor?.name || picked.aiTags?.dominant_color_name || "",
          colorHexSuggestion: picked.dominantColor?.hex || "",
          patternSuggestion: "solid",
          reason: `Matches ${baseCategory} with ${planItem.role} category ${planItem.categories[0]}`,
          product: picked,
        });
        if (matchedItems.length >= 3) break; // Limit to max 3 outfit items
      }
    }

    // Response structure remains consistent with existing controller pattern
    return res.json({
      base: baseProduct,
      outfitTitle: `Styled outfit for ${baseProduct.name}`,
      outfitItems: matchedItems,
      overallStyleExplanation:
        matchedItems.length > 0
          ? "Deterministic outfit based on gender, category, and color harmony."
          : "No compatible outfit items found for this product.",
    });
  } catch (error) {
    console.error("Enhanced AI Outfit Error:", error);
    return res.status(500).json({ message: "Failed to generate outfit." });
  }
};


