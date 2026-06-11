import { create } from 'zustand'
import type { Application } from '@/types'

interface AppStore {
  applications: Application[]
  setApplications: (apps: Application[]) => void
  addApplication: (app: Application) => void
  updateApplication: (id: string, data: Partial<Application>) => void
  removeApplication: (id: string) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  statusFilter: string
  setStatusFilter: (s: string) => void
}

export const useAppStore = create<AppStore>((set) => ({
  applications: [],
  setApplications: (apps) => set({ applications: apps }),
  addApplication: (app) =>
    set((s) => ({ applications: [app, ...s.applications] })),
  updateApplication: (id, data) =>
    set((s) => ({
      applications: s.applications.map((a) =>
        a._id === id ? { ...a, ...data } : a
      ),
    })),
  removeApplication: (id) =>
    set((s) => ({
      applications: s.applications.filter((a) => a._id !== id),
    })),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  statusFilter: 'all',
  setStatusFilter: (s) => set({ statusFilter: s }),
}))
