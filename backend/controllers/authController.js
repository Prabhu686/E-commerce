const jwt = require('jsonwebtoken');
const User = require('../models/User');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email }))
    return res.status(400).json({ message: 'Email already exists' });
  const user = await User.create({ name, email, password });
  res.status(201).json({
    _id: user._id, name: user.name, email: user.email,
    role: user.role, loyaltyPoints: user.loyaltyPoints,
    loyaltyLevel: user.loyaltyLevel, token: genToken(user._id),
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  res.json({
    _id: user._id, name: user.name, email: user.email,
    role: user.role, loyaltyPoints: user.loyaltyPoints,
    loyaltyLevel: user.loyaltyLevel, discountCoupon: user.discountCoupon,
    token: genToken(user._id),
  });
};

const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name price images');
  res.json(user);
};

const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  user.name = req.body.name || user.name;
  user.mood = req.body.mood || user.mood;
  if (req.body.password) user.password = req.body.password;
  await user.save();
  res.json({ name: user.name, mood: user.mood });
};

const spinWheel = async (req, res) => {
  const user = await User.findById(req.user._id);
  const today = new Date().toDateString();
  if (user.spinUsedToday && user.spinLastDate?.toDateString() === today)
    return res.status(400).json({ message: 'Already spun today! Come back tomorrow.' });

  const prizes = [
    { label: '5% OFF', coupon: 'SPIN5', type: 'discount' },
    { label: '10% OFF', coupon: 'SPIN10', type: 'discount' },
    { label: '50 Points', coupon: null, type: 'points', points: 50 },
    { label: 'Free Ship', coupon: 'FREESHIP', type: 'shipping' },
    { label: '15% OFF', coupon: 'SPIN15', type: 'discount' },
    { label: '100 Points', coupon: null, type: 'points', points: 100 },
    { label: 'Try Again', coupon: null, type: 'none' },
    { label: '20% OFF', coupon: 'SPIN20', type: 'discount' },
  ];

  const prize = prizes[Math.floor(Math.random() * prizes.length)];
  user.spinUsedToday = true;
  user.spinLastDate = new Date();

  if (prize.type === 'points') {
    user.loyaltyPoints += prize.points;
    user.updateLoyaltyLevel();
  } else if (prize.coupon) {
    user.discountCoupon = prize.coupon;
  }

  await user.save();
  res.json({ prize, loyaltyPoints: user.loyaltyPoints, loyaltyLevel: user.loyaltyLevel });
};

const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
};

const toggleWishlist = async (req, res) => {
  const user = await User.findById(req.user._id);
  const pid = req.params.productId;
  const idx = user.wishlist.indexOf(pid);
  if (idx === -1) user.wishlist.push(pid);
  else user.wishlist.splice(idx, 1);
  await user.save();
  res.json({ wishlist: user.wishlist });
};

module.exports = { register, login, getProfile, updateProfile, spinWheel, toggleWishlist, getAllUsers };
