// Optional helper (not a build step): syncs canonical/OG URLs, sitemap.xml and
// robots.txt with site.baseUrl in content.json. Run: node tools/set-base-url.mjs
import { readFileSync, writeFileSync } from "node:fs";

const { site } = JSON.parse(readFileSync("content.json", "utf8"));
const base = site.baseUrl.replace(/\/+$/, "");

let html = readFileSync("index.html", "utf8");
html = html
  .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${base}/"`)
  .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${base}/"`)
  .replace(/(<meta property="og:image" content=")[^"]*"/, `$1${base}/assets/og.png"`);
writeFileSync("index.html", html);

writeFileSync("sitemap.xml",
`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc></url>
</urlset>
`);
writeFileSync("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
console.log("Updated index.html, sitemap.xml, robots.txt for " + base);
