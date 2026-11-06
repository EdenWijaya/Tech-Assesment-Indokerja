import { Router } from "express";
import { getAllJobs, getJobDetail, createJob, getCompanyJobs } from "../controllers/job.controller";
import { authenticate, authorizeRole, optionalAuthenticate } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validate";
import { createJobSchema } from "../validations/job.validation";
import { Role } from "@prisma/client";

const router = Router();

// Public (tapi kalau login sebagai seeker, bisa cek apakah sudah melamar)
router.get("/", getAllJobs);
router.get("/company/my-jobs", authenticate, authorizeRole([Role.COMPANY]), getCompanyJobs);
router.get("/:id", optionalAuthenticate, getJobDetail);

// Khusus Company
router.post("/", authenticate, authorizeRole([Role.COMPANY]), validateRequest(createJobSchema), createJob);

export default router;
