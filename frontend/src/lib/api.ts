import axios from 'axios'
import { supabase } from './supabase'
import type { Application, Stats } from '@/types'

const api = axios.create({
  baseURL: import.meta.env.PROD ? '' : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'),
})

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      supabase.auth.signOut()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const applicationsAPI = {
  getAll: (params?: Record<string, string>) =>
    api.get<{ applications: Application[]; total: number }>('/api/applications', { params }),
  getOne: (id: string) =>
    api.get<{ application: Application }>(`/api/applications/${id}`),
  create: (data: Partial<Application>) =>
    api.post<{ application: Application }>('/api/applications', data),
  update: (id: string, data: Partial<Application>) =>
    api.patch<{ application: Application }>(`/api/applications/${id}`, data),
  delete: (id: string) =>
    api.delete(`/api/applications/${id}`),
}

export const aiAPI = {
  tailorResume: (data: {
    jobDescription: string
    currentBullets?: string
    role: string
    company: string
    applicationId?: string
  }) => api.post<{ bullets: string[] }>('/api/ai/tailor-resume', data),

  interviewPrep: (data: {
    company: string
    role: string
    jobDescription?: string
    applicationId?: string
  }) => api.post('/api/ai/interview-prep', data),

  coverLetter: (data: {
    company: string
    role: string
    jobDescription: string
    candidateName?: string
    highlights?: string
    applicationId?: string
  }) => api.post<{ coverLetter: string }>('/api/ai/cover-letter', data),
}

export const statsAPI = {
  get: () => api.get<Stats>('/api/stats'),
}

// Resume API
export const resumeAPI = {
  upload: (file: File) => {
    const formData = new FormData()
    formData.append('resume', file)
    return api.post<{
      success: boolean
      resume: {
        text: string
        sections: { experience: string; education: string; skills: string; summary: string; raw: string }
        wordCount: number
        fileType: string
        fileName: string
      }
      urlVerification: {
        urls: VerifiedUrl[]
        summary: UrlSummary
      } | null
    }>('/api/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  optimize: (data: {
    resumeText: string
    jobDescription: string
    targetRole?: string
    targetCompany?: string
  }) => api.post<{ optimization: ResumeOptimization }>('/api/resume/optimize', data),

  verifyUrls: (urls: string[]) =>
    api.post<{ urls: VerifiedUrl[]; summary: UrlSummary }>('/api/resume/verify-urls', { urls }),

  generatePdf: (resumeData: any) =>
    api.post('/api/resume/generate-pdf', { resumeData }, { responseType: 'blob' }),
}

// Jobs API
export const jobsAPI = {
  recommend: (data: {
    resumeText?: string
    location?: string
    jobTitle?: string
    skills?: string[]
  }) => api.post<{ jobs: JobListing[]; searchKeywords: string[]; totalFound: number; note: string }>(
    '/api/jobs/recommend', data
  ),

  matchScore: (data: {
    resumeText: string
    jobTitle: string
    jobDescription: string
    company: string
  }) => api.post<MatchScore>('/api/jobs/match-score', data),
}

// Types for advanced features
export interface VerifiedUrl {
  url: string
  status: 'valid' | 'broken' | 'redirect' | 'timeout' | 'unknown'
  statusCode: number | null
  responseTime: number
  suggestion: string | null
  platform: string | null
}

export interface UrlSummary {
  total: number
  valid: number
  broken: number
  unknown: number
  timeout: number
  redirect: number
}

export interface ResumeOptimization {
  atsScore: number
  matchPercentage: number
  missingKeywords: string[]
  presentKeywords: string[]
  optimizedSummary: string
  optimizedBullets: string[]
  skillsToAdd: string[]
  skillsToHighlight: string[]
  weaknesses: string[]
  strengths: string[]
  recommendations: string[]
}

export interface JobListing {
  id: string
  title: string
  company: string
  location: string
  salary?: { min: number; max: number; currency: string }
  description: string
  url: string
  postedDate: string
  jobType: string
  isActive: boolean
  daysOld: number
}

export interface MatchScore {
  matchScore: number
  verdict: string
  topMatchingSkills: string[]
  missingSkills: string[]
  recommendation: string
}

export default api
