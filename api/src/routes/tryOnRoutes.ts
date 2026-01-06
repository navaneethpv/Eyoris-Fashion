import express from 'express';
import { generateVirtualTryOn } from '../utils/tryOnAI';

const router = express.Router();

router.post('/preview', async (req, res) => {
    try {
        console.log("📦 Incoming Request Body Keys:", Object.keys(req.body));

        const { userImageBase64, productImageUrl, productType } = req.body;

        if (!userImageBase64 || !productImageUrl) {
            return res.status(400).json({ error: "Missing images" });
        }

        const positioning = await generateVirtualTryOn(userImageBase64, productImageUrl, productType);

        res.json({
            positioning,
            productImageUrl // Echo back so frontend can overlay it
        });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;