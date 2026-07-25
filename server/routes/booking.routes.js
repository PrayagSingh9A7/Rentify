import express from "express";

import {
  createBooking,
  getMyBookings,
  getOwnerBookings,
  approveBooking,
  rejectBooking,
  cancelBooking,
  completeBooking,
} from "../controllers/booking.controller.js";

import { authorize, protect } from "../middleware/auth.js";

const router = express.Router();

// Tenant
router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);

// Owner
router.get("/owner", protect, authorize("owner", "admin"), getOwnerBookings);

// Status Updates
router.put("/:id/approve", protect, authorize("owner", "admin"), approveBooking);
router.patch("/:id/approve", protect, authorize("owner", "admin"), approveBooking);

router.put("/:id/reject", protect, authorize("owner", "admin"), rejectBooking);
router.patch("/:id/reject", protect, authorize("owner", "admin"), rejectBooking);

router.put("/:id/cancel", protect, cancelBooking);
router.patch("/:id/cancel", protect, cancelBooking);

router.put("/:id/complete", protect, authorize("owner", "admin"), completeBooking);
router.patch("/:id/complete", protect, authorize("owner", "admin"), completeBooking);

export default router;
