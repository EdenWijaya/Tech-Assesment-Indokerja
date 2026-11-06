export type Role = "JOB_SEEKER" | "COMPANY";

export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "REMOTE" | "INTERNSHIP";

export type ApplicationStatus = "APPLIED" | "REVIEWING" | "SHORTLISTED" | "REJECTED" | "ACCEPTED";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface Job {
  id: string;
  companyId?: string;
  title: string;
  companyName: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  jobType: JobType;
  description: string;
  isActive: boolean;
  createdAt: string;
  _count?: { applications: number };
}

export interface ApplicationHistory {
  id: string;
  previousStatus: ApplicationStatus | null;
  newStatus: ApplicationStatus;
  notes: string | null;
  createdAt: string;
  changedBy: {
    name: string;
    role: Role;
  };
}

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  status: ApplicationStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  job?: Job;
  applicant?: Pick<User, "id" | "name" | "email" | "createdAt">;
  histories?: ApplicationHistory[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}
