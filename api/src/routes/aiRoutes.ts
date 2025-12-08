// api/src/routes/aiRoutes.ts

import { Router } from 'express';
import { upload } from '../config/multer';
import { searchByImageColor } from '../controllers/imageSearchController';
import { getOutfitRecommendations } from '../controllers/recommendationController';
import { getSuggestedCategory } from '../utils/geminiTagging'; // 👈 NEW IMPORT
import { generateOutfit } from '../controllers/aiOutfitController';

const router = Router();

router.post('/image-search', upload.single('image'), searchByImageColor);
router.get('/recommendations', getOutfitRecommendations);

// 🛑 NEW: Endpoint to get category from an uploaded file
router.post('/suggest-category', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Image file required.' });
    }
    
    try {
        const category = await getSuggestedCategory(req.file.buffer, req.file.mimetype);
        res.json({ suggested_category: category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'AI failed to suggest category.' });
    }
});
router.post('/outfit', generateOutfit);

export default router;