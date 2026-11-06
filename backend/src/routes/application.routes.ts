import { Router } from "express";
import {
  applyJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} from "../controllers/application.controller";
import { authenticate, authorizeRole } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validate";
import { applyJobSchema, updateApplicationStatusSchema } from "../validations/application.validation";
import { Role } from "@prisma/client";

const router = Router();

// Job Seeker: melamar pekerjaan
router.post("/", authenticate, authorizeRole([Role.JOB_SEEKER]), validateRequest(applyJobSchema), applyJob);

// Job Seeker: lihat riwayat lamaran saya
router.get("/my", authenticate, authorizeRole([Role.JOB_SEEKER]), getMyApplications);

// Company: lihat pelamar pada suatu lowongan
router.get("/job/:jobId", authenticate, authorizeRole([Role.COMPANY]), getJobApplications);

// Company: ubah status pelamar
router.patch(
  "/:id/status",
  authenticate,
  authorizeRole([Role.COMPANY]),
  validateRequest(updateApplicationStatusSchema),
  updateApplicationStatus,
);

export default router;
