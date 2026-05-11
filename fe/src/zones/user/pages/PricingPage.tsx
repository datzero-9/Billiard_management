import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock3, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { TABLE_TYPE_LABELS } from '@/lib/constants';
import type { PricingRule } from '@/types';

const DAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

export default function PricingPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    tableType: 'POOL',
    dayOfWeek: '',
    startHour: '18',
    endHour: '23',
    rateMultiplier: '1.2',
    name: '',
  });

  const { data: rules, isLoading } = useQuery({
    queryKey: ['pricing'],
    queryFn: () => api.get('/pricing').then((response) => response.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/pricing', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      setShowForm(false);
      setForm({ tableType: 'POOL', dayOfWeek: '', startHour: '18', endHour: '23', rateMultiplier: '1.2', name: '' });
      toast.success('Đã thêm quy tắc giá');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Không thể lưu quy tắc giá'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/pricing/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
      toast.success('Đã xóa quy tắc giá');
    },
  });

  const saveRule = () => {
    createMutation.mutate({
      ...form,
      dayOfWeek: form.dayOfWeek ? Number(form.dayOfWeek) : null,
      startHour: Number(form.startHour),
      endHour: Number(form.endHour),
      rateMultiplier: Number(form.rateMultiplier),
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Cài đặt giá</h1>
          <p className="mt-1 text-sm text-slate-500">Thiết lập giá theo loại bàn, khung giờ cao điểm và ngày trong tuần.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex h-10 items-center gap-2 rounded-md bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" />
          Thêm quy tắc
        </button>
      </div>

      <section className="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
            <Clock3 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Bảng giá theo giờ</h2>
            <p className="text-xs text-slate-500">Hệ số sẽ nhân với giá gốc của từng bàn.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Tên</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Loại bàn</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Ngày</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Khung giờ</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">Hệ số</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              ) : rules?.length ? (
                rules.map((rule: PricingRule) => (
                  <tr key={rule.id} className="border-b border-slate-100 transition hover:bg-sky-50/45">
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-900">{rule.name || 'Giá đặc biệt'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{TABLE_TYPE_LABELS[rule.tableType]}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {rule.dayOfWeek != null ? DAYS[rule.dayOfWeek] : 'Mọi ngày'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {rule.startHour}:00 - {rule.endHour}:00
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-md border border-sky-100 bg-sky-50 px-2.5 py-1 font-mono text-xs font-bold text-sky-700">
                        x{Number(rule.rateMultiplier).toFixed(1)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(rule.id)}
                        className="rounded-md p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
                        aria-label="Xóa quy tắc"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">
                    Chưa có quy tắc giá nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/35" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Thêm quy tắc giá</h2>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Tên quy tắc</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Giờ cao điểm tối"
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">Loại bàn</span>
                  <select
                    value={form.tableType}
                    onChange={(event) => setForm((current) => ({ ...current, tableType: event.target.value }))}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  >
                    {Object.entries(TABLE_TYPE_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">Ngày</span>
                  <select
                    value={form.dayOfWeek}
                    onChange={(event) => setForm((current) => ({ ...current, dayOfWeek: event.target.value }))}
                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  >
                    <option value="">Mọi ngày</option>
                    {DAYS.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">Bắt đầu</span>
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={form.startHour}
                    onChange={(event) => setForm((current) => ({ ...current, startHour: event.target.value }))}
                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">Kết thúc</span>
                  <input
                    type="number"
                    min={1}
                    max={24}
                    value={form.endHour}
                    onChange={(event) => setForm((current) => ({ ...current, endHour: event.target.value }))}
                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">Hệ số</span>
                  <input
                    type="number"
                    step="0.1"
                    value={form.rateMultiplier}
                    onChange={(event) => setForm((current) => ({ ...current, rateMultiplier: event.target.value }))}
                    className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
              </div>
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
                onClick={saveRule}
                disabled={createMutation.isPending}
                className="rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-60"
              >
                {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
