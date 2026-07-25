import Review from '../models/Review.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import { createNotification } from '../services/notification.service.js';

const verifiedReviewStatuses = ['approved', 'completed'];

export const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('reviewer', 'name avatar createdAt')
      .sort('-createdAt')
      .lean();

    const formatted = reviews.map((review) => ({
      ...review,
      reviewer: review.isAnonymous ? { name: 'Anonymous', avatar: '' } : review.reviewer,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    if (property.owner.toString() === req.user.id) {
      return res.status(403).json({ success: false, message: 'Owners cannot review their own property' });
    }

    const existing = await Review.findOne({ property: req.params.propertyId, reviewer: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this property' });

    const verifiedBooking = await Booking.exists({
      property: req.params.propertyId,
      tenant: req.user.id,
      status: { $in: verifiedReviewStatuses },
    });

    const review = await Review.create({
      ...req.body,
      property: req.params.propertyId,
      reviewer: req.user.id,
      isVerified: Boolean(verifiedBooking),
    });

    const [ratingStats] = await Review.aggregate([
      { $match: { property: property._id } },
      { $group: { _id: '$property', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 } } },
    ]);

    await Property.findByIdAndUpdate(property._id, {
      averageRating: Math.round((ratingStats?.averageRating || 0) * 10) / 10,
      reviewCount: ratingStats?.reviewCount || 0,
    });

    await createNotification({
      recipient: property.owner,
      sender: req.user.id,
      title: 'New Review',
      message: 'Your property received a new review.',
      type: 'REVIEW',
      referenceId: review._id,
      referenceModel: 'Review',
      icon: 'star',
    });

    await review.populate('reviewer', 'name avatar');
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const addOwnerResponse = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId).populate('property');
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });

    const property = await Property.findById(review.property);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
    if (property.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const content = req.body.content?.trim();
    if (!content) return res.status(400).json({ success: false, message: 'Response content is required' });

    review.ownerResponse = { content, respondedAt: new Date() };
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
