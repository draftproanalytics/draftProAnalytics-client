import { api } from '@/services/api';
import type { ViewerLocation } from '@/util/schedule/gameMarket';

interface PublicIpResponse {
  readonly ip?: unknown;
}

const normalizePublicIp = (value: unknown): string | null =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

const PUBLIC_IP_PROVIDERS = [
  'https://api64.ipify.org?format=json',
  'https://api.ipify.org?format=json',
] as const;

const unavailableLocation = (): ViewerLocation => ({
  available: false,
  city: null,
  region: null,
  regionCode: null,
  countryCode: null,
  latitude: null,
  longitude: null,
  timezone: null,
});

async function fetchPublicIp(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3000);

  try {
    console.info('[UpcomingGames:Market] public IP lookup start', { url });
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('[UpcomingGames:Market] public IP lookup HTTP failure', {
        url,
        status: response.status,
      });
      return null;
    }

    const data = (await response.json()) as PublicIpResponse;
    const publicIp = normalizePublicIp(data.ip);
    console.info('[UpcomingGames:Market] public IP lookup result', {
      url,
      succeeded: publicIp !== null,
      publicIp,
    });
    return publicIp;
  } catch (error: unknown) {
    console.warn('[UpcomingGames:Market] public IP lookup failed', {
      url,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function getBrowserPublicIp(): Promise<string | null> {
  for (const provider of PUBLIC_IP_PROVIDERS) {
    const publicIp = await fetchPublicIp(provider);
    if (publicIp) return publicIp;
  }
  return null;
}

async function getBrowserGeolocation(): Promise<ViewerLocation> {
  if (!('geolocation' in navigator)) {
    console.warn('[UpcomingGames:Market] browser geolocation unavailable');
    return unavailableLocation();
  }

  console.info('[UpcomingGames:Market] browser geolocation fallback start');

  return new Promise<ViewerLocation>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: ViewerLocation = {
          available: true,
          city: null,
          region: null,
          regionCode: null,
          countryCode: null,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
        };
        console.info('[UpcomingGames:Market] browser geolocation fallback result', {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracyMeters: position.coords.accuracy,
        });
        resolve(location);
      },
      (error) => {
        console.warn('[UpcomingGames:Market] browser geolocation fallback failed', {
          code: error.code,
          message: error.message,
        });
        resolve(unavailableLocation());
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 10 * 60 * 1000,
      },
    );
  });
}

export async function getViewerLocation(): Promise<ViewerLocation> {
  console.info('[UpcomingGames:Market] initialization started');

  const browserPublicIp = await getBrowserPublicIp();
  console.info('[UpcomingGames:Market] browser public IP resolution complete', {
    succeeded: browserPublicIp !== null,
    publicIp: browserPublicIp,
  });

  const config = browserPublicIp ? { params: { ip: browserPublicIp } } : undefined;
  console.info('[UpcomingGames:Market] requesting DPA viewing market', {
    explicitPublicIp: browserPublicIp,
  });

  try {
    const { data } = await api.get<ViewerLocation>('/schedules/viewingMarket', config);
    console.info('[UpcomingGames:Market] viewer location response', data);

    if (data.available && data.latitude !== null && data.longitude !== null) {
      return data;
    }

    console.warn('[UpcomingGames:Market] IP market unavailable; trying browser geolocation', data);
  } catch (error: unknown) {
    console.warn('[UpcomingGames:Market] DPA viewing market request failed; trying browser geolocation', {
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return getBrowserGeolocation();
}
