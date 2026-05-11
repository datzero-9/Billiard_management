import type { RouteObject } from 'react-router-dom';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UsersPage from './pages/UsersPage';
import AdminReportsPage from './pages/AdminReportsPage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';

export const adminRoutes: RouteObject[] = [
  { index: true, element: <AdminDashboardPage /> },
  { path: 'users', element: <UsersPage /> },
  { path: 'notifications', element: <NotificationsPage /> },
  { path: 'reports', element: <AdminReportsPage /> },
  { path: 'settings', element: <SettingsPage /> },
];
