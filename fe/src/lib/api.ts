import dayjs from 'dayjs';

type MockUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'STAFF';
  isActive: boolean;
  createdAt: string;
};

type MockTable = {
  id: string;
  name: string;
  type: 'POOL' | 'SNOOKER' | 'CAROM';
  hourlyRate: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';
  position: number;
  isActive: boolean;
};

type MockSession = {
  id: string;
  tableId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  pausedDuration: number;
  lastPausedAt?: string | null;
  totalAmount?: string;
  paymentMethod?: string;
  paidAt?: string;
  note?: string;
  createdAt: string;
};

type MockMenuItem = {
  id: string;
  name: string;
  category: 'BEVERAGE' | 'FOOD' | 'SNACK' | 'OTHER';
  price: string;
  description?: string;
  imageUrl?: string;
  isAvailable: boolean;
};

type MockOrder = {
  id: string;
  sessionId: string;
  totalAmount: string;
  status: 'PENDING' | 'PREPARING' | 'SERVED' | 'CANCELLED';
  note?: string;
  createdAt: string;
};

type MockOrderItem = {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: string;
  note?: string;
};

type MockPricingRule = {
  id: string;
  tableType: string;
  dayOfWeek: number | null;
  startHour: number;
  endHour: number;
  rateMultiplier: string;
  name?: string;
  isActive: boolean;
};

type MockState = {
  users: MockUser[];
  tables: MockTable[];
  sessions: MockSession[];
  menuItems: MockMenuItem[];
  orders: MockOrder[];
  orderItems: MockOrderItem[];
  pricingRules: MockPricingRule[];
};

const MOCK_DB_KEY = 'bida.fe.mockDb.v2';

const menuImages = {
  beer: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=900&q=80',
  coffee: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
  pizza: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=900&q=80',
  noodles: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
  nachos: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=900&q=80',
  fries: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=900&q=80',
};

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function money(value: number) {
  return value.toFixed(2);
}

