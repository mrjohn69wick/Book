export const resolveRecipeValue = (expr, context = {}) => {
  if (typeof expr === 'number') {
    return expr;
  }

  if (typeof expr !== 'string') {
    return expr;
  }

  const trimmed = expr.trim();
  const ratioMatch = trimmed.match(/^ratio\(\s*([0-9]*\.?[0-9]+)\s*\)$/i);

  if (ratioMatch) {
    const ratio = Number(ratioMatch[1]);
    const { low, high } = context;

    if (Number.isFinite(low) && Number.isFinite(high)) {
      return low + (high - low) * ratio;
    }
  }

  return trimmed;
};
