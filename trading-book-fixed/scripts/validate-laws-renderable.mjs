import fs from 'node:fs';
import path from 'node:path';
import { laws } from '../src/data/laws.js';
import { buildLawDrawPlan } from '../src/lib/indicator/model.js';

const csvPath = path.resolve('public/sample-data.csv');
const raw = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
const rows = raw.slice(1).map((line) => line.split(','));
const bars = rows
  .map((parts) => {
    const [date, hhmm, open, high, low, close] = parts;
    const normalizedDate = String(date || '').replace(/\./g, '-');
    const time = Math.floor(new Date(`${normalizedDate}T${hhmm || '00:00'}:00Z`).getTime() / 1000);
    return { time, open: Number(open), high: Number(high), low: Number(low), close: Number(close) };
  })
  .filter((b) => Number.isFinite(b.time) && Number.isFinite(b.open) && Number.isFinite(b.high) && Number.isFinite(b.low) && Number.isFinite(b.close));

const results = laws.map((law) => buildLawDrawPlan({ law, bars }));
const failed = results.filter((r) => !(r.boxesCount >= 1 && r.linesCount >= 2 && (r.labelsCount + r.markersCount) >= 1));

console.table(results.map((r) => ({
  lawId: r.lawId,
  lines: r.linesCount,
  boxes: r.boxesCount,
  labels: r.labelsCount,
  markers: r.markersCount,
  unknown: r.unknownMapping,
  pass: r.boxesCount >= 1 && r.linesCount >= 2 && (r.labelsCount + r.markersCount) >= 1,
})));

if (failed.length) {
  console.error(`Validation failed for ${failed.length} laws.`);
  process.exit(1);
}

console.log(`Validation passed for ${results.length} laws.`);
