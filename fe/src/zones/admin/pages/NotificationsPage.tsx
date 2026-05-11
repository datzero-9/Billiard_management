import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { BellRing, MessageSquareText, Send, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  loadMessages,
  loadStores,
  saveMessages,
  type PortalMessage,
} from '../data/portal';

const MESSAGE_TYPE_LABELS: Record<PortalMessage['type'], string> = {
  SYSTEM: 'Hệ thống',
  BILLING: 'Thanh toán',
  EVENT: 'Sự kiện',
};

export default function NotificationsPage() {
  const [stores] = useState(() => loadStores());
  const [messages, setMessages] = useState<PortalMessage[]>(() => loadMessages());
  const [selectedStoreId, setSelectedStoreId] = useState(stores[0]?.id || '');
  const [form, setForm] = useState({
    title: 'Nhắc gia hạn dịch vụ',
    content: '',
    type: 'BILLING' as PortalMessage['type'],
  });

  const selectedStore = stores.find((store) => store.id === selectedStoreId);
  const storeMessages = useMemo(
    () => messages.filter((message) => message.storeId === selectedStoreId),
    [messages, selectedStoreId],
  );

  const sendMessage = () => {
    if (!selectedStoreId || !form.title || !form.content) {
      toast.error('Vui lòng chọn cửa hàng và nhập nội dung thông báo');
      return;
    }

    const newMessage: PortalMessage = {
      id: `msg-${Date.now()}`,
      storeId: selectedStoreId,
      title: form.title,
      content: form.content,
      type: form.type,
      sentAt: new Date().toISOString(),
    };
    const nextMessages = [newMessage, ...messages];
    setMessages(nextMessages);
    saveMessages(nextMessages);
    setForm((current) => ({ ...current, content: '' }));
    toast.success('Đã gửi thông báo cho cửa hàng');
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Thông báo cửa hàng</h1>
        <p className="mt-1 text-sm text-slate-500">Gửi tin nhắn, nhắc thanh toán hoặc thông báo sự kiện đến từng tài khoản user.</p>
      </div>

      <div className="grid min-h-[calc(100vh-150px)] gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
              <BellRing className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Cửa hàng</h2>
          </div>
          <div className="max-h-[calc(100vh-230px)] overflow-y-auto p-3">
            {stores.map((store) => {
              const unreadCount = messages.filter((message) => message.storeId === store.id).length;
              return (
                <button
                  key={store.id}
                  type="button"
                  onClick={() => setSelectedStoreId(store.id)}
                  className={`mb-2 w-full rounded-md border p-3 text-left transition ${
                    selectedStoreId === store.id
                      ? 'border-sky-200 bg-sky-50'
                      : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{store.storeName}</p>
                      <p className="mt-1 text-xs text-slate-400">{store.ownerName}</p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-sky-700">{unreadCount}</span>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Hạn: {dayjs(store.expiresAt).format('DD/MM/YYYY')}</p>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="grid overflow-hidden rounded-lg border border-sky-100 bg-white shadow-sm lg:grid-rows-[auto_minmax(0,1fr)_auto]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">{selectedStore?.storeName || 'Chọn cửa hàng'}</h2>
                <p className="text-xs text-slate-500">{selectedStore?.email}</p>
              </div>
            </div>
            {selectedStore && (
              <span className="rounded-md border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
                {selectedStore.plan} - {selectedStore.tables} bàn
              </span>
            )}
          </div>

          <div className="max-h-[calc(100vh-360px)] space-y-3 overflow-y-auto bg-slate-50/70 p-5">
            {storeMessages.length === 0 ? (
              <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-slate-400">
                <MessageSquareText className="mb-3 h-10 w-10" />
                <p className="text-sm">Chưa có thông báo nào cho cửa hàng này.</p>
              </div>
            ) : (
              storeMessages.map((message) => (
                <article key={message.id} className="ml-auto max-w-2xl rounded-lg border border-sky-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold text-slate-900">{message.title}</p>
                    <span className="rounded-md bg-sky-50 px-2 py-1 text-[11px] font-bold text-sky-700">
                      {MESSAGE_TYPE_LABELS[message.type]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{message.content}</p>
                  <p className="mt-3 text-right text-[11px] font-semibold text-slate-400">
                    {dayjs(message.sentAt).format('HH:mm DD/MM/YYYY')}
                  </p>
                </article>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-5">
            <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)]">
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as PortalMessage['type'] }))}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="BILLING">Thanh toán</option>
                <option value="SYSTEM">Hệ thống</option>
                <option value="EVENT">Sự kiện</option>
              </select>
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Tiêu đề thông báo"
              />
            </div>
            <div className="mt-3 flex gap-3">
              <textarea
                value={form.content}
                onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                className="min-h-24 flex-1 resize-none rounded-md border border-slate-200 px-3 py-2 text-sm leading-6 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="Nhập nội dung gửi cho cửa hàng..."
              />
              <button
                type="button"
                onClick={sendMessage}
                className="flex w-12 items-center justify-center rounded-md bg-sky-700 text-white transition hover:bg-sky-800"
                aria-label="Gửi thông báo"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
