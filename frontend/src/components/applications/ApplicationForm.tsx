import { useState } from 'react'
import type { Application, ApplicationStatus, JobType } from '@/types'

interface Props {
  initial?: Partial<Application>
  onSubmit: (data: Partial<Application>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

const STATUS_OPTIONS: ApplicationStatus[] = [
  'wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn',
]
const JOB_TYPE_OPTIONS: JobType[] = [
  'full-time', 'part-time', 'contract', 'internship', 'remote',
]

export default function ApplicationForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [form, setForm] = useState({
    company: initial?.company || '',
    role: initial?.role || '',
    location: initial?.location || '',
    jobType: initial?.jobType || 'full-time',
    status: initial?.status || 'applied',
    appliedDate: initial?.appliedDate
      ? new Date(initial.appliedDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    jobUrl: initial?.jobUrl || '',
    jobDescription: initial?.jobDescription || '',
    notes: initial?.notes || '',
    salaryMin: initial?.salary?.min?.toString() || '',
    salaryMax: initial?.salary?.max?.toString() || '',
    contactName: initial?.contactName || '',
    contactEmail: initial?.contactEmail || '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      company: form.company,
      role: form.role,
      location: form.location,
      jobType: form.jobType as JobType,
      status: form.status as ApplicationStatus,
      appliedDate: form.appliedDate,
      jobUrl: form.jobUrl,
      jobDescription: form.jobDescription,
      notes: form.notes,
      salary: {
        min: form.salaryMin ? Number(form.salaryMin) : undefined,
        max: form.salaryMax ? Number(form.salaryMax) : undefined,
        currency: 'INR',
      },
      contactName: form.contactName,
      contactEmail: form.contactEmail,
    })
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Company *</label>
          <input id="form-company" name="company" value={form.company} onChange={handleChange}
            required className={inputClass} placeholder="Google" />
        </div>
        <div>
          <label className={labelClass}>Role *</label>
          <input id="form-role" name="role" value={form.role} onChange={handleChange}
            required className={inputClass} placeholder="Software Engineer" />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input name="location" value={form.location} onChange={handleChange}
            className={inputClass} placeholder="Bangalore, India" />
        </div>
        <div>
          <label className={labelClass}>Applied Date</label>
          <input name="appliedDate" type="date" value={form.appliedDate}
            onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Job Type</label>
          <select name="jobType" value={form.jobType} onChange={handleChange} className={inputClass}>
            {JOB_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Min Salary (INR)</label>
          <input name="salaryMin" type="number" value={form.salaryMin}
            onChange={handleChange} className={inputClass} placeholder="800000" />
        </div>
        <div>
          <label className={labelClass}>Max Salary (INR)</label>
          <input name="salaryMax" type="number" value={form.salaryMax}
            onChange={handleChange} className={inputClass} placeholder="1200000" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Job URL</label>
        <input name="jobUrl" value={form.jobUrl} onChange={handleChange}
          className={inputClass} placeholder="https://linkedin.com/jobs/..." />
      </div>

      <div>
        <label className={labelClass}>Job Description</label>
        <textarea name="jobDescription" value={form.jobDescription} onChange={handleChange}
          rows={4} className={inputClass} placeholder="Paste the job description here for AI analysis..." />
      </div>

      <div>
        <label className={labelClass}>Notes</label>
        <textarea name="notes" value={form.notes} onChange={handleChange}
          rows={2} className={inputClass} placeholder="Any notes about this application..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Contact Name</label>
          <input name="contactName" value={form.contactName} onChange={handleChange}
            className={inputClass} placeholder="Hiring Manager" />
        </div>
        <div>
          <label className={labelClass}>Contact Email</label>
          <input name="contactEmail" type="email" value={form.contactEmail}
            onChange={handleChange} className={inputClass} placeholder="hr@company.com" />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          id="form-submit"
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {loading ? 'Saving...' : initial?._id ? 'Update Application' : 'Add Application'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
