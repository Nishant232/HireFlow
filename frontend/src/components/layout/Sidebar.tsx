import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Sparkles,
  BarChart2, LogOut, Menu, X, FileText, Search,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { HireFlowLogo } from '../Logo'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'     },
  { to: '/applications',  icon: Briefcase,        label: 'Applications'  },
  { to: '/resume-studio', icon: FileText,          label: 'Resume Studio' },
  { to: '/jobs',          icon: Search,            label: 'Job Finder'    },
  { to: '/ai-tools',      icon: Sparkles,          label: 'AI Tools'      },
  { to: '/stats',         icon: BarChart2,         label: 'Statistics'    },
]

export default function Sidebar() {
  const { signOut, user } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-[#0a0e1a] border border-white/10 p-2 rounded-lg shadow-lg"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open
          ? <X    className="h-5 w-5 text-slate-300" />
          : <Menu className="h-5 w-5 text-slate-300" />
        }
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0a0e1a] border-r border-white/[0.07] z-40 flex flex-col
          transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.07]">
          <HireFlowLogo size={34} />
          <span className="text-[17px] font-bold text-white tracking-tight">HireFlow</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-blue-400' : ''}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + sign out */}
        <div className="p-3 border-t border-white/[0.07]">
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-xl bg-white/[0.03]">
            <div className="h-7 w-7 bg-blue-600/25 rounded-full flex items-center justify-center text-blue-400 font-bold text-xs border border-blue-600/30 flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs text-slate-500 truncate flex-1">{user?.email}</p>
          </div>
          <button
            id="sidebar-signout"
            onClick={signOut}
            className="flex items-center gap-2.5 text-[13px] text-slate-500 hover:text-red-400 transition-colors w-full px-3 py-2.5 rounded-xl hover:bg-red-500/[0.07] mt-0.5"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
