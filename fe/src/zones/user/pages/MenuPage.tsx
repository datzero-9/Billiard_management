import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { MENU_CATEGORIES, formatCurrency } from '@/lib/constants';
import { Plus, Pencil, Trash2, X, UtensilsCrossed, Tag, DollarSign, FileText, Search, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import type { MenuItem } from '@/types';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  BEVERAGE: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-200' },
  FOOD: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  SNACK: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  OTHER: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

export default function MenuPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', category: 'BEVERAGE', price: '', description: '', imageUrl: '' });

  const { data: items, isLoading } = useQuery({
    queryKey: ['menu', 'all'],
    queryFn: () => api.get('/menu?available=all').then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing
      ? api.put(`/menu/${editing.id}`, data)
      : api.post('/menu', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      setShowForm(false);
      setEditing(null);
      toast.success(editing ? 'Cập nhật thành công' : 'Thêm món thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/menu/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toast.success('Đã xóa');
    },
  });

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      price: String(item.price),
      description: item.description || '',
      imageUrl: item.imageUrl || '',
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', category: 'BEVERAGE', price: '', description: '', imageUrl: '' });
    setShowForm(true);
  };

  const filteredItems =
    items?.filter((item: MenuItem) => {
      const matchFilter = filter === 'ALL' || item.category === filter;
      const keyword = search.trim().toLowerCase();
      const matchSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword);
      return matchFilter && matchSearch;
    }) || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Thực đơn F&amp;B</h1>
          <p className="text-sm text-slate-500">Quản lý danh mục món ăn và đồ uống.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm thực đơn..."
              className="h-10 w-[260px] rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <button
            onClick={openNew}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
          >
            <Plus className="h-4 w-4" />
            Thêm món mới
          </button>
        </div>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('ALL')}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
            filter === 'ALL'
              ? 'bg-sky-500 text-white border-sky-500'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Tất cả
        </button>
        {Object.entries(MENU_CATEGORIES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              filter === key
                ? 'bg-sky-500 text-white border-sky-500'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Menu items grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item: MenuItem) => {
            const catColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.OTHER;
            return (
              <div
                key={item.id}
                className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md ${
                  !item.isAvailable ? 'opacity-50' : ''
                }`}
              >
                <div className="relative h-36 bg-slate-100">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#e0f7ff,#f8fafc)] text-sky-500">
                      <ImageIcon className="h-9 w-9" />
                    </div>
                  )}
                  <span
                    className={`absolute right-3 top-3 inline-flex items-center rounded-md border bg-white/90 px-2 py-1 text-[11px] font-bold backdrop-blur ${catColor.text} ${catColor.border}`}
                  >
                    {MENU_CATEGORIES[item.category]}
                  </span>
                  {!item.isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/45">
                      <span className="rounded bg-rose-500 px-3 py-1 text-xs font-bold uppercase text-white">Hết hàng</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 font-bold text-slate-900">{item.name}</h3>
                      {item.description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>
                      )}
                    </div>
                    <p className="whitespace-nowrap text-sm font-bold text-sky-700">{formatCurrency(item.price)}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${item.isAvailable ? 'text-emerald-600' : 'text-rose-500'}`}>
                      <span className={`h-2 w-2 rounded-full ${item.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {item.isAvailable ? 'Sẵn sàng' : 'Hết hàng'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-semibold text-sky-700 transition hover:bg-sky-50"
                      >
                        <Pencil className="h-3 w-3" />
                        Sửa nhanh
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-400 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500"
                        aria-label="Xóa món"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl shadow-slate-300/50 border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-sky-50 flex items-center justify-center">
                  <UtensilsCrossed className="h-4 w-4 text-sky-500" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editing ? 'Sửa món' : 'Thêm món mới'}
                </h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Tên món</label>
                <div className="relative">
                  <UtensilsCrossed className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="VD: Cà phê đen"
                    className="w-full pl-10 h-11 bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Danh mục</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full pl-10 h-11 bg-white border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 text-sm appearance-none"
                  >
                    {Object.entries(MENU_CATEGORIES).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Giá (VND)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="VD: 25000"
                    className="w-full pl-10 h-11 bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Mô tả</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Mô tả ngắn (tuỳ chọn)"
                    className="w-full pl-10 h-11 bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 outline-none transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Ảnh món</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={form.imageUrl}
                    onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                    placeholder="Dán URL ảnh (tuỳ chọn)"
                    className="w-full pl-10 h-11 bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => saveMutation.mutate({ ...form, price: Number(form.price) })}
                disabled={saveMutation.isPending}
                className="px-4 py-2.5 text-sm font-medium rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
