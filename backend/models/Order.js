const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  brief: { type: String, required: true },
  attachments: [{ type: String }],
  status: { type: String, enum: ['en attente', 'en cours', 'livre', 'livré'], default: 'en attente' },
  paymentStatus: { type: String, enum: ['non paye', 'non payé', 'paye', 'payé'], default: 'non paye' },
  amount: { type: Number, required: true },
  stripeCheckoutSessionId: { type: String },
  stripePaymentIntentId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
