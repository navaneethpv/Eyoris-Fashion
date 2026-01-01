
import { Router } from 'express';
import { getDashboardStats, getMonthlySales } from '../controllers/orderController';
import { User } from '../models/User';
import { clerkClient } from '@clerk/express';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/monthly-sales', getMonthlySales);

// Simple User List
router.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  // Fetch active sessions from Clerk to determine online status
  let onlineUserIds = new Set<string>();
  try {
    const sessions = await clerkClient.sessions.getSessionList({ status: "active" });
    sessions.data.forEach(session => onlineUserIds.add(session.userId));
  } catch (error) {
    console.error("Failed to fetch Clerk sessions:", error);
  }

  const formattedUsers = users.map(user => {
    const firstName = user.firstName?.trim();
    const lastName = user.lastName?.trim();
    const isOnline = onlineUserIds.has(user.clerkId);

    return {
      id: user._id,
      name:
        firstName || lastName
          ? `${firstName ?? ""} ${lastName ?? ""}`.trim()
          : "—",
      email: user.email,
      role: user.isAdmin ? "Administrator" : "Customer",
      joined: user.createdAt.toLocaleDateString(),
      lastSeenAt: user.lastSeenAt || null,
      isOnline,
    };
  });

  res.json({ users: formattedUsers });
});

export default router;
