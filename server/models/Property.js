import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // ETL Property Type
    propertyType: {
      type: String,
      enum: [
        "Apartment",
        "Independent Floor",
        "Independent House",
        "Villa",
        "Studio Apartment",
        "Penthouse",
      ],
      required: true,
    },

    // Keeping old field temporarily for backward compatibility
    type: {
      type: String,
      enum: ["pg", "flat", "room", "villa", "studio", "hostel"],
      default: undefined,
    },

    rent: {
      type: Number,
      required: true,
      min: 1000,
    },

    deposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    maintenanceCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    pricePerSqFt: {
      type: Number,
      default: 0,
      min: 0,
    },

    source: {
  type: String,
  default: "etl",
  trim: true,
},

    postedOn: Date,

    verificationDate: Date,

    address: {
      street: String,

      locality: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: String,

      pincode: String,

      coordinates: {
        lat: {
          type: Number,
          default: 0,
        },

        lng: {
          type: Number,
          default: 0,
        },
      },
    },

    // GeoJSON (Nearby Search)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    images: [
      {
        url: String,
        publicId: String,
      },
    ],

    amenities: [String],

    furnishing: {
      type: String,
      enum: ["furnished", "semi-furnished", "unfurnished"],
      default: "unfurnished",
    },

    genderPreference: {
      type: String,
      enum: ["male", "female", "any"],
      default: "any",
    },

    occupancy: {
      type: String,
      enum: ["single", "double", "triple", "any"],
      default: "single",
    },

    bhk: {
      type: Number,
      default: null,
      min: 0,
    },

    bathrooms: {
      type: Number,
      default: 0,
      min: 0,
    },

    balconies: {
      type: Number,
      default: 0,
      min: 0,
    },

    area: {
      type: Number,
      required: true,
      min: 10,
    },

    floorNumber: {
      type: Number,
      default: 0,
    },

    totalFloors: {
      type: Number,
      default: 1,
    },

    availableFrom: {
      type: Date,
      default: Date.now,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isPremium: {
      type: Boolean,
      default: false,
    },

    virtualTourUrl: {
      type: String,
      default: "",
    },

    noticePeriod: {
      type: Number,
      default: 30,
    },

    rules: [String],

    tags: [String],

    viewCount: {
      type: Number,
      default: 0,
    },

    inquiryCount: {
      type: Number,
      default: 0,
    },

    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    availabilityCalendar: [
      {
        date: Date,

        isBlocked: {
          type: Boolean,
          default: false,
        },

        note: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// -------------------- Indexes --------------------

propertySchema.index({ "address.city": 1 });

propertySchema.index({ owner: 1, createdAt: -1 });

propertySchema.index({ "address.locality": 1 });

propertySchema.index({ rent: 1 });

propertySchema.index({ propertyType: 1 });

propertySchema.index({ bhk: 1 });

propertySchema.index({ bathrooms: 1 });

propertySchema.index({ isAvailable: 1 });

propertySchema.index({ isVerified: 1 });

propertySchema.index({
  "address.city": 1,
  propertyType: 1,
  rent: 1,
});

propertySchema.index({ location: "2dsphere" });

propertySchema.index({
  title: "text",
  description: "text",
  "address.locality": "text",
  "address.city": "text",
});

propertySchema.pre("validate", function (next) {
  const lat = Number(this.address?.coordinates?.lat);
  const lng = Number(this.address?.coordinates?.lng);

  if (Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0)) {
    this.location = {
      type: "Point",
      coordinates: [lng, lat],
    };
  }

  next();
});

export default mongoose.model("Property", propertySchema);
