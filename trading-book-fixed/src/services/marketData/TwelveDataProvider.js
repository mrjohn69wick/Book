const BASE_URL = 'https://api.twelvedata.com/time_series';
const SEARCH_URL = 'https://api.twelvedata.com/symbol_search';

const memoryCache = new Map();
const MAX_OUTPUT = 5000;
const CACHE_PREFIX = 'tb:md:twelvedata:';
const CACHE_TTL_MS = 30 * 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseTime = (value) => {
  if (!value) return null;
  const epoch = Date.parse(`${value}Z`);
  return Number.isNaN(epoch) ? null : Math.floor(epoch / 1000);
};

const normalizeBars = (values = []) =>
  values
    .map((item) => {
      const time = parseTime(item.datetime);
      const open = Number(item.open);
      const high = Number(item.high);
      const low = Number(item.low);
      const close = Number(item.close);
      if (![time, open, high, low, close].every(Number.isFinite)) return null;
      return { time, open, high, low, close };
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time);

const getCache = (cacheKey) => {
  const inMemory = memoryCache.get(cacheKey);
  if (inMemory && Date.now() - inMemory.timestamp < CACHE_TTL_MS) {
    return inMemory;
  }

  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${cacheKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.bars?.length || Date.now() - parsed.timestamp >= CACHE_TTL_MS) return null;
    memoryCache.set(cacheKey, parsed);
    return parsed;
  } catch {
    return null;
  }
};

const setCache = (cacheKey, payload) => {
  memoryCache.set(cacheKey, payload);
  try {
    localStorage.setItem(`${CACHE_PREFIX}${cacheKey}`, JSON.stringify(payload));
  } catch {
    // no-op
  }
};

const fetchWithBackoff = async (url, retries = 3) => {
  let attempt = 0;
  while (attempt <= retries) {
    const response = await fetch(url);
    if (response.status === 429 && attempt < retries) {
      await sleep(500 * 2 ** attempt);
      attempt += 1;
      continue;
    }
    return response;
  }
  return fetch(url);
};

const fetchSeries = async ({ symbol, interval, outputsize, apiKey }) => {
  const url = new URL(BASE_URL);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', interval);
  url.searchParams.set('outputsize', String(Math.min(outputsize, MAX_OUTPUT)));
  url.searchParams.set('timezone', 'UTC');
  url.searchParams.set('apikey', apiKey);

  const response = await fetchWithBackoff(url.toString());
  if (response.status === 429) {
    const error = new Error('RATE_LIMIT');
    error.status = 429;
    throw error;
  }
  const payload = await response.json();
  if (!response.ok || payload?.status === 'error') {
    const error = new Error(payload?.message || `HTTP_${response.status}`);
    error.status = response.status;
    throw error;
  }

  return {
    bars: normalizeBars(payload.values || []),
    meta: payload.meta || {},
  };
};

const searchSymbol = async ({ keyword, apiKey }) => {
  const url = new URL(SEARCH_URL);
  url.searchParams.set('symbol', keyword);
  url.searchParams.set('apikey', apiKey);
  const response = await fetchWithBackoff(url.toString(), 1);
  const payload = await response.json();
  if (!Array.isArray(payload?.data)) return [];
  return payload.data;
};

export const createTwelveDataProvider = () => ({
  id: 'twelvedata',
  supports(symbol) {
    return !symbol.endsWith('USDT');
  },
  async fetchCandles({ symbol, interval, limit, apiKey }) {
    if (!apiKey) {
      throw new Error('MISSING_API_KEY');
    }

    const cacheKey = `${symbol}:${interval}:${limit}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return { bars: cached.bars, provider: 'twelvedata', fromCache: true };
    }

    try {
      const result = await fetchSeries({ symbol, interval, outputsize: limit, apiKey });
      setCache(cacheKey, { bars: result.bars, timestamp: Date.now() });
      return { ...result, provider: 'twelvedata' };
    } catch (error) {
      const discovered = await searchSymbol({ keyword: symbol, apiKey });
      const match = discovered.find((item) => item.symbol);
      if (match?.symbol && match.symbol !== symbol) {
        const result = await fetchSeries({ symbol: match.symbol, interval, outputsize: limit, apiKey });
        setCache(cacheKey, { bars: result.bars, timestamp: Date.now() });
        return { ...result, provider: 'twelvedata', resolvedSymbol: match.symbol, discovered };
      }
      error.discovered = discovered;
      throw error;
    }
  },
});
