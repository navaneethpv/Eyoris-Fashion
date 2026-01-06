import { Router } from 'express';
import { generateTryOnPreview } from '../controllers/tryOnController';

const router = Router();

/**
 * @route POST /api/try-on/preview
 * @desc Generate a virtual try-on preview for accessories
 * @access Public (Prototype)
 */
router.post('/preview', generateTryOnPreview);

export default router;
