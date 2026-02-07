export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isTimeSeries = url.pathname.endsWith('/time_series');
    const isSearch = url.pathname.endsWith('/symbol_search');

    if (!isTimeSeries && !isSearch) {
      return new Response('Not found', { status: 404, headers: corsHeaders() });
    }

    const target = new URL(`https://api.twelvedata.com/${isTimeSeries ? 'time_series' : 'symbol_search'}`);
    url.searchParams.forEach((value, key) => target.searchParams.set(key, value));
    target.searchParams.set('apikey', env.TWELVE_KEY || '');

    const cacheKey = new Request(target.toString(), { method: 'GET' });
    const cache = caches.default;
    const cached = await cache.match(cacheKey);
    if (cached) return withCors(cached);

    const response = await fetch(target.toString());
    const headers = new Headers(response.headers);
    headers.set('Cache-Control', 'public, max-age=30');
    const proxied = new Response(response.body, { status: response.status, headers });
    await cache.put(cacheKey, proxied.clone());
    return withCors(proxied);
  },
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };
}

function withCors(response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders()).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, { status: response.status, headers });
}
