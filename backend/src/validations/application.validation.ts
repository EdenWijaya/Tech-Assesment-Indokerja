import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const applyJobSchema = z.object({
  body: z.object({
    jobId: z.string().min(1, 'Job ID wajib diisi'),
    notes: z.string().optional().nullable(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ApplicationStatus, {
      errorMap: () => ({ message: 'Status tidak valid. Pilihan: APPLIED, REVIEWING, SHORTLISTED, REJECTED, ACCEPTED' }),
    }),
    notes: z.string().optional().nullable(),
  }),
  params: z.object({
    id: z.string().min(1, 'Application ID wajib diisi'),
  }),
});
