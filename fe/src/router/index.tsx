import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, AdminGuard } from './guards';
import LoginPage from '@/pages/LoginPage';
import AdminLayout from '@/zones/admin/layout/AdminLayout';
import UserLayout from '@/zones/user/layout/UserLayout';
import { adminRoutes } from '@/zones/admin/routes';
import { userRoutes } from '@/zones/user/routes';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/admin',
        element: <AdminGuard />,
        children: [
          {
            element: <AdminLayout />,
            children: adminRoutes,
          },
        ],
      },
      {
        path: '/',
        element: <UserLayout />,
        children: [
          { index: true, element: <Navigate to="/reports" replace /> },
          ...userRoutes,
        ],
      },
    ],
  },
]);
