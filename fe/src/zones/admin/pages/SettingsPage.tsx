import { useState } from 'react';
import { CheckCircle2, Save, Settings, WalletCards } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/constants';

const PLAN_SETTINGS_KEY = 'bida.admin.planSettings';

const DEFAULT_PLAN_SETTINGS = {
  starterFee: 590000,
  businessFee: 990000,
  premiumFee: 1490000,
  billingBank: 'Vietcombank',
  billingAccount: '9999 8888 7777',
  billingName: 'BILLIARD SAAS ADMIN',
  reminderDays: 7,
};

type PlanSettings = typeof DEFAULT_PLAN_SETTINGS;

function loadSettings(): PlanSettings {
  const raw = localStorage.getItem(PLAN_SETTINGS_KEY);
  if (!raw) return DEFAULT_PLAN_SETTINGS;
  try {
    return { ...DEFAULT_PLAN_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PLAN_SETTINGS;
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<PlanSettings>(() => loadSettings());

  const updateSetting = (field: keyof typeof DEFAULT_PLAN_SETTINGS, value: string) => {
    const numberFields = ['starterFee', 'businessFee', 'premiumFee', 'reminderDays'];
    setSettings((current) => ({
      ...current,
      [field]: numberFields.includes(field) ? Number(value) : value,
    }));
  };

  const saveSettings = () => {
    localStorage.setItem(PLAN_SETTINGS_KEY, JSON.stringify(settings));
    toast.success('Đã lưu cấu hình admin');
  };

  const plans = [
    { name: 'Starter', fee: settings.starterFee, desc: 'Quán nhỏ, thao tác bàn và order cơ bản' },
    { name: 'Business', fee: settings.businessFee, desc: 'Quán vận hành hằng ngày, có báo cáo và QR' },
    { name: 'Premium', fee: settings.premiumFee, desc: 'Chuỗi cửa hàng, ưu tiên hỗ trợ và mở rộng' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Cấu hình Admin Portal</h1>
          <p className="mt-1 text-sm text-slate-500">Thiết lập gói dịch vụ, tài khoản nhận phí và nhắc gia hạn.</p>
        </div>
        <button
          type="button"
          onClick={saveSettings}
          className="flex h-10 items-center gap-2 rounded-md bg-sky-700 px-4 text-sm font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-800"
        >
          <Save className="h-4 w-4" />
          Lưu cấu hình
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <section key={plan.name} className="rounded-lg border border-sky-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">{plan.name}</h2>
              <CheckCircle2 className="h-5 w-5 text-sky-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-950">{formatCurrency(plan.fee)}</p>
            <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">{plan.desc}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-sky-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sky-50 text-sky-700">
              <Settings className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Giá gói dịch vụ</h2>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-3">
            {[
              ['starterFee', 'Starter'],
              ['businessFee', 'Business'],
              ['premiumFee', 'Premium'],
            ].map(([field, label]) => (
              <label key={field} className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <input
                  type="number"
                  value={settings[field as keyof typeof DEFAULT_PLAN_SETTINGS]}
                  onChange={(event) => updateSetting(field as keyof typeof DEFAULT_PLAN_SETTINGS, event.target.value)}
                  className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-sky-100 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
              <WalletCards className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Thanh toán phí dịch vụ</h2>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Ngân hàng</span>
              <input
                value={settings.billingBank}
                onChange={(event) => updateSetting('billingBank', event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Số tài khoản</span>
              <input
                value={settings.billingAccount}
                onChange={(event) => updateSetting('billingAccount', event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Chủ tài khoản</span>
              <input
                value={settings.billingName}
                onChange={(event) => updateSetting('billingName', event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm uppercase outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
            <label className="space-y-1.5">
              <span className="text-sm font-semibold text-slate-700">Nhắc trước hạn</span>
              <input
                type="number"
                value={settings.reminderDays}
                onChange={(event) => updateSetting('reminderDays', event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
