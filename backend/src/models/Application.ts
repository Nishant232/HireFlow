import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface IApplication extends Document {
  userId: string;
  company: string;
  role: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  status: ApplicationStatus;
  appliedDate: Date;
  salary: {
    min?: number;
    max?: number;
    currency: string;
  };
  jobUrl: string;
  jobDescription: string;
  notes: string;
  resumeVersion: string;
  contactName: string;
  contactEmail: string;
  followUpDate?: Date;
  interviewDates: Date[];
  tags: string[];
  aiInsights: {
    resumeBullets: string[];
    interviewQuestions: string[];
    coverLetter: string;
    companyResearch: string;
    generatedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    status: {
      type: String,
      enum: ['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn'],
      default: 'applied',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' },
    },
    jobUrl: {
      type: String,
      default: '',
    },
    jobDescription: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    resumeVersion: {
      type: String,
      default: '',
    },
    contactName: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    followUpDate: Date,
    interviewDates: [Date],
    tags: [String],
    aiInsights: {
      resumeBullets: [String],
      interviewQuestions: [String],
      coverLetter: { type: String, default: '' },
      companyResearch: { type: String, default: '' },
      generatedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user queries
ApplicationSchema.index({ userId: 1, status: 1 });
ApplicationSchema.index({ userId: 1, appliedDate: -1 });
ApplicationSchema.index({ userId: 1, company: 'text', role: 'text' });

const Application = mongoose.model<IApplication>('Application', ApplicationSchema);

export default Application;
