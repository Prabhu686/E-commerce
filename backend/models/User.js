const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  loyaltyPoints: { type: Number, default: 0 },
  loyaltyLevel: { type: String, enum: ['Bronze', 'Silver', 'Gold', 'Platinum'], default: 'Bronze' },
  spinUsedToday: { type: Boolean, default: false },
  spinLastDate: { type: Date },
  discountCoupon: { type: String, default: null },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  mood: { type: String, default: 'all' },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

userSchema.methods.updateLoyaltyLevel = function () {
  const p = this.loyaltyPoints;
  if (p >= 5000) this.loyaltyLevel = 'Platinum';
  else if (p >= 2000) this.loyaltyLevel = 'Gold';
  else if (p >= 500) this.loyaltyLevel = 'Silver';
  else this.loyaltyLevel = 'Bronze';
};

module.exports = mongoose.model('User', userSchema);
