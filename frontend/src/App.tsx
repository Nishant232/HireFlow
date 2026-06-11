import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'
import Sidebar from '@/components/layout/Sidebar'

// Pages
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import ApplicationsPage from '@/pages/ApplicationsPage'
import ApplicationDetailPage from '@/pages/ApplicationDetailPage'
import AIToolsPage from '@/pages/AIToolsPage'
import StatsPage from '@/pages/StatsPage'
import ResumeStudioPage from '@/pages/ResumeStudioPage'
import JobRecommendationsPage from '@/pages/JobRecommendationsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/applications"
          element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>}
        />
        <Route
          path="/applications/:id"
          element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>}
        />
        <Route
          path="/ai-tools"
          element={<ProtectedRoute><AIToolsPage /></ProtectedRoute>}
        />
        <Route
          path="/stats"
          element={<ProtectedRoute><StatsPage /></ProtectedRoute>}
        />
        <Route
          path="/resume-studio"
          element={<ProtectedRoute><ResumeStudioPage /></ProtectedRoute>}
        />
        <Route
          path="/jobs"
          element={<ProtectedRoute><JobRecommendationsPage /></ProtectedRoute>}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
