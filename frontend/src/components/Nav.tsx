export default function Nav() {
  return (
    <header className="sticky top-0 z-50 flex items-center gap-6 px-[clamp(20px,5vw,56px)] py-4 bg-[rgba(17,17,17,0.82)] backdrop-blur-[10px] border-b border-line">
      <a href="#top" className="inline-flex items-center gap-2.5 font-bold text-xl tracking-tight">
        <span className="w-4 h-4 bg-brand shadow-hard inline-block" />
        <span>AI Presentation <span className="text-brand">Generator</span></span>
      </a>
      <nav className="flex gap-[26px] ml-3 max-[900px]:hidden">
        <a href="#how" className="nav-link">How it works</a>
        <a href="#features" className="nav-link">Features</a>
        <a href="https://github.com/" target="_blank" rel="noopener" className="nav-link">GitHub ↗</a>
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex gap-1.5 max-[620px]:hidden" aria-hidden="true">
          <span className="tech-pill">n8n</span>
          <span className="tech-pill">Gemini</span>
          <span className="tech-pill">MCP</span>
        </div>
        <a href="#generate" className="btn btn-primary btn-sm">Generate ↓</a>
      </div>
    </header>
  );
}
