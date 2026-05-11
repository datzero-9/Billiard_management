
import type { RouteObject } from 'react-router-dom';
import { RoleGuard } from '@/router/guards';
import DashboardPage from './pages/DashboardPage';
import TablesPage from './pages/TablesPage';
import TableDetailPage from './pages/TableDetailPage';
import MenuPage from './pages/MenuPage';
import OrdersPage from './pages/OrdersPage';
import ReportsPage from '@/zones/admin/pages/ReportsPage';
import PricingPage from './pages/PricingPage';
import TransactionsPage from './pages/TransactionsPage';
import PaymentQrPage from './pages/PaymentQrPage';

export const userRoutes: RouteObject[] = [
  { path: 'dashboard', element: <DashboardPage /> },
  { path: 'tables', element: <TablesPage /> },
  { path: 'tables/:id', element: <TableDetailPage /> },
  {
    element: <RoleGuard roles={['ADMIN', 'MANAGER']} />,
    children: [
      { path: 'menu', element: <MenuPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <PricingPage /> },
    ],
  },
  {
    element: <RoleGuard roles={['ADMIN', 'MANAGER', 'CASHIER']} />,
    children: [
      { path: 'orders', element: <OrdersPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'payment-qr', element: <PaymentQrPage /> },
    ],
  },
];
