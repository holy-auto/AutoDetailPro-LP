// supabase/functions/check-weather/index.ts
// Edge Function: Proxy to OpenWeatherMap API
// Keeps API key server-side, called from client via supabase.functions.invoke()

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('OPENWEATHER_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenWeatherMap API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { lat, lng, type = 'current' }: WeatherRequest = await req.json();

    if (lat == null || lng == null) {
      return new Response(
        JSON.stringify({ error: 'lat and lng are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ----- Current weather -----
    if (type === 'current') {
      const url = new URL('https://api.openweathermap.org/data/2.5/weather');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lng));
      url.searchParams.set('units', 'metric');
      url.searchParams.set('lang', 'ja');
      url.searchParams.set('appid', apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.cod && Number(data.cod) !== 200) {
        return new Response(
          JSON.stringify({ error: `OpenWeatherMap error: ${data.message ?? data.cod}` }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const parsed: ParsedWeather = {
        temp: data.main?.temp ?? 0,
        condition: data.weather?.[0]?.main ?? 'Unknown',
        rain_mm: data.rain?.['1h'] ?? data.rain?.['3h'] ?? 0,
        description: data.weather?.[0]?.description ?? '',
        icon: data.weather?.[0]?.icon ?? '',
      };

      return new Response(
        JSON.stringify(parsed),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // ----- Forecast -----
    if (type === 'forecast') {
      const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
      url.searchParams.set('lat', String(lat));
      url.searchParams.set('lon', String(lng));
      url.searchParams.set('units', 'metric');
      url.searchParams.set('lang', 'ja');
      url.searchParams.set('appid', apiKey);

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.cod && String(data.cod) !== '200') {
        return new Response(
          JSON.stringify({ error: `OpenWeatherMap error: ${data.message ?? data.cod}` }),
          { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }

      const forecast: ForecastEntry[] = (data.list ?? []).map(
        (entry: Record<string, unknown>) => {
          const weather = (entry.weather as Record<string, unknown>[])?.[0] ?? {};
          const main = entry.main as Record<string, unknown>;
          const rain = entry.rain as Record<string, unknown> | undefined;

          return {
            datetime: entry.dt_txt as string,
            temp: (main?.temp as number) ?? 0,
            condition: (weather.main as string) ?? 'Unknown',
            rain_mm: (rain?.['3h'] as number) ?? 0,
            description: (weather.description as string) ?? '',
            icon: (weather.icon as string) ?? '',
          };
        },
      );

      return new Response(
        JSON.stringify({ forecast }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid type. Use "current" or "forecast".' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
