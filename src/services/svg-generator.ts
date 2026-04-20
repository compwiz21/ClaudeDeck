import type { SessionStatus } from "../types/settings";

const STATUS_COLORS: Record<SessionStatus, { bg: string; dot: string }> = {
  idle: { bg: "#374151", dot: "#6B7280" },
  launching: { bg: "#4A3728", dot: "#F59E0B" },
  active: { bg: "#064E3B", dot: "#22C55E" },
  done: { bg: "#1E3A5F", dot: "#3B82F6" },
  error: { bg: "#7F1D1D", dot: "#EF4444" },
};

export function generateSessionSvg(
  name: string,
  status: SessionStatus,
  accentColor?: string
): string {
  const { bg, dot } = STATUS_COLORS[status];
  const label = name.length > 8 ? name.substring(0, 7) + "\u2026" : name;
  const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
  const accent = accentColor ?? bg;

  const svg = `<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
  <rect width="144" height="144" rx="16" fill="${bg}"/>
  <rect x="0" y="128" width="144" height="16" rx="0" fill="${accent}" opacity="0.6"/>
  <circle cx="122" cy="22" r="10" fill="${dot}"/>
  <text x="72" y="78" text-anchor="middle" fill="white"
        font-family="Arial, sans-serif" font-size="22" font-weight="bold">${label}</text>
  <text x="72" y="110" text-anchor="middle" fill="#9CA3AF"
        font-family="Arial, sans-serif" font-size="14">${statusLabel}</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function generateLaunchSvg(): string {
  const svg = `<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
  <rect width="144" height="144" rx="16" fill="#1E1B4B"/>
  <polygon points="52,36 52,108 112,72" fill="#A78BFA"/>
  <text x="72" y="136" text-anchor="middle" fill="#C4B5FD"
        font-family="Arial, sans-serif" font-size="12">Launch</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function generateKillSvg(): string {
  const svg = `<svg width="144" height="144" xmlns="http://www.w3.org/2000/svg">
  <rect width="144" height="144" rx="16" fill="#450A0A"/>
  <line x1="42" y1="42" x2="102" y2="102" stroke="#F87171" stroke-width="10" stroke-linecap="round"/>
  <line x1="102" y1="42" x2="42" y2="102" stroke="#F87171" stroke-width="10" stroke-linecap="round"/>
  <text x="72" y="136" text-anchor="middle" fill="#FCA5A5"
        font-family="Arial, sans-serif" font-size="12">Kill</text>
</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
