import {
  createBrowserRouter,
  Navigate,
} from 'react-router-dom';

import { AppLayout } from './AppLayout';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { NotFoundPage } from '../features/reports/pages/NotFoundPage';
import ReferencesPage from '../features/references/pages/ReferencesPage';
import ProviderTemplatesPage from '../features/templates/pages/ProviderTemplatesPage';
import { ReportDetailPage } from '../features/reports/pages/ReportDetailPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/reports" replace />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'reports/:reportId',
        element: <ReportDetailPage />,
      },
      {
        path: 'templates',
        element: <ProviderTemplatesPage />,
      },
      {
        path: 'references',
        element: <ReferencesPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);