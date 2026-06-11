import { Link } from 'react-router-dom'
import {
  Sparkles, BarChart2, ArrowRight, FileText, Search,
  Briefcase, Shield, Zap, TrendingUp, Star, CheckCircle,
} from 'lucide-react'
import { HireFlowLogo } from '../components/Logo'

const features = [
  {
    icon: Briefcase,
    tag: 'Pipeline',
    title: 'Never lose an application again',
    desc: 'Visual kanban tracks every opportunity from wishlist to offer — with status updates, follow-up dates, and interview notes.',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    hoverBorder: 'hover:border-blue-500/30',
    span: 'lg:col-span-2',
  },
  {
    icon: Sparkles,
    tag: 'AI Suite',
    title: 'AI tools that work for you',
    desc: 'Tailor resume bullets to any JD, generate cover letters, and ace interviews — powered by GPT.',
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-400',
    hoverBorder: 'hover:border-violet-500/30',
    span: 'lg:col-span-1',
  },
  {
    icon: FileText,
    tag: 'Resume Studio',
    title: 'ATS-optimized in minutes',
    desc: 'Build, score, and export your resume. Get real ATS scores, link verification, and clean PDF downloads.',
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
    hoverBorder: 'hover:border-indigo-500/30',
    span: 'lg:col-span-1',
  },
  {
    icon: Search,
    tag: 'Job Finder',
    title: 'Discover your next opportunity',
    desc: 'Find active listings with AI match scores — know exactly which jobs to apply to first.',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    hoverBorder: 'hover:border-cyan-500/30',
    span: 'lg:col-span-1',
  },
  {
    icon: BarChart2,
    tag: 'Analytics',
    title: 'Data that drives your strategy',
    desc: 'Track response rates, pipeline velocity, and monthly trends. Know what works and double down on it.',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    hoverBorder: 'hover:border-emerald-500/30',
    span: 'lg:col-span-1',
  },
]

const steps = [
  {
    num: '01',
    color: 'text-blue-400',
    border: 'border-blue-500/20',
    bg: 'hover:bg-blue-500/5',
    title: 'Track every application',
    desc: 'Add jobs manually or import. Set reminders, attach notes, and keep your pipeline organised.',
  },
  {
    num: '02',
    color: 'text-violet-400',
    border: 'border-violet-500/20',
    bg: 'hover:bg-violet-500/5',
    title: 'Let AI do the heavy lifting',
    desc: 'Tailor your resume, craft cover letters, and prepare for interviews — all in one click.',
  },
  {
    num: '03',
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    bg: 'hover:bg-emerald-500/5',
    title: 'Land the offer',
    desc: 'Follow up at the right time, use analytics to refine your approach, and negotiate confidently.',
  },
]

