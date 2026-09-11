import { chromium } from "playwright";

/** Render an HTML document to a PDF where each .slide becomes one 1280x720 page. */
export async function renderPdf(html: string, outPath: string): Promise<void> {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    // networkidle lets the themed Google Font load; then ensure it's applied.
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => (document as any).fonts?.ready).catch(() => {});
    await page.pdf({
      path: outPath,
      width: "1280px",
      height: "720px",
      printBackground: true,
    });
  } finally {
    await browser.close();
  }
}
