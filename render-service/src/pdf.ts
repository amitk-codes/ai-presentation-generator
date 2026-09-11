import { chromium } from "playwright";

/** Render an HTML document to a PDF where each .slide becomes one 1280x720 page. */
export async function renderPdf(html: string, outPath: string): Promise<void> {
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
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
