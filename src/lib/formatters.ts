const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
const compact = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
const integerBR = new Intl.NumberFormat('pt-BR');

export function formatBRL(value: number): string {
  if (!isFinite(value)) return 'R$ 0,00';
  return brl.format(value);
}

export function formatInt(value: number): string {
  if (!isFinite(value)) return '0';
  return integerBR.format(Math.round(value));
}

export function formatCompactNumber(value: number): string {
  if (!isFinite(value)) return '0';
  return compact.format(value);
}

export function formatPct(value: number, digits = 1): string {
  if (!isFinite(value)) return '0%';
  return `${value.toFixed(digits).replace('.', ',')}%`;
}

export function formatRate(rate: number, digits = 0): string {
  if (!isFinite(rate)) return '0%';
  return `${(rate * 100).toFixed(digits).replace('.', ',')}%`;
}

export function formatDelta(value: number): string {
  if (!isFinite(value) || value === 0) return '0%';
  const arrow = value > 0 ? '↑' : '↓';
  return `${arrow} ${Math.abs(value).toFixed(1).replace('.', ',')}%`;
}

export function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || seconds <= 0) return '0s';
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s > 0 ? `${m}min ${s}s` : `${m}min`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (isNaN(then)) return '—';
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return `há ${Math.floor(diff / 86400)} dias`;
}

export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 4) return '****';
  const ddd = digits.length >= 10 ? digits.slice(0, 2) : '00';
  return `(${ddd}) ****-${digits.slice(-4)}`;
}

export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes('@')) return '—';
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}${'*'.repeat(Math.max(1, local.length - 2))}${local.slice(-1)}@${domain}`;
}
