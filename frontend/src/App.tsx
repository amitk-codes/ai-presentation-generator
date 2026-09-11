import { useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import GeneratorForm from "./components/GeneratorForm";
import SidePanel from "./components/SidePanel";
import Result from "./components/Result";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import Footer from "./components/Footer";
import { generatePresentation } from "./api";
import type { GenerateResponse, Status } from "./types";

export default function App() {
  const [content, setContent] = useState("");
  const [nSlides, setNSlides] = useState(6);
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("");
  const [instructions, setInstructions] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [meta, setMeta] = useState("");
  const [error, setError] = useState("");

  async function handleGenerate() {
    const topic = content.trim();
    if (!topic) return;
    setError("");
    setResult(null);
    setStatus("loading");
    try {
      const data = await generatePresentation({
        content: topic,
        n_slides: nSlides,
        tone,
        audience: audience.trim(),
        instructions: instructions.trim(),
      });
      setMeta(
        `${nSlides} slides · ${tone}${audience.trim() ? " · " + audience.trim() : ""} · PDF + PPTX`
      );
      setResult(data);
      setStatus("done");
    } catch (e) {
      setError("Generation failed. " + ((e as Error)?.message || "Please try again."));
      setStatus("error");
    }
  }

  function generateAnother() {
    setStatus("idle");
    setResult(null);
    document.getElementById("generate")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Nav />

      <main id="top" className="max-w-[1180px] mx-auto px-[clamp(20px,5vw,56px)] relative z-[1]">
        <Hero />

        <section
          id="generate"
          className="grid grid-cols-[1.35fr_1fr] gap-[22px] pb-5 items-start max-[900px]:grid-cols-1"
        >
          <GeneratorForm
            content={content}
            setContent={setContent}
            nSlides={nSlides}
            setNSlides={setNSlides}
            tone={tone}
            setTone={setTone}
            audience={audience}
            setAudience={setAudience}
            instructions={instructions}
            setInstructions={setInstructions}
            loading={status === "loading"}
            onSubmit={handleGenerate}
          />
          <SidePanel status={status} />
        </section>

        {status === "error" && (
          <section>
            <div className="banner-error">
              <p>{error}</p>
            </div>
          </section>
        )}

        {status === "done" && result && (
          <Result result={result} meta={meta} onAgain={generateAnother} />
        )}

        <HowItWorks />
        <Features />
      </main>

      <Footer />
    </>
  );
}
