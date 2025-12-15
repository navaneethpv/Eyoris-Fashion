
import { Router } from 'express';
import { getDashboardStats, getMonthlySales } from '../controllers/orderController';
import { User } from '../models/User';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/monthly-sales', getMonthlySales);

// Simple User List
router.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

export default router;
