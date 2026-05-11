export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'STAFF';
  isActive?: boolean;
  createdAt?: string;
}

export interface Table {
  id: string;
  name: string;
  type: 'POOL' | 'SNOOKER' | 'CAROM';
  hourlyRate: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  position: number;
  isActive: boolean;
  sessions: Session[];
}

export interface Session {
  id: string;
  tableId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  pausedDuration: number;
  lastPausedAt?: string;
  totalAmount?: string;
  paymentMethod?: string;
  paidAt?: string;
  note?: string;
  table?: Table;
  user?: { id: string; name: string };
  orders?: Order[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'BEVERAGE' | 'FOOD' | 'SNACK' | 'OTHER';
  price: string;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface Order {
  id: string;
  sessionId: string;
  totalAmount: string;
  status: 'PENDING' | 'PREPARING' | 'SERVED' | 'CANCELLED';
  note?: string;
  createdAt: string;
  items: OrderItem[];
  session?: Session & { table?: { id: string; name: string } };
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unitPrice: string;
  note?: string;
  menuItem?: MenuItem;
}

export interface PricingRule {
  id: string;
  tableType: string;
  dayOfWeek?: number | null;
  startHour: number;
  endHour: number;
  rateMultiplier: string;
  name?: string;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    total: any;
    page: any;
    limit: any;
    totalPages: any;
  };
}
