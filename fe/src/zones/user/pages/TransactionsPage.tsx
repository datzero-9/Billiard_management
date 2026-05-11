import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { CreditCard, ReceiptText, Search, Table2, WalletCards } from 'lucide-react';
import api from '@/lib/api';
import { formatCurrency, formatDuration, PAYMENT_METHODS, TABLE_TYPE_LABELS } from '@/lib/constants';
import type { Session } from '@/types';

const PRESETS = [
  { label: 'Hôm nay', value: 'today' },
  { label: '7 ngày qua', value: 'week' },
  { label: 'Tháng này', value: 'month' },
  { label: 'Tùy chọn', value: 'custom' },
] as const;

function getPresetRange(preset: string) {
  const now = dayjs();
  if (preset === 'today') return { from: now.startOf('day'), to: now.endOf('day') };
  if (preset === 'week') return { from: now.subtract(6, 'day').startOf('day'), to: now.endOf('day') };
  return { from: now.startOf('month'), to: now.endOf('day') };
}

function getSessionSeconds(session: Session) {
  if (!session.endTime) return 0;
  const diff = dayjs(session.endTime).diff(dayjs(session.startTime), 'second');
  return Math.max(0, diff - (session.pausedDuration || 0));
}

export default function TransactionsPage() {
  const [preset, setPreset] = useState<(typeof PRESETS)[number]['value']>('week');
  const range = getPresetRange(preset);
  const [from, setFrom] = useState(range.from.format('YYYY-MM-DD'));
  const [to, setTo] = useState(range.to.format('YYYY-MM-DD'));
  const [search, setSearch] = useState('');

  const effectiveFrom = preset === 'custom' ? from : range.from.format('YYYY-MM-DD');
  const effectiveTo = preset === 'custom' ? to : range.to.format('YYYY-MM-DD');

  const { data, isLoading } = useQuery({
    queryKey: ['sessions', 'transactions', effectiveFrom, effectiveTo],
    queryFn: () =>
      api
        .get(`/sessions?status=COMPLETED&from=${effectiveFrom}&to=${effectiveTo}&limit=100`)
        .then((response) => response.data.data),
  });

  const sessions: Session[] = data?.sessions || [];
  const filteredSessions = useMemo(
    () =>
      sessions.filter((session) => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return true;
        return [
          session.table?.name,
          session.user?.name,
          session.paymentMethod ? PAYMENT_METHODS[session.paymentMethod] : '',
          session.id,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(keyword));
      }),
    [search, sessions],
  );

  const totalRevenue = filteredSessions.reduce((sum, session) => sum + Number(session.totalAmount || 0), 0);
  const bankTransferTotal = filteredSessions
    .filter((session) => session.paymentMethod === 'BANK_TRANSFER')
    .reduce((sum, session) => sum + Number(session.totalAmount || 0), 0);
  const totalHours = filteredSessions.reduce((sum, session) => sum + getSessionSeconds(session) / 3600, 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Lịch sử giao dịch</h1>
          <p className="mt-1 text-sm text-slate-500">Tra cứu các phiên đã thanh toán theo bàn, ngày và phương thức.</p>
        </div>
        <div className="flex rounded-md border border-slate-200 bg-white p-1 shadow-sm">
          {PRESETS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setPreset(item.value)}
              className={`h-8 rounded px-3 text-xs font-semibold transition ${
                preset === item.value ? 'bg-sky-50 text-sky-700' : 'text-slate-500 hover:text-sky-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {preset === 'custom' && (
        <div className="flex flex-wrap gap-3 rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Từ ngày</span>
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-slate-500">Đến ngày</span>
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Tổng doanh thu', value: formatCurrency(totalRevenue), icon: ReceiptText, color: 'text-sky-700', bg: 'bg-sky-50' },
          { label: 'Chuyển khoản', value: formatCurrency(bankTransferTotal), icon: WalletCards, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          { label: 'Tổng giờ chơi', value: `${totalHours.toFixed(1)}h`, icon: Table2, color: 'text-amber-700', bg: 'bg-amber-50' },
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

      <section className="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Danh sách giao dịch</h2>
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm bàn, nhân viên..."
              className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Bàn</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Giờ bắt đầu</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Giờ kết thúc</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Thời lượng</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Thanh toán</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Tổng cộng</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    Chưa có giao dịch trong khoảng thời gian này.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} className="border-b border-slate-100 transition hover:bg-sky-50/45">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-bold text-slate-900">{session.table?.name || '---'}</p>
                      <p className="text-xs text-slate-400">{session.table?.type ? TABLE_TYPE_LABELS[session.table.type] : '---'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {dayjs(session.startTime).format('HH:mm DD/MM/YYYY')}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {session.endTime ? dayjs(session.endTime).format('HH:mm DD/MM/YYYY') : '---'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono text-slate-700">{formatDuration(getSessionSeconds(session))}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                        <CreditCard className="h-3.5 w-3.5" />
                        {session.paymentMethod ? PAYMENT_METHODS[session.paymentMethod] : '---'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm font-bold text-slate-950">
                      {formatCurrency(session.totalAmount || 0)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