function initialState(): MockState {
  const now = dayjs();
  const users: MockUser[] = [
    { id: 'user-admin', name: 'Super Admin', email: 'superadmin@billiard.saas', password: '123123', role: 'ADMIN', isActive: true, createdAt: now.subtract(180, 'day').toISOString() },
    { id: 'user-manager', name: 'Quản lý CueManager', email: 'manager@billiardpro.com', password: '123123', role: 'MANAGER', isActive: true, createdAt: now.subtract(120, 'day').toISOString() },
    { id: 'user-cashier', name: 'Thu ngân ca tối', email: 'cashier@gmail.com', password: '123123', role: 'CASHIER', isActive: true, createdAt: now.subtract(60, 'day').toISOString() },
  ];

  const tables: MockTable[] = [
    { id: 'table-01', name: 'Bàn 01', type: 'POOL', hourlyRate: '65000.00', status: 'OCCUPIED', position: 1, isActive: true },
    { id: 'table-02', name: 'Bàn 02', type: 'POOL', hourlyRate: '65000.00', status: 'AVAILABLE', position: 2, isActive: true },
    { id: 'table-03', name: 'Bàn 03', type: 'POOL', hourlyRate: '65000.00', status: 'AVAILABLE', position: 3, isActive: true },
    { id: 'table-04', name: 'Bàn 04', type: 'CAROM', hourlyRate: '75000.00', status: 'RESERVED', position: 4, isActive: true },
    { id: 'table-05', name: 'Bàn 05', type: 'CAROM', hourlyRate: '75000.00', status: 'OCCUPIED', position: 5, isActive: true },
    { id: 'table-06', name: 'Bàn 06', type: 'POOL', hourlyRate: '65000.00', status: 'AVAILABLE', position: 6, isActive: true },
    { id: 'table-vip-01', name: 'Bàn VIP 01', type: 'SNOOKER', hourlyRate: '120000.00', status: 'OCCUPIED', position: 7, isActive: true },
    { id: 'table-vip-02', name: 'Bàn VIP 02', type: 'SNOOKER', hourlyRate: '120000.00', status: 'MAINTENANCE', position: 8, isActive: true },
  ];

  const menuItems: MockMenuItem[] = [
    { id: 'menu-beer', name: 'Bia thủ công cao cấp', category: 'BEVERAGE', price: '55000.00', description: 'Bia IPA tươi vị cam quýt và hậu vị sảng khoái.', imageUrl: menuImages.beer, isAvailable: true },
    { id: 'menu-coffee', name: 'Cà phê sữa đá', category: 'BEVERAGE', price: '28000.00', description: 'Cà phê rang đậm, sữa đặc và đá viên.', imageUrl: menuImages.coffee, isAvailable: true },
    { id: 'menu-pizza', name: 'Pizza Margherita truyền thống', category: 'FOOD', price: '145000.00', description: 'Phô mai mozzarella, cà chua San Marzano và lá basil.', imageUrl: menuImages.pizza, isAvailable: true },
    { id: 'menu-noodles', name: 'Mì xào bò', category: 'FOOD', price: '69000.00', description: 'Mì xào nóng với bò mềm, rau xanh và sốt đậm vị.', imageUrl: menuImages.noodles, isAvailable: true },
    { id: 'menu-nachos', name: 'Nachos đặc biệt', category: 'SNACK', price: '65000.00', description: 'Bánh tortilla phủ phô mai, ớt jalapeno và salsa.', imageUrl: menuImages.nachos, isAvailable: false },
    { id: 'menu-fries', name: 'Khoai tây chiên', category: 'SNACK', price: '45000.00', description: 'Khoai chiên giòn dùng cùng sốt mayonnaise.', imageUrl: menuImages.fries, isAvailable: true },
  ];

  const sessions: MockSession[] = [
    { id: 'session-active-01', tableId: 'table-01', userId: 'user-manager', startTime: now.subtract(2, 'hour').subtract(15, 'minute').toISOString(), status: 'ACTIVE', pausedDuration: 0, createdAt: now.subtract(2, 'hour').toISOString() },
    { id: 'session-active-04', tableId: 'table-04', userId: 'user-cashier', startTime: now.subtract(1, 'hour').subtract(40, 'minute').toISOString(), status: 'PAUSED', pausedDuration: 900, lastPausedAt: now.subtract(12, 'minute').toISOString(), createdAt: now.subtract(1, 'hour').toISOString() },
    { id: 'session-active-05', tableId: 'table-05', userId: 'user-cashier', startTime: now.subtract(3, 'hour').subtract(5, 'minute').toISOString(), status: 'ACTIVE', pausedDuration: 0, createdAt: now.subtract(3, 'hour').toISOString() },
    { id: 'session-active-vip', tableId: 'table-vip-01', userId: 'user-manager', startTime: now.subtract(58, 'minute').toISOString(), status: 'ACTIVE', pausedDuration: 0, createdAt: now.subtract(58, 'minute').toISOString() },
  ];

  const completed: MockSession[] = Array.from({ length: 18 }).map((_, index) => {
    const started = now.subtract(index % 9, 'day').hour(14 + (index % 7)).minute(index % 2 ? 30 : 0);
    const ended = started.add(90 + (index % 4) * 35, 'minute');
    const table = tables[index % tables.length];
    const tableTotal = (ended.diff(started, 'minute') / 60) * Number(table.hourlyRate);
    const fbTotal = [0, 45000, 80000, 120000][index % 4];
    return {
      id: `session-done-${index + 1}`,
      tableId: table.id,
      userId: index % 2 ? 'user-cashier' : 'user-manager',
      startTime: started.toISOString(),
      endTime: ended.toISOString(),
      status: 'COMPLETED',
      pausedDuration: 0,
      totalAmount: money(tableTotal + fbTotal),
      paymentMethod: index % 3 === 0 ? 'BANK_TRANSFER' : index % 3 === 1 ? 'CASH' : 'EWALLET',
      paidAt: ended.toISOString(),
      createdAt: started.toISOString(),
    };
  });

  const orders: MockOrder[] = [
    { id: 'order-01', sessionId: 'session-active-01', totalAmount: '200000.00', status: 'PENDING', createdAt: now.subtract(20, 'minute').toISOString() },
    { id: 'order-02', sessionId: 'session-active-05', totalAmount: '110000.00', status: 'PREPARING', createdAt: now.subtract(12, 'minute').toISOString() },
    { id: 'order-03', sessionId: 'session-active-vip', totalAmount: '145000.00', status: 'SERVED', createdAt: now.subtract(35, 'minute').toISOString() },
  ];

  const orderItems: MockOrderItem[] = [
    { id: 'oi-01', orderId: 'order-01', menuItemId: 'menu-beer', quantity: 1, unitPrice: '55000.00' },
    { id: 'oi-02', orderId: 'order-01', menuItemId: 'menu-pizza', quantity: 1, unitPrice: '145000.00' },
    { id: 'oi-03', orderId: 'order-02', menuItemId: 'menu-beer', quantity: 2, unitPrice: '55000.00' },
    { id: 'oi-04', orderId: 'order-03', menuItemId: 'menu-pizza', quantity: 1, unitPrice: '145000.00' },
  ];

  return {
    users,
    tables,
    sessions: [...sessions, ...completed],
    menuItems,
    orders,
    orderItems,
    pricingRules: [
      { id: 'pricing-evening', tableType: 'POOL', dayOfWeek: null, startHour: 18, endHour: 23, rateMultiplier: '1.20', name: 'Giờ cao điểm tối', isActive: true },
      { id: 'pricing-weekend', tableType: 'SNOOKER', dayOfWeek: 6, startHour: 14, endHour: 24, rateMultiplier: '1.35', name: 'Cuối tuần VIP', isActive: true },
    ],
  };
}

