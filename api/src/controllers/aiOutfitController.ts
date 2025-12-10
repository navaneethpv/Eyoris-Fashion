// /api/src/controllers/aiOutfitController.ts
import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { generateAIOutfits } from '../utils/aiOutfitGenerator';

// HELPER: map role to DB subCategory groups
const ROLE_TO_SUBCATEGORY: any = {
  top: ["Shirts", "T-Shirts", "Tops", "Kurtis", "Hoodies", "Sweaters", "Jackets"],
  bottom: ["Jeans", "Pants", "Trousers", "Joggers", "Skirts", "Shorts"],
  shoes: ["Shoes", "Sneakers", "Heels", "Sandals", "Boots"],
  accessories: ["Watches", "Bracelets", "Necklaces", "Bags", "Jewelry"]
};

async function findMatchingProduct(suggested: any, baseProductId: string) {
  const { suggestedType, role, colorSuggestion } = suggested;

  const validSubCategories = ROLE_TO_SUBCATEGORY[role.toLowerCase()] || [];

  const query: any = {
    isPublished: true,
    _id: { $ne: baseProductId },
    subCategory: { $in: validSubCategories }
  };

  if (colorSuggestion) {
    query['variants.color'] = new RegExp(colorSuggestion, "i");
  }

  let product = await Product.findOne(query).lean();

  if (!product) {
    delete query['variants.color'];
    product = await Product.findOne(query).lean();
  }

  return product;
}

export const generateOutfit = async (req: Request, res: Response) => {
  try {
    const { productId, userPreferences } = req.body; 
    const baseProduct = await Product.findById(productId).lean();
    if (!baseProduct) return res.status(404).json({ message: "Base product not found" });

    const inputData = {
      baseItem: {
        id: baseProduct._id.toString(),
        category: baseProduct.subCategory, // ⚠️ use subCategory
        color: baseProduct.variants[0]?.color,
        colorHex: baseProduct.dominantColor?.hex,
      },
      userPreferences: userPreferences || {}
    };

    const aiResult = await generateAIOutfits(inputData);

    const matched = [];
    for (const item of aiResult.outfitItems) {
      const p = await findMatchingProduct(item, baseProduct._id.toString());
      matched.push({ ...item, product: p });
    }

    res.json({
      base: baseProduct,
      outfitTitle: aiResult.outfitTitle,
      outfitItems: matched,
      overallStyleExplanation: aiResult.overallStyleExplanation,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to generate outfit" });
  }
};
