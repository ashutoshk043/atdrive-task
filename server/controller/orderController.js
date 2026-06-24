const mongoose = require('mongoose');
const { pool } = require('../config/mySqlConnect');
const Order = require('../models/order');
const Product = require('../models/product');

// ── CREATE ────────────────────────────────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { userId, customerName, products } = req.body;

    if (!userId) {
      return res.json({ success: false, message: 'userId is required' });
    }

    if (!customerName?.trim()) {
      return res.json({ success: false, message: 'customerName is required' });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.json({
        success: false,
        message: 'products must be a non-empty array',
      });
    }

    // Verify User in MySQL
    const [users] = await pool.execute(
      'SELECT id, username FROM users WHERE id = ?',
      [userId]
    );
    if (!users.length) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Validate all productIds
    for (const item of products) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.json({
          success: false,
          message: `Invalid productId: ${item.productId}`,
        });
      }
    }

    // Fetch all products in one query
    const productIds = products.map((p) => p.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== productIds.length) {
      return res.json({
        success: false,
        message: 'One or more products not found',
      });
    }

    // Build embedded product list with name + price from DB
    const orderProducts = products.map((item) => {
      const dbProduct = dbProducts.find(
        (p) => p._id.toString() === item.productId.toString()
      );
      return {
        productId: dbProduct._id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity || 1,
      };
    });

    // Calculate total
    const totalAmount = orderProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      userId,
      customerName: customerName.trim(),
      products: orderProducts,
      totalAmount,
    });

    return res.json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

// ── GET ALL (with pagination) ─────────────────────────────────────────────────
const getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(),
    ]);

    // Format to match what Angular frontend expects
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      userId: order.userId,
      customerName: order.customerName,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      products: order.products.map((p) => ({
        _id: p.productId,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
      })),
    }));

    return res.json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: formattedOrders,
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

// ── GET SINGLE ────────────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: 'Invalid order id' });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, customerName, products } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: 'Invalid order id' });
    }

    const existingOrder = await Order.findById(id);
    if (!existingOrder) {
      return res.json({ success: false, message: 'Order not found' });
    }

    if (!customerName?.trim()) {
      return res.json({ success: false, message: 'customerName is required' });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res.json({
        success: false,
        message: 'products must be a non-empty array',
      });
    }

    // Validate all productIds
    for (const item of products) {
      if (!mongoose.Types.ObjectId.isValid(item.productId)) {
        return res.json({
          success: false,
          message: `Invalid productId: ${item.productId}`,
        });
      }
    }

    const productIds = products.map((p) => p.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== productIds.length) {
      return res.json({
        success: false,
        message: 'One or more products not found',
      });
    }

    const orderProducts = products.map((item) => {
      const dbProduct = dbProducts.find(
        (p) => p._id.toString() === item.productId.toString()
      );
      return {
        productId: dbProduct._id,
        name: dbProduct.name,
        price: dbProduct.price,
        quantity: item.quantity || 1,
      };
    });

    const totalAmount = orderProducts.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const updated = await Order.findByIdAndUpdate(
      id,
      {
        ...(userId && { userId }),
        customerName: customerName.trim(),
        products: orderProducts,
        totalAmount,
      },
      { new: true, runValidators: true }
    );

    return res.json({
      success: true,
      message: 'Order updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: 'Invalid order id' });
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.json({ success: false, message: 'Order not found' });
    }

    return res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
};