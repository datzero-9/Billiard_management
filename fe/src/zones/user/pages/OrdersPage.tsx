import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ORDER_STATUS_CONFIG, formatCurrency } from '@/lib/constants';
import { Clock, PackageOpen } from 'lucide-react';
import { toast } from 'sonner';
import type { Order } from '@/types';

const STATUS_FLOW: Record<string, string> = {
  PENDING: 'PREPARING',
  PREPARING: 'SERVED',
};

const COLUMN_STYLES: Record<string, { badge: string; button: string; icon: string }> = {
  PENDING: {
    badge: 'bg-amber-50 text-amber-600 border border-amber-200',
    button: 'bg-amber-500 hover:bg-amber-600 text-white',
    icon: 'bg-amber-50 text-amber-500',
  },
  PREPARING: {
    badge: 'bg-sky-50 text-sky-600 border border-sky-200',
    button: 'bg-sky-500 hover:bg-sky-600 text-white',
    icon: 'bg-sky-50 text-sky-500',
  },
};

export default function OrdersPage() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: () => api.get('/orders/active').then(r => r.data.data),
    refetchInterval: 5000,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => api.patch(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Cập nhật trạng thái');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  const columns = ['PENDING', 'PREPARING'] as const;

  if (isLoading) return <div className="p-6 text-slate-400">Đang tải...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Đơn hàng</h1>
        <p className="text-slate-500">Quản lý đơn hàng bếp/bar</p>
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {columns.map(status => {
          const statusOrders = orders?.filter((o: Order) => o.status === status) || [];
          const config = ORDER_STATUS_CONFIG[status];
          const colStyle = COLUMN_STYLES[status];
          return (
            <div key={status}>
              {/* Column header */}
              <div className="flex items-center gap-2.5 mb-4">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-lg ${colStyle.badge}`}>
                  {config.label}
                </span>
                <span className="text-sm text-slate-400">({statusOrders.length})</span>
              </div>

              {/* Order cards */}
              <div className="space-y-3">
                {statusOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <PackageOpen className="h-10 w-10 mb-3 text-slate-300" />
                    <p className="text-sm">Không có đơn</p>
                  </div>
                ) : (
                  statusOrders.map((order: Order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {/* Card header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <span className="text-sm font-semibold text-slate-800">
                          {order.session?.table?.name || 'Bàn'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleTimeString('vi-VN')}
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="px-4 py-3 space-y-1.5">
                        {order.items.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-slate-600">
                              {item.menuItem?.name} <span className="text-slate-400">x{item.quantity}</span>
                            </span>
                            <span className="text-slate-400">{formatCurrency(Number(item.unitPrice) * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Card footer */}
                      <div className="flex justify-between items-center px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                        <span className="font-semibold text-slate-800">{formatCurrency(order.totalAmount)}</span>
                        {STATUS_FLOW[status] && (
                          <button
                            onClick={() => updateMutation.mutate({ id: order.id, status: STATUS_FLOW[status] })}
                            disabled={updateMutation.isPending}
                            className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-colors disabled:opacity-50 ${colStyle.button}`}
                          >
                            {status === 'PENDING' ? 'Bắt đầu làm' : 'Đã phục vụ'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
