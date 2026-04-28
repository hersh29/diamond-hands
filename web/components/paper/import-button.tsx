"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  detectFormat,
  formatLabel,
  normalize,
  parseCsv,
  type CsvImportRow,
} from "@/lib/paper/csv";
import { displaySymbol, formatCurrency } from "@/lib/utils";

interface Props {
  portfolioId: string;
}

export function ImportButton({ portfolioId }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<CsvImportRow[] | null>(null);
  const [format, setFormat] = useState<string>("");
  const [pending, start] = useTransition();

  const handleParse = () => {
    if (!text.trim()) {
      toast.error("Paste CSV content first");
      return;
    }
    try {
      const { headers, rows } = parseCsv(text);
      if (headers.length === 0) {
        toast.error("CSV looks empty");
        return;
      }
      const fmt = detectFormat(headers);
      const out = normalize(fmt, headers, rows);
      if (out.length === 0) {
        toast.error("Couldn't find symbol/shares/cost columns. Try the generic format.");
        return;
      }
      setFormat(formatLabel(fmt));
      setPreview(out);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to parse CSV");
    }
  };

  const handleImport = () => {
    if (!preview) return;
    start(async () => {
      const res = await fetch(`/api/paper/portfolios/${portfolioId}/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: preview }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Import failed");
        return;
      }
      const skippedNote = json.skipped?.length > 0
        ? ` Skipped: ${json.skipped.join(", ")}`
        : "";
      toast.success(`Imported ${json.imported} positions.${skippedNote}`);
      setOpen(false);
      setText("");
      setPreview(null);
      router.refresh();
    });
  };

  const totalCost = preview?.reduce((s, r) => s + r.shares * r.costBasis, 0) ?? 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="h-4 w-4" /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import positions from CSV</DialogTitle>
          <DialogDescription>
            Paste a position export from your broker (Robinhood, Fidelity, Schwab, Vanguard, or any CSV with symbol / shares / cost-basis columns).
            We auto-detect the format. Cash will be auto-deposited to fund the imported positions.
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder={"Symbol,Quantity,Average Cost\nAAPL,10,150.25\nVOO,5,400.10\n..."}
              className="w-full rounded-md border border-input bg-background p-3 font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleParse}>Parse</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Detected format: <span className="font-semibold text-foreground">{format}</span>{" "}
              · {preview.length} positions · Total cost: <span className="tabular font-semibold text-foreground">{formatCurrency(totalCost)}</span>
            </div>
            <div className="max-h-[280px] overflow-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2 text-left">Symbol</th>
                    <th className="px-3 py-2 text-right">Shares</th>
                    <th className="px-3 py-2 text-right">Cost / share</th>
                    <th className="px-3 py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-b border-border/60 last:border-b-0">
                      <td className="px-3 py-2 font-mono">{displaySymbol(r.symbol)}</td>
                      <td className="px-3 py-2 text-right tabular">{r.shares}</td>
                      <td className="px-3 py-2 text-right tabular">{formatCurrency(r.costBasis)}</td>
                      <td className="px-3 py-2 text-right tabular">{formatCurrency(r.shares * r.costBasis)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreview(null)} disabled={pending}>Back</Button>
              <Button onClick={handleImport} disabled={pending}>
                {pending ? "Importing…" : `Import ${preview.length} positions`}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
