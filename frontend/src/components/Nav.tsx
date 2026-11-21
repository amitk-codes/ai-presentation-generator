export default function Nav() {
  return (
    <header className="sticky top-0 z-50 flex items-center gap-6 px-[clamp(20px,5vw,56px)] py-4 bg-[rgba(17,17,17,0.82)] backdrop-blur-[10px] border-b border-line">
      <a href="#top" className="inline-flex items-center gap-2.5">
        <span className="w-4 h-4 bg-brand shadow-hard inline-block shrink-0" />
        <span className="flex flex-col leading-none">
          <span className="font-bold text-lg max-[620px]:text-base tracking-tight">
            Deck<span className="text-brand">Gen</span>
          </span>
        </span>
      </a>
      <nav className="flex gap-[26px] ml-3 max-[900px]:hidden">
        <a href="#how" className="nav-link">How it works</a>
        <a href="#features" className="nav-link">Features</a>
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex gap-1.5 max-[620px]:hidden" aria-hidden="true">
          <span className="tech-pill">n8n</span>
          <span className="tech-pill">MCP</span>
        </div>
        <a href="#generate" className="btn btn-primary btn-sm max-[620px]:hidden">Generate ↓</a>
      </div>
    </header>
  );
}
