
import { Router } from 'express';
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  requestReturn,
  approveReturn
} from '../controllers/orderController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/', createOrder);
router.get('/my', requireAuth, getUserOrders); // Protected route for user orders
router.get('/', getUserOrders); // Kept for backward compat (controller handles auth check)
router.get('/all', getAllOrders);

// Updated: Separate shipment and payment status updates
router.patch('/:id/order-status', updateOrderStatus); // Admin - Update shipment status
router.patch('/:id/payment-status', updatePaymentStatus); // Admin - Update payment status

// Legacy route for backward compatibility
router.patch('/:id/status', updateOrderStatus);

// User actions - Cancel & Return (Protected)
router.post('/:id/cancel', requireAuth, cancelOrder); // User - Cancel own order
router.post('/:id/return', requireAuth, requestReturn); // User - Request return

// Admin actions - Approve return
router.patch('/:id/return/approve', approveReturn); // Admin - Approve/reject return

export default router;
