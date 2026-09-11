import pptxgen from "pptxgenjs";
import { Deck, Slide } from "./types";
import { getTheme, hex, Theme } from "./themes";

const WHITE = "FFFFFF";

/** pptxgenjs wants "image/jpeg;base64,…" (no leading "data:"). */
function pptxData(dataUri?: string): string | null {
  if (!dataUri) return null;
  return dataUri.replace(/^data:/, "");
}

function coverBackground(
  pptx: pptxgen,
  s: pptxgen.Slide,
  slide: Slide,
  fallback: string
) {
  const img = pptxData(slide.imageData);
  if (img) {
    s.addImage({ data: img, x: 0, y: 0, w: 13.333, h: 7.5, sizing: { type: "cover", w: 13.333, h: 7.5 } });
    s.addShape(pptx.ShapeType.rect, {
      x: 0, y: 0, w: 13.333, h: 7.5,
      fill: { color: "000000", transparency: 45 },
      line: { type: "none" },
    });
  } else {
    s.background = { color: fallback };
  }
}

export async function renderPptx(deck: Deck, outPath: string): Promise<void> {
  const t: Theme = getTheme(deck.theme);
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in
  pptx.author = "AI Presentation Generator";
  pptx.title = deck.title;

  const A = hex(t.accent);
  const INK = hex(t.ink);
  const BODY = hex(t.bodyText);
  const MUTED = hex(t.muted);

  for (const slide of deck.slides) {
    const s = pptx.addSlide();

    if (slide.type === "title" || slide.type === "closing") {
      coverBackground(pptx, s, slide, hex(t.coverFrom));
      s.addText(slide.title || deck.title, {
        x: 0.6, y: 2.5, w: 12.13, h: 1.8, align: "center",
        fontFace: t.pptxHead, fontSize: 44, bold: true, color: WHITE,
      });
      if (slide.subtitle)
        s.addText(slide.subtitle, {
          x: 0.6, y: 4.3, w: 12.13, h: 0.8, align: "center",
          fontFace: t.pptxBody, fontSize: 20, color: "E5E7EB",
        });
    } else if (slide.type === "section") {
      coverBackground(pptx, s, slide, hex(t.sectionBg));
      s.addText(slide.title || "", {
        x: 0.6, y: 2.9, w: 12.13, h: 1.6, align: "center",
        fontFace: t.pptxHead, fontSize: 40, bold: true, color: WHITE,
      });
      if (slide.subtitle)
        s.addText(slide.subtitle, {
          x: 0.6, y: 4.4, w: 12.13, h: 0.8, align: "center",
          fontFace: t.pptxBody, fontSize: 20, color: "E5E7EB",
        });
    } else if (slide.type === "stat") {
      s.background = { color: WHITE };
      if (slide.title) {
        s.addText(slide.title, { x: 0.6, y: 0.6, w: 12.13, h: 1, fontFace: t.pptxHead, fontSize: 30, bold: true, color: INK });
        s.addShape(pptx.ShapeType.rect, { x: 0.62, y: 1.55, w: 1.5, h: 0.07, fill: { color: A }, line: { type: "none" } });
      }
      const stats = slide.stats ?? [];
      const n = Math.max(stats.length, 1);
      const colW = 12.13 / n;
      stats.forEach((st, i) => {
        const x = 0.6 + i * colW;
        s.addText(st.value, { x, y: 2.7, w: colW, h: 1.5, align: "center", fontFace: t.pptxHead, fontSize: n === 1 ? 96 : 60, bold: true, color: A });
        s.addText(st.label, { x, y: 4.3, w: colW, h: 1, align: "center", fontFace: t.pptxBody, fontSize: 18, color: BODY });
      });
    } else if (slide.type === "quote") {
      s.background = { color: WHITE };
      s.addText("“", { x: 0.7, y: 0.7, w: 3, h: 1.6, fontFace: t.pptxHead, fontSize: 120, bold: true, color: A });
      s.addText(slide.quote || "", { x: 1.0, y: 2.2, w: 11.3, h: 3, fontFace: t.pptxHead, fontSize: 30, bold: true, color: INK, lineSpacingMultiple: 1.2 });
      if (slide.attribution)
        s.addText("— " + slide.attribution, { x: 1.0, y: 5.4, w: 11.3, h: 0.6, fontFace: t.pptxBody, fontSize: 18, color: MUTED });
    } else {
      // content — split when there's a photo
      s.background = { color: WHITE };
      const img = pptxData(slide.imageData);
      const textW = img ? 6.6 : 12.13;
      if (img) {
        s.addImage({ data: img, x: 7.0, y: 0, w: 6.333, h: 7.5, sizing: { type: "cover", w: 6.333, h: 7.5 } });
      }
      s.addText(slide.title || "", { x: 0.6, y: 0.5, w: textW, h: 1, fontFace: t.pptxHead, fontSize: 30, bold: true, color: INK });
      s.addShape(pptx.ShapeType.rect, { x: 0.62, y: 1.5, w: 1.5, h: 0.07, fill: { color: A }, line: { type: "none" } });
      const bullets = slide.bullets ?? [];
      if (bullets.length) {
        s.addText(
          bullets.map((b) => ({ text: b, options: { bullet: true, color: BODY, fontFace: t.pptxBody, fontSize: 18, paraSpaceAfter: 12 } })),
          { x: 0.8, y: 1.9, w: textW - 0.3, h: 4.9, valign: "top" }
        );
      }
    }

    if (slide.notes) s.addNotes(slide.notes);
  }

  await pptx.writeFile({ fileName: outPath });
}
