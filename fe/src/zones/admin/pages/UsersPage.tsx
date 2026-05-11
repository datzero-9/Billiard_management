import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { CalendarPlus, MessageSquareText, Plus, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/constants';
import {
  loadStores,
  saveStores,
  type StoreAccount,
  type StoreStatus,
} from '../data/portal';

const STATUS_CONFIG: Record<StoreStatus, { label: string; className: string }> = {
  ACTIVE: { label: 'Đang hoạt động', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  EXPIRING: { label: 'Sắp đến hạn', className: 'border-amber-200 bg-amber-50 text-amber-700' },
  OVERDUE: { label: 'Quá hạn', className: 'border-rose-200 bg-rose-50 text-rose-700' },
  TRIAL: { label: 'Dùng thử', className: 'border-sky-200 bg-sky-50 text-sky-700' },
};

const PLAN_FEES: Record<StoreAccount['plan'], number> = {
  Starter: 590000,
  Business: 990000,
  Premium: 1490000,
};

const initialForm = {
  storeName: '',
  ownerName: '',
  email: '',
  phone: '',
  plan: 'Business' as StoreAccount['plan'],
  tables: '10',
  password: '',
};

export default function UsersPage() {
  const [stores, setStores] = useState<StoreAccount[]>(() => loadStores());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StoreStatus>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);

  const filteredStores = useMemo(
    () =>
      stores.filter((store) => {
        const keyword = search.trim().toLowerCase();
        const matchSearch =
          !keyword ||
          [store.storeName, store.ownerName, store.email, store.phone]
            .some((value) => value.toLowerCase().includes(keyword));
        const matchStatus = statusFilter === 'ALL' || store.status === statusFilter;
        return matchSearch && matchStatus;
      }),
    [search, statusFilter, stores],
  );

  const persistStores = (nextStores: StoreAccount[]) => {
    setStores(nextStores);
    saveStores(nextStores);
  };

  const createStore = () => {
    if (!form.storeName || !form.ownerName || !form.email) {
      toast.error('Vui lòng nhập tên cửa hàng, chủ tài khoản và email');
      return;
    }

    const newStore: StoreAccount = {
      id: `store-${Date.now()}`,
      storeName: form.storeName,
      ownerName: form.ownerName,
      email: form.email,
      phone: form.phone,
      plan: form.plan,
      tables: Number(form.tables) || 0,
      monthlyFee: PLAN_FEES[form.plan],
      startedAt: dayjs().format('YYYY-MM-DD'),
      expiresAt: dayjs().add(30, 'day').format('YYYY-MM-DD'),
      status: 'TRIAL',
      lastPaymentAt: dayjs().format('YYYY-MM-DD'),
    };

    persistStores([newStore, ...stores]);
    setForm(initialForm);
    setShowForm(false);
    toast.success('Đã cấp tài khoản cửa hàng');
  };

  const renewStore = (storeId: string, months = 1) => {
    const nextStores = stores.map((store) => {
      if (store.id !== storeId) return store;
      const baseDate = dayjs(store.expiresAt).isAfter(dayjs()) ? dayjs(store.expiresAt) : dayjs();
      return {
        ...store,
        expiresAt: baseDate.add(months, 'month').format('YYYY-MM-DD'),
        status: 'ACTIVE' as StoreStatus,
        lastPaymentAt: dayjs().format('YYYY-MM-DD'),
      };
    });
    persistStores(nextStores);
    toast.success(`Đã gia hạn ${months} tháng`);
  };

  const deactivateStore = (storeId: string) => {
    persistStores(stores.filter((store) => store.id !== storeId));
    toast.success('Đã xoá tài khoản khỏi danh sách demo');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Tài khoản cửa hàng</h1>
          <p className="mt-1 text-sm text-slate-500">Cấp tài khoản user, quản lý gói dịch vụ và gia hạn cho từng cửa hàng.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex h-10 items-center gap-2 rounded-md bg-sky-700 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-800"
        >
          <Plus className="h-4 w-4" />
          Cấp tài khoản
        </button>
      </div>

      <section className="rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm cửa hàng, chủ tài khoản..."
              className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'ACTIVE', 'EXPIRING', 'OVERDUE', 'TRIAL'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`h-9 rounded-md border px-3 text-xs font-bold transition ${
                  statusFilter === status ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                {status === 'ALL' ? 'Tất cả' : STATUS_CONFIG[status].label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Cửa hàng</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Tài khoản</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Gói</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Hạn dùng</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Trạng thái</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((store) => (
                <tr key={store.id} className="border-b border-slate-100 transition hover:bg-sky-50/45">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-900">{store.storeName}</p>
                    <p className="mt-1 text-xs text-slate-400">{store.tables} bàn cấu hình</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-700">{store.ownerName}</p>
                    <p className="mt-1 text-xs text-slate-400">{store.email}</p>
                    <p className="text-xs text-slate-400">{store.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-slate-900">{store.plan}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatCurrency(store.monthlyFee)}/tháng</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-700">{dayjs(store.expiresAt).format('DD/MM/YYYY')}</p>
                    <p className="mt-1 text-xs text-slate-400">Thanh toán: {dayjs(store.lastPaymentAt).format('DD/MM/YYYY')}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-bold ${STATUS_CONFIG[store.status].className}`}>
                      {STATUS_CONFIG[store.status].label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => renewStore(store.id, 1)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <CalendarPlus className="h-3.5 w-3.5" />
                        Gia hạn
                      </button>
                      <button
                        type="button"
                        onClick={() => toast.info(`Mở trang Thông báo để chat với ${store.storeName}`)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-sky-200 bg-sky-50 px-3 text-xs font-bold text-sky-700 transition hover:bg-sky-100"
                      >
                        <MessageSquareText className="h-3.5 w-3.5" />
                        Chat
                      </button>
                      <button
                        type="button"
                        onClick={() => deactivateStore(store.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                        aria-label="Xóa tài khoản"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/35" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Cấp tài khoản cửa hàng</h2>
                  <p className="text-xs text-slate-500">Tài khoản mới sẽ bắt đầu ở trạng thái dùng thử 30 ngày.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Tên cửa hàng</span>
                <input
                  value={form.storeName}
                  onChange={(event) => setForm((current) => ({ ...current, storeName: event.target.value }))}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  placeholder="VD: Bida 79 Arena"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Chủ tài khoản</span>
                <input
                  value={form.ownerName}
                  onChange={(event) => setForm((current) => ({ ...current, ownerName: event.target.value }))}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  placeholder="Nguyễn Văn A"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Email đăng nhập</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  placeholder="owner@bida.vn"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Số điện thoại</span>
                <input
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  placeholder="090..."
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Gói dịch vụ</span>
                <select
                  value={form.plan}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, plan: event.target.value as StoreAccount['plan'] }))
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                >
                  <option value="Starter">Starter - {formatCurrency(PLAN_FEES.Starter)}</option>
                  <option value="Business">Business - {formatCurrency(PLAN_FEES.Business)}</option>
                  <option value="Premium">Premium - {formatCurrency(PLAN_FEES.Premium)}</option>
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Số bàn dự kiến</span>
                <input
                  type="number"
                  min={1}
                  value={form.tables}
                  onChange={(event) => setForm((current) => ({ ...current, tables: event.target.value }))}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </label>
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Mật khẩu khởi tạo</span>
                <input
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  placeholder="Có thể gửi riêng cho chủ cửa hàng"
                />
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={createStore}
                className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800"
              >
                Tạo tài khoản
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
