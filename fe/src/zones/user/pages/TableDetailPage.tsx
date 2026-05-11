import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { TABLE_STATUS_CONFIG, TABLE_TYPE_LABELS, formatCurrency, formatDuration, PAYMENT_METHODS, MENU_CATEGORIES } from '@/lib/constants';
import { useTimer } from '@/hooks/useTimer';
import { ArrowLeft, Play, Pause, Square, ShoppingCart, Plus, Minus, X, Clock, Receipt, CreditCard, Printer, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MenuItem, Order } from '@/types';
import { BankQrPreview, getStoredPaymentQrConfig } from '@/components/payment/BankQrPreview';

// === Print helper ===
function printInvoice(data: any, isTemp: boolean) {
  const win = window.open('', '_blank', 'width=400,height=600');
  if (!win) return;
  const orders = data.orders || [];
  const allItems = orders.flatMap((o: any) => o.items || []);
  const tableCost = data.billing?.tableCost || data._tempTableCost || '0';
  const fbTotal = data.billing?.fbTotal || data._tempFbTotal || '0';
  const totalAmount = data.billing?.totalAmount || data._tempTotal || '0';
  const playTime = data.billing?.playDurationSeconds || data._tempPlaySeconds || 0;

  win.document.write(`<html><head><title>${isTemp ? 'Hóa đơn tạm' : 'Hóa đơn'} - ${data.table?.name}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Courier New',monospace;padding:20px;max-width:380px;margin:0 auto;font-size:13px;color:#1e293b}
    .header{text-align:center;border-bottom:1px dashed #cbd5e1;padding-bottom:12px;margin-bottom:12px}
    .header h1{font-size:18px;font-weight:bold}
    .header p{font-size:11px;color:#64748b;margin-top:4px}
    .temp-tag{display:inline-block;background:#fef3c7;color:#92400e;font-size:10px;padding:2px 8px;border-radius:4px;margin-top:6px;font-weight:bold}
    .row{display:flex;justify-content:space-between;padding:3px 0}
    .row .label{color:#64748b}
    .row .value{font-weight:500}
    .divider{border-top:1px dashed #cbd5e1;margin:10px 0}
    .divider-bold{border-top:2px solid #1e293b;margin:10px 0}
    .section-title{font-size:11px;font-weight:bold;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin:8px 0 4px}
    .total{font-size:16px;font-weight:bold}
    .footer{text-align:center;border-top:1px dashed #cbd5e1;padding-top:12px;margin-top:12px;font-size:11px;color:#94a3b8}
    @media print{body{padding:0}}
  </style></head><body>
    <div class="header">
      <h1>BIDA MANAGER</h1>
      <p>Hệ thống quản lý quán bida</p>
      <p>${new Date(data.paidAt || Date.now()).toLocaleString('vi-VN')}</p>
      ${isTemp ? '<div class="temp-tag">HÓA ĐƠN TẠM</div>' : ''}
    </div>
    <div class="row"><span class="label">Bàn</span><span class="value">${data.table?.name} (${TABLE_TYPE_LABELS[data.table?.type]})</span></div>
    <div class="row"><span class="label">Nhân viên</span><span>${data.user?.name || '---'}</span></div>
    ${!isTemp ? `<div class="row"><span class="label">Thanh toán</span><span>${PAYMENT_METHODS[data.paymentMethod] || '---'}</span></div>` : ''}
    <div class="row"><span class="label">Thời gian chơi</span><span>${formatDuration(playTime)}</span></div>
    <div class="divider"></div>
    <div class="row"><span class="label">Tiền bàn (${formatCurrency(data.table?.hourlyRate)}/giờ)</span><span class="value">${formatCurrency(tableCost)}</span></div>
    ${allItems.length > 0 ? `
      <div class="section-title">Đồ ăn & uống</div>
      ${allItems.map((i: any) => `<div class="row"><span>${i.menuItem?.name} x${i.quantity}</span><span>${formatCurrency(Number(i.unitPrice) * i.quantity)}</span></div>`).join('')}
      <div class="divider"></div>
      <div class="row"><span class="label">Cộng F&B</span><span class="value">${formatCurrency(fbTotal)}</span></div>
    ` : ''}
    <div class="divider-bold"></div>
    <div class="row total"><span>TỔNG CỘNG</span><span>${formatCurrency(totalAmount)}</span></div>
    <div class="footer"><p>Cảm ơn quý khách!</p><p>Hẹn gặp lại</p></div>
  </body></html>`);
  win.document.close();
  win.print();
}

