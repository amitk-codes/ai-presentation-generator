import pptxgen from "pptxgenjs";
import { Deck } from "./types";

// Palette (kept in sync with the HTML template so PDF and PPTX match).
const ACCENT = "4F46E5";
const DARK = "0F172A";
const BODY = "334155";
const LIGHT = "FFFFFF";
const MUTED = "E2E8F0";

/** Render the deck JSON to a real, editable .pptx (native text boxes). */
export async function renderPptx(deck: Deck, outPath: string): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5 in => 16:9
  pptx.author = "Presentation Automation";
  pptx.title = deck.title;

  for (const slide of deck.slides) {
    const s = pptx.addSlide();

    if (slide.type === "title" || slide.type === "closing") {
      s.background = { color: ACCENT };
      s.addText(slide.title, {
        x: 0.5, y: 2.6, w: 12.33, h: 1.6,
        align: "center", fontSize: 44, bold: true, color: LIGHT,
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 0.5, y: 4.2, w: 12.33, h: 0.8,
          align: "center", fontSize: 20, color: MUTED,
        });
      }
    } else if (slide.type === "section") {
      s.background = { color: DARK };
      s.addText(slide.title, {
        x: 0.5, y: 2.9, w: 12.33, h: 1.4,
        align: "center", fontSize: 40, bold: true, color: LIGHT,
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 0.5, y: 4.2, w: 12.33, h: 0.8,
          align: "center", fontSize: 20, color: MUTED,
        });
      }
    } else {
      // content
      s.background = { color: LIGHT };
      s.addText(slide.title, {
        x: 0.6, y: 0.5, w: 12.13, h: 1,
        fontSize: 30, bold: true, color: DARK,
      });
      s.addShape(pptx.ShapeType.rect, {
        x: 0.62, y: 1.5, w: 1.6, h: 0.07, fill: { color: ACCENT },
      });
      const bullets = slide.bullets ?? [];
      if (bullets.length > 0) {
        s.addText(
          bullets.map((b) => ({
            text: b,
            options: { bullet: true, color: BODY, fontSize: 18, paraSpaceAfter: 12 },
          })),
          { x: 0.8, y: 1.9, w: 11.7, h: 4.9, valign: "top" }
        );
      }
    }

    if (slide.notes) s.addNotes(slide.notes);
  }

  await pptx.writeFile({ fileName: outPath });
}
