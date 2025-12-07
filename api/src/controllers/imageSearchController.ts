import { Request, Response } from 'express';
// import getColors from 'get-image-colors'; // 🛑 REMOVE local library
import { Product } from '../models/Product';
import { calculateColorDistance, distanceToSimilarity } from '../utils/colorMath';
import { getGarmentColorFromGemini } from '../utils/geminiColorAnalyzer'; // 👈 NEW

// Helper to convert HEX to RGB
const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};


export const searchByImageColor = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    
    const imageBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    // 1. 🛑 NEW: Call Gemini for Garment Color 🛑
    const geminiResult = await getGarmentColorFromGemini(imageBuffer, mimeType);
    
    const queryColor = {
      hex: geminiResult.dominant_color_hex,
      ...hexToRgb(geminiResult.dominant_color_hex)
    };

    // 2. Fetch Candidates (Same as before)
    const candidates = await Product.find({ is_published: true })
      .select('name slug price_cents images category')
      .limit(2000) 
      .lean();

    // 3. The Algorithm: Vector Ranking (Same as before, using new queryColor)
    const results = candidates.map((product: any) => {
      // ... (Same distance calculation logic using calculateColorDistance)
      const productImage = product.images[0];
      if (!productImage || productImage.r === undefined) return null;

      const productRGB = { 
        r: productImage.r, 
        g: productImage.g, 
        b: productImage.b 
      };

      const distance = calculateColorDistance(queryColor, productRGB);
      const similarity = distanceToSimilarity(distance);

      return {
        ...product,
        similarity,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.similarity - a.similarity)
    .slice(0, 48);

    res.json({
      queryColor: {
          hex: queryColor.hex,
          name: geminiResult.dominant_color_name
      },
      results
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error.message || 'Error processing image with Gemini' });
  }
};