export default function TableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrder, setShowOrder] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const bankQrConfig = getStoredPaymentQrConfig();

  const { data: table, isLoading } = useQuery({
    queryKey: ['table', id],
    queryFn: () => api.get(`/tables/${id}`).then(r => r.data.data),
    refetchInterval: 3000,
  });

  const { data: menuItems } = useQuery({
    queryKey: ['menu'],
    queryFn: () => api.get('/menu').then(r => r.data.data),
  });

  const session = table?.sessions?.[0];
  const elapsed = useTimer(
    session?.startTime || null,
    session?.pausedDuration || 0,
    session?.lastPausedAt || null
  );
  const runningCost = session ? (elapsed / 3600) * Number(table.hourlyRate) : 0;
  const fbTotal = session?.orders?.reduce((s: number, o: Order) => s + Number(o.totalAmount), 0) || 0;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['table', id] });
    queryClient.invalidateQueries({ queryKey: ['tables'] });
  };

  const startMutation = useMutation({
    mutationFn: () => api.post('/sessions/start', { tableId: id }),
    onSuccess: () => { invalidate(); toast.success('Bắt đầu phiên'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  const pauseMutation = useMutation({
    mutationFn: () => api.patch(`/sessions/${session?.id}/pause`),
    onSuccess: () => { invalidate(); toast.success('Tạm dừng'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  const resumeMutation = useMutation({
    mutationFn: () => api.patch(`/sessions/${session?.id}/resume`),
    onSuccess: () => { invalidate(); toast.success('Tiếp tục'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  const checkoutMutation = useMutation({
    mutationFn: (data: any) => api.post(`/sessions/${session?.id}/checkout`, data),
    onSuccess: (res) => {
      invalidate();
      setShowCheckout(false);
      setInvoiceData(res.data.data);
      setShowInvoice(true);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  const orderMutation = useMutation({
    mutationFn: (data: any) => api.post('/orders', data),
    onSuccess: () => {
      invalidate();
      setShowOrder(false);
      setCart({});
      setEditingOrderId(null);
      toast.success('Đặt hàng thành công');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  const deleteOrderMutation = useMutation({
    mutationFn: (orderId: string) => api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' }),
    onSuccess: () => { invalidate(); toast.success('Đã hủy đơn hàng'); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Lỗi'),
  });

  const addToCart = (itemId: string) => setCart(c => ({ ...c, [itemId]: (c[itemId] || 0) + 1 }));
  const removeFromCart = (itemId: string) => setCart(c => {
    const n = (c[itemId] || 0) - 1;
    if (n <= 0) { const { [itemId]: _, ...rest } = c; return rest; }
    return { ...c, [itemId]: n };
  });

  const submitOrder = () => {
    if (!session) return;
    const items = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId, quantity }));
    orderMutation.mutate({ sessionId: session.id, items });
  };

  const openEditOrder = (order: Order) => {
    const newCart: Record<string, number> = {};
    order.items.forEach(item => { newCart[item.menuItemId] = item.quantity; });
    setCart(newCart);
    setEditingOrderId(order.id);
    setShowOrder(true);
  };

  const submitEditOrder = () => {
    if (!session || !editingOrderId) return;
    // Cancel old order then create new one
    deleteOrderMutation.mutate(editingOrderId, {
      onSuccess: () => {
        const items = Object.entries(cart).map(([menuItemId, quantity]) => ({ menuItemId, quantity }));
        if (items.length > 0) {
          orderMutation.mutate({ sessionId: session.id, items });
        } else {
          invalidate();
          setShowOrder(false);
          setCart({});
          setEditingOrderId(null);
        }
      },
    });
  };

  const handlePrintTemp = () => {
    if (!session || !table) return;
    printInvoice({
      table,
      user: session.user,
      orders: session.orders,
      _tempTableCost: runningCost.toFixed(2),
      _tempFbTotal: fbTotal.toFixed(2),
      _tempTotal: (runningCost + fbTotal).toFixed(2),
      _tempPlaySeconds: elapsed,
    }, true);
  };

  const cartTotal = Object.entries(cart).reduce((s, [itemId, qty]) => {
    const item = menuItems?.find((m: MenuItem) => m.id === itemId);
    return s + (item ? Number(item.price) * qty : 0);
  }, 0);

  if (isLoading) return <div className="p-6 text-slate-400">Đang tải...</div>;
  if (!table) return <div className="p-6 text-slate-400">Không tìm thấy bàn</div>;

  const statusConfig = TABLE_STATUS_CONFIG[table.status as keyof typeof TABLE_STATUS_CONFIG];

  return (
    <div className="p-6 space-y-6">
      {/* Back + Table Info */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/tables')} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">{table.name}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-md border border-slate-200 bg-white text-slate-600">{TABLE_TYPE_LABELS[table.type]}</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-md border ${statusConfig.color}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`} />
              {statusConfig.label}
            </span>
            <span className="text-sm text-slate-400">{formatCurrency(table.hourlyRate)}/giờ</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session panel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center"><Clock className="h-4 w-4 text-sky-500" /></div>
              <h2 className="text-base font-semibold text-slate-800">Phiên chơi</h2>
            </div>
          </div>

          <div className="p-5">
            {!session ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">Bàn đang trống</p>
                <button onClick={() => startMutation.mutate()} disabled={startMutation.isPending || table.status === 'MAINTENANCE'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50">
                  <Play className="h-5 w-5" />{startMutation.isPending ? 'Đang mở...' : 'Mở bàn'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Timer */}
                <div className="text-center py-4">
                  <p className="text-5xl font-mono font-bold text-slate-800 tracking-wider">{formatDuration(elapsed)}</p>
                  <p className="text-lg text-sky-600 mt-2">~ {formatCurrency(runningCost)}</p>
                  {session.status === 'PAUSED' && (
                    <span className="inline-flex items-center mt-3 px-3 py-1 text-xs font-medium rounded-lg bg-amber-50 text-amber-600 border border-amber-200">Đang tạm dừng</span>
                  )}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-3 flex-wrap">
                  {session.status === 'ACTIVE' && (
                    <>
                      <button onClick={() => pauseMutation.mutate()} disabled={pauseMutation.isPending}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-amber-200 text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-50">
                        <Pause className="h-4 w-4" /> Tạm dừng
                      </button>
                      <button onClick={() => { setCart({}); setEditingOrderId(null); setShowOrder(true); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                        <ShoppingCart className="h-4 w-4" /> Order
                      </button>
                      <button onClick={() => setShowCheckout(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors">
                        <Square className="h-4 w-4" /> Thanh toán
                      </button>
                    </>
                  )}
                  {session.status === 'PAUSED' && (
                    <>
                      <button onClick={() => resumeMutation.mutate()} disabled={resumeMutation.isPending}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors disabled:opacity-50">
                        <Play className="h-4 w-4" /> Tiếp tục
                      </button>
                      <button onClick={() => { setCart({}); setEditingOrderId(null); setShowOrder(true); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                        <ShoppingCart className="h-4 w-4" /> Order
                      </button>
                      <button onClick={() => setShowCheckout(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors">
                        <Square className="h-4 w-4" /> Thanh toán
                      </button>
                    </>
                  )}
                </div>

                {/* Orders list with edit/delete */}
                {session.orders && session.orders.length > 0 && (
                  <div className="pt-4">
                    <div className="h-px bg-slate-100 mb-5" />
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">Đơn hàng ({session.orders.filter((o: Order) => o.status !== 'CANCELLED').length})</h3>
                    <div className="space-y-2">
                      {session.orders.filter((o: Order) => o.status !== 'CANCELLED').map((order: Order) => (
                        <div key={order.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 group">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              {order.items.map(i => (
                                <div key={i.id} className="flex justify-between text-sm">
                                  <span className="text-slate-600">{i.menuItem?.name} <span className="text-slate-400">x{i.quantity}</span></span>
                                  <span className="text-slate-500">{formatCurrency(Number(i.unitPrice) * i.quantity)}</span>
                                </div>
                              ))}
                              <div className="flex justify-between mt-1 pt-1 border-t border-slate-200/60">
                                <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</span>
                                <span className="text-sm font-semibold text-slate-800">{formatCurrency(order.totalAmount)}</span>
                              </div>
                            </div>
                            {/* Edit/Delete buttons */}
                            <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => openEditOrder(order)} title="Sửa đơn"
                                className="w-7 h-7 rounded-lg hover:bg-sky-50 text-slate-400 hover:text-sky-500 flex items-center justify-center transition-colors">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => deleteOrderMutation.mutate(order.id)} title="Hủy đơn"
                                className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bill summary + Print temp */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center"><Receipt className="h-4 w-4 text-emerald-500" /></div>
              <h2 className="text-base font-semibold text-slate-800">Hóa đơn tạm tính</h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tiền bàn</span>
              <span className="text-slate-800">{formatCurrency(runningCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Đồ ăn/uống</span>
              <span className="text-slate-800">{formatCurrency(fbTotal)}</span>
            </div>
            <div className="h-px bg-slate-100" />
            <div className="flex justify-between font-bold text-lg">
              <span className="text-slate-800">Tổng</span>
              <span className="text-slate-800">{formatCurrency(runningCost + fbTotal)}</span>
            </div>
            <div className="text-xs text-slate-400 space-y-0.5 pt-1">
              <p>Bắt đầu: {session ? new Date(session.startTime).toLocaleString('vi-VN') : '---'}</p>
              <p>NV mở: {session?.user?.name || '---'}</p>
            </div>
            {session && (
              <button onClick={handlePrintTemp}
                className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                <Printer className="h-4 w-4" /> In tạm hóa đơn
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center"><CreditCard className="h-4 w-4 text-red-500" /></div>
                <h2 className="text-lg font-semibold text-slate-800">Thanh toán - {table.name}</h2>
              </div>
              <button onClick={() => setShowCheckout(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5">
                <div className="flex justify-between text-sm"><span className="text-slate-500">Tiền bàn</span><span className="text-slate-800">{formatCurrency(runningCost)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">F&B</span><span className="text-slate-800">{formatCurrency(fbTotal)}</span></div>
                <div className="h-px bg-slate-200" />
                <div className="flex justify-between font-bold text-lg"><span className="text-slate-800">Tổng</span><span className="text-slate-800">{formatCurrency(runningCost + fbTotal)}</span></div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Phương thức thanh toán</label>
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full h-11 px-3 bg-white border border-slate-200 text-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all text-sm">
                  {Object.entries(PAYMENT_METHODS).map(([key, label]) => (<option key={key} value={key}>{label}</option>))}
                </select>
              </div>
              {paymentMethod === 'BANK_TRANSFER' && bankQrConfig.enabled && (
                <div className="rounded-xl border border-sky-100 bg-sky-50/55 p-4">
                  <BankQrPreview
                    config={bankQrConfig}
                    amount={formatCurrency(runningCost + fbTotal)}
                    tableName={table.name}
                    compact
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <button onClick={() => setShowCheckout(false)} className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Hủy</button>
              <button onClick={() => checkoutMutation.mutate({ paymentMethod })} disabled={checkoutMutation.isPending}
                className="px-4 py-2.5 text-sm font-medium rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors disabled:opacity-50">
                {checkoutMutation.isPending ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order modal (create or edit) */}
      {showOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowOrder(false); setCart({}); setEditingOrderId(null); }} />
          <div className="relative w-full max-w-2xl max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
                  {editingOrderId ? <Pencil className="h-4 w-4 text-sky-500" /> : <ShoppingCart className="h-4 w-4 text-sky-500" />}
                </div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {editingOrderId ? 'Sửa đơn hàng' : 'Order đồ ăn/uống'} - {table.name}
                </h2>
              </div>
              <button onClick={() => { setShowOrder(false); setCart({}); setEditingOrderId(null); }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"><X className="h-4 w-4 text-slate-400" /></button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {Object.keys(MENU_CATEGORIES).map(cat => {
                const items = menuItems?.filter((m: MenuItem) => m.category === cat) || [];
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">{MENU_CATEGORIES[cat]}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item: MenuItem) => (
                        <div key={item.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors">
                          <div className="min-w-0 mr-2">
                            <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                            <p className="text-xs text-slate-400">{formatCurrency(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {cart[item.id] ? (
                              <>
                                <button onClick={() => removeFromCart(item.id)} className="w-7 h-7 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors"><Minus className="h-3 w-3" /></button>
                                <span className="w-6 text-center text-sm font-medium text-slate-800">{cart[item.id]}</span>
                              </>
                            ) : null}
                            <button onClick={() => addToCart(item.id)} className="w-7 h-7 rounded-lg border border-sky-200 text-sky-500 bg-sky-50 hover:bg-sky-100 flex items-center justify-center transition-colors"><Plus className="h-3 w-3" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.keys(cart).length > 0 && (
              <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-slate-800">Tổng đơn:</span>
                  <span className="text-sm font-semibold text-slate-800">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <button onClick={() => { setShowOrder(false); setCart({}); setEditingOrderId(null); }}
                    className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Hủy</button>
                  <button onClick={editingOrderId ? submitEditOrder : submitOrder} disabled={orderMutation.isPending || deleteOrderMutation.isPending}
                    className="px-4 py-2.5 text-sm font-medium rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-colors disabled:opacity-50">
                    {(orderMutation.isPending || deleteOrderMutation.isPending) ? 'Đang xử lý...' : (editingOrderId ? 'Cập nhật đơn' : 'Đặt hàng')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice after checkout */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { setShowInvoice(false); navigate('/tables'); }} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center"><Receipt className="h-4 w-4 text-emerald-600" /></div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-800">Hóa đơn thanh toán</h2>
                  <p className="text-xs text-emerald-600">Thanh toán thành công</p>
                </div>
              </div>
              <button onClick={() => { setShowInvoice(false); navigate('/tables'); }}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"><X className="h-4 w-4 text-slate-400" /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="text-center border-b border-dashed border-slate-200 pb-4">
                <h3 className="text-xl font-bold text-slate-800">BIDA MANAGER</h3>
                <p className="text-xs text-slate-500 mt-1">Hệ thống quản lý quán bida</p>
                <p className="text-xs text-slate-400 mt-0.5">{new Date(invoiceData.paidAt).toLocaleString('vi-VN')}</p>
              </div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Bàn</span><span className="font-medium text-slate-800">{invoiceData.table?.name} ({TABLE_TYPE_LABELS[invoiceData.table?.type]})</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Nhân viên</span><span className="text-slate-700">{invoiceData.user?.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Thanh toán</span><span className="text-slate-700">{PAYMENT_METHODS[invoiceData.paymentMethod]}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-500">Thời gian chơi</span><span className="text-slate-700">{formatDuration(invoiceData.billing?.playDurationSeconds || 0)}</span></div>
              <div className="border-t border-dashed border-slate-200" />
              <div className="flex justify-between text-sm"><span className="text-slate-600">Tiền bàn ({formatCurrency(invoiceData.table?.hourlyRate)}/giờ)</span><span className="font-medium text-slate-800">{formatCurrency(invoiceData.billing?.tableCost || 0)}</span></div>
              {invoiceData.orders?.filter((o: any) => o.status !== 'CANCELLED').length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đồ ăn & uống</p>
                  {invoiceData.orders.filter((o: any) => o.status !== 'CANCELLED').map((order: any) =>
                    order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.menuItem?.name} <span className="text-slate-400">x{item.quantity}</span></span>
                        <span className="text-slate-700">{formatCurrency(Number(item.unitPrice) * item.quantity)}</span>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between text-sm pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Cộng F&B</span>
                    <span className="font-medium text-slate-800">{formatCurrency(invoiceData.billing?.fbTotal || 0)}</span>
                  </div>
                </div>
              )}
              <div className="border-t-2 border-slate-800 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-slate-800">TỔNG CỘNG</span>
                  <span className="text-xl font-bold text-slate-800">{formatCurrency(invoiceData.billing?.totalAmount || invoiceData.totalAmount)}</span>
                </div>
              </div>
              <div className="text-center border-t border-dashed border-slate-200 pt-3">
                <p className="text-xs text-slate-400">Cảm ơn quý khách!</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/30">
              <button onClick={() => { setShowInvoice(false); navigate('/tables'); }}
                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Đóng</button>
              <button onClick={() => printInvoice(invoiceData, false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-colors flex items-center gap-2">
                <Printer className="h-4 w-4" /> In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
