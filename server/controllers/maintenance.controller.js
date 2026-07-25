import Maintenance from '../models/Maintenance.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import { createNotification } from '../services/notification.service.js';

const allowedStatuses = ['open', 'in-progress', 'resolved', 'closed'];

export const createComplaint = async (req, res) => {
  try {
    if (req.user.role !== 'tenant') {
      return res.status(403).json({ success: false, message: 'Only tenants can create maintenance requests' });
    }

    const property = await Property.findById(req.body.propertyId);
    if (!property) return res.status(404).json({ success: false, message: 'Property not found' });

    const hasActiveBooking = await Booking.exists({
      property: property._id,
      tenant: req.user.id,
      status: { $in: ['approved', 'completed'] },
    });
    if (!hasActiveBooking) {
      return res.status(403).json({
        success: false,
        message: 'Maintenance requests require an approved or completed booking for this property',
      });
    }

    const complaint = await Maintenance.create({
      ...req.body,
      property: property._id,
      tenant: req.user.id,
      owner: property.owner,
    });

    await complaint.populate(['tenant', 'owner'], 'name email avatar');
    await createNotification({
      recipient: property.owner,
      sender: req.user.id,
      title: 'New Maintenance Request',
      message: `${complaint.title} was reported for ${property.title}.`,
      type: 'MAINTENANCE',
      referenceId: complaint._id,
      referenceModel: 'Maintenance',
      icon: 'wrench',
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getComplaints = async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? {}
      : req.user.role === 'owner'
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
    if (complaint.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Invalid maintenance status' });
    }

    complaint.status = req.body.status;
    if (req.body.status === 'resolved') complaint.resolvedAt = new Date();
    if (req.body.note?.trim()) {
      complaint.notes.push({ author: req.user.id, content: req.body.note.trim() });
    }
    await complaint.save();

    await complaint.populate('property', 'title address images');
    await complaint.populate('tenant', 'name avatar');
    await createNotification({
      recipient: complaint.tenant._id || complaint.tenant,
      sender: req.user.id,
      title: 'Maintenance Updated',
      message: `Your maintenance request is now ${complaint.status}.`,
      type: 'MAINTENANCE',
      referenceId: complaint._id,
      referenceModel: 'Maintenance',
      icon: 'wrench',
    });

    res.json({ success: true, data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
