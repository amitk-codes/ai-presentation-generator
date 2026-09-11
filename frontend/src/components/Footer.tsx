export default function Footer() {
  return (
    <footer className="border-t border-line mt-5 relative z-[1]">
      <div className="max-w-[1180px] mx-auto px-[clamp(20px,5vw,56px)] py-7 flex justify-between items-center gap-4 flex-wrap">
        <div className="inline-flex items-center gap-2.5 font-bold text-xl tracking-tight">
          <span className="w-4 h-4 bg-brand shadow-hard inline-block" />
          <span>AI Presentation <span className="text-brand">Generator</span></span>
        </div>
        <p className="text-muted text-[13px] m-0">
          Built for the <strong>ContentBeta</strong> assessment · n8n · Gemini · MCP · Docker
        </p>
      </div>
    </footer>
  );
}
