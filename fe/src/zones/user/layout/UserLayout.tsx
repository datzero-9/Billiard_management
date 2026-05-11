import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  Headphones,
  LogOut,
  Plus,
  QrCode,
  ReceiptText,
  Settings,
  Shield,
  Table2,
  UtensilsCrossed,
  Waves,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';

const NAV_ITEMS = [
  { to: '/reports', icon: BarChart3, label: 'Báo cáo Doanh thu', roles: ['ADMIN', 'MANAGER'] },
  { to: '/tables', icon: Table2, label: 'Quản lý Bàn', roles: ['ADMIN', 'MANAGER', 'CASHIER', 'STAFF'] },
  { to: '/menu', icon: UtensilsCrossed, label: 'Thực đơn F&B', roles: ['ADMIN', 'MANAGER'] },
  { to: '/orders', icon: ClipboardList, label: 'Bếp / Bar', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/transactions', icon: ReceiptText, label: 'Lịch sử giao dịch', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/payment-qr', icon: QrCode, label: 'QR chuyển khoản', roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { to: '/settings', icon: Settings, label: 'Cài đặt Giá', roles: ['ADMIN', 'MANAGER'] },
];

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#f4fbff] text-slate-800">
      <aside className="flex w-[224px] shrink-0 flex-col border-r border-sky-100 bg-[#eaf7ff]">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-white shadow-sm shadow-sky-200">
            <Waves className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight text-sky-950">CueManager</h1>
            <p className="truncate text-[11px] font-medium text-slate-500">Elite Billiards Club</p>
          </div>
        </div>

        <div className="px-4">
          <button
            type="button"
            onClick={() => navigate('/tables')}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-sky-600 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" />
            Đặt bàn mới
          </button>
        </div>

        <nav className="mt-6 flex-1 space-y-1 px-3">
          {NAV_ITEMS.filter((item) => user && item.roles.includes(user.role)).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex h-10 items-center gap-3 rounded-md border border-transparent px-3 text-[13px] font-semibold transition ${
                  isActive
                    ? 'border-sky-100 bg-sky-100 text-sky-700 shadow-sm'
                    : 'text-slate-600 hover:bg-white/65 hover:text-sky-800'
                }`
              }
            >
              <item.icon className="h-[17px] w-[17px]" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {user?.role === 'ADMIN' && (
          <div className="px-3 pb-2">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="flex h-10 w-full items-center gap-2 rounded-md border border-sky-100 bg-white/70 px-3 text-[13px] font-semibold text-sky-700 transition hover:bg-white"
            >
              <Shield className="h-4 w-4" />
              Admin Portal
            </button>
          </div>
        )}

        <div className="mx-4 border-t border-sky-100 py-4">
          <button
            type="button"
            className="flex h-9 w-full items-center gap-2 rounded-md px-2 text-[13px] font-medium text-slate-500 transition hover:bg-white/70 hover:text-sky-800"
          >
            <Headphones className="h-4 w-4" />
            Hỗ trợ
          </button>
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="mt-1 flex h-9 w-full items-center gap-2 rounded-md px-2 text-[13px] font-medium text-slate-500 transition hover:bg-white/70 hover:text-sky-800"
          >
            <Settings className="h-4 w-4" />
            Cài đặt
          </button>
        </div>

        <div className="border-t border-sky-100 px-3 py-3">
          <div className="flex items-center gap-3 rounded-md bg-white/70 px-2 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-100 text-xs font-bold text-sky-700">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{user?.name}</p>
              <p className="text-[11px] font-medium text-slate-400">{user?.role}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-[#f4fbff]">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
