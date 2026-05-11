import { useState } from 'react';
import { Check, QrCode, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  BankQrPreview,
  DEFAULT_BANK_QR_CONFIG,
  getStoredPaymentQrConfig,
  PAYMENT_QR_STORAGE_KEY,
  type BankQrConfig,
} from '@/components/payment/BankQrPreview';
import { formatCurrency } from '@/lib/constants';

export default function PaymentQrPage() {
  const [config, setConfig] = useState<BankQrConfig>(() => getStoredPaymentQrConfig());

  const updateField = (field: keyof BankQrConfig, value: string | boolean) => {
    setConfig((current) => ({ ...current, [field]: value }));
  };

  const saveConfig = () => {
    localStorage.setItem(PAYMENT_QR_STORAGE_KEY, JSON.stringify(config));
    toast.success('Đã lưu cấu hình QR chuyển khoản');
  };

  const resetConfig = () => {
    setConfig(DEFAULT_BANK_QR_CONFIG);
    localStorage.setItem(PAYMENT_QR_STORAGE_KEY, JSON.stringify(DEFAULT_BANK_QR_CONFIG));
    toast.success('Đã khôi phục cấu hình mặc định');
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">QR chuyển khoản</h1>
          <p className="mt-1 text-sm text-slate-500">Cấu hình mã QR thanh toán hiển thị khi khách chọn chuyển khoản.</p>
        </div>
        <button
          type="button"
          onClick={saveConfig}
          className="flex h-10 items-center gap-2 rounded-md bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700"
        >
          <Save className="h-4 w-4" />
          Lưu cấu hình
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-sky-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                <QrCode className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Thông tin nhận tiền</h2>
                <p className="text-xs text-slate-500">Nội dung có thể dùng biến {'{table}'} và {'{amount}'}.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateField('enabled', !config.enabled)}
              className={`flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                config.enabled
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              {config.enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {config.enabled ? 'Đang bật' : 'Đang tắt'}
            </button>
          </div>

          <div className="grid gap-4 p-5 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Ngân hàng / ví</span>
              <input
                value={config.bankName}
                onChange={(event) => updateField('bankName', event.target.value)}
                className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="VD: Vietcombank"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Số tài khoản</span>
              <input
                value={config.accountNumber}
                onChange={(event) => updateField('accountNumber', event.target.value)}
                className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="VD: 0123456789"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Tên chủ tài khoản</span>
              <input
                value={config.accountName}
                onChange={(event) => updateField('accountName', event.target.value)}
                className="h-11 w-full rounded-md border border-slate-200 px-3 text-sm uppercase outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="VD: BILLIARD PRO"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Nội dung chuyển khoản</span>
              <input
                value={config.contentTemplate}
                onChange={(event) => updateField('contentTemplate', event.target.value)}
                className="h-11 w-full rounded-md border border-slate-200 px-3 font-mono text-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="BIDA-{table}-{amount}"
              />
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Check className="h-4 w-4 text-emerald-500" />
              QR sẽ lấy cấu hình này ở màn thanh toán bàn.
            </div>
            <button
              type="button"
              onClick={resetConfig}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Khôi phục mặc định
            </button>
          </div>
        </section>

        <aside className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-slate-900">Xem trước</h2>
          <BankQrPreview config={config} amount={formatCurrency(285000)} tableName="Bàn 05" />
          <div className="mt-5 rounded-md border border-sky-100 bg-sky-50 p-3 text-xs leading-5 text-sky-900">
            Khi thanh toán bằng chuyển khoản, nhân viên có thể đưa màn hình này cho khách quét trực tiếp.
          </div>
        </aside>
      </div>
    </div>
  );
}
