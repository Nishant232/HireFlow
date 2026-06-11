import { useState, useCallback } from 'react'
import {
  FileText, Download, RefreshCw, Plus, Trash2,
  User, Briefcase, BookOpen, Code2, Award, Star,
  Globe, Heart, Shield, ChevronDown, ChevronUp,
} from 'lucide-react'
import { resumeAPI } from '@/lib/api'
import toast from 'react-hot-toast'

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = 'fresher' | 'professional'

interface Education {
  degree: string; branch: string; institution: string
  startYear: string; endYear: string; grade: string
}
interface Experience {
  title: string; company: string; location: string
  startDate: string; endDate: string; current: boolean; responsibilities: string
}
interface Project {
  name: string; description: string; tech: string
  githubUrl: string; liveUrl: string
}
interface Internship {
  role: string; organization: string; duration: string; description: string
}
interface Certification {
  name: string; issuer: string; date: string; url: string
}
interface Achievement { title: string; description: string }
interface Position { position: string; organization: string; description: string }
interface Language { language: string; proficiency: string }

interface FormState {
  name: string; email: string; phone: string; location: string
  linkedin: string; github: string; portfolio: string; website: string
  summary: string
  skills: { languages: string; frameworks: string; databases: string; tools: string; soft: string }
  education: Education[]
  experience: Experience[]
  projects: Project[]
  internships: Internship[]
  certifications: Certification[]
  achievements: Achievement[]
  positions: Position[]
  languages: Language[]
  interests: string
}

interface Errors { [key: string]: string }

// ─── Defaults ────────────────────────────────────────────────────────────────

const defEducation    = (): Education    => ({ degree: '', branch: '', institution: '', startYear: '', endYear: '', grade: '' })
const defExperience   = (): Experience   => ({ title: '', company: '', location: '', startDate: '', endDate: '', current: false, responsibilities: '' })
const defProject      = (): Project      => ({ name: '', description: '', tech: '', githubUrl: '', liveUrl: '' })
const defInternship   = (): Internship   => ({ role: '', organization: '', duration: '', description: '' })
const defCertification= (): Certification=> ({ name: '', issuer: '', date: '', url: '' })
const defAchievement  = (): Achievement  => ({ title: '', description: '' })
const defPosition     = (): Position     => ({ position: '', organization: '', description: '' })
const defLanguage     = (): Language     => ({ language: '', proficiency: '' })

