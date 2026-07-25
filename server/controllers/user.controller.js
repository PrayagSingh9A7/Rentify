import User from '../models/User.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import Inquiry from '../models/Inquiry.js';

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, location, preferences } = req.body;
    const updates = { name, phone, bio, location };
    if (preferences) updates.preferences = preferences;
    if (req.file) updates.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getSavedProperties = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({ path: 'savedProperties', populate: { path: 'owner', select: 'name avatar isVerified' } });
    res.json({ success: true, data: user.savedProperties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({ path: 'recentlyViewed', populate: { path: 'owner', select: 'name avatar isVerified' } });
    res.json({ success: true, data: user.recentlyViewed.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name avatar bio location isVerified createdAt role');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    if (!['owner', 'admin'].includes(req.user.role)) return res.status(403).json({ success: false, message: 'Not authorized' });

    const scopedQuery = req.user.role === 'admin' ? {} : { owner: req.user.id };
    const properties = await Property.find(scopedQuery).sort('-createdAt').lean();
    const totalViews = properties.reduce((sum, p) => sum + p.viewCount, 0);
    const totalInquiries = await Inquiry.countDocuments(scopedQuery);
    const totalBookings = await Booking.countDocuments(scopedQuery);
    const pendingBookings = await Booking.countDocuments({ ...scopedQuery, status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ ...scopedQuery, status: 'approved' });
    const activeListings = properties.filter((p) => p.isAvailable).length;
    const completedBookings = await Booking.find({ ...scopedQuery, status: 'completed' }).populate('property', 'rent').lean();
    const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.property?.rent || 0), 0);

    res.json({
      success: true,
      data: {
        totalProperties: properties.length,
        activeListings,
        totalViews,
        totalInquiries,
        totalBookings,
        pendingBookings,
        approvedBookings,
        totalRevenue,
        properties: properties.slice(0, 5),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
