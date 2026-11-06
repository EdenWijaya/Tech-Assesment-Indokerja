import { Request, Response, NextFunction } from 'express';
import { JobType, Prisma } from '@prisma/client';
import prisma from '../config/prisma';

export const getAllJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, jobType, location } = req.query;

    const whereClause: Prisma.JobWhereInput = {
      isActive: true,
    };

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location && typeof location === 'string') {
      whereClause.location = { contains: location, mode: 'insensitive' };
    }

    if (jobType && Object.values(JobType).includes(jobType as JobType)) {
      whereClause.jobType = jobType as JobType;
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        companyName: true,
        location: true,
        salaryMin: true,
        salaryMax: true,
        jobType: true,
        description: true,
        createdAt: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar lowongan pekerjaan.',
      data: { jobs },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobDetail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Lowongan pekerjaan tidak ditemukan.',
      });
      return;
    }

    // Cek apakah user seeker saat ini sudah pernah melamar
    let hasApplied = false;
    let userApplication = null;

    if (req.user && req.user.role === 'JOB_SEEKER') {
      userApplication = await prisma.application.findUnique({
        where: {
          jobId_applicantId: {
            jobId: id,
            applicantId: req.user.id,
          },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      });

      if (userApplication) {
        hasApplied = true;
      }
    }

    res.status(200).json({
      success: true,
      data: {
        job,
        hasApplied,
        userApplication,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, companyName, location, salaryMin, salaryMax, jobType, description } = req.body;

    const job = await prisma.job.create({
      data: {
        companyId: req.user!.id,
        title,
        companyName: companyName || req.user!.name,
        location,
        salaryMin: salaryMin ? parseInt(salaryMin, 10) : null,
        salaryMax: salaryMax ? parseInt(salaryMax, 10) : null,
        jobType,
        description,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Lowongan pekerjaan berhasil dibuat.',
      data: { job },
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanyJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        companyId: req.user!.id,
      },
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: { jobs },
    });
  } catch (error) {
    next(error);
  }
};