const INITIAL_FORM: FormState = {
  name: '', email: '', phone: '', location: '',
  linkedin: '', github: '', portfolio: '', website: '',
  summary: '',
  skills: { languages: '', frameworks: '', databases: '', tools: '', soft: '' },
  education: [defEducation()],
  experience: [],
  projects: [defProject()],
  internships: [],
  certifications: [],
  achievements: [],
  positions: [],
  languages: [],
  interests: '',
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form: FormState, mode: Mode): Errors {
  const e: Errors = {}

  // Personal info
  if (!form.name.trim())  e.name  = 'Full name is required'
  if (!form.email.trim()) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address'
  if (!form.phone.trim()) e.phone = 'Phone number is required'
  if (!form.location.trim()) e.location = 'Location is required'

  // URLs (if filled)
  const urlRe = /^https?:\/\/.+/
  if (form.linkedin && !urlRe.test(form.linkedin)) e.linkedin = 'Must start with http:// or https://'
  if (form.github   && !urlRe.test(form.github))   e.github   = 'Must start with http:// or https://'
  if (form.portfolio && !urlRe.test(form.portfolio)) e.portfolio = 'Must start with http:// or https://'
  if (form.website  && !urlRe.test(form.website))  e.website  = 'Must start with http:// or https://'

  // Summary
  if (!form.summary.trim()) e.summary = 'Professional summary is required'
  else if (form.summary.length < 50) e.summary = 'Summary should be at least 50 characters'
  else if (form.summary.length > 600) e.summary = 'Summary should be under 600 characters'

  // Skills
  const hasSkill = form.skills.languages || form.skills.frameworks || form.skills.databases || form.skills.tools
  if (!hasSkill) e['skills.languages'] = 'At least one skill category is required'

  // Education (required for all)
  if (form.education.length === 0) {
    e.education = 'At least one education entry is required'
  } else {
    form.education.forEach((edu, i) => {
      if (!edu.degree.trim())      e[`edu_${i}_degree`]      = 'Degree is required'
      if (!edu.institution.trim()) e[`edu_${i}_institution`] = 'Institution is required'
      if (!edu.startYear.trim())   e[`edu_${i}_startYear`]   = 'Start year is required'
      if (!edu.endYear.trim())     e[`edu_${i}_endYear`]     = 'End year is required'
    })
  }

  // Projects (required for freshers)
  if (mode === 'fresher') {
    if (form.projects.length === 0) {
      e.projects = 'At least one project is required for freshers'
    } else {
      form.projects.forEach((proj, i) => {
        if (!proj.name.trim())        e[`proj_${i}_name`]        = 'Project name is required'
        if (!proj.description.trim()) e[`proj_${i}_description`] = 'Description is required'
        if (!proj.tech.trim())        e[`proj_${i}_tech`]        = 'Technologies are required'
      })
    }
  }

  // Experience (required for professionals)
  if (mode === 'professional') {
    if (form.experience.length === 0) {
      e.experience = 'At least one work experience entry is required'
    } else {
      form.experience.forEach((exp, i) => {
        if (!exp.title.trim())            e[`exp_${i}_title`]            = 'Job title is required'
        if (!exp.company.trim())          e[`exp_${i}_company`]          = 'Company is required'
        if (!exp.startDate.trim())        e[`exp_${i}_startDate`]        = 'Start date is required'
        if (!exp.responsibilities.trim()) e[`exp_${i}_responsibilities`] = 'Responsibilities are required'
      })
    }
  }

  return e
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

const inputClass = (err?: string) =>
  `w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 transition
   ${err ? 'border-red-400 focus:ring-red-300' : 'border-gray-200 focus:ring-blue-400'}`

const labelClass = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide'

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="text-red-500 text-xs mt-1">{msg}</p>
}

function SectionTitle({ icon: Icon, title, optional }: { icon: any; title: string; optional?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
      <Icon className="h-4 w-4 text-blue-600" />
      <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
      {optional && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Optional</span>}
    </div>
  )
}

function CollapsibleSection({
  icon, title, optional, defaultOpen = false, children,
}: {
  icon: any; title: string; optional?: boolean; defaultOpen?: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-sm text-gray-700">{title}</span>
          {optional && <span className="text-xs text-gray-400 bg-white border px-2 py-0.5 rounded-full">Optional</span>}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1.5 text-blue-600 text-xs font-medium hover:text-blue-800 mt-3 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition">
      <Plus className="h-3.5 w-3.5" /> {label}
    </button>
  )
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0">
      <Trash2 className="h-4 w-4" />
    </button>
  )
}

// ─── TagInput ─────────────────────────────────────────────────────────────────

