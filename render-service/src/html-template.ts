import { Deck, Slide } from "./types";

/** Escape user/AI text so it can't break the HTML structure. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function footer(index: number, total: number, deckTitle: string): string {
  return `<div class="footer"><span>${esc(deckTitle)}</span><span>${
    index + 1
  } / ${total}</span></div>`;
}

function slideHtml(
  slide: Slide,
  index: number,
  total: number,
  deckTitle: string
): string {
  const subtitle = slide.subtitle
    ? `<p class="subtitle">${esc(slide.subtitle)}</p>`
    : "";

  switch (slide.type) {
    case "title":
      return `<section class="slide slide--cover">
        <div class="cover-inner"><h1>${esc(slide.title)}</h1>${subtitle}</div>
      </section>`;

    case "closing":
      return `<section class="slide slide--cover slide--closing">
        <div class="cover-inner"><h1>${esc(slide.title)}</h1>${subtitle}</div>
      </section>`;

    case "section":
      return `<section class="slide slide--section">
        <div class="section-inner"><h2>${esc(slide.title)}</h2>${subtitle}</div>
      </section>`;

    case "content":
    default: {
      const bullets = (slide.bullets ?? [])
        .map((b) => `<li>${esc(b)}</li>`)
        .join("");
      return `<section class="slide slide--content">
        <h2 class="content-title">${esc(slide.title)}</h2>
        <div class="accent-bar"></div>
        <ul class="bullets">${bullets}</ul>
        ${footer(index, total, deckTitle)}
      </section>`;
    }
  }
}

/** Build a full print-ready HTML document — one 1280x720 slide per page. */
export function deckToHtml(deck: Deck): string {
  const total = deck.slides.length;
  const body = deck.slides
    .map((s, i) => slideHtml(s, i, total, deck.title))
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>${esc(deck.title)}</title><style>${CSS}</style></head>
<body>${body}</body>
</html>`;
}

const CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: 1280px 720px; margin: 0; }
html, body { margin: 0; padding: 0; }
body {
  font-family: 'Segoe UI', 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
}
.slide {
  position: relative;
  width: 1280px;
  height: 720px;
  overflow: hidden;
  background: #ffffff;
  page-break-after: always;
}
.slide:last-child { page-break-after: auto; }

/* Cover / title / closing */
.slide--cover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.slide--closing { background: linear-gradient(135deg, #0f172a 0%, #4f46e5 100%); }
.cover-inner { text-align: center; padding: 0 120px; }
.cover-inner h1 { font-size: 64px; font-weight: 800; line-height: 1.1; letter-spacing: -1px; }
.cover-inner .subtitle { margin-top: 28px; font-size: 26px; font-weight: 400; color: rgba(255,255,255,0.85); }

/* Section divider */
.slide--section {
  background: #0f172a; color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.section-inner { text-align: center; padding: 0 120px; }
.section-inner h2 { font-size: 52px; font-weight: 700; }
.section-inner .subtitle { margin-top: 20px; font-size: 24px; color: rgba(255,255,255,0.8); }

/* Content */
.slide--content { padding: 80px 96px 72px; }
.content-title { font-size: 44px; font-weight: 700; color: #0f172a; }
.accent-bar { width: 96px; height: 6px; background: #4f46e5; border-radius: 3px; margin: 20px 0 40px; }
.bullets { list-style: none; }
.bullets li {
  position: relative;
  font-size: 26px; line-height: 1.5; color: #334155;
  padding-left: 44px; margin-bottom: 26px;
}
.bullets li::before {
  content: ''; position: absolute; left: 8px; top: 14px;
  width: 14px; height: 14px; background: #4f46e5; border-radius: 4px;
  transform: rotate(45deg);
}

/* Footer */
.footer {
  position: absolute; bottom: 32px; left: 96px; right: 96px;
  display: flex; justify-content: space-between;
  font-size: 15px; color: #94a3b8;
  border-top: 1px solid #e2e8f0; padding-top: 14px;
}
`;
