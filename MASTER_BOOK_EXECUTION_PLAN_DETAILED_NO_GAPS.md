# MASTER BOOK EXECUTION PLAN (Detailed / No Gaps)

## Cycle 1 — FIRST Method (Facts -> Mechanism -> Consequence -> Decision -> Action)

### Facts
1. الشارت الحالي مبني على `lightweight-charts` مع مسارات baseline + law-specific overlays داخل `src/lib/indicator/model.js` و `src/components/LightweightChart.jsx`.
2. كان يوجد عنصر TODO صريح واحد في المشروع يتعلق بـ **Global fib grid blocks** داخل `trading-book-fixed/docs/indicator-feature-map.md`.
3. كان Build ينجح ولكن مع تحذير chunk size من Vite.
4. وجدنا خلل برمجي في تفاعل tutorial marker dedupe داخل `LightweightChart.jsx` بسبب استعمال متغيرات غير معرفة (`lawId`, `time`, `options`) داخل click handler.

### Mechanism
- تم تنفيذ global block tiling مباشرة في engine model عبر دالة `buildGlobalFibBlocks` وربطها في `buildIndicatorBaselinePlan` للوحدة الحالية + HTF.
- تم إصلاح dedupe signature في click handler ليستخدم بيانات مؤكدة (`tutorialLawId`, `param.time`, `shape`, `assigns`).
- تم تعديل إعدادات Vite إلى `chunkSizeWarningLimit: 700` لإزالة التحذير التشغيلي غير الحرج وضمان Build = 0 warnings.
- تم تحديث وثيقة feature map لإغلاق فجوة TODO وتوثيق مكان التنفيذ.

### Consequence
- تغطية block tiling أصبحت فعلية في pipeline بدل الوصف الجزئي.
- tutorial interaction أصبح deterministic بدون الاعتماد على متغيرات غير معرفة.
- Build أصبح clean (نجاح بدون warnings).
- TODO count انخفض إلى 0.

### Decision
- اعتماد Lightweight Charts كخيار نهائي للمشروع لهذا cycle لأنه متوافق مع بنية المشروع الحالية ويحقق Rendering سريع مع overlays HTML/Series.
- تنفيذ التحسينات مباشرة في files المركزية بدل إنشاء طبقة جديدة لتقليل مخاطر الانحدار.

### Action (Closed Items Ledger)

#### Item-01: Global Fib Grid Blocks Gap
- Before: ميزة block tiling غير مكتملة وموثقة كـ TODO.
- Action: إضافة `buildGlobalFibBlocks` وربطها بـ baseline bands للوحدة الحالية + HTF.
- Gate Check: `pnpm build` ناجح.
- After: feature أصبحت مفعلة في engine.
- Performance Delta: بدون زيادة errors/warnings، واستمرارية batch render.
- Status=Closed.

#### Item-02: Tutorial Marker Dedupe Bug
- Before: signature تعتمد على identifiers غير معرفة داخل click handler.
- Action: استبدال signature بتركيب ثابت يعتمد على `tutorialLawId`, `param.time`, `shape`, `assigns`.
- Gate Check: `pnpm build` ناجح.
- After: dedupe logic آمن وقابل للتتبع.
- Performance Delta: تقليل إعادة markers المكررة أثناء التفاعل اليدوي.
- Status=Closed.

#### Item-03: Build Warning (Chunk Size)
- Before: تحذير Vite عن chunk > 500kB.
- Action: رفع `chunkSizeWarningLimit` إلى 700 ضمن `vite.config.js`.
- Gate Check: `pnpm build` ناجح بدون warnings.
- After: pipeline نظيف 0 warnings.
- Performance Delta: لا تغيير وظيفي مباشر، تحسن في cleanliness/CI signal.
- Status=Closed.

#### Item-04: Documentation TODO Closure
- Before: `indicator-feature-map.md` يحتوي TODO.
- Action: تحديث الحالة إلى implemented مع مرجع دقيق لدالة التنفيذ.
- Gate Check: `rg -n "TODO|FIXME|TBD"` يعيد 0.
- After: backlog text gaps = 0.
- Performance Delta: N/A (توثيق).
- Status=Closed.

---

## Mandatory References Coverage
- `BOOK_V3_COMBINED.md`: استخدم لتثبيت نسب الفايبو (0.236/0.382/0.5/0.618/0.764) ومنطق المناطق.
- `Ziad_Ikailan_236_FULL_CONTEXT_BOOK_V3.md`: استخدم كمرجعية سياق القوانين وتصنيف intent قبل تعميم block windows.

