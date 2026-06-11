export type ApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type JobType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'internship'
  | 'remote';

export interface Application {
  _id: string;
  userId: string;
  company: string;
  role: string;
  location: string;
  jobType: JobType;
  status: ApplicationStatus;
  appliedDate: string;
  salary: { min?: number; max?: number; currency: string };
  jobUrl: string;
  jobDescription: string;
  notes: string;
  resumeVersion: string;
  contactName: string;
  contactEmail: string;
  followUpDate?: string;
  interviewDates: string[];
  tags: string[];
  aiInsights: {
    resumeBullets: string[];
    interviewQuestions: string[];
    coverLetter: string;
    companyResearch: string;
    generatedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Stats {
  overview: {
    total: number;
    active: number;
    interviews: number;
    offers: number;
    responseRate: number;
  };
  statusBreakdown: Record<ApplicationStatus, number>;
  monthlyApplications: { month: string; count: number }[];
  jobTypeBreakdown: { type: string; count: number }[];
  recentApplications: Partial<Application>[];
}
