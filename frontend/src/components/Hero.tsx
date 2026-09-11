import { useEffect, useState } from "react";

function Stat({
  target,
  label,
  prefix = "",
  suffix = "",
}: {
  target: number;
  label: string;
  prefix?: string;
  suffix?: string;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    let raf = 0;
    const step = Math.max(1, Math.round(target / 24));
    const tick = () => {
      cur = Math.min(target, cur + step);
      setVal(cur);
      if (cur < target) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return (
    <div className="flex flex-col">
      <span className="text-[40px] font-bold text-brand leading-none">{prefix}{val}{suffix}</span>
      <span className="text-[13px] text-muted mt-1.5 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="reveal pt-[clamp(48px,8vw,92px)] pb-[clamp(28px,4vw,44px)]">
      <div className="text-xs font-semibold tracking-[3px] text-brand mb-[18px]">
        AI PRESENTATION AUTOMATION
      </div>
      <h1 className="text-[clamp(40px,7vw,76px)] leading-[1.02]">
        Generate a <em>Presentation</em>
        <br />
        in seconds.
      </h1>
      <p className="max-w-[620px] mt-6 text-[clamp(16px,2vw,19px)] text-muted">
        Describe your topic — get a polished, downloadable deck as <strong>PDF</strong> and
        editable <strong>PowerPoint</strong>. Powered by an automated n8n workflow.
      </p>
      <div className="flex flex-wrap gap-[clamp(24px,5vw,56px)] mt-10">
        <Stat target={4} prefix="~" suffix="s" label="avg. generation" />
        <Stat target={2} label="formats out" />
        <Stat target={2} label="ways in — web & MCP" />
      </div>
    </section>
  );
}
