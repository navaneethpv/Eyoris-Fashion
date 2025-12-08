import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { generateAIOutfits } from '../utils/aiOutfitGenerator';

// 🛑 NEW: POST /api/ai/outfit
export const generateOutfit = async (req: Request, res: Response) => {
  try {
    const { productId, userPreferences } = req.body; // Expect frontend to send these

    // 1. Fetch Product Data (to get all the necessary attributes)
    const baseProduct = await Product.findById(productId);
    if (!baseProduct) {
        return res.status(404).json({ message: 'Base product not found in catalog.' });
    }

    // 2. Format Input Data for Gemini (using the detailed schema from your prompt)
    const inputData = {
      baseItem: {
        id: baseProduct._id.toString(),
        category: baseProduct.category as string,
        type: baseProduct.category as string, // Simplification: using category for 'type'
        color: baseProduct.images[0]?.dominant_color || 'unknown',
        colorHex: baseProduct.images[0]?.dominant_color || '#000000',
        fit: baseProduct.tags.includes('oversized') ? 'oversized' : 'regular', // Simple tag check
        pattern: baseProduct.tags.includes('printed') ? 'printed' : 'solid',
        fabric: baseProduct.tags.find(t => t.toLowerCase().includes('cotton')) ? 'cotton' : 'blend', // Simple fabric check
        occasion: baseProduct.tags.includes('party') ? 'party' : 'casual',
        priceRange: (baseProduct.price_cents > 30000) ? 'high' : 'mid',
        season: 'summer' // Default for now
      },
      userPreferences: userPreferences || { gender: 'unisex', styleVibe: 'street', avoidColors: [] }
    };
    
    // 3. Call Gemini
    const outfitResult = await generateAIOutfits(inputData);
    
    // 4. Return Result
    res.json(outfitResult);

  } catch (error) {
    console.error('API Error during outfit generation:', error);
    res.status(500).json({ message: 'Failed to communicate with AI stylist.' });
  }
};