const FEATURES = [
  { ic: "◆", title: "n8n workflow", body: "The generation logic lives as a visible, editable workflow — the brain." },
  { ic: "✦", title: "Fast AI drafting", body: "Structured, on-topic slides in about four seconds." },
  { ic: "▤", title: "PDF + PPTX", body: "A polished PDF and a genuinely editable PowerPoint from one source." },
  { ic: "⌘", title: "MCP server", body: "Generate from inside ChatGPT or Claude — same workflow, one tool." },
];

export default function Features() {
  return (
    <section id="features" className="reveal py-[clamp(40px,6vw,72px)] border-t border-line">
      <h2 className="text-[clamp(26px,4vw,40px)] font-bold mb-[34px]">
        Built like a <em>product</em>.
      </h2>
      <div className="grid grid-cols-4 gap-4 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1">
        {FEATURES.map((f) => (
          <div className="feature" key={f.title}>
            <div className="feature-ic">{f.ic}</div>
            <b className="text-[16px]">{f.title}</b>
            <p className="text-muted text-[13.5px] mt-2">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
