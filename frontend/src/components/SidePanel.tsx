import { useEffect, useState } from "react";
import type { Status } from "../types";

const LIVE_STEPS = [
  "Understanding your topic",
  "Outlining the deck",
  "Writing the slides",
  "Rendering PDF & PPTX",
];

function LiveStatus() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const t = setInterval(
      () => setActive((a) => Math.min(a + 1, LIVE_STEPS.length - 1)),
      1300
    );
    return () => clearInterval(t);
  }, []);
  const progress = 8 + (active / (LIVE_STEPS.length - 1)) * 78;
  return (
    <aside className="card reveal sticky top-[88px] max-[900px]:static">
      <h3 className="card-title">Generating…</h3>
      <ul className="live-steps">
        {LIVE_STEPS.map((s, i) => (
          <li key={i} className={i < active ? "is-done" : i === active ? "is-active" : ""}>
            {s}
          </li>
        ))}
      </ul>
      <div className="progress">
        <div className="progress-bar" style={{ width: progress + "%" }} />
      </div>
    </aside>
  );
}

function HowItWorksSide() {
  return (
    <aside className="card reveal sticky top-[88px] max-[900px]:static">
      <h3 className="card-title">How it works</h3>
      <ol className="list-none m-0 p-0 flex flex-col gap-[18px]">
        <li className="flex gap-[14px]">
          <span className="step-n">1</span>
          <div><b className="text-[15px]">Describe your topic</b><p className="mt-[3px] text-[13.5px] text-muted">A prompt and a few options — that's it.</p></div>
        </li>
        <li className="flex gap-[14px]">
          <span className="step-n">2</span>
          <div><b className="text-[15px]">AI writes the slides</b><p className="mt-[3px] text-[13.5px] text-muted">Gemini drafts a structured, on-topic deck.</p></div>
        </li>
        <li className="flex gap-[14px]">
          <span className="step-n">3</span>
          <div><b className="text-[15px]">Download &amp; present</b><p className="mt-[3px] text-[13.5px] text-muted">Get a PDF and an editable PowerPoint.</p></div>
        </li>
      </ol>
      <div className="mt-[22px] pt-[18px] border-t border-line text-[13px] text-muted flex items-center gap-2">
        <span className="w-2 h-2 bg-brand rounded-full animate-pulse-dot inline-block" />
        Same engine powers the ChatGPT / Claude MCP.
      </div>
    </aside>
  );
}

export default function SidePanel({ status }: { status: Status }) {
  return status === "loading" ? <LiveStatus /> : <HowItWorksSide />;
}
