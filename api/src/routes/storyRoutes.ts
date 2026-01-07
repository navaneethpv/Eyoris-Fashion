
import express from 'express';
import { createStory, getStories } from '../controllers/storyController';
import { upload } from '../config/multer';

const router = express.Router();

// Public: Get active stories
router.get('/', getStories);

// Protected: Upload story
// Clerk middleware is applied globally, so we check req.auth in controller
router.post('/', upload.single('image'), createStory);

export default router;
