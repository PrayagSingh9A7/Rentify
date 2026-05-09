import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['tenant', 'owner', 'admin'], default: 'tenant' },
    avatar: { type: String, default: '' },
    phone: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    recentlyViewed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
    preferences: {
      budget: { min: Number, max: Number },
      propertyType: [String],
      locations: [String],
      amenities: [String],
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpire;
  return obj;
};

export default mongoose.model('User', userSchema);