function loadState(): MockState {
  const raw = localStorage.getItem(MOCK_DB_KEY);
  if (!raw) {
    const state = initialState();
    saveState(state);
    return state;
  }

  try {
    return JSON.parse(raw) as MockState;
  } catch {
    const state = initialState();
    saveState(state);
    return state;
  }
}

function saveState(state: MockState) {
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(state));
}

function response<T>(data: T): Promise<any> {
  return Promise.resolve({ data: { success: true, data } });
}

function parsePath(url: string) {
  const [pathname, queryString = ''] = url.split('?');
  return { pathname, params: new URLSearchParams(queryString) };
}

function activeSessionForTable(state: MockState, tableId: string) {
  return state.sessions.find((session) => session.tableId === tableId && ['ACTIVE', 'PAUSED'].includes(session.status));
}

function getUser(state: MockState, userId: string) {
  const user = state.users.find((item) => item.id === userId);
  return user ? { id: user.id, name: user.name } : undefined;
}

function getOrderItems(state: MockState, orderId: string) {
  return state.orderItems
    .filter((item) => item.orderId === orderId)
    .map((item) => ({
      ...item,
      menuItem: state.menuItems.find((menuItem) => menuItem.id === item.menuItemId),
    }));
}

function hydrateOrder(state: MockState, order: MockOrder) {
  const session = state.sessions.find((item) => item.id === order.sessionId);
  const table = session ? state.tables.find((item) => item.id === session.tableId) : undefined;
  return {
    ...order,
    items: getOrderItems(state, order.id),
    session: session
      ? {
          ...session,
          table: table ? { id: table.id, name: table.name } : undefined,
          user: getUser(state, session.userId),
        }
      : undefined,
  };
}

function hydrateSession(state: MockState, session: MockSession) {
  const table = state.tables.find((item) => item.id === session.tableId);
  return {
    ...session,
    table,
    user: getUser(state, session.userId),
    orders: state.orders
      .filter((order) => order.sessionId === session.id)
      .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
      .map((order) => hydrateOrder(state, order)),
  };
}

function hydrateTable(state: MockState, table: MockTable) {
  const session = activeSessionForTable(state, table.id);
  return {
    ...table,
    sessions: session ? [hydrateSession(state, session)] : [],
  };
}

function calculateRunningTableCost(state: MockState, session: MockSession, endTime = dayjs()) {
  const table = state.tables.find((item) => item.id === session.tableId);
  if (!table) return 0;
  let paused = session.pausedDuration || 0;
  if (session.lastPausedAt) {
    paused += dayjs(endTime).diff(dayjs(session.lastPausedAt), 'second');
  }
  const seconds = Math.max(0, dayjs(endTime).diff(dayjs(session.startTime), 'second') - paused);
  return (seconds / 3600) * Number(table.hourlyRate);
}

