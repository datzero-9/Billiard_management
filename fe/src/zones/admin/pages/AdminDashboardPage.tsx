import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Building2, CalendarClock, MessageSquareText, ShieldCheck, WalletCards } from 'lucide-react';
import { formatCurrency } from '@/lib/constants';
import { loadMessages, loadStores, type StoreStatus } from '../data/portal';

const STATUS_CONFIG: Record<StoreStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Đang hoạt động', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  EXPIRING: { label: 'Sắp đến hạn', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  OVERDUE: { label: 'Quá hạn', className: 'border-rose-200 bg-rose-50 text-rose-700' },
  TRIAL: { label: 'Dùng thử', className: 'border-sky-200 bg-sky-50 text-sky-700' },
};

export default function AdminDashboardPage() {
  const [stores] = useState(() => loadStores());
  const [messages] = useState(() => loadMessages());

  const monthlyRecurringRevenue = stores.reduce((sum, store) => sum + store.monthlyFee, 0);
  const activeStores = stores.filter((store) => store.status === 'ACTIVE' || store.status === 'TRIAL').length;
  const expiringStores = stores.filter((store) => store.status === 'EXPIRING').length;
  const overdueStores = stores.filter((store) => store.status === 'OVERDUE').length;

  const nextRenewals = useMemo(
    () => [...stores].sort((a, b) => dayjs(a.expiresAt).valueOf() - dayjs(b.expiresAt).valueOf()).slice(0, 4),
    [stores],
  );

  const stats = [
    {
      label: 'Cửa hàng đang dùng',
      value: activeStores,
      sub: `${stores.length} tài khoản trong hệ thống`,
      icon: Building2,
      iconBg: 'bg-sky-50',
      iconColor: 'text-sky-700',
    },
    {
      label: 'Doanh thu định kỳ',
      value: formatCurrency(monthlyRecurringRevenue),
      sub: 'ước tính theo tháng',
      icon: WalletCards,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-700',
    },
    {
      label: 'Sắp đến hạn',
      value: expiringStores,
      sub: 'cần nhắc thanh toán',
      icon: CalendarClock,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-700',
    },
    {
      label: 'Quá hạn',
      value: overdueStores,
      sub: 'cần xử lý dịch vụ',
      icon: ShieldCheck,
      iconBg: 'bg-rose-50',
      iconColor: 'text-rose-700',
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Super Portal</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý tài khoản cửa hàng, gia hạn dịch vụ và thông báo hệ thống.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <section key={item.label} className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-slate-500">{item.label}</p>
              <div className={`flex h-9 w-9 items-center justify-center rounded-md ${item.iconBg} ${item.iconColor}`}>
                <item.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-950">{item.value}</p>
            <p className="mt-1 text-xs text-slate-400">{item.sub}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-base font-bold text-slate-900">Lịch gia hạn gần nhất</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Cửa hàng</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Gói</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Hết hạn</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Phí tháng</th>
                </tr>
              </thead>
              <tbody>
                {nextRenewals.map((store) => (
                  <tr key={store.id} className="border-b border-slate-100 transition hover:bg-sky-50/45">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-bold text-slate-900">{store.storeName}</p>
                      <p className="text-xs text-slate-400">{store.ownerName}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-slate-600">{store.plan}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{dayjs(store.expiresAt).format('DD/MM/YYYY')}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${STATUS_CONFIG[store.status].className}`}>
                        {STATUS_CONFIG[store.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm font-bold text-slate-900">{formatCurrency(store.monthlyFee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-lg border border-sky-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
              <MessageSquareText className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Thông báo gần đây</h2>
          </div>
          <div className="space-y-3 p-5">
            {messages.slice(0, 4).map((message) => {
              const store = stores.find((item) => item.id === message.storeId);
              return (
                <article key={message.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">{message.title}</p>
                    <span className="text-[11px] font-semibold text-slate-400">{dayjs(message.sentAt).format('DD/MM')}</span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-sky-700">{store?.storeName || 'Tất cả cửa hàng'}</p>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{message.content}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
