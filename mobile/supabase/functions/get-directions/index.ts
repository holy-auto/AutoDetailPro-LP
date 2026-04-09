// supabase/functions/get-directions/index.ts
// Edge Function: Proxy to Google Directions API
// Keeps API key server-side, called from client via supabase.functions.invoke()

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DirectionsRequest {
  origin: string;       // "lat,lng"
  destination: string;  // "lat,lng"
  mode?: string;        // driving, walking, etc.
  language?: string;    // ja
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const { origin, destination, mode = 'driving', language = 'ja' }: DirectionsRequest =
      await req.json();

    if (!origin || !destination) {
      return new Response(
        JSON.stringify({ error: 'origin and destination are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
    url.searchParams.set('origin', origin);
    url.searchParams.set('destination', destination);
    url.searchParams.set('mode', mode);
    url.searchParams.set('language', language);
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK') {
      return new Response(
        JSON.stringify({ error: `Directions API error: ${data.status}`, details: data.error_message }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
