export type StoreStatus = 'ACTIVE' | 'EXPIRING' | 'OVERDUE' | 'TRIAL';

export type StoreAccount = {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  plan: 'Starter' | 'Business' | 'Premium';
  tables: number;
  monthlyFee: number;
  startedAt: string;
  expiresAt: string;
  status: StoreStatus;
  lastPaymentAt: string;
};

export type PortalMessage = {
  id: string;
  storeId: string;
  title: string;
  content: string;
  sentAt: string;
  type: 'SYSTEM' | 'BILLING' | 'EVENT';
};

export const STORE_STORAGE_KEY = 'bida.admin.storeAccounts';
export const MESSAGE_STORAGE_KEY = 'bida.admin.messages';

export const DEFAULT_STORES: StoreAccount[] = [
  {
    id: 'store-001',
    storeName: 'Elite Billiards Club',
    ownerName: 'Nguyễn Minh Anh',
    email: 'manager@elitebilliards.vn',
    phone: '0901 234 567',
    plan: 'Premium',
    tables: 18,
    monthlyFee: 1490000,
    startedAt: '2026-01-01',
    expiresAt: '2026-05-28',
    status: 'ACTIVE',
    lastPaymentAt: '2026-04-25',
  },
  {
    id: 'store-002',
    storeName: 'Cue House Đà Nẵng',
    ownerName: 'Trần Hoàng Long',
    email: 'cuehouse.dn@gmail.com',
    phone: '0918 998 111',
    plan: 'Business',
    tables: 12,
    monthlyFee: 990000,
    startedAt: '2025-11-10',
    expiresAt: '2026-05-05',
    status: 'EXPIRING',
    lastPaymentAt: '2026-04-05',
  },
  {
    id: 'store-003',
    storeName: 'Bida 79 Arena',
    ownerName: 'Phạm Quốc Huy',
    email: 'admin@bida79.vn',
    phone: '0935 222 111',
    plan: 'Starter',
    tables: 7,
    monthlyFee: 590000,
    startedAt: '2026-03-15',
    expiresAt: '2026-04-20',
    status: 'OVERDUE',
    lastPaymentAt: '2026-03-20',
  },
  {
    id: 'store-004',
    storeName: 'Sky Pool Lounge',
    ownerName: 'Lê Bảo Ngọc',
    email: 'owner@skypool.vn',
    phone: '0986 551 777',
    plan: 'Business',
    tables: 10,
    monthlyFee: 990000,
    startedAt: '2026-04-18',
    expiresAt: '2026-05-18',
    status: 'TRIAL',
    lastPaymentAt: '2026-04-18',
  },
];

export const DEFAULT_MESSAGES: PortalMessage[] = [
  {
    id: 'msg-001',
    storeId: 'store-002',
    title: 'Nhắc gia hạn dịch vụ',
    content: 'Gói Business của Cue House Đà Nẵng sẽ đến hạn trong 7 ngày. Vui lòng thanh toán để tránh gián đoạn dịch vụ.',
    sentAt: '2026-04-28T09:20:00+07:00',
    type: 'BILLING',
  },
  {
    id: 'msg-002',
    storeId: 'store-001',
    title: 'Cập nhật tính năng QR',
    content: 'Tính năng cấu hình QR chuyển khoản theo từng bàn đã sẵn sàng trong khu vực Cài đặt.',
    sentAt: '2026-04-26T15:45:00+07:00',
    type: 'SYSTEM',
  },
];

export function loadStores() {
  const raw = localStorage.getItem(STORE_STORAGE_KEY);
  if (!raw) return DEFAULT_STORES;
  try {
    return JSON.parse(raw) as StoreAccount[];
  } catch {
    return DEFAULT_STORES;
  }
}

export function saveStores(stores: StoreAccount[]) {
  localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(stores));
}

export function loadMessages() {
  const raw = localStorage.getItem(MESSAGE_STORAGE_KEY);
  if (!raw) return DEFAULT_MESSAGES;
  try {
    return JSON.parse(raw) as PortalMessage[];
  } catch {
    return DEFAULT_MESSAGES;
  }
}

export function saveMessages(messages: PortalMessage[]) {
  localStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages));
}
