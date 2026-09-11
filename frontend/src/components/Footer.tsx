export default function Footer() {
  return (
    <footer className="border-t border-line mt-5 relative z-[1]">
      <div className="max-w-[1180px] mx-auto px-[clamp(20px,5vw,56px)] py-7 flex justify-between items-center gap-4 flex-wrap">
        <div className="inline-flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <span className="w-4 h-4 bg-brand shadow-hard inline-block" />
          <span>AI Presentation <span className="text-brand">Generator</span></span>
        </div>
        <p className="text-muted text-[13px] m-0">
          Built with <span className="text-brand">♥</span> by <strong>Amit Kumar</strong>
          {" · "}
          <a href="https://github.com/amitk-codes" target="_blank" rel="noopener"
             className="text-ink hover:text-brand transition-colors underline underline-offset-2 decoration-line-2">GitHub</a>
          {" · "}
          <a href="https://www.linkedin.com/in/amitkumar-aiml" target="_blank" rel="noopener"
             className="text-ink hover:text-brand transition-colors underline underline-offset-2 decoration-line-2">LinkedIn</a>
        </p>
      </div>
    </footer>
  );
}
