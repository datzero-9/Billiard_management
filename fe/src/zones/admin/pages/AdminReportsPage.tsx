import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Building2, CalendarClock, WalletCards } from 'lucide-react';
import { formatCurrency } from '@/lib/constants';
import { loadStores } from '../data/portal';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b'];

export default function AdminReportsPage() {
  const [stores] = useState(() => loadStores());
  const monthlyRevenue = stores.reduce((sum, store) => sum + store.monthlyFee, 0);
  const paidThisMonth = stores.filter((store) => dayjs(store.lastPaymentAt).isSame(dayjs(), 'month')).length;
  const expiringThisMonth = stores.filter((store) => dayjs(store.expiresAt).isSame(dayjs(), 'month')).length;

  const revenueData = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, index) => {
        const month = dayjs().subtract(5 - index, 'month');
        const modifier = 0.76 + index * 0.06;
        return {
          month: month.format('MM/YYYY'),
          revenue: Math.round(monthlyRevenue * modifier),
        };
      }),
    [monthlyRevenue],
  );

  const planData = Object.entries(
    stores.reduce<Record<string, number>>((result, store) => {
      result[store.plan] = (result[store.plan] || 0) + 1;
      return result;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Doanh thu hệ thống</h1>
        <p className="mt-1 text-sm text-slate-500">Theo dõi doanh thu SaaS từ các cửa hàng thuê ứng dụng.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'MRR hiện tại', value: formatCurrency(monthlyRevenue), icon: WalletCards, color: 'text-sky-700', bg: 'bg-sky-50' },
          { label: 'Đã thanh toán tháng này', value: paidThisMonth, icon: Building2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Hết hạn trong tháng', value: expiringThisMonth, icon: CalendarClock, color: 'text-amber-700', bg: 'bg-amber-50' },
        ].map((card) => (
          <section key={card.label} className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-500">{card.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-md ${card.bg} ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-950">{card.value}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-lg border border-sky-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-900">Doanh thu 6 tháng</h2>
          </div>
          <div className="h-[320px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" fontSize={12} stroke="#94a3b8" />
                <YAxis fontSize={12} stroke="#94a3b8" tickFormatter={(value) => `${Number(value) / 1000000}tr`} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-sky-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-900">Cơ cấu gói</h2>
          </div>
          <div className="h-[320px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={planData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {planData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-[-20px] space-y-2">
              {planData.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {item.name}
                  </span>
                  <span className="font-bold text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