const previewApps = [
  { company: 'Google', role: 'Software Engineer', status: 'Interview', statusCls: 'bg-blue-500/20 text-blue-300 border-blue-500/25' },
  { company: 'Stripe', role: 'Full Stack Engineer', status: 'Offer 🎉', statusCls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/25' },
  { company: 'Figma', role: 'Frontend Dev', status: 'Screening', statusCls: 'bg-amber-500/20 text-amber-300 border-amber-500/25' },
  { company: 'Notion', role: 'SWE Intern', status: 'Applied', statusCls: 'bg-slate-500/20 text-slate-400 border-slate-500/25' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060912] text-white overflow-x-hidden">

      {/* ── Fixed background effects ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="grid-dots-bg absolute inset-0" />
        <div className="absolute top-[-20%] left-[8%]  w-[700px] h-[700px] rounded-full bg-blue-600/[0.07]   blur-[160px]" />
        <div className="absolute top-[25%]  right-[-8%] w-[550px] h-[550px] rounded-full bg-violet-600/[0.07] blur-[130px]" />
        <div className="absolute bottom-[5%] left-[35%] w-[400px] h-[400px] rounded-full bg-cyan-600/[0.05]   blur-[100px]" />
      </div>

      {/* ── Sticky Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-[#060912]/80">
        <div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <HireFlowLogo size={36} />
            <span className="text-[17px] font-bold tracking-tight">HireFlow</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-600/25 hover:-translate-y-px"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero — split layout ── */}
      <section className="relative max-w-7xl mx-auto px-5 md:px-10 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* Left: copy */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/[0.05] border border-white/[0.1] text-slate-300 text-xs font-medium px-4 py-1.5 rounded-full mb-7">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              AI-Powered Job Search Platform
              <span className="w-px h-3 bg-white/20" />
              <span className="text-blue-400 font-semibold">Free Forever</span>
            </div>

            {/* Headline */}
            <h1 className="text-[2.6rem] md:text-5xl xl:text-[3.4rem] font-extrabold tracking-tight leading-[1.07] mb-6">
              Job hunting should be
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 animate-gradient">
                smarter, not harder.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-slate-400 mb-9 leading-relaxed max-w-lg">
              HireFlow combines intelligent application tracking with AI-powered tools — so you can focus on what matters:{' '}
              <span className="text-slate-200 font-medium">landing the offer.</span>
            </p>

            {/* CTA row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-2xl shadow-blue-900/40 hover:shadow-blue-600/30 hover:-translate-y-px"
              >
                Start for Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/[0.1] text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/[0.05] font-semibold rounded-xl transition-all duration-200"
              >
                Sign In
              </Link>
            </div>

            {/* Trust micro-copy */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-slate-500 text-sm">
              {['No credit card required', 'Free forever', '8 powerful features'].map((item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Right: floating UI preview */}
          <div className="relative hidden lg:block select-none">
            {/* Main pipeline card */}
            <div className="relative bg-[#0d1117] border border-white/[0.09] rounded-2xl p-5 shadow-2xl shadow-black/50">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-white text-sm font-semibold">Application Pipeline</p>
                  <p className="text-slate-500 text-xs mt-0.5">12 active applications</p>
                </div>
                <div className="h-7 w-7 bg-blue-500/15 rounded-lg flex items-center justify-center">
                  <Briefcase className="h-3.5 w-3.5 text-blue-400" />
                </div>
              </div>

              <div className="space-y-2">
                {previewApps.map((app) => (
                  <div
                    key={app.company}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.05]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-md bg-white/[0.08] flex items-center justify-center text-xs font-bold text-white">
                        {app.company[0]}
                      </div>
                      <div>
                        <p className="text-white text-[13px] font-medium">{app.company}</p>
                        <p className="text-slate-500 text-xs">{app.role}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${app.statusCls}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div className="flex gap-1.5">
                  {['All', 'Active', 'Offers'].map((f, i) => (
                    <span
                      key={f}
                      className={`text-xs px-2.5 py-1 rounded-md ${i === 0 ? 'bg-blue-600/20 text-blue-300' : 'text-slate-500'}`}
                    >
                      {f}
                    </span>
                  ))}
                </div>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
            </div>

            {/* Floating card — AI score */}
            <div className="absolute -bottom-6 -left-10 bg-[#0d1117] border border-white/[0.09] rounded-xl p-3.5 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Resume Tailored</p>
                  <p className="text-slate-500 text-xs">
                    ATS Score:{' '}
                    <span className="text-emerald-400 font-bold">94%</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Floating card — response rate */}
            <div className="absolute -top-6 -right-6 bg-[#0d1117] border border-white/[0.09] rounded-xl p-3.5 shadow-xl backdrop-blur-sm min-w-[130px]">
              <p className="text-slate-500 text-xs mb-1">Response Rate</p>
              <p className="text-2xl font-black text-white leading-none">68%</p>
              <div className="flex items-end gap-0.5 mt-2.5">
                {[3, 5, 4, 7, 6, 8, 9].map((h, i) => (
                  <div
                    key={i}
                    className={`w-3 rounded-sm ${i === 6 ? 'bg-emerald-400' : 'bg-emerald-500/30'}`}
                    style={{ height: `${h * 3}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-y border-white/[0.06] py-9">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { val: '100%', label: 'Free to use', icon: Star },
              { val: 'GPT-4o', label: 'AI powered', icon: Sparkles },
              { val: '8 tools', label: 'All-in-one', icon: Zap },
            ].map(({ val, label, icon: Icon }) => (
              <div key={label}>
                <div className="text-2xl md:text-3xl font-extrabold text-white">{val}</div>
                <div className="flex items-center justify-center gap-1.5 text-slate-500 text-sm mt-1">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features bento ── */}
      <section className="relative max-w-6xl mx-auto px-5 md:px-10 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase text-blue-400 mb-3">Features</p>
          <h2 className="text-3xl md:text-4xl font-bold">Everything you need to land the job</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto text-[15px]">
            From first application to final offer — HireFlow has you covered at every step of the journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, tag, title, desc, iconBg, iconColor, hoverBorder, span }) => (
            <div
              key={title}
              className={`group relative rounded-2xl p-6 border border-white/[0.07] bg-white/[0.02] ${hoverBorder} hover:bg-white/[0.04] transition-all duration-300 cursor-default ${span}`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} mb-4`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <p className={`text-[11px] font-semibold tracking-widest uppercase ${iconColor} opacity-60 mb-2`}>{tag}</p>
              <h3 className="text-[15px] font-semibold text-white mb-2 leading-snug">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="relative max-w-5xl mx-auto px-5 md:px-10 py-16">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-violet-400 mb-3">Process</p>
          <h2 className="text-3xl md:text-4xl font-bold">Three steps to your dream job</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {steps.map(({ num, color, border, bg, title, desc }) => (
            <div
              key={num}
              className={`relative rounded-2xl border ${border} bg-white/[0.02] ${bg} p-6 transition-colors duration-200`}
            >
              <div className={`text-[3.5rem] font-black ${color} opacity-[0.15] mb-3 leading-none select-none`}>
                {num}
              </div>
              <h3 className="text-white font-semibold text-[15px] mb-2 leading-snug">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative max-w-4xl mx-auto px-5 md:px-10 py-20">
        <div
          className="relative rounded-3xl p-10 md:p-16 text-center overflow-hidden border border-white/[0.1]"
          style={{
            background: 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(109,40,217,0.18) 100%)',
          }}
        >
          {/* Inner glows */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
            <div className="absolute -top-24 left-1/3  w-72 h-72 bg-blue-600/20   rounded-full blur-3xl" />
            <div className="absolute -bottom-16 right-1/4 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="inline-flex items-center gap-2 bg-white/[0.08] border border-white/[0.1] text-slate-300 text-xs px-3.5 py-1 rounded-full mb-6">
              <Star className="h-3 w-3 text-amber-400" />
              Free to use · No credit card needed
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Ready to take control of
              <br />
              your job search?
            </h2>
            <p className="text-slate-300 mb-8 text-lg max-w-md mx-auto">
              Track smarter, apply better, and land the offer — all in one place.
            </p>
            <Link
              to="/signup"
              className="group inline-flex items-center gap-2 bg-white text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-2xl hover:-translate-y-0.5"
            >
              Create Your Free Account
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="text-slate-500 text-sm mt-5">Free forever · No credit card required</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HireFlowLogo size={28} />
            <span className="text-white font-semibold">HireFlow</span>
          </div>
          <p className="text-slate-500 text-sm">
            Built for ambitious job seekers · 2026 · All rights reserved
          </p>
          <div className="flex gap-5 text-slate-500 text-sm">
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
