import Property from '../models/Property.js';
import User from '../models/User.js';

export const getProperties = async (req, res) => {
  try {
    const {
      city, locality, type, minRent, maxRent, furnishing,
      genderPreference, amenities, isAvailable, page = 1, limit = 12,
      sort = '-createdAt', search, bhk, occupancy,
    } = req.query;

    const query = {};
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (locality) query['address.locality'] = new RegExp(locality, 'i');
    if (type) query.type = type;
    if (furnishing) query.furnishing = furnishing;
    if (genderPreference) query.genderPreference = genderPreference;
    if (bhk) query.bhk = Number(bhk);
    if (occupancy) query.occupancy = occupancy;
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (minRent || maxRent) {
      query.rent = {};
      if (minRent) query.rent.$gte = Number(minRent);
      if (maxRent) query.rent.$lte = Number(maxRent);
    }
    if (amenities) {
      const amenityList = amenities.split(',');
      query.amenities = { $all: amenityList };
    }
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { 'address.locality': new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [properties, total] = await Promise.all([
      Property.find(query)
        .populate('owner', 'name avatar isVerified phone')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Property.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: properties,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
    const data = { ...req.body, owner: req.user.id };
    if (typeof data.amenities === 'string') data.amenities = JSON.parse(data.amenities);
    if (typeof data.rules === 'string') data.rules = JSON.parse(data.rules);
    if (typeof data.address === 'string') data.address = JSON.parse(data.address);

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

    const data = { ...req.body };
    if (typeof data.amenities === 'string') data.amenities = JSON.parse(data.amenities);
    if (typeof data.rules === 'string') data.rules = JSON.parse(data.amenities);
    if (typeof data.address === 'string') data.address = JSON.parse(data.address);

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
    const user = await User.findById(req.user.id);
    const propId = req.params.id;
    const isSaved = user.savedProperties.includes(propId);

    if (isSaved) {
      user.savedProperties = user.savedProperties.filter((id) => id.toString() !== propId);
    } else {
      user.savedProperties.push(propId);
    }
    await user.save();

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