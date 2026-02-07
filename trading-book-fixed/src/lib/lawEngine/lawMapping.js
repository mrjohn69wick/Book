import { laws } from '../../data/laws.js';

const keywordFeatureRules = [
  { keys: ['كسر', 'Break'], feature: 'PrevBreakHL', indicatorPointer: 'indicator.txt: enablePrevBreakHL', bookPointer: 'BOOK_V3_COMBINED.md: تداخل/كسر' },
  { keys: ['داخل', 'Inside', 'تداخل'], feature: 'InsideHL', indicatorPointer: 'indicator.txt: enablePrevInsideHL', bookPointer: 'BOOK_V3_COMBINED.md: قانون التداخل' },
  { keys: ['ضعيف', 'Weak'], feature: 'Weak123', indicatorPointer: 'indicator.txt: enablePrevWeak123HL', bookPointer: 'Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md: weak wording' },
  { keys: ['0.236', '0.382', '0.5', '0.618', '0.764', '1.236', '1.382', 'الذهبية', 'حد الأمان', 'اتزان'], feature: 'fibGrid', indicatorPointer: 'indicator.txt: baseDefault + fillBand', bookPointer: 'BOOK_V3_COMBINED.md: 0.236/zone sections' },
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
        mode: 'ATTEMPT_A_RECIPE',
        attempts: 1,
        features: ['baseline', ...new Set(matched.map((m) => m.feature)), 'recipeOverlay', `lawSpecific:${law.id}`],
        reason: 'Attempt A: direct recipe mapping exists; merged with indicator baseline and law-specific geometry.',
        references: {
          books: ['BOOK_V3_COMBINED.md', 'Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md'],
          indicator: ['indicator.txt: HL/Fib/Fill blocks'],
          pointers: matched.map((m) => ({ book: m.bookPointer, indicator: m.indicatorPointer })),
        },
      };
      return;
    }

    if (matched.length) {
      map[law.id] = {
        mode: 'ATTEMPT_B_INDICATOR_FEATURE',
        attempts: 2,
        features: ['baseline', ...new Set(matched.map((m) => m.feature)), `lawSpecific:${law.id}`],
        reason: 'Attempt B: mapped to indicator features by keyword semantics; no invented signal trigger added.',
        references: {
          books: ['BOOK_V3_COMBINED.md', 'Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md'],
          indicator: ['indicator.txt'],
          pointers: matched.map((m) => ({ book: m.bookPointer, indicator: m.indicatorPointer })),
        },
      };
      return;
    }

    const categoryFeature = law?.category === 'المؤشر' ? 'fibGrid' : law?.category === 'المدرسة الكونية' ? 'BothSidesBreak' : law?.category === 'الذكاء الاصطناعي' ? 'InsideShortHL' : 'unitHL';
    map[law.id] = {
      mode: 'ATTEMPT_C_CATEGORY_HEURISTIC',
      attempts: 3,
      features: ['baseline', categoryFeature, `lawSpecific:${law.id}`],
      reason: 'Attempt C: category-driven mapping to closest indicator feature family without inventing trade signal conditions.',
      references: {
        books: ['BOOK_V3_COMBINED.md (category/law framing)', 'Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md (category context)'],
        indicator: ['indicator.txt feature toggles by behavior family'],
        pointers: [],
      },
    };
  });
  return map;
};
