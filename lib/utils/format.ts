// Format price in Nigerian Naira
export function formatPrice(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000_000)
      return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
    if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format rent duration label
export function formatRentDuration(duration: string | null): string {
  if (!duration) return "";
  return duration === "YEAR" ? "/ year" : "/ month";
}

// Relative time (e.g. "2 days ago")
export function timeAgo(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;

  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + "...";
}

// Build URL query string from filters object
export function buildQueryString(
  params: Record<string, string | number | undefined | null>,
): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });
  return query.toString();
}
