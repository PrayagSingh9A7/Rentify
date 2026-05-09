import Review from '../models/Review.js';
import Property from '../models/Property.js';

export const getPropertyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('reviewer', 'name avatar createdAt')
      .sort('-createdAt')
      .lean();

    const formatted = reviews.map((r) => ({
      ...r,
      reviewer: r.isAnonymous ? { name: 'Anonymous', avatar: '' } : r.reviewer,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const existing = await Review.findOne({ property: req.params.propertyId, reviewer: req.user.id });
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this property' });

    const review = await Review.create({
      ...req.body,
      property: req.params.propertyId,
      reviewer: req.user.id,
    });

    // Update property average rating
    const allReviews = await Review.find({ property: req.params.propertyId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Property.findByIdAndUpdate(req.params.propertyId, {
      averageRating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
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
    if (property.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    review.ownerResponse = { content: req.body.content, respondedAt: new Date() };
    await review.save();
    res.json({ success: true, data: review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};