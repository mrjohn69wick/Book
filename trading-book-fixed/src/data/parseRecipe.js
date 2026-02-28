const INPUT_EXPR_RE = /^input\(\s*([a-zA-Z0-9_]+)\s*\)$/i;
const RATIO_EXPR_RE = /^ratio\(\s*([0-9]*\.?[0-9]+)\s*\)$/i;

const readInputValue = (raw) => {
  if (raw == null) return undefined;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'object') {
    if (Number.isFinite(raw.price)) return raw.price;
    if (Number.isFinite(raw.value)) return raw.value;
  }
  if (typeof raw === 'string') {
    const normalized = raw.trim().toLowerCase();
    if (normalized === 'buy' || normalized === 'long' || normalized === 'bullish') return 'buy';
    if (normalized === 'sell' || normalized === 'short' || normalized === 'bearish') return 'sell';
    const n = Number(normalized);
    if (Number.isFinite(n)) return n;
    return raw;
  }
  return raw;
};

export const resolveRecipeValue = (expr, context = {}) => {
  if (typeof expr === 'number') {
    return expr;
  }

  if (typeof expr !== 'string') {
    return expr;
  }

  const trimmed = expr.trim();
  const inputMatch = trimmed.match(INPUT_EXPR_RE);
  if (inputMatch) {
    const inputName = inputMatch[1];
    const direct = readInputValue(context?.inputs?.[inputName]);
    if (direct !== undefined) return direct;
    const fallback = readInputValue(context?.defaults?.[inputName]);
    return fallback !== undefined ? fallback : null;
  }

  const ratioMatch = trimmed.match(RATIO_EXPR_RE);
  if (ratioMatch) {
    const ratio = Number(ratioMatch[1]);
    const { low, high } = context;

    if (Number.isFinite(low) && Number.isFinite(high)) {
      return low + (high - low) * ratio;
    }
    return null;
  }

  return trimmed;
};
