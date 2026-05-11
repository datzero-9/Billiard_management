import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/constants';
import { Table2, Clock, DollarSign, ClipboardList } from 'lucide-react';

export default function DashboardPage() {
  const { data: tables } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api.get('/tables').then(r => r.data.data),
    refetchInterval: 10000,
  });

  const { data: activeOrders } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => api.get('/orders/active').then(r => r.data.data),
    refetchInterval: 10000,
  });

  const occupiedTables = tables?.filter((t: any) => t.status === 'OCCUPIED' || t.status === 'RESERVED') || [];
  const activeSessions = tables?.flatMap((t: any) => t.sessions) || [];

  const stats = [
    {
      label: 'Bàn đang chơi',
      value: occupiedTables.length,
      sub: `/ ${tables?.length || 0} bàn`,
      icon: Table2,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-500',
      borderColor: 'border-sky-200',
    },
    {
      label: 'Phiên active',
      value: activeSessions.length,
      sub: 'đang hoạt động',
      icon: Clock,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-200',
    },
    {
      label: 'Đơn hàng chờ',
      value: activeOrders?.length || 0,
      sub: 'cần xử lý',
      icon: ClipboardList,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-200',
    },
    {
      label: 'Giá bàn TB',
      value: tables?.length ? formatCurrency(tables.reduce((s: number, t: any) => s + Number(t.hourlyRate), 0) / tables.length) : '---',
      sub: '/ giờ',
      icon: DollarSign,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-500',
      borderColor: 'border-violet-200',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Bảng điều khiển</h1>
        <p className="text-slate-500">Tổng quan hoạt động quán bida</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-white rounded-xl border ${s.borderColor} p-5 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{s.label}</span>
              <div className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center`}>
                <s.icon className={`h-[18px] w-[18px] ${s.iconColor}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-800">{s.value}</div>
            <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Active tables */}
      {occupiedTables.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Bàn đang hoạt động</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {occupiedTables.map((table: any) => (
                <div key={table.id} className="p-3 rounded-xl border border-rose-200 bg-rose-50 text-center hover:shadow-sm transition-shadow">
                  <p className="font-semibold text-sm text-slate-700">{table.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{table.type}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
