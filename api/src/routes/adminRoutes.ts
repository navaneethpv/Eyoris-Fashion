
import { Router } from 'express';
import { getDashboardStats, getMonthlySales } from '../controllers/orderController';
import { requireAdmin, requireSuperAdmin } from '../middleware/adminAuth';
import { promoteToAdmin, demoteFromAdmin } from '../controllers/userController';
import { User } from '../models/User';

const router = Router();

// Apply admin protection to all routes in this file
router.use(requireAdmin);

router.get('/stats', getDashboardStats);
router.get('/monthly-sales', getMonthlySales);

// Super Admin Routes
router.patch('/users/:id/promote', requireSuperAdmin, promoteToAdmin);
router.patch('/users/:id/demote', requireSuperAdmin, demoteFromAdmin);

// Simple User List
router.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  const currentUser = (req as any).user;

  const formattedUsers = users.map((user: any) => {
    const firstName = user.firstName?.trim();
    const lastName = user.lastName?.trim();
    const isOnline = user.isOnline; // DIRECT FROM DB

    return {
      id: user._id,
      name:
        firstName || lastName
          ? `${firstName ?? ""} ${lastName ?? ""}`.trim()
          : "—",
      email: user.email,
      role: user.role === 'admin' || user.role === 'super_admin' ? "Administrator" : "Customer",
      rawRole: user.role, // Exposed for frontend logic
      joined: user.createdAt.toLocaleDateString(),
      lastSeenAt: user.lastSeenAt || null,
      isOnline,
    };
  });

  res.json({
    users: formattedUsers,
    currentUserRole: currentUser?.role
  });
});

export default router;
