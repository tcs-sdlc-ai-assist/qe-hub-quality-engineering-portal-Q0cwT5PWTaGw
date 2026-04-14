import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/common/ProtectedRoute'
import WelcomePage from './pages/WelcomePage'
import LoginPage from './pages/LoginPage'
import ReleaseReadinessPage from './pages/ReleaseReadinessPage'
import ShowstopperDefectsPage from './pages/ShowstopperDefectsPage'
import SITDefectSummaryPage from './pages/SITDefectSummaryPage'
import DomainDSRPage from './pages/DomainDSRPage'
import ProgramDSRPage from './pages/ProgramDSRPage'
import ProgramStatusPage from './pages/ProgramStatusPage'
import DeferredDefectsPage from './pages/DeferredDefectsPage'
import QualityMetricsPage from './pages/QualityMetricsPage'
import EmbeddedDashboardsPage from './pages/EmbeddedDashboardsPage'
import ConfluenceLinksPage from './pages/ConfluenceLinksPage'
import AdminPage from './pages/AdminPage'
import NotFoundPage from './pages/NotFoundPage'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'release-readiness',
        element: (
          <ProtectedRoute>
            <ReleaseReadinessPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'showstopper-defects',
        element: (
          <ProtectedRoute>
            <ShowstopperDefectsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'sit-defect-summary',
        element: (
          <ProtectedRoute>
            <SITDefectSummaryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'domain-dsr',
        element: (
          <ProtectedRoute>
            <DomainDSRPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'program-dsr',
        element: (
          <ProtectedRoute>
            <ProgramDSRPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'program-status',
        element: (
          <ProtectedRoute>
            <ProgramStatusPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'deferred-defects',
        element: (
          <ProtectedRoute>
            <DeferredDefectsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'quality-metrics',
        element: (
          <ProtectedRoute>
            <QualityMetricsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'embedded-dashboards',
        element: (
          <ProtectedRoute>
            <EmbeddedDashboardsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'confluence-links',
        element: (
          <ProtectedRoute>
            <ConfluenceLinksPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRole="lead">
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}