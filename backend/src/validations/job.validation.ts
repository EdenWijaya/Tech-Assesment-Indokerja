import { z } from 'zod';
import { JobType } from '@prisma/client';

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Judul pekerjaan minimal 3 karakter'),
    companyName: z.string().min(2, 'Nama perusahaan minimal 2 karakter'),
    location: z.string().min(2, 'Lokasi minimal 2 karakter'),
    salaryMin: z.number().int().nonnegative('Gaji minimal tidak boleh negatif').optional().nullable(),
    salaryMax: z.number().int().nonnegative('Gaji maksimal tidak boleh negatif').optional().nullable(),
    jobType: z.nativeEnum(JobType, {
      errorMap: () => ({ message: 'Tipe pekerjaan tidak valid' }),
    }),
    description: z.string().min(10, 'Deskripsi pekerjaan minimal 10 karakter'),
  }),
});
