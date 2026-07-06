require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/db');

const products = [
  // ── ELECTRONICS ──
  {
    name: 'boAt Rockerz 450 Bluetooth Headphones',
    description: 'On-ear wireless headphones with 15 hours playback, 40mm drivers, and foldable design. Deep bass with soft padded earcups for all-day comfort.',
    price: 1299, originalPrice: 3490, category: 'electronics',
    moods: ['chill', 'energetic'], stock: 120, sold: 4800,
    isFeatured: true, isTrending: true, isFlashDeal: true,
    flashDiscount: 20, flashDealEnds: new Date(Date.now() + 86400000 * 2),
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80',
    ],
    tags: ['headphones', 'boat', 'wireless', 'bluetooth'], rating: 4.2, numReviews: 28450,
  },
  {
    name: 'Samsung Galaxy S23 FE 5G',
    description: '6.4" Super AMOLED display, Exynos 2200 processor, 50MP triple camera, 4500mAh battery with 25W fast charging. Available in Graphite, Cream, Mint.',
    price: 34999, originalPrice: 44999, category: 'electronics',
    moods: ['luxurious', 'creative'], stock: 45, sold: 1230,
    isFeatured: true, isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80',
    ],
    tags: ['samsung', 'smartphone', '5g', 'android'], rating: 4.4, numReviews: 9870,
  },
  {
    name: 'Apple MacBook Air M2',
    description: '13.6" Liquid Retina display, Apple M2 chip, 8GB RAM, 256GB SSD, 18-hour battery life. Fanless design, MagSafe charging.',
    price: 99900, originalPrice: 114900, category: 'electronics',
    moods: ['creative', 'luxurious'], stock: 18, sold: 560,
    isFeatured: true, isFlashDeal: true,
    flashDiscount: 13, flashDealEnds: new Date(Date.now() + 86400000 * 3),
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
      'https://images.unsplash.com/photo-1611186871525-9c4a1e5e7e5e?w=600&q=80',
    ],
    tags: ['apple', 'macbook', 'laptop', 'm2'], rating: 4.8, numReviews: 3420,
  },
  {
    name: 'Sony WH-1000XM5 Noise Cancelling',
    description: 'Industry-leading noise cancellation, 30-hour battery, multipoint connection, speak-to-chat technology. Foldable design with premium carrying case.',
    price: 24990, originalPrice: 34990, category: 'electronics',
    moods: ['chill', 'luxurious'], stock: 35, sold: 2100,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80',
    ],
    tags: ['sony', 'headphones', 'noise-cancelling', 'premium'], rating: 4.7, numReviews: 5670,
  },
  {
    name: 'Redmi Note 13 Pro 5G',
    description: '200MP OIS camera, 6.67" AMOLED 120Hz display, Snapdragon 7s Gen 2, 5100mAh battery, 67W turbo charging. IP54 splash resistant.',
    price: 23999, originalPrice: 29999, category: 'electronics',
    moods: ['energetic', 'adventurous'], stock: 90, sold: 6700,
    isTrending: true, isFlashDeal: true,
    flashDiscount: 15, flashDealEnds: new Date(Date.now() + 86400000),
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&q=80',
    ],
    tags: ['redmi', 'xiaomi', 'smartphone', '5g', '200mp'], rating: 4.3, numReviews: 14200,
  },

  // ── FASHION ──
  {
    name: 'Levi\'s 511 Slim Fit Jeans',
    description: 'Slim fit through seat and thigh, straight leg opening. Made with stretch denim for all-day comfort. Available in multiple washes.',
    price: 2999, originalPrice: 4999, category: 'fashion',
    moods: ['chill', 'adventurous'], stock: 200, sold: 8900,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80',
      'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600&q=80',
    ],
    tags: ['levis', 'jeans', 'denim', 'slim-fit'], rating: 4.4, numReviews: 12300,
  },
  {
    name: 'Nike Air Max 270 React',
    description: 'Lightweight React foam midsole with large Air unit for maximum cushioning. Breathable mesh upper with dynamic support. Iconic silhouette.',
    price: 9995, originalPrice: 12995, category: 'fashion',
    moods: ['energetic', 'adventurous'], stock: 75, sold: 3400,
    isFeatured: true, isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
    ],
    tags: ['nike', 'shoes', 'sneakers', 'airmax'], rating: 4.5, numReviews: 7800,
  },
  {
    name: 'Allen Solly Men\'s Formal Shirt',
    description: 'Regular fit formal shirt in premium cotton blend. Wrinkle-resistant fabric, spread collar, full button placket. Perfect for office and events.',
    price: 1299, originalPrice: 2499, category: 'fashion',
    moods: ['luxurious', 'creative'], stock: 300, sold: 15600,
    images: [
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80',
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80',
    ],
    tags: ['allen-solly', 'shirt', 'formal', 'cotton'], rating: 4.2, numReviews: 18900,
  },

  // ── SPORTS ──
  {
    name: 'Adidas Ultraboost 22 Running Shoes',
    description: 'Responsive Boost midsole returns energy with every stride. Primeknit+ upper adapts to your foot. Continental rubber outsole for superior grip.',
    price: 12999, originalPrice: 17999, category: 'sports',
    moods: ['energetic'], stock: 60, sold: 2800,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80',
    ],
    tags: ['adidas', 'running', 'ultraboost', 'shoes'], rating: 4.6, numReviews: 4500,
  },
  {
    name: 'Boldfit Yoga Mat 6mm Anti-Slip',
    description: 'Extra thick 6mm TPE yoga mat with alignment lines. Non-slip texture on both sides, moisture resistant, eco-friendly material. Includes carry strap.',
    price: 799, originalPrice: 1999, category: 'sports',
    moods: ['energetic', 'chill'], stock: 400, sold: 22000,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1601925228008-f5e4c5e5e5e5?w=600&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80',
    ],
    tags: ['yoga', 'mat', 'fitness', 'exercise'], rating: 4.3, numReviews: 31200,
  },
  {
    name: 'Wildcraft Trailblazer 45L Backpack',
    description: 'Durable 45L trekking backpack with rain cover, padded shoulder straps, multiple compartments, and hydration sleeve. Ideal for weekend treks.',
    price: 2499, originalPrice: 4999, category: 'sports',
    moods: ['adventurous'], stock: 85, sold: 3600,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80',
      'https://images.unsplash.com/photo-1622260614153-03223fb72052?w=600&q=80',
    ],
    tags: ['wildcraft', 'backpack', 'trekking', 'hiking'], rating: 4.4, numReviews: 6700,
  },

  // ── HOME ──
  {
    name: 'Prestige Iris 750W Mixer Grinder',
    description: '3 stainless steel jars (1.5L, 1L, 0.4L), 3-speed control with incher, overload protection, ISI certified. Ideal for Indian cooking.',
    price: 2295, originalPrice: 3995, category: 'home',
    moods: ['creative'], stock: 150, sold: 9800,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    ],
    tags: ['prestige', 'mixer', 'grinder', 'kitchen'], rating: 4.3, numReviews: 24500,
  },
  {
    name: 'Milton Thermosteel Flask 1 Litre',
    description: 'Double wall stainless steel vacuum insulated flask. Keeps beverages hot for 24 hours and cold for 48 hours. Leak-proof, BPA-free.',
    price: 699, originalPrice: 1299, category: 'home',
    moods: ['adventurous', 'energetic'], stock: 500, sold: 45000,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80',
    ],
    tags: ['milton', 'flask', 'thermos', 'insulated'], rating: 4.5, numReviews: 67800,
  },
  {
    name: 'Philips Air Fryer HD9200',
    description: 'Rapid Air Technology for crispy results with up to 90% less fat. 4.1L capacity, 7 preset programs, digital display, dishwasher-safe parts.',
    price: 6995, originalPrice: 9995, category: 'home',
    moods: ['creative'], stock: 70, sold: 5600,
    isFeatured: true, isFlashDeal: true,
    flashDiscount: 30, flashDealEnds: new Date(Date.now() + 86400000 * 1.5),
    images: [
      'https://images.unsplash.com/photo-1648146956409-a5e7e5e5e5e5?w=600&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
    ],
    tags: ['philips', 'airfryer', 'kitchen', 'healthy'], rating: 4.4, numReviews: 11200,
  },

  // ── BEAUTY ──
  {
    name: 'Lakme 9 to 5 Primer + Matte Foundation',
    description: 'SPF 20 foundation with built-in primer. 16-hour stay, oil-control formula. Available in 10 shades for Indian skin tones. Lightweight, buildable coverage.',
    price: 449, originalPrice: 699, category: 'beauty',
    moods: ['creative', 'romantic'], stock: 250, sold: 34000,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80',
    ],
    tags: ['lakme', 'foundation', 'makeup', 'matte'], rating: 4.1, numReviews: 42300,
  },
  {
    name: 'Forest Essentials Facial Ubtan',
    description: 'Ayurvedic face scrub with pure saffron, turmeric, and rose water. Brightens skin, removes tan, and gives a natural glow. Suitable for all skin types.',
    price: 1295, originalPrice: 1695, category: 'beauty',
    moods: ['luxurious', 'romantic'], stock: 120, sold: 8900,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=600&q=80',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80',
    ],
    tags: ['forest-essentials', 'ayurvedic', 'skincare', 'ubtan'], rating: 4.6, numReviews: 5600,
  },
  {
    name: 'Mamaearth Vitamin C Face Serum',
    description: 'With 10% Vitamin C and Turmeric. Reduces dark spots, brightens skin, and boosts collagen. Dermatologically tested, toxin-free, suitable for all skin types.',
    price: 599, originalPrice: 999, category: 'beauty',
    moods: ['creative'], stock: 300, sold: 28000,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&q=80',
      'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80',
    ],
    tags: ['mamaearth', 'serum', 'vitamin-c', 'skincare'], rating: 4.2, numReviews: 19800,
  },

  // ── BOOKS ──
  {
    name: 'Atomic Habits — James Clear',
    description: 'The #1 New York Times bestseller. A proven framework for improving every day. Learn how tiny changes lead to remarkable results in life and work.',
    price: 399, originalPrice: 799, category: 'books',
    moods: ['energetic', 'creative'], stock: 500, sold: 78000,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
    ],
    tags: ['atomic-habits', 'self-help', 'productivity', 'bestseller'], rating: 4.8, numReviews: 89000,
  },
  {
    name: 'The Psychology of Money — Morgan Housel',
    description: 'Timeless lessons on wealth, greed, and happiness. 19 short stories exploring the strange ways people think about money. A must-read for every Indian investor.',
    price: 349, originalPrice: 599, category: 'books',
    moods: ['chill', 'creative'], stock: 400, sold: 45000,
    isFeatured: true,
    images: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80',
    ],
    tags: ['finance', 'money', 'investing', 'bestseller'], rating: 4.7, numReviews: 34500,
  },
  {
    name: 'Rich Dad Poor Dad — Robert Kiyosaki',
    description: 'The #1 personal finance book of all time. What the rich teach their kids about money that the poor and middle class do not. Over 32 million copies sold.',
    price: 299, originalPrice: 495, category: 'books',
    moods: ['energetic', 'adventurous'], stock: 600, sold: 120000,
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    ],
    tags: ['rich-dad', 'finance', 'investing', 'classic'], rating: 4.6, numReviews: 156000,
  },
];

const seed = async () => {
  await connectDB();
  await Product.deleteMany();
  await User.deleteMany();

  const seededProducts = await Product.insertMany(
    products.map(p => ({
      ...p,
      priceHistory: [
        { price: p.originalPrice, date: new Date(Date.now() - 86400000 * 30) },
        { price: Math.round(p.originalPrice * 0.92), date: new Date(Date.now() - 86400000 * 15) },
        { price: p.price, date: new Date() },
      ],
    }))
  );

  await User.create({
    name: 'Admin User',
    email: 'admin@nexashop.com',
    password: 'admin123',
    role: 'admin',
    loyaltyPoints: 5000,
    loyaltyLevel: 'Platinum',
  });

  await User.create({
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'rahul1234',
    loyaltyPoints: 750,
    loyaltyLevel: 'Silver',
  });

  console.log(`Seeded ${seededProducts.length} products and 2 users`);
  process.exit();
};

seed().catch(err => { console.error(err); process.exit(1); });
