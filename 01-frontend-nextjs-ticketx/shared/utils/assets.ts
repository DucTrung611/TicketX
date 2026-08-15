const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:6060/api/v1';
const API_ORIGIN = API_URL.replace(/\/api\/v\d+\/?$/, '');

export function getApiOrigin(): string {
  return API_ORIGIN;
}

export function toAssetUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_ORIGIN}${path}`;
}
