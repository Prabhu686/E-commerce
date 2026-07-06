const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

const COUPONS = {
  SPIN5: 5, SPIN10: 10, SPIN15: 15, SPIN20: 20, FREESHIP: 0,
};

const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponUsed } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'No items' });

  let itemsPrice = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || product.stock < item.qty)
      return res.status(400).json({ message: `${product?.name || 'Product'} out of stock` });
    itemsPrice += product.price * item.qty;
    product.stock -= item.qty;
    product.sold += item.qty;
    await product.save();
  }

  let discountAmount = 0;
  let shippingPrice = itemsPrice > 100 ? 0 : 9.99;

  if (couponUsed && COUPONS[couponUsed] !== undefined) {
    if (couponUsed === 'FREESHIP') shippingPrice = 0;
    else discountAmount = (itemsPrice * COUPONS[couponUsed]) / 100;
    const user = await User.findById(req.user._id);
    if (user.discountCoupon === couponUsed) { user.discountCoupon = null; await user.save(); }
  }

  const totalPrice = itemsPrice - discountAmount + shippingPrice;
  const loyaltyEarned = Math.floor(totalPrice);

  const order = await Order.create({
    user: req.user._id, items, shippingAddress, paymentMethod,
    itemsPrice, shippingPrice, discountAmount, totalPrice,
    couponUsed, loyaltyEarned,
  });

  const user = await User.findById(req.user._id);
  user.loyaltyPoints += loyaltyEarned;
  user.updateLoyaltyLevel();
  await user.save();

  res.status(201).json(order);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order || order.user._id.toString() !== req.user._id.toString())
    return res.status(404).json({ message: 'Order not found' });
  res.json(order);
};

const payOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  order.isPaid = true;
  order.paidAt = new Date();
  order.status = 'processing';
  await order.save();
  res.json(order);
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
  res.json(orders);
};

const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  order.status = req.body.status;
  if (req.body.status === 'delivered') { order.isDelivered = true; order.deliveredAt = new Date(); }
  if (req.body.trackingNumber !== undefined) order.trackingNumber = req.body.trackingNumber;
  await order.save();
  res.json(order);
};

const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
  if (!['pending', 'processing'].includes(order.status)) return res.status(400).json({ message: 'Cannot cancel this order' });
  order.status = 'cancelled';
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty, sold: -item.qty } });
  }
  await order.save();
  res.json(order);
};

const requestReturn = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Not found' });
  if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
  if (order.status !== 'delivered') return res.status(400).json({ message: 'Only delivered orders can be returned' });
  order.status = 'return_requested';
  order.returnReason = req.body.reason || 'No reason provided';
  await order.save();
  res.json(order);
};

module.exports = { createOrder, getOrderById, payOrder, getMyOrders, getAllOrders, updateOrderStatus, cancelOrder, requestReturn };
