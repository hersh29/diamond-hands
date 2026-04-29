export type BacktestMode = "basic" | "advanced";

export function modeFromSearchParams(sp: { mode?: string | string[] | undefined }): BacktestMode {
  const raw = Array.isArray(sp.mode) ? sp.mode[0] : sp.mode;
  return raw === "advanced" ? "advanced" : "basic";
}
