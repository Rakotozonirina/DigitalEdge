const Stripe = require('stripe');
const Order = require('../models/Order');
const Service = require('../models/Service');

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const buildAttachmentPaths = (files = []) =>
  files.map((file) => `/uploads/orders/${file.filename}`);

const canAccessOrder = (order, user) =>
  user.role === 'admin' || String(order.client) === String(user._id);

const getFrontendBaseUrl = () =>
  process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

const serializeOrder = async (orderId) =>
  Order.findById(orderId)
    .populate('client', 'name email')
    .populate('service', 'title price image');

const createCheckoutSession = async (order, service, user) => {
  if (!stripe) {
    throw new Error('Stripe n est pas configure.');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    success_url: `${getFrontendBaseUrl()}/payment/success?order=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getFrontendBaseUrl()}/payment/cancel?order=${order._id}`,
    metadata: {
      orderId: String(order._id),
      serviceId: String(service._id),
      userId: String(user._id),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(Number(order.amount || 0) * 100),
          product_data: {
            name: service.title,
            description: `Commande MahaTech #${order._id}`,
          },
        },
      },
    ],
  });

  order.stripeCheckoutSessionId = session.id;
  await order.save();

  return session;
};

const getOrders = async (req, res) => {
  try {
    const query = req.user.role === 'admin' ? {} : { client: req.user._id };

    const orders = await Order.find(query)
      .populate('client', 'name email')
      .populate('service', 'title price image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await serializeOrder(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    if (!canAccessOrder(order, req.user)) {
      return res.status(403).json({ message: 'Acces refuse a cette commande' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { service: serviceId, brief } = req.body;

    if (!serviceId || !brief) {
      return res.status(400).json({ message: 'Le service et le brief sont requis' });
    }

    const service = await Service.findById(serviceId);

    if (!service) {
      return res.status(404).json({ message: 'Service introuvable' });
    }

    const order = await Order.create({
      client: req.user._id,
      service: service._id,
      brief,
      attachments: buildAttachmentPaths(req.files),
      amount: service.price,
    });

    const populatedOrder = await serializeOrder(order._id);

    if (Number(service.price) > 0) {
      const session = await createCheckoutSession(order, service, req.user);

      return res.status(201).json({
        order: populatedOrder,
        checkoutUrl: session.url,
        requiresPayment: true,
      });
    }

    res.status(201).json({
      order: populatedOrder,
      checkoutUrl: null,
      requiresPayment: false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCheckoutSessionForOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('service', 'title price image');

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    if (!canAccessOrder(order, req.user)) {
      return res.status(403).json({ message: 'Acces refuse a cette commande' });
    }

    if (order.paymentStatus === 'paye' || order.paymentStatus === 'payÃ©') {
      return res.status(400).json({ message: 'Cette commande est deja payee.' });
    }

    if (!order.amount || Number(order.amount) <= 0) {
      return res.status(400).json({ message: 'Cette commande ne necessite pas de paiement.' });
    }

    const session = await createCheckoutSession(order, order.service, req.user);

    res.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmOrderPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Le sessionId Stripe est requis.' });
    }

    if (!stripe) {
      return res.status(500).json({ message: 'Stripe n est pas configure.' });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    if (!canAccessOrder(order, req.user)) {
      return res.status(403).json({ message: 'Acces refuse a cette commande' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.metadata?.orderId !== String(order._id)) {
      return res.status(400).json({ message: 'Session Stripe invalide pour cette commande.' });
    }

    if (session.payment_status === 'paid') {
      order.paymentStatus = 'paye';
      order.stripeCheckoutSessionId = session.id;
      order.stripePaymentIntentId = session.payment_intent ? String(session.payment_intent) : undefined;
      await order.save();
    }

    const populatedOrder = await serializeOrder(order._id);

    res.json({
      order: populatedOrder,
      paymentStatus: session.payment_status,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    if (!canAccessOrder(order, req.user)) {
      return res.status(403).json({ message: 'Acces refuse a cette commande' });
    }

    const isAdmin = req.user.role === 'admin';

    if (req.body.brief !== undefined) {
      order.brief = req.body.brief;
    }

    if (req.files && req.files.length > 0) {
      order.attachments = [...order.attachments, ...buildAttachmentPaths(req.files)];
    }

    if (isAdmin && req.body.status !== undefined) {
      order.status = req.body.status;
    }

    if (isAdmin && req.body.paymentStatus !== undefined) {
      order.paymentStatus = req.body.paymentStatus;
    }

    await order.save();

    const populatedOrder = await serializeOrder(order._id);

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    await order.deleteOne();
    res.json({ message: 'Commande supprimee avec succes' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  createCheckoutSessionForOrder,
  confirmOrderPayment,
  updateOrder,
  deleteOrder,
};
