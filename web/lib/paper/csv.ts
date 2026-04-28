/**
 * CSV import parser. Supports multiple broker formats with auto-detection,
 * plus a generic format. Output is a normalized list of imports the API can
 * insert as transactions.
 */

export interface CsvImportRow {
  symbol: string;
  shares: number;
  costBasis: number;
  /** Optional opened-at date YYYY-MM-DD. Defaults to today if absent. */
  openedAt?: string;
}

export type CsvFormat =
  | "robinhood"
  | "fidelity"
  | "schwab"
  | "vanguard"
  | "generic";

const FORMAT_LABELS: Record<CsvFormat, string> = {
  robinhood: "Robinhood",
  fidelity:  "Fidelity",
  schwab:    "Schwab",
  vanguard:  "Vanguard",
  generic:   "Generic",
};

export function formatLabel(f: CsvFormat): string {
  return FORMAT_LABELS[f];
}

/**
 * Detect which broker exported this CSV based on header columns.
 * Returns 'generic' if nothing better matches.
 */
export function detectFormat(headers: string[]): CsvFormat {
  const lower = headers.map((h) => h.trim().toLowerCase());
  const has = (s: string) => lower.includes(s);

  // Robinhood: "Symbol","Quantity","Average Cost"
  if (has("symbol") && has("quantity") && (has("average cost") || has("avg cost") || has("cost basis"))) {
    return "robinhood";
  }
  // Schwab: "Symbol","Description","Quantity","Price","Market Value","Day Change %"...
  if (has("symbol") && has("quantity") && has("price") && has("market value")) {
    return "schwab";
  }
  // Fidelity: "Account Name","Symbol","Description","Quantity","Last Price","Current Value","Cost Basis Total","Average Cost Basis"
  if (has("symbol") && (has("cost basis total") || has("average cost basis"))) {
    return "fidelity";
  }
  // Vanguard: "Account Number","Investment Name","Symbol","Shares","Share Price","Total Value"
  if (has("symbol") && has("shares") && has("share price")) {
    return "vanguard";
  }
  return "generic";
}

/**
 * Parse a CSV string into typed rows. Dead-simple parser that handles quoted
 * fields with commas. Not RFC4180-compliant for every edge case, but good
 * enough for broker exports.
 */
export function parseCsv(input: string): { headers: string[]; rows: string[][] } {
  const lines = input.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        out.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map(parseLine);
  return { headers, rows };
}

/**
 * Convert parsed CSV rows into normalized imports based on the detected format.
 * Skips rows that don't have a usable symbol + shares + cost basis.
 */
export function normalize(
  format: CsvFormat,
  headers: string[],
  rows: string[][],
): CsvImportRow[] {
  const lower = headers.map((h) => h.trim().toLowerCase());
  const idx = (name: string) => lower.indexOf(name);

  const colSymbol = pick(idx, ["symbol", "ticker"]);
  const colShares = pick(idx, ["shares", "quantity", "qty"]);
  const colCost = pick(idx, [
    "average cost",
    "avg cost",
    "average cost basis",
    "cost basis",
    "cost",
    "share price",
    "purchase price",
    "price",
  ]);
  const colDate = pick(idx, ["date", "purchase date", "opened at", "trade date"]);

  if (colSymbol < 0 || colShares < 0 || colCost < 0) return [];

  const out: CsvImportRow[] = [];
  for (const r of rows) {
    const symbol = (r[colSymbol] ?? "").trim().toUpperCase();
    const sharesNum = parseNumber(r[colShares]);
    const costNum = parseNumber(r[colCost]);
    if (!symbol || !sharesNum || !costNum) continue;

    const dateRaw = colDate >= 0 ? r[colDate]?.trim() : undefined;
    const opened = dateRaw ? toIsoDate(dateRaw) : undefined;

    out.push({
      symbol,
      shares: sharesNum,
      costBasis: costNum,
      openedAt: opened,
    });
  }
  void format;
  return out;
}

function pick(idxFn: (s: string) => number, names: string[]): number {
  for (const n of names) {
    const i = idxFn(n);
    if (i >= 0) return i;
  }
  return -1;
}

function parseNumber(raw: string | undefined): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,]/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function toIsoDate(raw: string): string | undefined {
  const s = raw.trim();
  // Already ISO-ish?
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  // MM/DD/YYYY
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/.exec(s);
  if (m) {
    let yyyy = m[3];
    if (yyyy.length === 2) yyyy = `20${yyyy}`;
    const mm = m[1].padStart(2, "0");
    const dd = m[2].padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return undefined;
}
