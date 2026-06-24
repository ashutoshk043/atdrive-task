const express = require('express');
const router = express.Router();

const {
  createOrder,
  getOrderById,
  getOrders,
  updateOrder,
  deleteOrder,
} = require('../controller/orderController');

router.post('/create-order', createOrder);
router.get('/get-orders', getOrders);
router.get('/get-order-by-id/:id', getOrderById);
router.put('/update-order/:id', updateOrder);
router.delete('/delete-order/:id', deleteOrder);

module.exports = router;