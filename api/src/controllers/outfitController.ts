import { Request, Response } from 'express';
import { Product, IProduct } from '../models/Product';
import mongoose from 'mongoose';

// Minimal constants for Phase 1
const ROLES = {
    TOP: 'Top',
    BOTTOM: 'Bottom',
    FOOTWEAR: 'Footwear',
    ACCESSORY: 'Accessory',
    OTHER: 'Other'
};

// Helper: Classify product into a role
const getProductRole = (product: IProduct): string => {
    const cat = (product.category || '').toLowerCase();
    const sub = (product.subCategory || '').toLowerCase();
    const name = (product.name || '').toLowerCase();

    // Footwear
    if (cat === 'shoes' || sub.includes('shoe') || sub.includes('sneaker') || sub.includes('boots') || sub.includes('sandal') || sub.includes('heels') || sub.includes('flats')) {
        return ROLES.FOOTWEAR;
    }

    // Tops
    if (cat === 'shirts' || sub.includes('shirt') || sub.includes('top') || sub.includes('tee') || sub.includes('polo') || sub.includes('blouse') || sub.includes('jacket') || sub.includes('coat') || sub.includes('sweater') || sub.includes('hoodie') || sub.includes('sweatshirt')) {
        return ROLES.TOP;
    }

    // Bottoms
    if (cat === 'jeans' || sub.includes('jean') || sub.includes('pant') || sub.includes('trouser') || sub.includes('legging') || sub.includes('jogger') || sub.includes('short') || sub.includes('skirt')) {
        return ROLES.BOTTOM;
    }

    // Accessories
    if (cat === 'watch' || cat === 'belt' || sub.includes('watch') || sub.includes('belt') || sub.includes('bag') || sub.includes('wallet') || sub.includes('hat') || sub.includes('cap') || sub.includes('accessory')) {
        return ROLES.ACCESSORY;
    }

    return ROLES.OTHER;
};

// POST /api/outfit/simple
export const generateSimpleOutfit = async (req: Request, res: Response) => {
    try {
        const { productId } = req.body; // Changed from baseProductId to productId to match frontend call

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required.' });
        }

        const baseProduct = await Product.findById(productId);
        if (!baseProduct) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        const baseRole = getProductRole(baseProduct);
        const gender = baseProduct.gender;

        // Base query for compatibility
        const baseQuery: any = {
            _id: { $ne: baseProduct._id },
            isPublished: true,
            stock: { $gt: 0 },
        };

        // Strict gender matching if available
        if (gender) {
            // Handle "Men"/"Male" normalization if needed, but assuming DB is consistent for now or using text match
            // Or simpler: match exact string first.
            baseQuery.gender = gender;
        }

        // Define roles to fill
        const rolesToFill = [ROLES.TOP, ROLES.BOTTOM, ROLES.FOOTWEAR];
        const suggestions: any[] = [];

        // Helper to get random product for role
        const getProductForRole = async (targetRole: string) => {
            let roleQuery: any = {};

            switch (targetRole) {
                case ROLES.TOP:
                    roleQuery = {
                        $or: [
                            { category: 'Shirts' },
                            { subCategory: { $regex: /shirt|top|tee|polo|blouse|jacket|coat|sweater|hoodie/i } }
                        ]
                    };
                    break;
                case ROLES.BOTTOM:
                    roleQuery = {
                        $or: [
                            { category: 'Jeans' },
                            { subCategory: { $regex: /jean|pant|trouser|legging|jogger|short|skirt/i } }
                        ]
                    };
                    break;
                case ROLES.FOOTWEAR:
                    roleQuery = {
                        $or: [
                            { category: 'Shoes' },
                            { subCategory: { $regex: /shoe|sneaker|boot|sandal|heel|flat/i } }
                        ]
                    };
                    break;
            }

            const products = await Product.aggregate([
                { $match: { ...baseQuery, ...roleQuery } },
                { $sample: { size: 1 } },
                {
                    $project: {
                        name: 1, slug: 1, price_cents: 1, brand: 1, category: 1, subCategory: 1, images: { $slice: ["$images", 1] }, variants: 1
                    }
                }
            ]);

            return products[0];
        };

        // fill missing roles
        for (const role of rolesToFill) {
            if (role === baseRole) continue; // Don't duplicate role (e.g. don't suggest Top if base is Top)
            // Actually, for simplicity Phase 1, let's just do it.

            const product = await getProductForRole(role);
            if (product) {
                suggestions.push({
                    role: role,
                    suggestedType: product.subCategory || product.category,
                    colorSuggestion: 'Matching',
                    colorHexSuggestion: '#000000',
                    reason: `Matches your ${baseRole}`,
                    product: product
                });
            }
        }

        res.json({
            outfitTitle: "Style Studio Pick",
            overallStyleExplanation: "A curated selection based on your item.",
            outfitItems: suggestions
        });

    } catch (error) {
        console.error("Simple Outfit Error:", error);
        res.status(500).json({ message: "Failed to generate outfit." });
    }
};
