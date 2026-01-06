import { Request, Response } from 'express';
import { generateVirtualTryOn } from '../utils/tryOnAI';

/**
 * Handles the virtual try-on image generation.
 * This uses Gemini to generate a photorealistic composite image.
 */
export const generateTryOnPreview = async (req: Request, res: Response) => {
    try {
        const { userImageBase64, productImageUrl, productType } = req.body;

        // 1. Validation
        if (!userImageBase64 || !productImageUrl || !productType) {
            return res.status(400).json({
                message: 'Missing required fields: userImageBase64, productImageUrl, and productType are required.'
            });
        }

        const validTypes = ['bangle', 'ring', 'necklace', 'earring'];
        if (!validTypes.some(t => productType.toLowerCase().includes(t))) {
            return res.status(400).json({
                message: `Invalid productType. Must be one of: ${validTypes.join(', ')}`
            });
        }

        // 2. AI Image Generation (or fallback to positioning)
        console.log(`🍌 Generating ${productType} try-on composite for: ${productImageUrl}`);

        const result = await generateVirtualTryOn(
            userImageBase64,
            productImageUrl,
            productType
        );

        // Check if we got an image or positioning data
        if (result.generatedImageUrl) {
            // Image generation successful
            return res.status(200).json({
                success: true,
                generatedImageUrl: result.generatedImageUrl,
                message: 'Virtual try-on image generated successfully'
            });
        } else {
            // Fallback: positioning coordinates
            return res.status(200).json({
                success: true,
                positioning: result,
                message: 'Positioning analyzed successfully'
            });
        }

    } catch (error: any) {
        console.error('Try-On Preview Error:', error.message);
        return res.status(500).json({
            message: 'Failed to generate try-on preview.',
            error: error.message || 'Unknown error'
        });
    }
};