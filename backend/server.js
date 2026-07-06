require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const connectDB = require('./config/db');

connectDB();

const app = express();

app.use(compression({ level: 6, threshold: 1024 }));

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (
      origin.includes('localhost') ||
      origin.includes('vercel.app') ||
      (process.env.FRONTEND_URL && origin.startsWith(process.env.FRONTEND_URL))
    ) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/products', (req, res, next) => {
  if (req.method === 'GET') res.set('Cache-Control', 'public, max-age=15, stale-while-revalidate=30');
  next();
});

app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/ai',       require('./routes/ai'));

app.get('/api/seed', async (_, res) => {
  if (process.env.NODE_ENV !== 'production') return res.status(403).json({ message: 'Only in production' });
  try {
    const Product = require('./models/Product');
    const User = require('./models/User');
    const seed = require('./seed-data');
    await Product.deleteMany();
    await User.deleteMany();
    await Product.insertMany(seed.products);
    await User.create(seed.users[0]);
    await User.create(seed.users[1]);
    res.json({ message: '✅ Seeded successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/health', (_, res) => res.json({ status: 'NexaShop API running ✅' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
