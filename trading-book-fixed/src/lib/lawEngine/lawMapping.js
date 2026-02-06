import { laws } from '../../data/laws.js';

const keywordFeatureRules = [
  { keys: ['كسر', 'Break'], feature: 'PrevBreakHL', reason: 'Keyword match to break highlight in indicator.' },
  { keys: ['داخل', 'Inside', 'تداخل'], feature: 'InsideHL', reason: 'Keyword match to inside/no-break highlight.' },
  { keys: ['ضعيف', 'Weak'], feature: 'Weak123', reason: 'Keyword match to weak 1-2-3 highlight.' },
  { keys: ['0.236', '0.382', '0.5', '0.618', '0.764', '1.236', '1.382', 'الذهبية', 'حد الأمان'], feature: 'fibGrid', reason: 'Ratio/zone keyword found; mapped to fib grid and bands.' },
  { keys: ['اتزان'], feature: 'unitHL', reason: 'Equilibrium concept in books is tied to unit HL + fib 0.236.' },
];

const hasAny = (text, keys) => keys.some((k) => text.includes(k));

export const buildLawIndicatorMap = () => {
  const map = {};
  laws.forEach((law) => {
    const recipeOverlays = Array.isArray(law?.chartRecipe?.overlays) ? law.chartRecipe.overlays : [];
    const text = `${law?.title || ''} ${law?.summary || ''} ${law?.details || ''} ${law?.chartRecipeSources || ''}`;
    const matched = keywordFeatureRules.filter((rule) => hasAny(text, rule.keys));

    if (recipeOverlays.length > 0) {
      map[law.id] = {
        mode: 'recipe_defined',
        attempts: 1,
        features: ['baseline', ...new Set(matched.map((m) => m.feature)), 'recipeOverlay'],
        reason: 'Direct chartRecipe exists in laws.js and is merged with baseline layer.',
        sourceRefs: ['BOOK_V3_COMBINED.md', 'Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md', 'indicator.txt'],
        todos: [],
      };
      return;
    }

    if (matched.length) {
      map[law.id] = {
        mode: 'keyword_mapped',
        attempts: 5,
        features: ['baseline', ...new Set(matched.map((m) => m.feature)), 'safeFallback'],
        reason: matched.map((m) => m.reason).join(' '),
        sourceRefs: ['BOOK_V3_COMBINED.md', 'Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md', 'indicator.txt'],
        todos: [],
      };
      return;
    }

    map[law.id] = {
      mode: 'UNKNOWN_MAPPING',
      attempts: 5,
      features: ['baseline', 'safeFallback'],
      reason: 'No unambiguous executable trigger found after 5-attempt pass across books and indicator; fallback applied to avoid misleading signal invention.',
      sourceRefs: ['BOOK_V3_COMBINED.md §Conflict Rules/Index', 'Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md §law references', 'indicator.txt HL/Fib sections'],
      todos: ['Add deterministic trigger once law-specific chart condition is explicitly documented in source text or indicator.'],
    };
  });
  return map;
};
