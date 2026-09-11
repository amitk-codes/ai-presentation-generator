import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { toLocal } from "../api";
import type { GenerateResponse } from "../types";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

interface Props {
  result: GenerateResponse;
  meta: string;
  onAgain: () => void;
}

export default function Result({ result, meta, onAgain }: Props) {
  const pdfLocal = toLocal(result.files.pdf);
  const pptxLocal = result.files.pptx ? toLocal(result.files.pptx) : null;

  const rootRef = useRef<HTMLElement>(null);
  const bigRef = useRef<HTMLCanvasElement>(null);
  const thumbRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const pdfRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [active, setActive] = useState(1);

  // Load the PDF whenever the result changes.
  useEffect(() => {
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    let cancelled = false;
    setNumPages(0);
    setActive(1);
    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument(pdfLocal).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
      } catch {
        /* leave the preview blank on failure */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfLocal]);

  // Render the thumbnail strip once we know the page count.
  useEffect(() => {
    const pdf = pdfRef.current;
    if (!pdf || numPages === 0) return;
    let cancelled = false;
    (async () => {
      for (let n = 1; n <= numPages; n++) {
        const canvas = thumbRefs.current[n - 1];
        if (!canvas) continue;
        const page = await pdf.getPage(n);
        if (cancelled) return;
        const vp = page.getViewport({ scale: 0.34 });
        canvas.width = vp.width;
        canvas.height = vp.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport: vp }).promise;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [numPages]);

  // Render the big preview for the selected slide.
  useEffect(() => {
    const pdf = pdfRef.current;
    if (!pdf || numPages === 0 || !bigRef.current) return;
    let cancelled = false;
    (async () => {
      const page = await pdf.getPage(active);
      if (cancelled) return;
      const vp = page.getViewport({ scale: 2 }); // hi-dpi; CSS scales to 100%
      const c = bigRef.current!;
      c.width = vp.width;
      c.height = vp.height;
      await page.render({ canvasContext: c.getContext("2d")!, viewport: vp }).promise;
    })();
    return () => {
      cancelled = true;
    };
  }, [active, numPages]);

  return (
    <section id="result" className="reveal pb-5" ref={rootRef}>
      <div className="card">
        <div className="flex justify-between items-start gap-5 mb-[22px] flex-wrap">
          <div>
            <div className="text-xs font-semibold tracking-[3px] text-brand mb-[10px]">READY</div>
            <h2 className="text-[22px] font-bold m-0">{result.title || "Your presentation"}</h2>
            <p className="text-muted text-sm m-0">{meta}</p>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            <a className="btn btn-primary btn-sm" href={pdfLocal} download>Download PDF</a>
            {pptxLocal && (
              <a className="btn btn-ghost btn-sm" href={pptxLocal} download>Download PPTX</a>
            )}
            <button className="btn btn-ghost btn-sm" type="button" onClick={onAgain}>
              Generate another
            </button>
          </div>
        </div>
        <div className="grid grid-cols-[150px_1fr] gap-[18px] max-[620px]:grid-cols-1">
          <div className="thumbs" aria-label="Slide thumbnails">
            {Array.from({ length: numPages }).map((_, i) => (
              <canvas
                key={i}
                ref={(el) => {
                  thumbRefs.current[i] = el;
                }}
                className={active === i + 1 ? "is-active" : ""}
                title={"Slide " + (i + 1)}
                style={{ animationDelay: i * 0.05 + "s" }}
                onClick={() => setActive(i + 1)}
              />
            ))}
          </div>
          <div className="preview">
            <canvas ref={bigRef} id="previewCanvas" aria-label="Selected slide" />
          </div>
        </div>
      </div>
    </section>
  );
}
