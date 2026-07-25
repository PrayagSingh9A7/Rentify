import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import { createNotification } from "./notification.service.js";
import { badRequest, forbidden, notFound } from "../utils/AppError.js";

const ACTIVE_STATUSES = ["pending", "approved"];

const populateBooking = (booking) =>
  booking.populate([
    {
      path: "property",
      select: "title rent images address",
    },
    {
      path: "owner",
      select: "name email phone",
    },
    {
      path: "tenant",
      select: "name email phone avatar",
    },
  ]);

const assertTransition = (booking, allowed, nextStatus) => {
  if (!allowed.includes(booking.status)) {
    throw badRequest(`Cannot change booking from ${booking.status} to ${nextStatus}`);
  }
};

/**
 * Create Booking
 */
export const createBooking = async (bookingData, tenantId) => {
  const { property, visitDate, timeSlot, message, purpose } = bookingData;

  if (!property || !visitDate || !timeSlot) {
    throw badRequest("Property, visit date, and time slot are required");
  }

  // Check property exists
  const propertyDoc = await Property.findById(property);

  if (!propertyDoc) {
    throw notFound("Property not found");
  }

  if (!propertyDoc.isAvailable) {
    throw badRequest("This property is not currently available");
  }

  // Tenant cannot book own property
  if (propertyDoc.owner.toString() === tenantId.toString()) {
    throw badRequest("You cannot book your own property");
  }

  // Duplicate slot check
const bookingDate = new Date(visitDate);

const startOfDay = new Date(bookingDate);
startOfDay.setHours(0, 0, 0, 0);

const endOfDay = new Date(bookingDate);
endOfDay.setHours(23, 59, 59, 999);

const slotExists = await Booking.findOne({
    property,
    visitDate: {
        $gte: startOfDay,
        $lte: endOfDay,
    },
    timeSlot,
    status: {
        $in: ACTIVE_STATUSES,
    },
});

  if (slotExists) {
    throw badRequest("Selected time slot is already booked");
  }

  let booking;
  try {
    booking = await Booking.create({
      property,
      owner: propertyDoc.owner,
      tenant: tenantId,
      visitDate,
      timeSlot,
      purpose,
      message,
    });
  } catch (error) {
    if (error.code === 11000) {
      throw badRequest("Selected time slot is already booked");
    }
    throw error;
  }

  await createNotification({
    recipient: propertyDoc.owner,
    sender: tenantId,
    title: "New booking request",
    message: `A tenant requested a visit for ${propertyDoc.title}.`,
    type: "BOOKING",
    referenceId: booking._id,
    referenceModel: "Booking",
    icon: "calendar",
  });

  return populateBooking(booking);
};

/**
 * Tenant Bookings
 */
export const getMyBookings = async (tenantId) => {
  return Booking.find({
    tenant: tenantId,
  })
    .populate("property", "title images address rent")
    .populate("owner", "name phone email")
    .sort({
      createdAt: -1,
    });
};

/**
 * Owner Bookings
 */
export const getOwnerBookings = async (ownerId) => {
  return Booking.find({
    owner: ownerId,
  })
    .populate("property", "title images")
    .populate("tenant", "name email phone avatar")
    .sort({
      createdAt: -1,
    });
};

/**
 * Approve Booking
 */
export const approveBooking = async (bookingId, ownerId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw notFound("Booking not found");
  }

  if (booking.owner.toString() !== ownerId.toString()) {
    throw forbidden("Unauthorized");
  }

  assertTransition(booking, ["pending"], "approved");
  booking.status = "approved";
  booking.approvedAt = new Date();

  await booking.save();

  await createNotification({
    recipient: booking.tenant,
    sender: ownerId,
    title: "Booking approved",
    message: "Your property visit request was approved.",
    type: "BOOKING",
    referenceId: booking._id,
    referenceModel: "Booking",
    icon: "calendar-check",
  });

  return populateBooking(booking);
};

/**
 * Reject Booking
 */
export const rejectBooking = async (
  bookingId,
  ownerId,
  reason = ""
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw notFound("Booking not found");
  }

  if (booking.owner.toString() !== ownerId.toString()) {
    throw forbidden("Unauthorized");
  }

  assertTransition(booking, ["pending"], "rejected");
  booking.status = "rejected";
  booking.rejectedAt = new Date();
  booking.cancellationReason = reason;

  await booking.save();

  await createNotification({
    recipient: booking.tenant,
    sender: ownerId,
    title: "Booking rejected",
    message: reason || "Your property visit request was rejected.",
    type: "BOOKING",
    referenceId: booking._id,
    referenceModel: "Booking",
    icon: "calendar-x",
  });

  return populateBooking(booking);
};

/**
 * Cancel Booking
 */
export const cancelBooking = async (
  bookingId,
  tenantId,
  reason = ""
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw notFound("Booking not found");
  }

  if (booking.tenant.toString() !== tenantId.toString()) {
    throw forbidden("Unauthorized");
  }

  assertTransition(booking, ["pending", "approved"], "cancelled");
  booking.status = "cancelled";
  booking.cancelledAt = new Date();
  booking.cancellationReason = reason;

  await booking.save();

  await createNotification({
    recipient: booking.owner,
    sender: tenantId,
    title: "Booking cancelled",
    message: reason || "A tenant cancelled a property visit.",
    type: "BOOKING",
    referenceId: booking._id,
    referenceModel: "Booking",
    icon: "calendar-x",
  });

  return populateBooking(booking);
};

/**
 * Complete Booking
 */
export const completeBooking = async (
  bookingId,
  ownerId
) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw notFound("Booking not found");
  }

  if (booking.owner.toString() !== ownerId.toString()) {
    throw forbidden("Unauthorized");
  }

  assertTransition(booking, ["approved"], "completed");
  booking.status = "completed";
  booking.completedAt = new Date();
  booking.isVisited = true;

  await booking.save();

  await createNotification({
    recipient: booking.tenant,
    sender: ownerId,
    title: "Visit completed",
    message: "Your property visit was marked as completed.",
    type: "BOOKING",
    referenceId: booking._id,
    referenceModel: "Booking",
    icon: "calendar-check",
  });

  return populateBooking(booking);
};