function getCompletedSessionsInRange(state: MockState, from?: string | null, to?: string | null) {
  const start = from ? dayjs(from).startOf('day') : dayjs().startOf('month');
  const end = to ? dayjs(to).endOf('day') : dayjs().endOf('day');
  return state.sessions.filter((session) => {
    if (session.status !== 'COMPLETED' || !session.paidAt) return false;
    const paidAt = dayjs(session.paidAt);
    return paidAt.isAfter(start.subtract(1, 'millisecond')) && paidAt.isBefore(end.add(1, 'millisecond'));
  });
}

async function get(url: string): Promise<any> {
  const state = loadState();
  const { pathname, params } = parsePath(url);

  if (pathname === '/tables') {
    return response(state.tables.sort((a, b) => a.position - b.position).map((table) => hydrateTable(state, table)));
  }

  if (pathname.startsWith('/tables/')) {
    const table = state.tables.find((item) => item.id === pathname.split('/')[2]);
    return response(table ? hydrateTable(state, table) : null);
  }

  if (pathname === '/menu') {
    const available = params.get('available');
    const items = available === 'all' ? state.menuItems : state.menuItems.filter((item) => item.isAvailable);
    return response(items);
  }

  if (pathname === '/orders/active') {
    return response(
      state.orders
        .filter((order) => ['PENDING', 'PREPARING'].includes(order.status))
        .sort((a, b) => dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf())
        .map((order) => hydrateOrder(state, order)),
    );
  }

  if (pathname === '/pricing') {
    return response(state.pricingRules);
  }

  if (pathname === '/users') {
    const users = state.users.filter((user) => user.isActive).map(({ password, ...user }) => user);
    return response({ users, total: users.length, page: 1, limit: 20, totalPages: 1 });
  }

  if (pathname === '/sessions') {
    const sessions = getCompletedSessionsInRange(state, params.get('from'), params.get('to')).map((session) => hydrateSession(state, session));
    return response({ sessions, total: sessions.length, page: 1, limit: Number(params.get('limit') || 100), totalPages: 1 });
  }

  if (pathname === '/reports/revenue') {
    const groupBy = params.get('groupBy') || 'day';
    const sessions = getCompletedSessionsInRange(state, params.get('from'), params.get('to'));
    const grouped = sessions.reduce<Record<string, number>>((result, session) => {
      const paidAt = dayjs(session.paidAt);
      const key = groupBy === 'month' ? paidAt.format('YYYY-MM') : groupBy === 'week' ? paidAt.startOf('week').format('YYYY-MM-DD') : paidAt.format('YYYY-MM-DD');
      result[key] = (result[key] || 0) + Number(session.totalAmount || 0);
      return result;
    }, {});
    const data = Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
    return response({ data, totalRevenue: data.reduce((sum, item) => sum + item.revenue, 0), from: params.get('from'), to: params.get('to') });
  }

  if (pathname === '/reports/revenue/breakdown') {
    const sessions = getCompletedSessionsInRange(state, params.get('from'), params.get('to'));
    const fbRevenue = sessions.reduce((sum, session) => {
      const sessionOrders = state.orders.filter((order) => order.sessionId === session.id && order.status !== 'CANCELLED');
      return sum + sessionOrders.reduce((orderSum, order) => orderSum + Number(order.totalAmount), 0);
    }, 0);
    const totalRevenue = sessions.reduce((sum, session) => sum + Number(session.totalAmount || 0), 0);
    return response({ tableRevenue: Math.max(0, totalRevenue - fbRevenue), fbRevenue, totalRevenue });
  }

  if (pathname === '/reports/tables/utilization') {
    const sessions = getCompletedSessionsInRange(state, params.get('from'), params.get('to'));
    const data = state.tables.map((table) => {
      const playSeconds = sessions
        .filter((session) => session.tableId === table.id && session.endTime)
        .reduce((sum, session) => sum + Math.max(0, dayjs(session.endTime).diff(dayjs(session.startTime), 'second') - session.pausedDuration), 0);
      return {
        tableId: table.id,
        tableName: table.name,
        tableType: table.type,
        playHours: Number((playSeconds / 3600).toFixed(2)),
        utilization: Number(Math.min(100, (playSeconds / (8 * 3600)) * 100).toFixed(1)),
        sessionCount: sessions.filter((session) => session.tableId === table.id).length,
      };
    });
    return response(data);
  }

  if (pathname === '/reports/menu/top-selling') {
    const result = state.menuItems.map((menuItem) => {
      const items = state.orderItems.filter((item) => item.menuItemId === menuItem.id);
      return {
        menuItemId: menuItem.id,
        name: menuItem.name,
        category: menuItem.category,
        totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
        totalRevenue: items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0),
      };
    });
    return response(result.sort((a, b) => b.totalQuantity - a.totalQuantity).slice(0, 10));
  }

  return response(null);
}

