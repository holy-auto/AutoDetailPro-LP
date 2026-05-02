// supabase/functions/check-weather/index.ts
// Edge Function: Weather lookup via Open-Meteo (key-free, lat/lng based).
// Called from the client via supabase.functions.invoke().

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherRequest {
  lat: number;
  lng: number;
  type: 'current' | 'forecast';
}

interface ParsedWeather {
  temp: number;
  condition: string;
  rain_mm: number;
  description: string;
  icon: string;
}

interface ForecastEntry extends ParsedWeather {
  datetime: string;
}

// WMO weather codes → (condition keyword, Japanese description).
// The condition keyword is what `getWeatherIcon()` on the client matches against,
// so it must contain words like "rain", "snow", "clear", "cloud", etc.
function decodeWeatherCode(code: number): { condition: string; description: string } {
  if (code === 0) return { condition: 'Clear', description: '快晴' };
  if (code === 1) return { condition: 'Clear', description: '晴れ' };
  if (code === 2) return { condition: 'Clouds scattered', description: '晴れ時々曇り' };
  if (code === 3) return { condition: 'Clouds', description: '曇り' };
  if (code === 45 || code === 48) return { condition: 'Fog', description: '霧' };
  if (code >= 51 && code <= 57) return { condition: 'Drizzle', description: '霧雨' };
  if (code >= 61 && code <= 67) return { condition: 'Rain', description: '雨' };
  if (code >= 71 && code <= 77) return { condition: 'Snow', description: '雪' };
  if (code >= 80 && code <= 82) return { condition: 'Rain', description: 'にわか雨' };
  if (code === 85 || code === 86) return { condition: 'Snow', description: 'にわか雪' };
  if (code === 95) return { condition: 'Thunderstorm', description: '雷雨' };
  if (code === 96 || code === 99) return { condition: 'Thunderstorm', description: '雷雨（ひょう）' };
  return { condition: 'Unknown', description: '不明' };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { lat, lng, type = 'current' }: WeatherRequest = await req.json();

    if (lat == null || lng == null) {
      return jsonResponse({ error: 'lat and lng are required' }, 400);
    }

    // ----- Current weather -----
    if (type === 'current') {
      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.searchParams.set('latitude', String(lat));
      url.searchParams.set('longitude', String(lng));
      url.searchParams.set('current', 'temperature_2m,weather_code,rain,precipitation');
      url.searchParams.set('timezone', 'auto');

      const response = await fetch(url.toString());
      if (!response.ok) {
        return jsonResponse({ error: `Open-Meteo error: ${response.status}` }, 502);
      }
      const data = await response.json();
      const current = data.current ?? {};
      const code = Number(current.weather_code ?? -1);
      const { condition, description } = decodeWeatherCode(code);

      const parsed: ParsedWeather = {
        temp: Number(current.temperature_2m ?? 0),
        condition,
        rain_mm: Number(current.rain ?? current.precipitation ?? 0),
        description,
        icon: String(code),
      };

      return jsonResponse(parsed);
    }

    // ----- Hourly forecast (next ~48 h) -----
    if (type === 'forecast') {
      const url = new URL('https://api.open-meteo.com/v1/forecast');
      url.searchParams.set('latitude', String(lat));
      url.searchParams.set('longitude', String(lng));
      url.searchParams.set('hourly', 'temperature_2m,weather_code,rain,precipitation');
      url.searchParams.set('forecast_days', '2');
      url.searchParams.set('timezone', 'auto');

      const response = await fetch(url.toString());
      if (!response.ok) {
        return jsonResponse({ error: `Open-Meteo error: ${response.status}` }, 502);
      }
      const data = await response.json();
      const hourly = data.hourly ?? {};
      const times: string[] = hourly.time ?? [];
      const temps: number[] = hourly.temperature_2m ?? [];
      const codes: number[] = hourly.weather_code ?? [];
      const rains: number[] = hourly.rain ?? [];
      const precips: number[] = hourly.precipitation ?? [];

      const forecast: ForecastEntry[] = times.map((time, i) => {
        const code = Number(codes[i] ?? -1);
        const { condition, description } = decodeWeatherCode(code);
        return {
          datetime: time,
          temp: Number(temps[i] ?? 0),
          condition,
          rain_mm: Number(rains[i] ?? precips[i] ?? 0),
          description,
          icon: String(code),
        };
      });

      return jsonResponse({ forecast });
    }

    return jsonResponse({ error: 'Invalid type. Use "current" or "forecast".' }, 400);
  } catch (err) {
    return jsonResponse({ error: (err as Error).message }, 500);
  }
});
