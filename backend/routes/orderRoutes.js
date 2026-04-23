const express = require('express');
const {
  getOrders,
  getOrderById,
  createOrder,
  createCheckoutSessionForOrder,
  confirmOrderPayment,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, admin, verifiedOnly } = require('../middleware/authMiddleware');
const { uploadOrderAttachments } = require('../config/multer');

const router = express.Router();

router.get('/', protect, getOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, verifiedOnly, uploadOrderAttachments.array('attachments', 5), createOrder);
router.post('/:id/checkout-session', protect, verifiedOnly, createCheckoutSessionForOrder);
router.post('/:id/confirm-payment', protect, verifiedOnly, confirmOrderPayment);
router.put('/:id', protect, uploadOrderAttachments.array('attachments', 5), updateOrder);
router.delete('/:id', protect, admin, deleteOrder);

module.exports = router;
