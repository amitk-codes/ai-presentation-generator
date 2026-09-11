export default function HowItWorks() {
  return (
    <section id="how" className="reveal py-[clamp(40px,6vw,72px)] border-t border-line">
      <h2 className="text-[clamp(26px,4vw,40px)] font-bold mb-[34px]">
        From prompt to deck, <em>automatically</em>.
      </h2>
      <div className="grid grid-cols-3 gap-[18px] max-[900px]:grid-cols-1">
        <div className="how-step">
          <span className="how-n">01</span>
          <b className="text-[18px]">You describe it</b>
          <p className="text-muted mt-1.5 text-[14.5px]">Type a topic and pick a tone, slide count, and audience.</p>
        </div>
        <div className="how-step">
          <span className="how-n">02</span>
          <b className="text-[18px]">The workflow builds it</b>
          <p className="text-muted mt-1.5 text-[14.5px]">A visual n8n workflow drafts a structured deck with AI, then renders it.</p>
        </div>
        <div className="how-step">
          <span className="how-n">03</span>
          <b className="text-[18px]">You download it</b>
          <p className="text-muted mt-1.5 text-[14.5px]">A clean PDF and a fully editable PowerPoint — in seconds.</p>
        </div>
      </div>
    </section>
  );
}
