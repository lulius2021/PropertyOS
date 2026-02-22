import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

// Serves the Astro-built marketing landing page (public/index.html) at /
// In production, Vercel serves public/index.html directly before Next.js routing,
// so this handler is only active in local development.
export async function GET() {
  const html = readFileSync(join(process.cwd(), "public", "index.html"), "utf-8");
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
