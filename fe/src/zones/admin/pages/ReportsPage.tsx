import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/constants';
import { DollarSign, Table2, UtensilsCrossed } from 'lucide-react';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

const tooltipStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
};

export default function ReportsPage() {
  const [from, setFrom] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
  const [to, setTo] = useState(dayjs().format('YYYY-MM-DD'));

  const { data: revenue } = useQuery({
    queryKey: ['reports', 'revenue', from, to],
    queryFn: () => api.get(`/reports/revenue?from=${from}&to=${to}&groupBy=day`).then(r => r.data.data),
  });

  const { data: breakdown } = useQuery({
    queryKey: ['reports', 'breakdown', from, to],
    queryFn: () => api.get(`/reports/revenue/breakdown?from=${from}&to=${to}`).then(r => r.data.data),
  });

  const { data: utilization } = useQuery({
    queryKey: ['reports', 'utilization', from, to],
    queryFn: () => api.get(`/reports/tables/utilization?from=${from}&to=${to}`).then(r => r.data.data),
  });

  const { data: topSelling } = useQuery({
    queryKey: ['reports', 'topSelling', from, to],
    queryFn: () => api.get(`/reports/menu/top-selling?from=${from}&to=${to}`).then(r => r.data.data),
  });

  const pieData = breakdown ? [
    { name: 'Bàn bida', value: breakdown.tableRevenue },
    { name: 'F&B', value: breakdown.fbRevenue },
  ].filter(d => d.value > 0) : [];

  const summaryCards = [
    {
      label: 'Tổng doanh thu',
      value: formatCurrency(revenue?.totalRevenue || 0),
      icon: DollarSign,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      borderColor: 'border-emerald-200',
    },
    {
      label: 'Doanh thu bàn',
      value: formatCurrency(breakdown?.tableRevenue || 0),
      icon: Table2,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-500',
      borderColor: 'border-sky-200',
    },
    {
      label: 'Doanh thu F&B',
      value: formatCurrency(breakdown?.fbRevenue || 0),
      icon: UtensilsCrossed,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      borderColor: 'border-amber-200',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Báo cáo</h1>
          <p className="text-slate-500">Phân tích doanh thu và hoạt động</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Từ ngày</label>
            <input
              type="date"
              value={from}
              onChange={e => setFrom(e.target.value)}
              className="block w-40 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-500">Đến ngày</label>
            <input
              type="date"
              value={to}
              onChange={e => setTo(e.target.value)}
              className="block w-40 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((s) => (
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
            <div className="text-2xl font-bold text-slate-800">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Doanh thu theo ngày</h2>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenue?.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={v => `${(v / 1000)}k`} />
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v))}
                  contentStyle={tooltipStyle}
                />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue breakdown pie */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Cơ cấu doanh thu</h2>
          </div>
          <div className="p-5">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 text-center py-12">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Table utilization */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Tỷ lệ sử dụng bàn</h2>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={utilization || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="tableName" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="utilization" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top selling */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Món bán chạy</h2>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSelling || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" fontSize={12} stroke="#94a3b8" />
                <YAxis type="category" dataKey="name" fontSize={12} stroke="#94a3b8" width={100} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="totalQuantity" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
