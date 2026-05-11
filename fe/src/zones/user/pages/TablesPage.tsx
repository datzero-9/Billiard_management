import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { TABLE_STATUS_CONFIG, TABLE_TYPE_LABELS, formatCurrency, formatDuration } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';
import { useTimer } from '@/hooks/useTimer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Table2, Tag, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import type { Table } from '@/types';

function TableCard({ table }: { table: Table }) {
  const navigate = useNavigate();
  const session = table.sessions?.[0];
  const config = TABLE_STATUS_CONFIG[table.status];
  const elapsed = useTimer(
    session?.startTime || null,
    session?.pausedDuration || 0,
    session?.lastPausedAt || null
  );

  return (
    <Card
      className={`p-4 border-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md ${config.color}`}
      onClick={() => navigate(`/tables/${table.id}`)}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-800">{table.name}</h3>
        <Badge variant="outline" className="text-xs">{TABLE_TYPE_LABELS[table.type]}</Badge>
      </div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-2 w-2 rounded-full ${config.dot}`} />
        <span className="text-xs text-slate-600">{config.label}</span>
      </div>
      <p className="text-sm text-slate-500">{formatCurrency(table.hourlyRate)}/giờ</p>
      {session && (
        <div className="mt-3 pt-3 border-t border-slate-200/60">
          <p className="text-lg font-mono font-bold text-slate-800">{formatDuration(elapsed)}</p>
          <p className="text-xs text-slate-500">
            ~ {formatCurrency((elapsed / 3600) * Number(table.hourlyRate))}
          </p>
        </div>
      )}
    </Card>
  );
}

export default function TablesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', type: 'POOL', hourlyRate: '' });

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: () => api.get('/tables').then(r => r.data.data),
    refetchInterval: 5000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/tables', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      setShowForm(false);
      setFormData({ name: '', type: 'POOL', hourlyRate: '' });
      toast.success('Tạo bàn thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  const canManage = user && ['ADMIN', 'MANAGER'].includes(user.role);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bàn Bida</h1>
          <p className="text-slate-500">Quản lý và theo dõi trạng thái bàn</p>
        </div>
        {canManage && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm bàn
          </Button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        {Object.entries(TABLE_STATUS_CONFIG).map(([key, cfg]) => {
          const count = tables?.filter((t: Table) => t.status === key).length || 0;
          return (
            <div key={key} className="flex items-center gap-2 text-sm">
              <div className={`h-3 w-3 rounded-full ${cfg.dot}`} />
              <span className="text-slate-500">{cfg.label}: {count}</span>
            </div>
          );
        })}
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables?.map((table: Table) => <TableCard key={table.id} table={table} />)}
        </div>
      )}

      {/* Modal thêm bàn */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-slate-300/50 border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-100 flex items-center justify-center">
                  <Plus className="h-4 w-4 text-sky-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Thêm bàn mới</h2>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">Tên bàn</Label>
                <div className="relative">
                  <Table2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    placeholder="VD: Bàn 11"
                    className="pl-10 h-11 bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">Loại bàn</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                  <select
                    value={formData.type}
                    onChange={e => setFormData(f => ({ ...f, type: e.target.value }))}
                    className="w-full pl-10 h-11 bg-white border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 text-sm appearance-none"
                  >
                    <option value="POOL">Pool</option>
                    <option value="SNOOKER">Snooker</option>
                    <option value="CAROM">Carom</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">Giá/giờ (VND)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={e => setFormData(f => ({ ...f, hourlyRate: e.target.value }))}
                    placeholder="VD: 50000"
                    className="pl-10 h-11 bg-white border-slate-200 text-slate-700 placeholder:text-slate-400 rounded-xl focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </Button>
              <Button
                onClick={() => createMutation.mutate({ ...formData, hourlyRate: Number(formData.hourlyRate) })}
                disabled={createMutation.isPending}
                className="rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm"
              >
                {createMutation.isPending ? 'Đang tạo...' : 'Tạo bàn'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