async function post(url: string, body?: any): Promise<any> {
  const state = loadState();

  if (url === '/auth/login') {
    const aliases: Record<string, string> = {
      'admin@gmail.com': 'superadmin@billiard.saas',
      'user@gmail.com': 'manager@billiardpro.com',
    };
    const loginEmail = aliases[body.email] || body.email;
    const fallbackUsers = initialState().users;
    const user =
      state.users.find((item) => item.email === loginEmail && item.password === body.password && item.isActive) ||
      fallbackUsers.find((item) => item.email === loginEmail && item.password === body.password && item.isActive);
    if (!user) {
      return Promise.reject({ response: { data: { message: 'Email hoặc mật khẩu không đúng' } } });
    }
    const { password, ...safeUser } = user;
    return response({ accessToken: 'mock-access-token', refreshToken: 'mock-refresh-token', user: safeUser });
  }

  if (url === '/auth/logout') {
    return response(true);
  }

  if (url === '/tables') {
    const table: MockTable = {
      id: id('table'),
      name: body.name,
      type: body.type,
      hourlyRate: money(Number(body.hourlyRate || 0)),
      status: 'AVAILABLE',
      position: state.tables.length + 1,
      isActive: true,
    };
    state.tables.push(table);
    saveState(state);
    return response(table);
  }

  if (url === '/sessions/start') {
    const table = state.tables.find((item) => item.id === body.tableId);
    if (!table) return Promise.reject({ response: { data: { message: 'Không tìm thấy bàn' } } });
    table.status = 'OCCUPIED';
    const session: MockSession = {
      id: id('session'),
      tableId: table.id,
      userId: 'user-manager',
      startTime: new Date().toISOString(),
      status: 'ACTIVE',
      pausedDuration: 0,
      createdAt: new Date().toISOString(),
    };
    state.sessions.unshift(session);
    saveState(state);
    return response(hydrateSession(state, session));
  }

  if (url.startsWith('/sessions/') && url.endsWith('/checkout')) {
    const sessionId = url.split('/')[2];
    const session = state.sessions.find((item) => item.id === sessionId);
    if (!session) return Promise.reject({ response: { data: { message: 'Không tìm thấy phiên chơi' } } });
    const endTime = dayjs();
    const tableCost = calculateRunningTableCost(state, session, endTime);
    const fbTotal = state.orders
      .filter((order) => order.sessionId === session.id && order.status !== 'CANCELLED')
      .reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const totalAmount = tableCost + fbTotal;
    session.status = 'COMPLETED';
    session.endTime = endTime.toISOString();
    session.totalAmount = money(totalAmount);
    session.paymentMethod = body.paymentMethod;
    session.paidAt = endTime.toISOString();
    session.lastPausedAt = null;
    const table = state.tables.find((item) => item.id === session.tableId);
    if (table) table.status = 'AVAILABLE';
    saveState(state);
    return response({
      ...hydrateSession(state, session),
      billing: {
        tableCost: money(tableCost),
        fbTotal: money(fbTotal),
        totalAmount: money(totalAmount),
        playDurationSeconds: Math.max(0, endTime.diff(dayjs(session.startTime), 'second') - session.pausedDuration),
        pausedDurationSeconds: session.pausedDuration,
      },
    });
  }

  if (url === '/orders') {
    const items = body.items || [];
    const totalAmount = items.reduce((sum: number, item: { menuItemId: string; quantity: number }) => {
      const menuItem = state.menuItems.find((menu) => menu.id === item.menuItemId);
      return sum + (menuItem ? Number(menuItem.price) * item.quantity : 0);
    }, 0);
    const order: MockOrder = {
      id: id('order'),
      sessionId: body.sessionId,
      totalAmount: money(totalAmount),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    state.orders.unshift(order);
    items.forEach((item: { menuItemId: string; quantity: number }) => {
      const menuItem = state.menuItems.find((menu) => menu.id === item.menuItemId);
      if (!menuItem) return;
      state.orderItems.push({ id: id('oi'), orderId: order.id, menuItemId: item.menuItemId, quantity: item.quantity, unitPrice: menuItem.price });
    });
    saveState(state);
    return response(hydrateOrder(state, order));
  }

  if (url === '/menu') {
    const item: MockMenuItem = {
      id: id('menu'),
      name: body.name,
      category: body.category,
      price: money(Number(body.price || 0)),
      description: body.description,
      imageUrl: body.imageUrl,
      isAvailable: true,
    };
    state.menuItems.unshift(item);
    saveState(state);
    return response(item);
  }

  if (url === '/pricing') {
    const rule: MockPricingRule = {
      id: id('pricing'),
      tableType: body.tableType,
      dayOfWeek: body.dayOfWeek ?? null,
      startHour: body.startHour,
      endHour: body.endHour,
      rateMultiplier: String(body.rateMultiplier),
      name: body.name,
      isActive: true,
    };
    state.pricingRules.unshift(rule);
    saveState(state);
    return response(rule);
  }

  return response(null);
}

async function patch(url: string, body?: any): Promise<any> {
  const state = loadState();

  if (url.startsWith('/sessions/') && url.endsWith('/pause')) {
    const session = state.sessions.find((item) => item.id === url.split('/')[2]);
    if (session) {
      session.status = 'PAUSED';
      session.lastPausedAt = new Date().toISOString();
      const table = state.tables.find((item) => item.id === session.tableId);
      if (table) table.status = 'RESERVED';
      saveState(state);
      return response(hydrateSession(state, session));
    }
  }

  if (url.startsWith('/sessions/') && url.endsWith('/resume')) {
    const session = state.sessions.find((item) => item.id === url.split('/')[2]);
    if (session) {
      if (session.lastPausedAt) {
        session.pausedDuration += dayjs().diff(dayjs(session.lastPausedAt), 'second');
      }
      session.status = 'ACTIVE';
      session.lastPausedAt = null;
      const table = state.tables.find((item) => item.id === session.tableId);
      if (table) table.status = 'OCCUPIED';
      saveState(state);
      return response(hydrateSession(state, session));
    }
  }

  if (url.startsWith('/orders/') && url.endsWith('/status')) {
    const order = state.orders.find((item) => item.id === url.split('/')[2]);
    if (order) {
      order.status = body.status;
      saveState(state);
      return response(hydrateOrder(state, order));
    }
  }

  if (url.startsWith('/tables/') && url.endsWith('/status')) {
    const table = state.tables.find((item) => item.id === url.split('/')[2]);
    if (table) {
      table.status = body.status;
      saveState(state);
      return response(hydrateTable(state, table));
    }
  }

  return response(null);
}

async function put(url: string, body?: any): Promise<any> {
  const state = loadState();

  if (url.startsWith('/menu/')) {
    const item = state.menuItems.find((menuItem) => menuItem.id === url.split('/')[2]);
    if (item) {
      item.name = body.name;
      item.category = body.category;
      item.price = money(Number(body.price || 0));
      item.description = body.description;
      item.imageUrl = body.imageUrl;
      saveState(state);
      return response(item);
    }
  }

  return response(null);
}

async function remove(url: string): Promise<any> {
  const state = loadState();

  if (url.startsWith('/menu/')) {
    const item = state.menuItems.find((menuItem) => menuItem.id === url.split('/')[2]);
    if (item) item.isAvailable = false;
    saveState(state);
    return response(true);
  }

  if (url.startsWith('/pricing/')) {
    state.pricingRules = state.pricingRules.filter((rule) => rule.id !== url.split('/')[2]);
    saveState(state);
    return response(true);
  }

  if (url.startsWith('/users/')) {
    const user = state.users.find((item) => item.id === url.split('/')[2]);
    if (user) user.isActive = false;
    saveState(state);
    return response(true);
  }

  return response(true);
}

const api = {
  get,
  post,
  patch,
  put,
  delete: remove,
};

export default api;
