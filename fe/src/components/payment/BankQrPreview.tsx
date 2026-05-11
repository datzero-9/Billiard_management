export type BankQrConfig = {
  bankName: string;
  accountNumber: string;
  accountName: string;
  contentTemplate: string;
  enabled: boolean;
};

export const PAYMENT_QR_STORAGE_KEY = 'bida.paymentQrConfig';

export const DEFAULT_BANK_QR_CONFIG: BankQrConfig = {
  bankName: 'MB Bank',
  accountNumber: '0123456789',
  accountName: 'CONG TY BILLIARD PRO',
  contentTemplate: 'BIDA-{table}-{amount}',
  enabled: true,
};

export function getStoredPaymentQrConfig(): BankQrConfig {
  if (typeof window === 'undefined') return DEFAULT_BANK_QR_CONFIG;
  const raw = window.localStorage.getItem(PAYMENT_QR_STORAGE_KEY);
  if (!raw) return DEFAULT_BANK_QR_CONFIG;

  try {
    return { ...DEFAULT_BANK_QR_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_BANK_QR_CONFIG;
  }
}

function hashText(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function isFinder(row: number, col: number) {
  const inTopLeft = row < 7 && col < 7;
  const inTopRight = row < 7 && col > 13;
  const inBottomLeft = row > 13 && col < 7;
  if (!inTopLeft && !inTopRight && !inBottomLeft) return null;

  const localRow = row > 13 ? row - 14 : row;
  const localCol = col > 13 ? col - 14 : col;
  const border = localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6;
  const center = localRow >= 2 && localRow <= 4 && localCol >= 2 && localCol <= 4;
  return border || center;
}

export function PseudoQr({ seed, compact = false }: { seed: string; compact?: boolean }) {
  const base = hashText(seed || 'bida-manager');
  const cells = Array.from({ length: 21 * 21 }).map((_, index) => {
    const row = Math.floor(index / 21);
    const col = index % 21;
    const finder = isFinder(row, col);
    if (finder !== null) return finder;
    return ((base + row * 13 + col * 17 + row * col * 7) % 5) <= 1;
  });

  return (
    <div
      className={`grid grid-cols-[repeat(21,minmax(0,1fr))] gap-px border border-slate-200 bg-white p-2 ${
        compact ? 'h-32 w-32' : 'h-48 w-48'
      }`}
      aria-label="QR chuyển khoản"
    >
      {cells.map((active, index) => (
        <span key={index} className={active ? 'bg-sky-950' : 'bg-white'} />
      ))}
    </div>
  );
}

export function BankQrPreview({
  config,
  amount,
  tableName,
  compact = false,
}: {
  config: BankQrConfig;
  amount?: string;
  tableName?: string;
  compact?: boolean;
}) {
  const transferContent = config.contentTemplate
    .replace('{table}', tableName || 'BAN')
    .replace('{amount}', amount || '0');
  const seed = `${config.bankName}|${config.accountNumber}|${config.accountName}|${transferContent}`;

  return (
    <div className="flex flex-col items-center gap-3">
      <PseudoQr seed={seed} compact={compact} />
      <div className="w-full space-y-1 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-800">{config.bankName}</p>
        <p>{config.accountNumber}</p>
        <p className="font-medium uppercase text-slate-700">{config.accountName}</p>
        <p className="font-mono text-[11px] text-sky-700">{transferContent}</p>
      </div>
    </div>
  );
}
