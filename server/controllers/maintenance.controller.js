import Maintenance from '../models/Maintenance.js';
import Property from '../models/Property.js';

export const createComplaint = async (req, res) => {
  try {
    const property = await Property.findById(req.body.propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const complaint = await Maintenance.create({
      ...req.body,
      property: req.body.propertyId,
      tenant: req.user.id,
      owner: property.owner,
    });

    await complaint.populate(['tenant', 'owner'], 'name email avatar');
    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const query = req.user.role === 'owner'
      ? { owner: req.user.id }
      : { tenant: req.user.id };

    const complaints = await Maintenance.find(query)
      .populate('property', 'title address images')
      .populate('tenant', 'name avatar')
      .sort('-createdAt')
      .lean();

    res.json({ success: true, data: complaints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const complaint = await Maintenance.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    complaint.status = req.body.status;
    if (req.body.status === 'resolved') complaint.resolvedAt = new Date();
    if (req.body.note) {
      complaint.notes.push({ author: req.user.id, content: req.body.note });
    }
    await complaint.save();
    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};