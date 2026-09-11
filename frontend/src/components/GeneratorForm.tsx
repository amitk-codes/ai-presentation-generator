import { useState } from "react";
import { TONES } from "../types";

const EXAMPLES = [
  "The future of AI in healthcare",
  "Q3 go-to-market strategy",
  "Intro to Kubernetes for devs",
];

interface Props {
  content: string;
  setContent: (v: string) => void;
  nSlides: number;
  setNSlides: (v: number) => void;
  tone: string;
  setTone: (v: string) => void;
  audience: string;
  setAudience: (v: string) => void;
  instructions: string;
  setInstructions: (v: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

export default function GeneratorForm(props: Props) {
  const [advOpen, setAdvOpen] = useState(false);

  const clampSlides = (delta: number) =>
    props.setNSlides(Math.min(20, Math.max(3, props.nSlides + delta)));

  return (
    <div className="card reveal">
      <h2 className="card-title">Build your deck</h2>

      <form
        className="flex flex-col gap-[18px]"
        onSubmit={(e) => {
          e.preventDefault();
          props.onSubmit();
        }}
      >
        <label className="flex flex-col gap-2">
          <span className="field-label">Topic / content <em className="req">*</em></span>
          <textarea
            id="content"
            rows={3}
            required
            value={props.content}
            onChange={(e) => props.setContent(e.target.value)}
            placeholder="e.g. The future of remote work, for a leadership offsite"
          />
        </label>

        <div className="flex flex-wrap gap-2 -mt-1" aria-label="Example prompts">
          {EXAMPLES.map((ex) => (
            <button key={ex} type="button" className="chip" onClick={() => props.setContent(ex)}>
              {ex}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <span className="field-label">Tone</span>
          <div className="flex flex-wrap gap-2" role="tablist">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                className={"pill" + (props.tone === t ? " is-active" : "")}
                onClick={() => props.setTone(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col gap-2 flex-none">
            <span className="field-label">Slides</span>
            <div className="stepper">
              <button type="button" className="step-btn" aria-label="Fewer slides" onClick={() => clampSlides(-1)}>–</button>
              <input type="number" min={3} max={20} value={props.nSlides} readOnly />
              <button type="button" className="step-btn" aria-label="More slides" onClick={() => clampSlides(1)}>+</button>
            </div>
          </div>
          <label className="flex flex-col gap-2 flex-1">
            <span className="field-label">Audience <em className="opt">(optional)</em></span>
            <input
              type="text"
              value={props.audience}
              onChange={(e) => props.setAudience(e.target.value)}
              placeholder="e.g. executives, students"
            />
          </label>
        </div>

        <button
          type="button"
          className="adv-toggle"
          aria-expanded={advOpen}
          onClick={() => setAdvOpen((o) => !o)}
        >
          <span>Advanced instructions</span>
          <span className="chev">▸</span>
        </button>
        {advOpen && (
          <div className="reveal">
            <label className="flex flex-col gap-2">
              <textarea
                rows={2}
                value={props.instructions}
                onChange={(e) => props.setInstructions(e.target.value)}
                placeholder="e.g. Include a slide on cost savings; keep it upbeat"
              />
            </label>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-block" disabled={props.loading}>
          {props.loading ? "Generating…" : "Generate presentation"}
        </button>
      </form>
    </div>
  );
}
