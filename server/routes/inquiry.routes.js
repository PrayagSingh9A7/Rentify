import { Router } from "express";

import { authorize, protect } from "../middleware/auth.js";

import {

createInquiry,

getMyInquiries,

getOwnerInquiries,

updateInquiryStatus,
replyInquiry,
deleteInquiry,

} from "../controllers/inquiry.controller.js";

const router = Router();

router.post("/", protect, createInquiry);

router.get("/my", protect, getMyInquiries);

router.get("/owner", protect, authorize("owner", "admin"), getOwnerInquiries);

router.put("/:id/status", protect, authorize("owner", "admin"), updateInquiryStatus);
router.patch("/:id/status", protect, authorize("owner", "admin"), updateInquiryStatus);

router.patch("/:id/reply", protect, authorize("owner", "admin"), replyInquiry);

router.delete("/:id", protect, deleteInquiry);

export default router;
