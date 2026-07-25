import * as bookingService from "../services/booking.service.js";

/**
 * Create Booking
 * POST /api/bookings
 */

export const createBooking = async (req, res) => {
  try {
    const booking = await bookingService.createBooking(
      req.body,
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: "Booking request sent successfully.",
      data: booking,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Tenant Bookings
 * GET /api/bookings/my
 */
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getMyBookings(req.user.id);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Owner Bookings
 * GET /api/bookings/owner
 */
export const getOwnerBookings = async (req, res) => {
  try {
    const bookings = await bookingService.getOwnerBookings(req.user.id);

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Approve Booking
 * PUT /api/bookings/:id/approve
 */
export const approveBooking = async (req, res) => {
  try {
    const booking = await bookingService.approveBooking(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Booking approved successfully.",
      data: booking,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Reject Booking
 * PUT /api/bookings/:id/reject
 */
export const rejectBooking = async (req, res) => {
  try {
    const booking = await bookingService.rejectBooking(
      req.params.id,
      req.user.id,
      req.body.reason || req.body.cancellationReason
    );

    res.status(200).json({
      success: true,
      message: "Booking rejected.",
      data: booking,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Cancel Booking
 * PUT /api/bookings/:id/cancel
 */
export const cancelBooking = async (req, res) => {
  try {
    const booking = await bookingService.cancelBooking(
      req.params.id,
      req.user.id,
      req.body.reason || req.body.cancellationReason
    );

    res.status(200).json({
      success: true,
      message: "Booking cancelled.",
      data: booking,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * Complete Booking
 * PUT /api/bookings/:id/complete
 */
export const completeBooking = async (req, res) => {
  try {
    const booking = await bookingService.completeBooking(
      req.params.id,
      req.user.id
    );

    res.status(200).json({
      success: true,
      message: "Visit marked as completed.",
      data: booking,
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: error.message,
    });
  }
};