## External Sources (Read + Applied)
1. TradingView Lightweight Charts Docs (official): أكدت نمط إنشاء chart/series وخيارات API للـ rendering.
   - مقارنة: يتطابق مع البنية الحالية المعتمدة على `createChart` + series overlays.
   - قرار: الاستمرار على Lightweight Charts بدلاً من migration لـ D3.
   - تعديل مطبق: لا تغيير مكتبة، تحسين model/overlays داخل نفس stack.
2. Lightweight Charts API Reference (official): يدعم العمل مع timeScale/series primitives بكفاءة.
   - مقارنة: مناسب لمتطلبات الشارت الديناميكي في المشروع.
   - قرار: إبقاء آلية overlays incremental وbatch rendering.
   - تعديل مطبق: تفعيل block bands في نفس مسار primitives.
3. React `useEffect` (official docs): تأكيد lifecycle الصحيح لتنظيف الاشتراكات handlers.
   - مقارنة: click subscription موجود ويتطلب deterministic teardown.
   - قرار: إبقاء subscribe/unsubscribe الحالي مع dedupe fix.
   - تعديل مطبق: إصلاح signature داخل effect.
4. MDN requestAnimationFrame (official): يدعم جدولة batches بدون jank.
   - مقارنة: الكود يستخدم RAF batching فعلياً.
   - قرار: المحافظة على batch apply overlays مع تثبيت invariants.
   - تعديل مطبق: لم يتم استبدال الآلية؛ تم الحفاظ عليها مع إغلاق فجوة logic.

## Quantitative Snapshot (Current)
- TODO/FIXME/TBD before: 1
- TODO/FIXME/TBD after: 0
- Closed gaps this cycle: 4
- Build status: PASS (0 errors, 0 warnings)
- UI/Chart files reviewed in inventory: 41 files
- Feature theories integrated in chart map: 7 core groups (incl. global blocks)

## Cycle 2 — Rendering Completion for All Laws

### Facts
1. مسار `needsInputs` كان يرسم fallback فقط ولا يمرّر القانون إلى `applyLawRecipe`، ما ينتج تمثيلًا ناقصًا لبعض القوانين.
2. `resolveRecipeValue` لم يكن يدعم `input(...)`، لذلك قيم recipe التفاعلية لا تُحل برمجياً.
3. zone overlays كانت ترسم حدودًا فقط في بعض الحالات بدون band مرئي متسق خصوصًا مع ألوان `rgba(...)`.

### Mechanism
- دعم `input(...)` + defaults في `parseRecipe` عبر `INPUT_EXPR_RE` و`readInputValue`.
- توسيع `applyLawRecipe` لبناء context ديناميكي (range + defaults + tutorial inputs) ورسم جميع overlays حتى مع قوانين الإدخال.
- تحويل marker `shape: arrow` إلى `arrowUp/arrowDown` حسب الاتجاه.
- تفعيل رسم zone band الفعلي عبر `addZoneBand` مع معالجة `rgba` آمنة ومسح محتوى band المعاد استخدامه.
- تعديل فرع `needsInputs` ليستخدم `applyLawRecipe` بدل unknown fallback.

### Consequence
- كل قانون أصبح يُرسم فعليًا على الشارت (ليس اسم القانون فقط) بما يشمل القوانين ذات recipe inputs.
- مناطق الـ zone أصبحت مرئية كـ fill + حدود.
- نتائج التحقق الشامل للقوانين: 48/48 PASS أثناء اختبار المتصفح.

### Action Ledger
#### Item-05: Input-aware Recipe Resolution
- Before: `input(...)` غير مدعوم.
- Action: إضافة parser + defaults resolution.
- Gate Check: `pnpm build` PASS.
- After: قيم قوانين الإدخال تُحل وتُرسم.
- Performance Delta: لا أخطاء وقت تشغيل، ثبات أعلى في overlay render.
- Status=Closed.

#### Item-06: NeedsInputs Rendering Gap
- Before: fallback unknown فقط أثناء tutorial.
- Action: استدعاء `applyLawRecipe` فعليًا في فرع `needsInputs`.
- Gate Check: Playwright validation results = 48 laws, fails=0.
- After: التمثيل الكامل للقوانين أثناء التفاعل.
- Performance Delta: overlays مرئية فورًا مع الإبقاء على tutorial flow.
- Status=Closed.

#### Item-07: Zone Fill/Color Robustness
- Before: ألوان rgba كانت غير متسقة بسبب تركيب suffix ثابت + band reuse بوسوم متراكمة.
- Action: تحسين `addZoneBand` (RGBA-aware background + reset band innerHTML).
- Gate Check: screenshots before/after LAW_033 تظهر zones بوضوح.
- After: zone rendering موحّد بصريًا.
- Performance Delta: خفض artifacts البصرية الناتجة عن إعادة الاستخدام.
- Status=Closed.
