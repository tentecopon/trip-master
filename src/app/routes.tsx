import { createHashRouter } from 'react-router-dom'
import { App } from './App'
import { DashboardPage } from '@/pages/DashboardPage'
import { TripListPage } from '@/pages/TripListPage'
import { TripRegisterPage } from '@/pages/TripRegisterPage'
import { TripEditPage } from '@/pages/TripEditPage'
import { TripDetailPage } from '@/pages/TripDetailPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { HistoryDetailPage } from '@/pages/HistoryDetailPage'
import { TemplatePage } from '@/pages/TemplatePage'
import { TemplateEditPage } from '@/pages/TemplateEditPage'
import { SettingsPage } from '@/pages/SettingsPage'

// Hash router: keeps deep links working offline once installed as a PWA
// without needing server-side rewrite rules. §27
export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'trips', element: <TripListPage /> },
      { path: 'trips/new', element: <TripRegisterPage /> },
      { path: 'trips/:tripId/edit', element: <TripEditPage /> },
      { path: 'trips/:tripId', element: <TripDetailPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'history/:tripId', element: <HistoryDetailPage /> },
      { path: 'templates', element: <TemplatePage /> },
      { path: 'templates/:templateId', element: <TemplateEditPage /> },
      { path: 'settings', element: <SettingsPage /> }
    ]
  }
])
