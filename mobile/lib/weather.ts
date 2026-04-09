import { supabase } from './supabase';
import { WEATHER } from '@/constants/business-rules';

// =============================================
// Weather Integration
// =============================================

type ApiResult<T = undefined> = {
  success: boolean;
  data?: T;
  error?: string;
};

export interface WeatherData {
  temp: number;
  condition: string;
  rain_mm: number;
  description: string;
  icon: string;
}

export interface ForecastEntry extends WeatherData {
  datetime: string;
}

/**
 * Check current weather at the given coordinates.
 * Proxies through the `check-weather` Edge Function so API keys stay server-side.
 */
export async function checkWeather(
  lat: number,
  lng: number,
): Promise<ApiResult<WeatherData>> {
  try {
    const { data, error } = await supabase.functions.invoke('check-weather', {
      body: { lat, lng, type: 'current' },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as WeatherData };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Determine whether we should suggest cancellation due to rain.
 * Returns true with a suggestion message when rain_mm >= RAIN_THRESHOLD_MM.
 */
export async function shouldSuggestCancel(
  lat: number,
  lng: number,
): Promise<ApiResult<{ shouldCancel: boolean; message: string }>> {
  try {
    const result = await checkWeather(lat, lng);

    if (!result.success || !result.data) {
      return { success: false, error: result.error ?? 'Failed to fetch weather' };
    }

    const { rain_mm, description } = result.data;
    const shouldCancel = rain_mm >= WEATHER.RAIN_THRESHOLD_MM;

    const message = shouldCancel
      ? `現在の天気: ${description}（降水量 ${rain_mm}mm）。雨天のため、日程変更またはキャンセルをおすすめします。`
      : `現在の天気: ${description}。洗車に適した天候です。`;

    return { success: true, data: { shouldCancel, message } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Get a weather forecast for the next N hours.
 * The Edge Function returns 3-hour interval entries from the OpenWeatherMap
 * forecast endpoint; we filter to the requested window.
 */
export async function getWeatherForecast(
  lat: number,
  lng: number,
  hours: number,
): Promise<ApiResult<ForecastEntry[]>> {
  try {
    const { data, error } = await supabase.functions.invoke('check-weather', {
      body: { lat, lng, type: 'forecast' },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    const entries = (data as { forecast: ForecastEntry[] })?.forecast ?? [];

    // Keep only entries within the requested hour window
    const cutoff = new Date(Date.now() + hours * 60 * 60 * 1000);
    const filtered = entries.filter(
      (entry) => new Date(entry.datetime) <= cutoff,
    );

    return { success: true, data: filtered };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Check weather ahead of a scheduled booking.
 * Looks at the forecast ADVANCE_CHECK_HOURS (3 h) before the booking time and
 * returns a warning if rain is expected during the booking window.
 */
export async function checkUpcomingBookingWeather(
  bookingDate: string,
  bookingTime: string,
  lat: number,
  lng: number,
): Promise<ApiResult<{ warning: boolean; message: string }>> {
  try {
    // Parse booking datetime
    const bookingDateTime = new Date(`${bookingDate}T${bookingTime}`);
    const now = new Date();

    // Only check within the advance window
    const checkStart = new Date(
      bookingDateTime.getTime() - WEATHER.ADVANCE_CHECK_HOURS * 60 * 60 * 1000,
    );

    if (now < checkStart) {
      return {
        success: true,
        data: {
          warning: false,
          message: '天気チェックは予約の3時間前から行います。',
        },
      };
    }

    // Fetch forecast covering the booking hour
    const hoursUntilBooking = Math.max(
      1,
      Math.ceil((bookingDateTime.getTime() - now.getTime()) / (60 * 60 * 1000)),
    );
    const result = await getWeatherForecast(lat, lng, hoursUntilBooking);

    if (!result.success || !result.data) {
      return { success: false, error: result.error ?? 'Failed to fetch forecast' };
    }

    // Check if any forecast entry in the window has rain
    const rainExpected = result.data.some(
      (entry) => entry.rain_mm >= WEATHER.RAIN_THRESHOLD_MM,
    );

    const message = rainExpected
      ? `予約時間帯に雨が予想されています。日程変更またはキャンセルをご検討ください。`
      : `予約時間帯の天気は良好です。`;

    return { success: true, data: { warning: rainExpected, message } };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Map a weather condition string to an Ionicons icon name.
 */
export function getWeatherIcon(condition: string): string {
  const lower = condition.toLowerCase();

  if (lower.includes('thunder') || lower.includes('storm')) return 'thunderstorm';
  if (lower.includes('drizzle')) return 'rainy-outline';
  if (lower.includes('rain')) return 'rainy';
  if (lower.includes('snow')) return 'snow';
  if (lower.includes('mist') || lower.includes('fog') || lower.includes('haze')) return 'cloud-outline';
  if (lower.includes('clear') || lower.includes('sunny')) return 'sunny';
  if (lower.includes('cloud') && lower.includes('scatter')) return 'partly-sunny';
  if (lower.includes('cloud')) return 'cloudy';

  return 'partly-sunny';
}
