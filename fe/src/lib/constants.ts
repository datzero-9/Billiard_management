export const TABLE_STATUS_CONFIG = {
  AVAILABLE: { label: 'Trống', color: 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400', dot: 'bg-emerald-500' },
  OCCUPIED: { label: 'Đang chơi', color: 'bg-rose-500/10 border-rose-500/50 text-rose-400', dot: 'bg-rose-500' },
  RESERVED: { label: 'Tạm dừng', color: 'bg-amber-500/10 border-amber-500/50 text-amber-400', dot: 'bg-amber-500' },
  MAINTENANCE: { label: 'Bảo trì', color: 'bg-slate-500/10 border-slate-500/50 text-slate-400', dot: 'bg-slate-500' },
} as const;

export const TABLE_TYPE_LABELS: Record<string, string> = {
  POOL: 'Pool',
  SNOOKER: 'Snooker',
  CAROM: 'Carom',
};

export const ORDER_STATUS_CONFIG = {
  PENDING: { label: 'Chờ', color: 'bg-amber-500/10 text-amber-400' },
  PREPARING: { label: 'Đang làm', color: 'bg-blue-500/10 text-blue-400' },
  SERVED: { label: 'Đã phục vụ', color: 'bg-emerald-500/10 text-emerald-400' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-500/10 text-red-400' },
} as const;

export const MENU_CATEGORIES: Record<string, string> = {
  BEVERAGE: 'Đồ uống',
  FOOD: 'Đồ ăn',
  SNACK: 'Snack',
  OTHER: 'Khác',
};

export const PAYMENT_METHODS: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK_TRANSFER: 'Chuyển khoản',
  EWALLET: 'Ví điện tử',
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Quản lý',
  CASHIER: 'Thu ngân',
  STAFF: 'Nhân viên',
};

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
