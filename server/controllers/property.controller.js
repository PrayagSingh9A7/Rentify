import Property from '../models/Property.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const legacyTypeToPropertyType = {
  pg: "Apartment",
  flat: "Apartment",
  room: "Independent Floor",
  villa: "Villa",
  studio: "Studio Apartment",
  hostel: "Apartment",
};

const normalizePropertyPayload = (body) => {
  const data = { ...body };
  if (typeof data.amenities === 'string') data.amenities = JSON.parse(data.amenities);
  if (typeof data.rules === 'string') data.rules = JSON.parse(data.rules);
  if (typeof data.address === 'string') data.address = JSON.parse(data.address);
  if (!data.propertyType && data.type) data.propertyType = legacyTypeToPropertyType[data.type] || data.type;
  return data;
};

export const getProperties = async (req, res) => {
  try {
    const {
      city,
      locality,
      propertyType,
      type,
      bhk,
      bathrooms,
      furnishing,
      occupancy,
      genderPreference,

      minRent,
      maxRent,

      minArea,
      maxArea,

      amenities,

      search,

      isAvailable,

      sort = "newest",

      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    // -----------------------
    // Location
    // -----------------------

    if (city)
      query["address.city"] = {
        $regex: escapeRegex(city),
        $options: "i",
      };

    if (locality)
      query["address.locality"] = {
        $regex: escapeRegex(locality),
        $options: "i",
      };

    // -----------------------
    // Property Filters
    // -----------------------

    if (propertyType) {
      query.propertyType = legacyTypeToPropertyType[propertyType] || propertyType;
    } else if (type) {
      query.$or = [
        { type },
        { propertyType: legacyTypeToPropertyType[type] || type },
      ];
    }

    if (bhk)
      query.bhk = Number(bhk);

    if (bathrooms)
      query.bathrooms = {
        $gte: Number(bathrooms),
      };

    if (occupancy)
      query.occupancy = occupancy;

    if (genderPreference)
      query.genderPreference = genderPreference;

    if (furnishing)
      query.furnishing = furnishing;

    query.isAvailable = isAvailable === undefined ? true : isAvailable === "true";

    // -----------------------
    // Rent
    // -----------------------

    if (minRent || maxRent) {
      query.rent = {};

      if (minRent)
        query.rent.$gte = Number(minRent);

      if (maxRent)
        query.rent.$lte = Number(maxRent);
    }

    // -----------------------
    // Area
    // -----------------------

    if (minArea || maxArea) {
      query.area = {};

      if (minArea)
        query.area.$gte = Number(minArea);

      if (maxArea)
        query.area.$lte = Number(maxArea);
    }

    // -----------------------
    // Amenities
    // -----------------------

    if (amenities) {
      query.amenities = {
        $all: amenities.split(","),
      };
    }

    // -----------------------
    // Search
    // -----------------------

    if (search) {
      query.$or = [
        { title: { $regex: escapeRegex(search), $options: "i" } },
        { description: { $regex: escapeRegex(search), $options: "i" } },
        { "address.city": { $regex: escapeRegex(search), $options: "i" } },
        { "address.locality": { $regex: escapeRegex(search), $options: "i" } },
      ];
    }

    // -----------------------
    // Sorting
    // -----------------------

    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },

      rentAsc: { rent: 1 },
      rentDesc: { rent: -1 },

      areaAsc: { area: 1 },
      areaDesc: { area: -1 },

      views: { viewCount: -1 },

      featured: {
        isFeatured: -1,
        createdAt: -1,
      },
    };

    const sortQuery =
      sortOptions[sort] || sortOptions.newest;

    // -----------------------
    // Pagination
    // -----------------------

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(limit) || 12));

    const skip = (pageNumber - 1) * pageSize;

    // -----------------------
    // Database Query
    // -----------------------

    const [properties, total] =
      await Promise.all([

        Property.find(query)
          .populate(
            "owner",
            "name avatar phone isVerified"
          )
          .sort(sortQuery)
          .skip(skip)
          .limit(pageSize)
          .lean(),

        Property.countDocuments(query),

      ]);

    const totalPages = Math.ceil(total / pageSize);

    res.status(200).json({
      success: true,

      total,

      page: pageNumber,

      limit: pageSize,

      totalPages,

      hasNextPage:
        pageNumber < totalPages,

      hasPrevPage:
        pageNumber > 1,

      data: properties,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        pages: totalPages,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name avatar isVerified phone email createdAt');

    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    // Increment view count
    await Property.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });

    // Track recently viewed for logged in user
    if (req.user) {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { recentlyViewed: property._id },
      });
      await User.findByIdAndUpdate(req.user.id, {
        $push: { recentlyViewed: { $each: [property._id], $position: 0, $slice: 20 } },
      });
    }

    res.json({ success: true, data: property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createProperty = async (req, res) => {
  try {
    const data = { ...normalizePropertyPayload(req.body), owner: req.user.id };

    const property = await Property.create(data);
    res.status(201).json({ success: true, data: property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateProperty = async (req, res) => {
  try {
    let property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const data = normalizePropertyPayload(req.body);

    property = await Property.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    res.json({ success: true, data: property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await property.deleteOne();
    res.json({ success: true, message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleSaveProperty = async (req, res) => {
  try {
    const propId = req.params.id;
    const property = await Property.findById(propId).select("_id");
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const user = await User.findById(req.user.id).select("savedProperties");
    const isSaved = user.savedProperties.some((id) => id.toString() === propId);

    if (isSaved) {
      await User.findByIdAndUpdate(req.user.id, { $pull: { savedProperties: propId } });
    } else {
      await User.findByIdAndUpdate(req.user.id, { $addToSet: { savedProperties: propId } });
    }

    res.json({ success: true, isSaved: !isSaved, message: isSaved ? 'Removed from saved' : 'Saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOwnerProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user.id })
      .sort('-createdAt')
      .lean();
    res.json({ success: true, data: properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFeaturedProperties = async (req, res) => {
  try {
    const featured = await Property.find({ isFeatured: true, isAvailable: true })
      .populate('owner', 'name avatar isVerified')
      .limit(8)
      .lean();
    res.json({ success: true, data: featured });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getHomeData = async (_req, res) => {
  try {
    const [
      totalListings,
      verifiedListings,
      tenantCount,
      cityAgg,
      ratingAgg,
      featured,
      recentlyAdded,
      popularCities,
      trendingLocations,
      popularTypes,
    ] = await Promise.all([
      Property.countDocuments({ isAvailable: true }),
      Property.countDocuments({ isAvailable: true, isVerified: true }),
      User.countDocuments({ role: 'tenant' }),
      Property.distinct('address.city', { isAvailable: true }),
      Property.aggregate([
        { $match: { isAvailable: true, averageRating: { $gt: 0 }, reviewCount: { $gt: 0 } } },
        { $group: { _id: null, averageRating: { $avg: '$averageRating' }, reviewCount: { $sum: '$reviewCount' } } },
      ]),
      Property.find({ isFeatured: true, isAvailable: true })
        .populate('owner', 'name avatar isVerified')
        .sort('-averageRating -viewCount -createdAt')
        .limit(6)
        .lean(),
      Property.find({ isAvailable: true })
        .populate('owner', 'name avatar isVerified')
        .sort('-createdAt')
        .limit(6)
        .lean(),
      Property.aggregate([
        { $match: { isAvailable: true, 'address.city': { $nin: [null, ''] } } },
        {
          $group: {
            _id: '$address.city',
            listings: { $sum: 1 },
            averageRent: { $avg: '$rent' },
          },
        },
        { $sort: { listings: -1, averageRent: 1 } },
        { $limit: 8 },
        { $project: { _id: 0, city: '$_id', listings: 1, averageRent: { $round: ['$averageRent', 0] } } },
      ]),
      Property.aggregate([
        { $match: { isAvailable: true, 'address.locality': { $nin: [null, ''] }, 'address.city': { $nin: [null, ''] } } },
        {
          $group: {
            _id: { locality: '$address.locality', city: '$address.city' },
            listings: { $sum: 1 },
            views: { $sum: '$viewCount' },
            averageRent: { $avg: '$rent' },
          },
        },
        { $sort: { views: -1, listings: -1 } },
        { $limit: 8 },
        {
          $project: {
            _id: 0,
            locality: '$_id.locality',
            city: '$_id.city',
            listings: 1,
            views: 1,
            averageRent: { $round: ['$averageRent', 0] },
          },
        },
      ]),
      Property.aggregate([
        { $match: { isAvailable: true, propertyType: { $nin: [null, ''] } } },
        { $group: { _id: '$propertyType', listings: { $sum: 1 }, averageRent: { $avg: '$rent' } } },
        { $sort: { listings: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, propertyType: '$_id', listings: 1, averageRent: { $round: ['$averageRent', 0] } } },
      ]),
    ]);

    const rating = ratingAgg[0];
    const stats = [
      totalListings > 0 && { label: 'Available Listings', value: totalListings },
      verifiedListings > 0 && { label: 'Verified Listings', value: verifiedListings },
      cityAgg.length > 0 && { label: 'Cities', value: cityAgg.length },
      tenantCount > 0 && { label: 'Tenants Registered', value: tenantCount },
      rating?.reviewCount > 0 && {
        label: 'Average Rating',
        value: Math.round(rating.averageRating * 10) / 10,
        suffix: '/5',
      },
    ].filter(Boolean);

    res.json({
      success: true,
      data: {
        stats,
        featured,
        recentlyAdded,
        popularCities,
        trendingLocations,
        popularTypes,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAvailabilityCalendar = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    property.availabilityCalendar = req.body.calendar;
    await property.save();
    res.json({ success: true, data: property.availabilityCalendar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addPropertyImages = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const newImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    property.images = [...property.images, ...newImages];
    await property.save();
    res.json({ success: true, data: property.images });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getNearbyProperties = async (req, res) => {
  try {
    const { radius = 5 } = req.query;
    let { lat, lng } = req.query;

    if (req.params.id) {
      const source = await Property.findById(req.params.id).lean();
      if (!source) return res.status(404).json({ success: false, message: "Property not found" });
      [lng, lat] = source.location?.coordinates?.length ? source.location.coordinates : [source.address?.coordinates?.lng, source.address?.coordinates?.lat];
    }

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
    }

    const properties = await Property.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          distanceField: "distance",
          spherical: true,
          maxDistance: Number(radius) * 1000,
          query: {
            isAvailable: true,
            ...(req.params.id && { _id: { $ne: new mongoose.Types.ObjectId(req.params.id) } }),
          },
        },
      },
      {
        $limit: 20,
      },
    ]);

    res.json({
      success: true,
      count: properties.length,
      data: properties,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
};

export const getSimilarProperties = async (req, res) => {

  try {

    const property = await Property.findById(req.params.id);

    if (!property) {

      return res.status(404).json({
        success: false,
        message: "Property not found",
      });

    }

    const similar = await Property.find({

      _id: {
        $ne: property._id,
      },

      propertyType: property.propertyType,

      bhk: property.bhk,

      "address.city": property.address.city,

      isAvailable: true,

    })

      .limit(8)

      .populate(
        "owner",
        "name avatar isVerified"
      )

      .lean();

    res.json({

      success: true,

      data: similar,

    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,

    });

  }

};
