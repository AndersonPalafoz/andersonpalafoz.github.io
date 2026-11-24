import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const RESERVED_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "invalid",
]);
const SENSITIVE_FIXTURE_PATH = /(?:^|[\/._-])(?:\.tmp|tmp|temp|seed|seeds|fixture|fixtures|test[-_]?data|sample[-_]?data|demo[-_]?data)(?:$|[\/._-])/i;
const STRUCTURED_DATA_FILE = /\.(?:csv|tsv|jsonl?)$/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const CPF_PATTERN = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const IDENTIFIER_FIELD_PATTERN = /\b(?:studentIdNumber|student_id_number|student_id|cpf|phone|mobile|telefone)\s*[:=]\s*["'`]([^"'`]{4,})["'`]/gi;
const SAFE_IDENTIFIER = /^(?:0+|123456+|test(?:[-_ ]?\d+)?|dummy|example|ficticio|fake|sample)$/i;

export function findPrivateDataIndicators(filePath, content) {
  const indicators = [];

  if (SENSITIVE_FIXTURE_PATH.test(filePath) || STRUCTURED_DATA_FILE.test(filePath)) {
    for (const match of content.matchAll(EMAIL_PATTERN)) {
      const domain = match[0].split("@")[1].toLowerCase();
      const isReserved = RESERVED_EMAIL_DOMAINS.has(domain)
        || domain.endsWith(".example")
        || domain.endsWith(".test")
        || domain.endsWith(".invalid");
      if (!isReserved) indicators.push("email não reservado");
    }

    if (content.match(CPF_PATTERN)?.length) indicators.push("possível CPF");

    for (const match of content.matchAll(IDENTIFIER_FIELD_PATTERN)) {
      if (!SAFE_IDENTIFIER.test(match[1].trim())) {
        indicators.push("identificador pessoal literal");
      }
    }
  }

  return [...new Set(indicators)];
}

function getChangedFiles(baseSha, headSha) {
  let args;

  if (baseSha && headSha && !/^0+$/.test(baseSha)) {
    args = ["diff", "--name-only", "--diff-filter=ACMR", "-z", `${baseSha}...${headSha}`];
  } else if (headSha) {
    args = ["diff-tree", "--root", "--no-commit-id", "--name-only", "--diff-filter=ACMR", "-r", "-z", headSha];
  } else {
    args = ["diff", "--name-only", "--diff-filter=ACMR", "-z", "HEAD"];
  }

  const output = execFileSync("git", args, { encoding: "utf8" });
  return output.split("\0").filter(Boolean);
}

function getComparison() {
  const [argumentBase, argumentHead] = process.argv.slice(2);
  if (argumentBase && argumentHead) return [argumentBase, argumentHead];

  if (process.env.DATA_GUARD_BASE_SHA && process.env.DATA_GUARD_HEAD_SHA) {
    return [process.env.DATA_GUARD_BASE_SHA, process.env.DATA_GUARD_HEAD_SHA];
  }

  if (process.env.GITHUB_EVENT_PATH) {
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
    if (event.pull_request) {
      return [event.pull_request.base.sha, event.pull_request.head.sha];
    }
    if (event.before && process.env.GITHUB_SHA) {
      return [event.before, process.env.GITHUB_SHA];
    }
  }

  return [null, null];
}

function main() {
  const [baseSha, headSha] = getComparison();
  const changedFiles = getChangedFiles(baseSha, headSha);
  const violations = [];

  for (const filePath of changedFiles) {
    if (SENSITIVE_FIXTURE_PATH.test(filePath) && /^(?:\.tmp|tmp|temp)\//i.test(filePath)) {
      violations.push(`${filePath}: arquivos temporários não podem ser versionados`);
      continue;
    }

    if (!SENSITIVE_FIXTURE_PATH.test(filePath) && !STRUCTURED_DATA_FILE.test(filePath)) continue;

    const indicators = findPrivateDataIndicators(filePath, readFileSync(filePath, "utf8"));
    for (const indicator of indicators) violations.push(`${filePath}: ${indicator}`);
  }

  if (violations.length > 0) {
    console.error("Verificação de privacidade reprovada. Remova dados pessoais reais e use identificadores sintéticos reservados:");
    for (const violation of violations) console.error(`- ${violation}`);
    process.exitCode = 1;
    return;
  }

  console.log(`Verificação de privacidade aprovada (${changedFiles.length} arquivo(s) alterado(s)).`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
