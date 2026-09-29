// Every category but performance must be 100; performance only warns, since it
// moves with the runner's load.
//
//   node .github/scripts/check-lighthouse.mjs <report.json>...

import { readFileSync } from "node:fs";

const STRICT = ["accessibility", "best-practices", "seo", "agentic-browsing"];
const PERF_FLOOR = 0.9;

const reports = process.argv.slice(2);
if (!reports.length) {
  console.error("usage: check-lighthouse.mjs <report.json>...");
  process.exit(2);
}

let failed = 0;
for (const file of reports) {
  const lhr = JSON.parse(readFileSync(file, "utf8"));
  const url = lhr.finalDisplayedUrl || lhr.requestedUrl;
  const scores = [];

  for (const id of STRICT) {
    const cat = lhr.categories[id];
    // A missing category is a wrong Lighthouse version, not a pass.
    if (!cat) {
      console.log(`  BAD  ${url}  no "${id}" category in Lighthouse ${lhr.lighthouseVersion}`);
      failed++;
      continue;
    }
    scores.push(`${id} ${Math.round(cat.score * 100)}`);
    if (cat.score === 1) continue;
    failed++;
    for (const ref of cat.auditRefs) {
      const audit = lhr.audits[ref.id];
      if (ref.weight === 0 || audit.score === null || audit.score === 1) continue;
      const items = (audit.details?.items || []).slice(0, 3).map((i) => i.node?.snippet || i.url || i.source?.url || "");
      console.log(`  BAD  ${url}  ${id}: ${audit.id}${audit.displayValue ? ` (${audit.displayValue})` : ""}`);
      for (const item of items.filter(Boolean)) console.log(`         ${item}`);
    }
  }

  const perf = lhr.categories.performance?.score;
  scores.push(`performance ${Math.round(perf * 100)}`);
  if (perf < PERF_FLOOR) {
    console.log(`::warning::${url} performance ${Math.round(perf * 100)}, under ${PERF_FLOOR * 100}`);
  }
  console.log(`  ${url}  ${scores.join(", ")}`);
}

if (failed) {
  console.log(`\n${failed} category score(s) under 100.`);
  process.exit(1);
}
