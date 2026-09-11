export interface Theme {
  fontsHref: string; // Google Fonts <link> for the PDF render
  head: string; // CSS font-family for headings
  body: string; // CSS font-family for body
  pptxHead: string; // safe font for PowerPoint (avoids substitution)
  pptxBody: string;
  accent: string; // hex, "#RRGGBB"
  ink: string; // headings / strong text
  bodyText: string; // body text
  muted: string; // footers / captions
  coverFrom: string; // cover gradient start
  coverTo: string; // cover gradient end
  coverText: string; // text over cover / section
  sectionBg: string; // section slide bg when no image
}

export const THEMES: Record<string, Theme> = {
  professional: {
    fontsHref: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap",
    head: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    pptxHead: "Arial",
    pptxBody: "Arial",
    accent: "#2563EB",
    ink: "#0F172A",
    bodyText: "#334155",
    muted: "#94A3B8",
    coverFrom: "#1E3A8A",
    coverTo: "#2563EB",
    coverText: "#FFFFFF",
    sectionBg: "#0F172A",
  },
  casual: {
    fontsHref: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap",
    head: "'Poppins', sans-serif",
    body: "'Poppins', sans-serif",
    pptxHead: "Trebuchet MS",
    pptxBody: "Trebuchet MS",
    accent: "#0D9488",
    ink: "#134E4A",
    bodyText: "#374151",
    muted: "#6B7280",
    coverFrom: "#0D9488",
    coverTo: "#14B8A6",
    coverText: "#FFFFFF",
    sectionBg: "#134E4A",
  },
  academic: {
    fontsHref: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
    head: "'Merriweather', Georgia, serif",
    body: "Georgia, 'Times New Roman', serif",
    pptxHead: "Georgia",
    pptxBody: "Georgia",
    accent: "#15803D",
    ink: "#14532D",
    bodyText: "#1F2937",
    muted: "#6B7280",
    coverFrom: "#14532D",
    coverTo: "#166534",
    coverText: "#FFFFFF",
    sectionBg: "#14532D",
  },
  persuasive: {
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800&family=Inter:wght@400;600&display=swap",
    head: "'Montserrat', sans-serif",
    body: "'Inter', sans-serif",
    pptxHead: "Arial",
    pptxBody: "Arial",
    accent: "#DC2626",
    ink: "#0A0A0A",
    bodyText: "#262626",
    muted: "#737373",
    coverFrom: "#0A0A0A",
    coverTo: "#B91C1C",
    coverText: "#FFFFFF",
    sectionBg: "#0A0A0A",
  },
  inspirational: {
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Inter:wght@400;600&display=swap",
    head: "'Playfair Display', serif",
    body: "'Inter', sans-serif",
    pptxHead: "Georgia",
    pptxBody: "Arial",
    accent: "#DB2777",
    ink: "#18181B",
    bodyText: "#3F3F46",
    muted: "#71717A",
    coverFrom: "#7E22CE",
    coverTo: "#DB2777",
    coverText: "#FFFFFF",
    sectionBg: "#18181B",
  },
};

export function getTheme(name?: string): Theme {
  return (name && THEMES[name]) || THEMES.professional;
}

/** "#2563EB" -> "2563EB" for pptxgenjs. */
export const hex = (c: string) => c.replace("#", "");
