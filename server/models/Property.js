import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: {
      type: String,
      enum: ['pg', 'flat', 'room', 'villa', 'studio', 'hostel'],
      required: true,
    },
    rent: { type: Number, required: true },
    deposit: { type: Number, default: 0 },
    maintenanceCharges: { type: Number, default: 0 },
    address: {
      street: String,
      locality: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      pincode: String,
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    images: [{ url: String, publicId: String }],
    amenities: [String],
    furnishing: { type: String, enum: ['furnished', 'semi-furnished', 'unfurnished'], default: 'unfurnished' },
    genderPreference: { type: String, enum: ['male', 'female', 'any'], default: 'any' },
    occupancy: { type: String, enum: ['single', 'double', 'triple', 'any'], default: 'single' },
    bhk: { type: Number, default: 1 },
    bathrooms: { type: Number, default: 1 },
    area: { type: Number, default: 0 },
    floorNumber: { type: Number, default: 0 },
    totalFloors: { type: Number, default: 1 },
    availableFrom: { type: Date, default: Date.now },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    virtualTourUrl: { type: String, default: '' },
    noticePeriod: { type: Number, default: 30 },
    rules: [String],
    tags: [String],
    viewCount: { type: Number, default: 0 },
    inquiryCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    availabilityCalendar: [
      {
        date: Date,
        isBlocked: { type: Boolean, default: false },
        note: String,
      },
    ],
  },
  { timestamps: true }
);

// Indexes for search performance
propertySchema.index({ 'address.city': 1 });
propertySchema.index({ 'address.locality': 1 });
propertySchema.index({ rent: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ isAvailable: 1 });
propertySchema.index({ 'address.coordinates': '2dsphere' });

export default mongoose.model('Property', propertySchema);