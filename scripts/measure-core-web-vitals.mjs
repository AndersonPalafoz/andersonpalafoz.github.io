import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseUrl = (process.env.PERFORMANCE_BASE_URL || "https://andersonpalafoz.vercel.app").replace(/\/$/, "");
const runsPerRoute = Number.parseInt(process.env.PERFORMANCE_RUNS || "3", 10);
const outputDir = process.env.PERFORMANCE_OUTPUT_DIR || "performance-results";
const routes = ["/", "/sobre", "/cursos", "/materiais", "/blog", "/contato", "/depoimentos"];
const thresholds = {
  performanceScoreMinimum: 80,
  lcpMedianMaximumMs: 4000,
  clsMedianMaximum: 0.25,
};

if (!Number.isInteger(runsPerRoute) || runsPerRoute < 3 || runsPerRoute > 5) {
  throw new Error("PERFORMANCE_RUNS deve ser um inteiro entre 3 e 5.");
}

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1));
  return sorted[index];
}

function runLighthouse(url, route, runNumber) {
  const tempDirectory = mkdtempSync(join(tmpdir(), "lighthouse-") );
  const reportPath = join(tempDirectory, "report.json");
  try {
    execFileSync(
      "pnpm",
      [
        "exec",
        "lighthouse",
        url,
        "--quiet",
        "--output=json",
        `--output-path=${reportPath}`,
        "--only-categories=performance",
        '--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage',
      ],
      { stdio: "inherit", timeout: 180_000 },
    );
    const report = JSON.parse(readFileSync(reportPath, "utf8"));
    return {
      route,
      run: runNumber,
      url,
      fetchTime: report.fetchTime,
      performanceScore: Math.round((report.categories.performance.score || 0) * 100),
      lcpMs: report.audits["largest-contentful-paint"]?.numericValue ?? null,
      cls: report.audits["cumulative-layout-shift"]?.numericValue ?? null,
      fcpMs: report.audits["first-contentful-paint"]?.numericValue ?? null,
      tbtMs: report.audits["total-blocking-time"]?.numericValue ?? null,
      ttfbMs: report.audits["server-response-time"]?.numericValue ?? null,
    };
  } finally {
    rmSync(tempDirectory, { recursive: true, force: true });
  }
}

mkdirSync(outputDir, { recursive: true });
const measurements = [];
for (const route of routes) {
  const url = `${baseUrl}${route}`;
  for (let run = 1; run <= runsPerRoute; run += 1) {
    console.log(`Measuring ${route} (${run}/${runsPerRoute})`);
    measurements.push(runLighthouse(url, route, run));
  }
}

const summaries = routes.map((route) => {
  const rows = measurements.filter((measurement) => measurement.route === route);
  return {
    route,
    runs: rows.length,
    performanceScoreMedian: percentile(rows.map((row) => row.performanceScore), 0.5),
    lcpMedianMs: Math.round(percentile(rows.map((row) => row.lcpMs ?? Number.POSITIVE_INFINITY), 0.5)),
    clsMedian: Number(percentile(rows.map((row) => row.cls ?? Number.POSITIVE_INFINITY), 0.5).toFixed(3)),
    fcpMedianMs: Math.round(percentile(rows.map((row) => row.fcpMs ?? Number.POSITIVE_INFINITY), 0.5)),
    tbtMedianMs: Math.round(percentile(rows.map((row) => row.tbtMs ?? Number.POSITIVE_INFINITY), 0.5)),
    ttfbMedianMs: Math.round(percentile(rows.map((row) => row.ttfbMs ?? Number.POSITIVE_INFINITY), 0.5)),
  };
});

const failures = summaries.flatMap((summary) => {
  const issues = [];
  if (summary.performanceScoreMedian < thresholds.performanceScoreMinimum) issues.push(`performance ${summary.performanceScoreMedian} < ${thresholds.performanceScoreMinimum}`);
  if (summary.lcpMedianMs > thresholds.lcpMedianMaximumMs) issues.push(`LCP ${summary.lcpMedianMs}ms > ${thresholds.lcpMedianMaximumMs}ms`);
  if (summary.clsMedian > thresholds.clsMedianMaximum) issues.push(`CLS ${summary.clsMedian} > ${thresholds.clsMedianMaximum}`);
  return issues.length ? [{ route: summary.route, issues }] : [];
});

const result = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  routes,
  runsPerRoute,
  thresholds,
  realUserData: {
    provider: "Vercel Speed Insights",
    dashboard: "Vercel project > Speed Insights",
    note: "Field data is collected independently from these lab measurements; this artifact contains Lighthouse lab data only.",
  },
  summaries,
  measurements,
  status: failures.length ? "failed" : "passed",
  failures,
};

writeFileSync(join(outputDir, "core-web-vitals.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ status: result.status, summaries, failures }, null, 2));
if (failures.length) process.exitCode = 1;
