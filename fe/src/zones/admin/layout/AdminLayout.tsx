import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  Building2,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';

const NAV_ITEMS = [
  { to: '/admin', icon: LayoutDashboard, label: 'Tổng quan', end: true },
  { to: '/admin/users', icon: Building2, label: 'Tài khoản cửa hàng' },
  { to: '/admin/notifications', icon: MessageSquareText, label: 'Thông báo' },
  { to: '/admin/reports', icon: BarChart3, label: 'Doanh thu hệ thống' },
  { to: '/admin/settings', icon: Settings, label: 'Cấu hình' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-[#f5fbff] text-slate-800">
      <aside className="flex w-[248px] shrink-0 flex-col border-r border-sky-100 bg-white">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-700 text-white shadow-sm shadow-sky-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-slate-950">Billiard Admin</h1>
            <p className="text-[11px] font-medium text-slate-400">Super Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex h-10 items-center gap-3 rounded-md border border-transparent px-3 text-[13px] font-semibold transition ${
                  isActive
                    ? 'border-sky-100 bg-sky-50 text-sky-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-sky-800'
                }`
              }
            >
              <item.icon className="h-[17px] w-[17px]" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="flex h-10 w-full items-center gap-2 rounded-md border border-sky-100 bg-sky-50 px-3 text-[13px] font-semibold text-sky-700 transition hover:bg-sky-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại user app
          </button>
        </div>

        <div className="border-t border-slate-100 px-3 py-3">
          <div className="flex items-center gap-3 rounded-md bg-slate-50 px-2 py-2">
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

      <main className="flex-1 overflow-auto bg-[#f5fbff]">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
