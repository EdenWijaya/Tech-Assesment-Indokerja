import { PrismaClient, Role, JobType, ApplicationStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Clean up existing data
  await prisma.applicationHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default password
  const hashedPassword = await bcrypt.hash("password123", 10);

  // 3. Create Sample Company User
  const companyUser = await prisma.user.create({
    data: {
      email: "hr@tokotech.id",
      password: hashedPassword,
      name: "PT Toko Tech Indonesia",
      role: Role.COMPANY,
    },
  });

  const companyUser2 = await prisma.user.create({
    data: {
      email: "recruiter@fintechsolusi.id",
      password: hashedPassword,
      name: "PT Fintech Solusi Nusantara",
      role: Role.COMPANY,
    },
  });

  // 4. Create Sample Job Seekers
  const seeker1 = await prisma.user.create({
    data: {
      email: "budi.santoso@example.com",
      password: hashedPassword,
      name: "Budi Santoso",
      role: Role.JOB_SEEKER,
    },
  });

  const seeker2 = await prisma.user.create({
    data: {
      email: "siti.rahma@example.com",
      password: hashedPassword,
      name: "Siti Rahma",
      role: Role.JOB_SEEKER,
    },
  });

  // 5. Create Sample Jobs
  const job1 = await prisma.job.create({
    data: {
      companyId: companyUser.id,
      title: "Full Stack Developer (Node.js & React)",
      companyName: "PT Toko Tech Indonesia",
      location: "Jakarta Selatan (Hybrid)",
      salaryMin: 12000000,
      salaryMax: 18000000,
      jobType: JobType.FULL_TIME,
      description:
        "Kami mencari Full Stack Developer berpengalaman dalam Node.js, Express, React, dan TypeScript untuk bergabung membangun platform e-commerce generasi terbaru.",
    },
  });

  const job2 = await prisma.job.create({
    data: {
      companyId: companyUser.id,
      title: "Frontend Engineer (React + TypeScript)",
      companyName: "PT Toko Tech Indonesia",
      location: "Jakarta Selatan",
      salaryMin: 9000000,
      salaryMax: 14000000,
      jobType: JobType.FULL_TIME,
      description:
        "Membangun antarmuka web modern dengan performa tinggi dan desain responsif menggunakan Tailwind CSS dan Next/React.",
    },
  });

  const job3 = await prisma.job.create({
    data: {
      companyId: companyUser2.id,
      title: "Backend Engineer (Node.js & PostgreSQL)",
      companyName: "PT Fintech Solusi Nusantara",
      location: "Bandung (Remote)",
      salaryMin: 15000000,
      salaryMax: 22000000,
      jobType: JobType.REMOTE,
      description:
        "Bertanggung jawab dalam merancang skema database PostgreSQL, RESTful API dengan high concurrency, serta optimasi query Prisma.",
    },
  });

  // 6. Create Sample Application & History
  const application1 = await prisma.application.create({
    data: {
      jobId: job1.id,
      applicantId: seeker1.id,
      status: ApplicationStatus.REVIEWING,
      notes: "Memiliki pengalaman 2 tahun di React & Node.js.",
    },
  });

  // Initial history: APPLIED
  await prisma.applicationHistory.create({
    data: {
      applicationId: application1.id,
      previousStatus: null,
      newStatus: ApplicationStatus.APPLIED,
      changedById: seeker1.id,
      notes: "Kandidat mengirimkan lamaran.",
    },
  });

  // Second history: REVIEWING by Company
  await prisma.applicationHistory.create({
    data: {
      applicationId: application1.id,
      previousStatus: ApplicationStatus.APPLIED,
      newStatus: ApplicationStatus.REVIEWING,
      changedById: companyUser.id,
      notes: "HR sedang meninjau portofolio dan CV kandidat.",
    },
  });

  console.log("Seeding completed successfully!");
  console.log("Akun uji coba yang dibuat:");
  console.log("1. Company: hr@tokotech.id / password123");
  console.log("2. Company: recruiter@fintechsolusi.id / password123");
  console.log("3. Seeker: budi.santoso@example.com / password123");
  console.log("4. Seeker: siti.rahma@example.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
