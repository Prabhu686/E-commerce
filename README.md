# ⚡ NexaShop — MERN E-Commerce

A full-stack MERN e-commerce app with unique features not found in typical shops.

## 🚀 Unique Features

| Feature | Description |
|---|---|
| 🧠 Mood-Based Shopping | Filter products by vibe: Energetic, Chill, Luxurious, Adventurous, Creative, Romantic |
| 🎰 Spin-to-Win Wheel | Daily canvas spin wheel — win discount coupons or loyalty points |
| 🎮 Gamified Loyalty | Bronze → Silver → Gold → Platinum with perks unlocked at each level |
| ⚡ Flash Deals | Live per-product countdown timers with real-time stock bars |
| 📊 Price History Chart | Chart.js line graph showing price changes over time per product |
| 💬 NexaBot Chat | Smart keyword-based chatbot with typing animation |
| 🛒 Smart Cart | Sidebar cart with AI-style "you might also like" recommendations |
| 🔥 Trending Ticker | Auto-scrolling live ticker of trending products |
| 🎁 Coupon System | Spin-earned coupons applied at checkout with real discount logic |
| ⭐ Order Loyalty | Earn 1 point per $1 spent, auto-level up after each order |

## 📁 Structure

```
E-commerce/
├── backend/          # Express + MongoDB API
│   ├── models/       # User, Product, Order
│   ├── controllers/  # Auth, Product, Order logic
│   ├── routes/       # REST endpoints
│   ├── middleware/   # JWT auth
│   ├── config/       # MongoDB connection
│   ├── seed.js       # 20 products + 2 users
│   └── server.js
└── frontend/         # React + Vite + Tailwind CSS v4
    └── src/
        ├── pages/    # Home, ProductDetail, Auth, Checkout, Orders, Profile, Admin
        ├── components/ # Navbar, CartSidebar, SpinWheel, ChatBot, FlashDeals, LoyaltySection
        ├── store/    # Zustand (auth + cart)
        └── api/      # Axios instance
```

## ⚙️ Setup

### Prerequisites
- Node.js 18+
- MongoDB running locally on port 27017

### 1. Backend
```bash
cd backend
npm install
node seed.js        # seed database with 20 products + 2 users
npm run dev         # runs on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev         # runs on http://localhost:5173
```

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@nexashop.com | admin123 |
| User | john@example.com | john1234 |

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/profile | Get profile (auth) |
| POST | /api/auth/spin | Daily spin wheel (auth) |
| PUT | /api/auth/wishlist/:id | Toggle wishlist (auth) |
| GET | /api/products | Get products (filter: mood, category, search, sort, flash) |
| GET | /api/products/trending | Trending products |
| GET | /api/products/:id | Product detail |
| GET | /api/products/:id/recommendations | Related products |
| POST | /api/products/:id/reviews | Add review (auth) |
| POST | /api/products | Create product (admin) |
| PUT | /api/products/:id | Update product (admin) |
| DELETE | /api/products/:id | Delete product (admin) |
| POST | /api/orders | Place order (auth) |
| GET | /api/orders/mine | My orders (auth) |
| PUT | /api/orders/:id/pay | Mark paid (auth) |
| GET | /api/orders | All orders (admin) |
| PUT | /api/orders/:id/status | Update status (admin) |
