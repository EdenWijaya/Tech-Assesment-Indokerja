import { Request, Response, NextFunction } from 'express';
import { ApplicationStatus } from '@prisma/client';
import prisma from '../config/prisma';

export const applyJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobId, notes } = req.body;
    const applicantId = req.user!.id;

    // 1. Cek apakah lowongan pekerjaan tersedia
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || !job.isActive) {
      res.status(404).json({
        success: false,
        message: 'Lowongan pekerjaan tidak ditemukan atau sudah ditutup.',
      });
      return;
    }

    // 2. Cegah duplikasi lamaran (Spesifikasi: Job Seeker tidak dapat melamar pekerjaan yang sama > 1 kali)
    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_applicantId: {
          jobId,
          applicantId,
        },
      },
    });

    if (existingApplication) {
      res.status(400).json({
        success: false,
        message: 'Anda sudah melamar pada lowongan pekerjaan ini sebelumnya.',
      });
      return;
    }

    // 3. Database transaction: buat Application dan ApplicationHistory secara atomic
    const application = await prisma.$transaction(async (tx) => {
      const newApp = await tx.application.create({
        data: {
          jobId,
          applicantId,
          status: ApplicationStatus.APPLIED,
          notes,
        },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              companyName: true,
            },
          },
        },
      });

      // Catat entri riwayat awal
      await tx.applicationHistory.create({
        data: {
          applicationId: newApp.id,
          previousStatus: null,
          newStatus: ApplicationStatus.APPLIED,
          changedById: applicantId,
          notes: notes || 'Lamaran pertama kali diajukan oleh pelamar.',
        },
      });

      return newApp;
    });

    res.status(201).json({
      success: true,
      message: 'Lamaran Anda berhasil dikirimkan.',
      data: { application },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const applicantId = req.user!.id;

    const applications = await prisma.application.findMany({
      where: { applicantId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
            jobType: true,
          },
        },
        histories: {
          orderBy: { createdAt: 'desc' },
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil daftar riwayat lamaran.',
      data: { applications },
    });
  } catch (error) {
    next(error);
  }
};

export const getJobApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobId } = req.params;
    const companyId = req.user!.id;

    // Pastikan lowongan ini benar milik company yang sedang login
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId,
      },
    });

    if (!job) {
      res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin untuk melihat lowongan ini.',
      });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        applicant: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        histories: {
          orderBy: { createdAt: 'desc' },
          include: {
            changedBy: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        job: {
          id: job.id,
          title: job.title,
          companyName: job.companyName,
        },
        applications,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status: newStatus, notes } = req.body;
    const companyId = req.user!.id;

    // Cek apakah application ada dan jobnya milik company yang sedang login
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
      },
    });

    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Data lamaran tidak ditemukan.',
      });
      return;
    }

    if (application.job.companyId !== companyId) {
      res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda hanya dapat mengubah status pelamar pada lowongan milik Anda.',
      });
      return;
    }

    const previousStatus = application.status;

    if (previousStatus === newStatus) {
      res.status(400).json({
        success: false,
        message: `Status pelamar sudah '${newStatus}'.`,
      });
      return;
    }

    // Database transaction: Update Application & Catat di ApplicationHistory
    const updatedApplication = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id },
        data: {
          status: newStatus as ApplicationStatus,
        },
        include: {
          applicant: {
            select: {
              name: true,
              email: true,
            },
          },
          job: {
            select: {
              title: true,
            },
          },
        },
      });

      // Catat ke application history
      await tx.applicationHistory.create({
        data: {
          applicationId: id,
          previousStatus,
          newStatus: newStatus as ApplicationStatus,
          changedById: companyId,
          notes: notes || `Status diubah dari ${previousStatus} menjadi ${newStatus}.`,
        },
      });

      return updated;
    });

    res.status(200).json({
      success: true,
      message: `Status pelamar berhasil diperbarui menjadi ${newStatus}.`,
      data: { application: updatedApplication },
    });
  } catch (error) {
    next(error);
  }
};
