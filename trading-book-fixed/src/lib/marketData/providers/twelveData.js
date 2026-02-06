const BASE_URL = 'https://api.twelvedata.com/time_series';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseTimestamp = (datetime) => {
  if (!datetime) return null;
  const epoch = Date.parse(`${datetime}Z`);
  if (Number.isNaN(epoch)) return null;
  return Math.floor(epoch / 1000);
};

const parseBars = (values = []) =>
  values
    .map((item) => {
      const time = parseTimestamp(item.datetime);
      const open = Number(item.open);
      const high = Number(item.high);
      const low = Number(item.low);
      const close = Number(item.close);
      if (![time, open, high, low, close].every(Number.isFinite)) {
        return null;
      }
      return { time, open, high, low, close };
    })
    .filter(Boolean)
    .sort((a, b) => a.time - b.time);

export const fetchTwelveData = async ({ symbol, interval, limit, apiKey }) => {
  const url = new URL(BASE_URL);
  url.searchParams.set('symbol', symbol);
  url.searchParams.set('interval', interval);
  url.searchParams.set('outputsize', String(limit));
  url.searchParams.set('timezone', 'UTC');
  url.searchParams.set('apikey', apiKey);

  const response = await fetch(url.toString());
  if (response.status === 429) {
    const error = new Error('RATE_LIMIT');
    error.status = 429;
    throw error;
  }
  if (!response.ok) {
    throw new Error(`HTTP_${response.status}`);
  }

  const payload = await response.json();
  if (payload.status === 'error') {
    throw new Error(payload.message || 'API_ERROR');
  }

  const bars = parseBars(payload.values || []);
  return {
    bars,
    meta: payload.meta || {},
  };
};

export const fetchWithBackoff = async (args, retries = 3) => {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await fetchTwelveData(args);
    } catch (error) {
      if (error.status === 429 && attempt < retries) {
        const delay = 500 * 2 ** attempt;
        await sleep(delay);
        attempt += 1;
        continue;
      }
      throw error;
    }
  }
  throw new Error('RATE_LIMIT');
};
