export type RiskLevel = "low" | "moderate" | "high" | "very-high" | "extreme" | "unknown";

export function getRiskLevel(uv: number | null | undefined): RiskLevel {
  if (uv == null || Number.isNaN(uv)) return "unknown";
  if (uv < 3) return "low";
  if (uv < 6) return "moderate";
  if (uv < 8) return "high";
  if (uv < 11) return "very-high";
  return "extreme";
}

export const RISK_LABEL: Record<RiskLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  "very-high": "Very High",
  extreme: "Extreme",
  unknown: "Unknown",
};

export const RISK_TIPS: Record<RiskLevel, string[]> = {
  low: [
    "Enjoy the outdoors safely — minimal protection required.",
    "Wear sunglasses on bright days, especially near water or snow.",
    "Apply SPF 30+ if outside for over an hour.",
  ],
  moderate: [
    "Seek shade during midday hours (10am–4pm).",
    "Wear SPF 30+ sunscreen, reapply every 2 hours.",
    "Cover up with a wide-brimmed hat and UV-blocking sunglasses.",
  ],
  high: [
    "Reduce time in the sun between 10am and 4pm.",
    "Use SPF 50+ generously, reapply after swimming or sweating.",
    "Wear protective clothing, hat, and UV400 sunglasses.",
  ],
  "very-high": [
    "Minimize sun exposure — unprotected skin can burn quickly.",
    "SPF 50+ is essential. Reapply every 90 minutes.",
    "Stay in shade, wear long sleeves, and avoid direct midday sun.",
  ],
  extreme: [
    "Avoid being outside during midday if possible.",
    "Take all precautions: SPF 50+, hat, sunglasses, long sleeves.",
    "Even brief exposure can cause damage — seek full shade.",
  ],
  unknown: [
    "Allow location access to see your real-time UV index.",
    "Daily UV protection helps prevent long-term skin damage.",
    "SPF 30+ is recommended for everyday outdoor activity.",
  ],
};

export interface UVData {
  uv: number;
  uvMax: number;
  city: string;
  lat: number;
  lon: number;
  fetchedAt: string;
}

export async function fetchCity(lat: number, lon: number): Promise<string> {
  try {
    const r = await fetch(
      `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&language=en&format=json`
    );
    const j = await r.json();
    const place = j?.results?.[0];
    if (place) return [place.name, place.country_code].filter(Boolean).join(", ");
  } catch {}
  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
}

export async function fetchUV(lat: number, lon: number): Promise<UVData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index&daily=uv_index_max&timezone=auto`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("Failed to fetch UV data");
  const j = await r.json();
  const uv = j?.current?.uv_index ?? 0;
  const uvMax = j?.daily?.uv_index_max?.[0] ?? uv;
  const city = await fetchCity(lat, lon);
  return { uv, uvMax, city, lat, lon, fetchedAt: new Date().toISOString() };
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}