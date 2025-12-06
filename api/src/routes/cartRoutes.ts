import { Router } from 'express';
import { addToCart, getCart, removeFromCart } from '../controllers/cartController';

const router = Router();

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/', removeFromCart);

export default router;