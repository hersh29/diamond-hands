import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://diamondhands.space";
  const now = new Date();
  const paths = [
    "/",
    "/backtest",
    "/explore",
    "/login",
    "/signup",
    "/legal/disclaimer",
    "/legal/terms",
    "/legal/privacy",
  ];
  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === "/" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : 0.5,
  }));
}
