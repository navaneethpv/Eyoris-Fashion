import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';

// POST /api/orders
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId, items, total_cents, shippingAddress } = req.body;

    // 1. Create the Order
    const newOrder = new Order({
      userId,
      items,
      total_cents,
      shippingAddress,
      status: 'paid', // Mocking successful payment
      paymentInfo: {
        method: 'credit_card',
        status: 'succeeded',
        id: `mock_pay_${Date.now()}`
      }
    });

    const savedOrder = await newOrder.save();

    // 2. Clear the User's Cart
    await Cart.findOneAndUpdate(
      { userId }, 
      { $set: { items: [] } }
    );

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// GET /api/orders?userId=...
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};