function TagInput({
  value, onChange, placeholder, error,
}: { value: string; onChange: (v: string) => void; placeholder: string; error?: string }) {
  const tags = value.split(',').map(s => s.trim()).filter(Boolean)
  const [inputVal, setInputVal] = useState('')

  const addTag = () => {
    const trimmed = inputVal.trim()
    if (!trimmed) return
    const newTags = [...tags, trimmed]
    onChange(newTags.join(', '))
    setInputVal('')
  }

  const removeTag = (i: number) => {
    const newTags = tags.filter((_, idx) => idx !== i)
    onChange(newTags.join(', '))
  }

  return (
    <div>
      <div className={`border rounded-lg p-2 min-h-[44px] flex flex-wrap gap-1.5 focus-within:ring-2 transition
        ${error ? 'border-red-400 focus-within:ring-red-300' : 'border-gray-200 focus-within:ring-blue-400'}`}>
        {tags.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md">
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="hover:text-red-600">×</button>
          </span>
        ))}
        <input
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : 'Add more...'}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent"
        />
      </div>
      <FieldError msg={error} />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResumeStudioPage() {
  const [mode, setMode]     = useState<Mode>('fresher')
  const [form, setForm]     = useState<FormState>(INITIAL_FORM)
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)

  // ── Field helpers ──────────────────────────────────────────────────────────

  const set = useCallback((key: keyof FormState, val: any) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => { const n = { ...e }; delete n[key as string]; return n })
  }, [])

  const setSkill = (k: keyof FormState['skills'], v: string) =>
    setForm(f => ({ ...f, skills: { ...f.skills, [k]: v } }))

  // Generic multi-entry helpers
  function addEntry<T>(key: keyof FormState, def: T) {
    setForm(f => ({ ...f, [key]: [...(f[key] as T[]), def] }))
  }
  function removeEntry<T>(key: keyof FormState, i: number) {
    setForm(f => ({ ...f, [key]: (f[key] as T[]).filter((_, idx) => idx !== i) }))
  }
  function updateEntry<T>(key: keyof FormState, i: number, val: Partial<T>) {
    setForm(f => {
      const arr = [...(f[key] as T[])] as any[]
      arr[i] = { ...arr[i], ...val }
      return { ...f, [key]: arr }
    })
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleDownload = async () => {
    const errs = validate(form, mode)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error('Please fix the highlighted errors')
      // Scroll to first error
      const firstKey = Object.keys(errs)[0]
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setLoading(true)
    try {
      const parse = (s: string) => s.split(',').map(x => x.trim()).filter(Boolean)
      const resumeData = {
        name: form.name, email: form.email, phone: form.phone,
        location: form.location, linkedin: form.linkedin || undefined,
        github: form.github || undefined, portfolio: form.portfolio || undefined,
        website: form.website || undefined, summary: form.summary,
        skills: {
          languages:  parse(form.skills.languages),
          frameworks: parse(form.skills.frameworks),
          databases:  parse(form.skills.databases),
          tools:      parse(form.skills.tools),
          soft:       parse(form.skills.soft),
        },
        education: form.education,
        experience: mode === 'professional' ? form.experience.map(e => ({
          ...e, responsibilities: e.responsibilities.split('\n').map(r => r.trim()).filter(Boolean),
        })) : [],
        projects: form.projects.map(p => ({ ...p, tech: parse(p.tech) })),
        internships:    form.internships.length    ? form.internships    : undefined,
        certifications: form.certifications.length ? form.certifications : undefined,
        achievements:   form.achievements.length   ? form.achievements   : undefined,
        positions:      form.positions.length      ? form.positions      : undefined,
        languages:      form.languages.length      ? form.languages      : undefined,
        interests:      form.interests ? parse(form.interests) : undefined,
      }

      const response = await resumeAPI.generatePdf(resumeData)
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.download = `${form.name.replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      toast.success('✅ Resume PDF downloaded successfully!')
    } catch (err: any) {
      console.error('PDF error:', err)
      const msg = err?.response?.data?.error || err?.message || 'Failed to generate PDF'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-blue-600 rounded-xl">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resume Studio</h1>
          <p className="text-sm text-gray-500">Build an ATS-optimized PDF resume from scratch</p>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-3 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
        {(['fresher', 'professional'] as Mode[]).map(m => (
          <button key={m} type="button"
            onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition capitalize
              ${mode === m ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}>
            {m === 'fresher' ? '🎓 Fresher' : '💼 Professional'}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-400 mb-6">
        {mode === 'fresher'
          ? 'Fresher mode: Personal info, Summary, Skills, Education, and Projects are required.'
          : 'Professional mode: Personal info, Summary, Skills, Education, and Work Experience are required.'}
      </p>

      <div className="space-y-5">

        {/* ── 1. Personal Information ────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <SectionTitle icon={User} title="Personal Information" />
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: 'name',     label: 'Full Name *',      placeholder: 'Nishant Kumar',         type: 'text'  },
              { id: 'email',    label: 'Email Address *',  placeholder: 'you@example.com',       type: 'email' },
              { id: 'phone',    label: 'Phone Number *',   placeholder: '+91 98765 43210',        type: 'tel'   },
              { id: 'location', label: 'Location *',       placeholder: 'Faridabad, Haryana',    type: 'text'  },
            ].map(({ id, label, placeholder, type }) => (
              <div key={id} id={id}>
                <label className={labelClass}>{label}</label>
                <input type={type} value={(form as any)[id]} placeholder={placeholder}
                  onChange={e => set(id as any, e.target.value)}
                  className={inputClass(errors[id])} />
                <FieldError msg={errors[id]} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { id: 'linkedin',  label: 'LinkedIn URL',        placeholder: 'https://linkedin.com/in/yourprofile' },
              { id: 'github',    label: 'GitHub URL',          placeholder: 'https://github.com/username' },
              { id: 'portfolio', label: 'Portfolio Website',   placeholder: 'https://your-portfolio.vercel.app' },
              { id: 'website',   label: 'Personal Website',    placeholder: 'https://yourwebsite.com' },
            ].map(({ id, label, placeholder }) => (
              <div key={id}>
                <label className={labelClass}>{label} <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
                <input type="url" value={(form as any)[id]} placeholder={placeholder}
                  onChange={e => set(id as any, e.target.value)}
                  className={inputClass(errors[id])} />
                <FieldError msg={errors[id]} />
              </div>
            ))}
          </div>
        </div>

        {/* ── 2. Professional Summary ────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5" id="summary">
          <SectionTitle icon={FileText} title="Professional Summary" />
          <textarea value={form.summary} rows={4}
            onChange={e => set('summary', e.target.value)}
            className={inputClass(errors.summary)}
            placeholder="Full Stack Developer with 2+ years of experience building scalable web applications using React, Node.js, and MongoDB. Passionate about clean code and user-centric design..." />
          <div className="flex justify-between mt-1">
            <FieldError msg={errors.summary} />
            <span className={`text-xs ml-auto ${form.summary.length > 600 ? 'text-red-500' : 'text-gray-400'}`}>
              {form.summary.length}/600
            </span>
          </div>
        </div>

        {/* ── 3. Technical Skills ────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5" id="skills.languages">
          <SectionTitle icon={Code2} title="Technical Skills" />
          {errors['skills.languages'] && (
            <p className="text-red-500 text-xs mb-3">⚠ {errors['skills.languages']}</p>
          )}
          <div className="space-y-4">
            {[
              { key: 'languages',  label: 'Programming Languages *', placeholder: 'Python, JavaScript, Java, C++' },
              { key: 'frameworks', label: 'Frameworks & Libraries *', placeholder: 'React, Node.js, Express, Django' },
              { key: 'databases',  label: 'Databases *',              placeholder: 'MongoDB, PostgreSQL, MySQL, Redis' },
              { key: 'tools',      label: 'Tools & Technologies *',   placeholder: 'Git, Docker, AWS, Postman, VS Code' },
              { key: 'soft',       label: 'Soft Skills',              placeholder: 'Leadership, Communication, Problem Solving' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className={labelClass}>
                  {label}
                  {key === 'soft' && <span className="text-gray-400 normal-case font-normal ml-1">(optional)</span>}
                </label>
                <TagInput
                  value={(form.skills as any)[key]}
                  onChange={v => setSkill(key as any, v)}
                  placeholder={placeholder}
                  error={errors[`skills.${key}`]}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. Education ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5" id="education">
          <SectionTitle icon={BookOpen} title="Education" />
          {errors.education && <p className="text-red-500 text-xs mb-3">{errors.education}</p>}
          {form.education.map((edu, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3 relative">
              <div className="absolute top-3 right-3">
                {form.education.length > 1 && <RemoveButton onClick={() => removeEntry('education', i)} />}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div id={`edu_${i}_degree`}>
                  <label className={labelClass}>Degree *</label>
                  <input value={edu.degree} onChange={e => updateEntry('education', i, { degree: e.target.value })}
                    className={inputClass(errors[`edu_${i}_degree`])} placeholder="B.Tech / B.Sc / MBA" />
                  <FieldError msg={errors[`edu_${i}_degree`]} />
                </div>
                <div>
                  <label className={labelClass}>Branch / Specialization</label>
                  <input value={edu.branch} onChange={e => updateEntry('education', i, { branch: e.target.value })}
                    className={inputClass()} placeholder="Computer Science" />
                </div>
                <div className="col-span-2" id={`edu_${i}_institution`}>
                  <label className={labelClass}>College / University *</label>
                  <input value={edu.institution} onChange={e => updateEntry('education', i, { institution: e.target.value })}
                    className={inputClass(errors[`edu_${i}_institution`])} placeholder="Delhi Technological University" />
                  <FieldError msg={errors[`edu_${i}_institution`]} />
                </div>
                <div id={`edu_${i}_startYear`}>
                  <label className={labelClass}>Start Year *</label>
                  <input value={edu.startYear} onChange={e => updateEntry('education', i, { startYear: e.target.value })}
                    className={inputClass(errors[`edu_${i}_startYear`])} placeholder="2020" />
                  <FieldError msg={errors[`edu_${i}_startYear`]} />
                </div>
                <div id={`edu_${i}_endYear`}>
                  <label className={labelClass}>End Year *</label>
                  <input value={edu.endYear} onChange={e => updateEntry('education', i, { endYear: e.target.value })}
                    className={inputClass(errors[`edu_${i}_endYear`])} placeholder="2024 or Present" />
                  <FieldError msg={errors[`edu_${i}_endYear`]} />
                </div>
                <div>
                  <label className={labelClass}>CGPA / Percentage <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input value={edu.grade} onChange={e => updateEntry('education', i, { grade: e.target.value })}
                    className={inputClass()} placeholder="8.5 CGPA / 85%" />
                </div>
              </div>
            </div>
          ))}
          <AddButton onClick={() => addEntry('education', defEducation())} label="Add Education" />
        </div>

        {/* ── 5. Projects (required for fresher, optional for pro) ────────── */}
        <CollapsibleSection
          icon={<Code2 className="h-4 w-4 text-blue-600" />}
          title="Projects"
          optional={mode === 'professional'}
          defaultOpen={true}
        >
          {errors.projects && <p className="text-red-500 text-xs mb-3">{errors.projects}</p>}
          {form.projects.map((proj, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3 relative">
              <div className="absolute top-3 right-3">
                {form.projects.length > 1 && <RemoveButton onClick={() => removeEntry('projects', i)} />}
              </div>
              <div className="space-y-3">
                <div id={`proj_${i}_name`}>
                  <label className={labelClass}>Project Title *</label>
                  <input value={proj.name} onChange={e => updateEntry('projects', i, { name: e.target.value })}
                    className={inputClass(errors[`proj_${i}_name`])} placeholder="HireFlow — AI-Powered Job Search Platform" />
                  <FieldError msg={errors[`proj_${i}_name`]} />
                </div>
                <div id={`proj_${i}_description`}>
                  <label className={labelClass}>Description *</label>
                  <textarea value={proj.description} rows={2}
                    onChange={e => updateEntry('projects', i, { description: e.target.value })}
                    className={inputClass(errors[`proj_${i}_description`])}
                    placeholder="Built a full-stack job application tracker with AI-powered resume tailoring..." />
                  <FieldError msg={errors[`proj_${i}_description`]} />
                </div>
                <div id={`proj_${i}_tech`}>
                  <label className={labelClass}>Technologies Used *</label>
                  <TagInput value={proj.tech}
                    onChange={v => updateEntry('projects', i, { tech: v })}
                    placeholder="React, Node.js, MongoDB" error={errors[`proj_${i}_tech`]} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>GitHub URL <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input value={proj.githubUrl} type="url"
                      onChange={e => updateEntry('projects', i, { githubUrl: e.target.value })}
                      className={inputClass()} placeholder="https://github.com/user/repo" />
                  </div>
                  <div>
                    <label className={labelClass}>Live Demo <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input value={proj.liveUrl} type="url"
                      onChange={e => updateEntry('projects', i, { liveUrl: e.target.value })}
                      className={inputClass()} placeholder="https://your-demo.vercel.app" />
                  </div>
                </div>
              </div>
            </div>
          ))}
          <AddButton onClick={() => addEntry('projects', defProject())} label="Add Project" />
        </CollapsibleSection>

        {/* ── 6. Work Experience (required for professional) ───────────────── */}
        <CollapsibleSection
          icon={<Briefcase className="h-4 w-4 text-blue-600" />}
          title="Work Experience"
          optional={mode === 'fresher'}
          defaultOpen={mode === 'professional'}
        >
          {errors.experience && <p className="text-red-500 text-xs mb-3">{errors.experience}</p>}
          {form.experience.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No experience added yet.</p>
          )}
          {form.experience.map((exp, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3 relative">
              <div className="absolute top-3 right-3">
                <RemoveButton onClick={() => removeEntry('experience', i)} />
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div id={`exp_${i}_title`}>
                    <label className={labelClass}>Job Title *</label>
                    <input value={exp.title} onChange={e => updateEntry('experience', i, { title: e.target.value })}
                      className={inputClass(errors[`exp_${i}_title`])} placeholder="Software Engineer" />
                    <FieldError msg={errors[`exp_${i}_title`]} />
                  </div>
                  <div id={`exp_${i}_company`}>
                    <label className={labelClass}>Company *</label>
                    <input value={exp.company} onChange={e => updateEntry('experience', i, { company: e.target.value })}
                      className={inputClass(errors[`exp_${i}_company`])} placeholder="Google India" />
                    <FieldError msg={errors[`exp_${i}_company`]} />
                  </div>
                  <div>
                    <label className={labelClass}>Location</label>
                    <input value={exp.location} onChange={e => updateEntry('experience', i, { location: e.target.value })}
                      className={inputClass()} placeholder="Bangalore, India" />
                  </div>
                  <div>
                    {/* spacer */}
                  </div>
                  <div id={`exp_${i}_startDate`}>
                    <label className={labelClass}>Start Date *</label>
                    <input value={exp.startDate} onChange={e => updateEntry('experience', i, { startDate: e.target.value })}
                      className={inputClass(errors[`exp_${i}_startDate`])} placeholder="Jan 2023" />
                    <FieldError msg={errors[`exp_${i}_startDate`]} />
                  </div>
                  <div>
                    <label className={labelClass}>End Date</label>
                    <input value={exp.endDate} disabled={exp.current}
                      onChange={e => updateEntry('experience', i, { endDate: e.target.value })}
                      className={inputClass() + (exp.current ? ' opacity-40' : '')} placeholder="Dec 2024 or Present" />
                    <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                      <input type="checkbox" checked={exp.current}
                        onChange={e => updateEntry('experience', i, { current: e.target.checked, endDate: '' })}
                        className="rounded" />
                      <span className="text-xs text-gray-500">Currently working here</span>
                    </label>
                  </div>
                </div>
                <div id={`exp_${i}_responsibilities`}>
                  <label className={labelClass}>Responsibilities * <span className="text-gray-400 font-normal">(one per line)</span></label>
                  <textarea value={exp.responsibilities} rows={4}
                    onChange={e => updateEntry('experience', i, { responsibilities: e.target.value })}
                    className={inputClass(errors[`exp_${i}_responsibilities`])}
                    placeholder={"Built RESTful APIs using Node.js and Express serving 10k+ daily users\nReduced page load time by 40% through lazy loading and code splitting\nLed a team of 3 developers to deliver the project 2 weeks ahead of schedule"} />
                  <FieldError msg={errors[`exp_${i}_responsibilities`]} />
                </div>
              </div>
            </div>
          ))}
          <AddButton onClick={() => addEntry('experience', defExperience())} label="Add Experience" />
        </CollapsibleSection>

        {/* ── 7. Internships ─────────────────────────────────────────────── */}
        <CollapsibleSection icon={<Briefcase className="h-4 w-4 text-purple-500" />} title="Internships" optional>
          {form.internships.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">No internships added yet.</p>
          )}
          {form.internships.map((intern, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3 relative">
              <div className="absolute top-3 right-3"><RemoveButton onClick={() => removeEntry('internships', i)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Role *</label>
                  <input value={intern.role} onChange={e => updateEntry('internships', i, { role: e.target.value })}
                    className={inputClass()} placeholder="Frontend Developer Intern" />
                </div>
                <div>
                  <label className={labelClass}>Organization *</label>
                  <input value={intern.organization} onChange={e => updateEntry('internships', i, { organization: e.target.value })}
                    className={inputClass()} placeholder="Startup XYZ" />
                </div>
                <div>
                  <label className={labelClass}>Duration *</label>
                  <input value={intern.duration} onChange={e => updateEntry('internships', i, { duration: e.target.value })}
                    className={inputClass()} placeholder="June 2023 – Aug 2023 (3 months)" />
                </div>
              </div>
              <div className="mt-3">
                <label className={labelClass}>Description *</label>
                <textarea value={intern.description} rows={2}
                  onChange={e => updateEntry('internships', i, { description: e.target.value })}
                  className={inputClass()} placeholder="Developed responsive UI components using React..." />
              </div>
            </div>
          ))}
          <AddButton onClick={() => addEntry('internships', defInternship())} label="Add Internship" />
        </CollapsibleSection>

        {/* ── 8. Certifications ──────────────────────────────────────────── */}
        <CollapsibleSection icon={<Shield className="h-4 w-4 text-green-600" />} title="Certifications" optional>
          {form.certifications.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">No certifications added yet.</p>
          )}
          {form.certifications.map((cert, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3 relative">
              <div className="absolute top-3 right-3"><RemoveButton onClick={() => removeEntry('certifications', i)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Certification Name *</label>
                  <input value={cert.name} onChange={e => updateEntry('certifications', i, { name: e.target.value })}
                    className={inputClass()} placeholder="AWS Cloud Practitioner" />
                </div>
                <div>
                  <label className={labelClass}>Issuing Organization *</label>
                  <input value={cert.issuer} onChange={e => updateEntry('certifications', i, { issuer: e.target.value })}
                    className={inputClass()} placeholder="Amazon Web Services" />
                </div>
                <div>
                  <label className={labelClass}>Issue Date *</label>
                  <input value={cert.date} onChange={e => updateEntry('certifications', i, { date: e.target.value })}
                    className={inputClass()} placeholder="March 2024" />
                </div>
                <div>
                  <label className={labelClass}>Credential URL <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input value={cert.url} type="url" onChange={e => updateEntry('certifications', i, { url: e.target.value })}
                    className={inputClass()} placeholder="https://credentials.example.com/cert/abc" />
                </div>
              </div>
            </div>
          ))}
          <AddButton onClick={() => addEntry('certifications', defCertification())} label="Add Certification" />
        </CollapsibleSection>

        {/* ── 9. Achievements ────────────────────────────────────────────── */}
        <CollapsibleSection icon={<Award className="h-4 w-4 text-yellow-500" />} title="Achievements" optional>
          {form.achievements.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">No achievements added yet.</p>
          )}
          {form.achievements.map((ach, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3 relative">
              <div className="absolute top-3 right-3"><RemoveButton onClick={() => removeEntry('achievements', i)} /></div>
              <div>
                <label className={labelClass}>Achievement Title *</label>
                <input value={ach.title} onChange={e => updateEntry('achievements', i, { title: e.target.value })}
                  className={inputClass()} placeholder="1st Place – National Hackathon 2024" />
              </div>
              <div className="mt-3">
                <label className={labelClass}>Description *</label>
                <textarea value={ach.description} rows={2}
                  onChange={e => updateEntry('achievements', i, { description: e.target.value })}
                  className={inputClass()} placeholder="Won 1st place among 200+ teams by building an AI-powered crop disease detection system..." />
              </div>
            </div>
          ))}
          <AddButton onClick={() => addEntry('achievements', defAchievement())} label="Add Achievement" />
        </CollapsibleSection>

        {/* ── 10. Positions of Responsibility ────────────────────────────── */}
        <CollapsibleSection icon={<Star className="h-4 w-4 text-orange-500" />} title="Positions of Responsibility" optional>
          {form.positions.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">No positions added yet.</p>
          )}
          {form.positions.map((pos, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-4 mb-3 relative">
              <div className="absolute top-3 right-3"><RemoveButton onClick={() => removeEntry('positions', i)} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Position *</label>
                  <input value={pos.position} onChange={e => updateEntry('positions', i, { position: e.target.value })}
                    className={inputClass()} placeholder="Club President / Team Lead" />
                </div>
                <div>
                  <label className={labelClass}>Organization *</label>
                  <input value={pos.organization} onChange={e => updateEntry('positions', i, { organization: e.target.value })}
                    className={inputClass()} placeholder="Coding Club, DTU" />
                </div>
              </div>
              <div className="mt-3">
                <label className={labelClass}>Description *</label>
                <textarea value={pos.description} rows={2}
                  onChange={e => updateEntry('positions', i, { description: e.target.value })}
                  className={inputClass()} placeholder="Led a team of 30 members, organized 5 workshops with 200+ attendees..." />
              </div>
            </div>
          ))}
          <AddButton onClick={() => addEntry('positions', defPosition())} label="Add Position" />
        </CollapsibleSection>

        {/* ── 11. Languages ──────────────────────────────────────────────── */}
        <CollapsibleSection icon={<Globe className="h-4 w-4 text-teal-600" />} title="Languages" optional>
          {form.languages.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-3">No languages added yet.</p>
          )}
          <div className="space-y-2">
            {form.languages.map((lang, i) => (
              <div key={i} className="flex gap-3 items-end">
                <div className="flex-1">
                  <label className={labelClass}>Language *</label>
                  <input value={lang.language} onChange={e => updateEntry('languages', i, { language: e.target.value })}
                    className={inputClass()} placeholder="English" />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Proficiency *</label>
                  <select value={lang.proficiency} onChange={e => updateEntry('languages', i, { proficiency: e.target.value })}
                    className={inputClass()}>
                    <option value="">Select level</option>
                    <option>Native</option>
                    <option>Fluent</option>
                    <option>Professional</option>
                    <option>Intermediate</option>
                    <option>Basic</option>
                  </select>
                </div>
                <RemoveButton onClick={() => removeEntry('languages', i)} />
              </div>
            ))}
          </div>
          <AddButton onClick={() => addEntry('languages', defLanguage())} label="Add Language" />
        </CollapsibleSection>

        {/* ── 12. Interests ──────────────────────────────────────────────── */}
        <CollapsibleSection icon={<Heart className="h-4 w-4 text-pink-500" />} title="Interests / Hobbies" optional>
          <label className={labelClass}>Interests / Hobbies <span className="text-gray-400 font-normal">(comma-separated)</span></label>
          <TagInput value={form.interests} onChange={v => set('interests', v)}
            placeholder="Open Source, Competitive Programming, Chess, Photography" />
        </CollapsibleSection>

        {/* ── Download Button ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">Ready to download your resume?</p>
            <p className="text-blue-200 text-xs mt-0.5">ATS-friendly PDF · Clean layout · Professional design</p>
          </div>
          <button onClick={handleDownload} disabled={loading}
            className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-50 disabled:opacity-60 transition shadow-sm flex-shrink-0">
            {loading
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating...</>
              : <><Download className="h-4 w-4" /> Download PDF</>}
          </button>
        </div>

        {/* Validation summary (if errors exist) */}
        {Object.keys(errors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-semibold text-sm mb-2">⚠ Please fix the following before downloading:</p>
            <ul className="list-disc list-inside space-y-1">
              {Object.values(errors).map((msg, i) => (
                <li key={i} className="text-red-600 text-xs">{msg}</li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  )
}
