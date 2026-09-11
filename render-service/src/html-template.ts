import { Deck, Slide } from "./types";
import { getTheme, Theme } from "./themes";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function footer(index: number, total: number, deckTitle: string): string {
  return `<div class="footer"><span>${esc(deckTitle)}</span><span>${index + 1} / ${total}</span></div>`;
}

/** Full-bleed background: photo (with dark overlay) or theme gradient. */
function coverBg(slide: Slide, theme: Theme, kind: "cover" | "section"): string {
  if (slide.imageData) {
    return `background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.62)), url('${slide.imageData}'); background-size: cover; background-position: center;`;
  }
  if (kind === "section") return `background: ${theme.sectionBg};`;
  return `background: linear-gradient(135deg, ${theme.coverFrom} 0%, ${theme.coverTo} 100%);`;
}

function slideHtml(
  slide: Slide,
  index: number,
  total: number,
  deckTitle: string,
  theme: Theme
): string {
  const title = slide.title ? esc(slide.title) : "";
  const subtitle = slide.subtitle ? `<p class="subtitle">${esc(slide.subtitle)}</p>` : "";

  switch (slide.type) {
    case "title":
    case "closing":
      return `<section class="slide cover" style="${coverBg(slide, theme, "cover")}">
        <div class="cover-inner"><h1>${title}</h1>${subtitle}</div>
      </section>`;

    case "section":
      return `<section class="slide cover section" style="${coverBg(slide, theme, "section")}">
        <div class="cover-inner"><h2 class="section-title">${title}</h2>${subtitle}</div>
      </section>`;

    case "stat": {
      const stats = (slide.stats ?? [])
        .map(
          (s) =>
            `<div class="stat-item"><div class="stat-value">${esc(s.value)}</div><div class="stat-lbl">${esc(s.label)}</div></div>`
        )
        .join("");
      return `<section class="slide pad">
        ${title ? `<h2 class="content-title">${title}</h2><div class="accent-bar"></div>` : ""}
        <div class="stats stats-${(slide.stats ?? []).length}">${stats}</div>
        ${footer(index, total, deckTitle)}
      </section>`;
    }

    case "quote":
      return `<section class="slide quote-slide">
        <div class="quote-mark">&ldquo;</div>
        <blockquote>${slide.quote ? esc(slide.quote) : ""}</blockquote>
        ${slide.attribution ? `<div class="attribution">— ${esc(slide.attribution)}</div>` : ""}
        ${footer(index, total, deckTitle)}
      </section>`;

    case "content":
    default: {
      const bullets = (slide.bullets ?? []).map((b) => `<li>${esc(b)}</li>`).join("");
      // Split layout when the slide has a photo.
      if (slide.imageData) {
        return `<section class="slide split">
          <div class="split-text">
            <h2 class="content-title">${title}</h2>
            <div class="accent-bar"></div>
            <ul class="bullets">${bullets}</ul>
          </div>
          <div class="split-img" style="background-image:url('${slide.imageData}');"></div>
          ${footer(index, total, deckTitle)}
        </section>`;
      }
      return `<section class="slide pad">
        <h2 class="content-title">${title}</h2>
        <div class="accent-bar"></div>
        <ul class="bullets">${bullets}</ul>
        ${footer(index, total, deckTitle)}
      </section>`;
    }
  }
}

export function deckToHtml(deck: Deck): string {
  const theme = getTheme(deck.theme);
  const total = deck.slides.length;
  const body = deck.slides
    .map((s, i) => slideHtml(s, i, total, deck.title, theme))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><title>${esc(deck.title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${theme.fontsHref}" rel="stylesheet">
<style>${css(theme)}</style>
</head>
<body>${body}</body>
</html>`;
}

function css(t: Theme): string {
  return `
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { size: 1280px 720px; margin: 0; }
html, body { margin: 0; padding: 0; }
body { font-family: ${t.body}; color: ${t.ink}; -webkit-font-smoothing: antialiased; }
.slide { position: relative; width: 1280px; height: 720px; overflow: hidden; background: #fff; page-break-after: always; }
.slide:last-child { page-break-after: auto; }

/* Cover / section / closing */
.cover { display: flex; align-items: center; justify-content: center; color: ${t.coverText}; }
.cover-inner { text-align: center; padding: 0 120px; max-width: 1040px; }
.cover-inner h1 { font-family: ${t.head}; font-size: 66px; font-weight: 800; line-height: 1.08; letter-spacing: -1px; }
.section-title { font-family: ${t.head}; font-size: 52px; font-weight: 800; line-height: 1.1; }
.cover-inner .subtitle { margin-top: 26px; font-size: 25px; font-weight: 400; color: rgba(255,255,255,0.88); }

/* Content */
.pad { padding: 80px 96px 72px; }
.content-title { font-family: ${t.head}; font-size: 42px; font-weight: 800; color: ${t.ink}; line-height: 1.1; }
.accent-bar { width: 92px; height: 6px; background: ${t.accent}; border-radius: 3px; margin: 20px 0 38px; }
.bullets { list-style: none; }
.bullets li { position: relative; font-size: 25px; line-height: 1.5; color: ${t.bodyText}; padding-left: 42px; margin-bottom: 24px; }
.bullets li::before { content: ''; position: absolute; left: 6px; top: 13px; width: 13px; height: 13px; background: ${t.accent}; border-radius: 4px; transform: rotate(45deg); }

/* Split (content + photo) */
.split { display: flex; }
.split-text { width: 56%; padding: 80px 64px 72px; }
.split-img { width: 44%; background-size: cover; background-position: center; }

/* Stats */
.stat-slide, .pad .stats { }
.stats { display: flex; gap: 64px; align-items: center; justify-content: center; height: calc(100% - 180px); flex-wrap: wrap; }
.stats-1 { justify-content: flex-start; }
.stat-item { text-align: center; }
.stat-value { font-family: ${t.head}; font-size: 108px; font-weight: 800; color: ${t.accent}; line-height: 1; }
.stats-1 .stat-value { font-size: 150px; }
.stat-lbl { margin-top: 14px; font-size: 24px; color: ${t.bodyText}; max-width: 340px; }

/* Quote */
.quote-slide { padding: 96px 120px; display: flex; flex-direction: column; justify-content: center; }
.quote-mark { font-family: ${t.head}; font-size: 140px; line-height: 0.6; color: ${t.accent}; height: 70px; }
.quote-slide blockquote { font-family: ${t.head}; font-size: 46px; font-weight: 700; line-height: 1.28; color: ${t.ink}; }
.attribution { margin-top: 34px; font-size: 24px; color: ${t.muted}; }

/* Footer */
.footer { position: absolute; bottom: 30px; left: 96px; right: 96px; display: flex; justify-content: space-between; font-size: 14px; color: ${t.muted}; border-top: 1px solid #e5e7eb; padding-top: 12px; }
.split .footer { left: 64px; right: calc(44% + 64px); }
`;
}
