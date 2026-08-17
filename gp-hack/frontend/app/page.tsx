import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-background text-foreground">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-between px-6 md:px-16 py-6 overflow-hidden">
  <div
    className="absolute inset-0 bg-cover bg-center opacity-40 z-0"
    style={{
      backgroundImage:
        "url('https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=1600&q=80')",
    }}
  />
  <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-background z-0" />
  <svg
    className="absolute inset-0 w-full h-full z-0 pointer-events-none"
    viewBox="0 0 1000 600"
    preserveAspectRatio="none"
  >
    <path
      d="M -100 400 Q 300 250 500 350 T 1100 200"
      fill="none"
      stroke="#FF1E1E"
      strokeWidth="2"
      className="hero-line"
      style={{ filter: "drop-shadow(0 0 8px #FF1E1E)" }}
    />
  </svg>

        <header className="relative z-10 flex justify-between items-center">
          <span className="font-black tracking-tighter text-racing-red text-xl hidden md:block">
            SILENT CO-DRIVER
          </span>
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 bg-surface-container-high px-6 py-3 border border-outline hover:border-racing-red transition-colors"
          >
            <span className="font-mono text-[11px] tracking-widest uppercase group-hover:text-racing-red transition-colors">
              Enter Dashboard
            </span>
          </Link>
        </header>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-end pb-16 pt-24">
          <div className="md:col-span-8 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-racing-red animate-pulse" />
              <span className="font-mono text-[11px] tracking-[0.2em] text-racing-red uppercase">
                AI Race Intelligence
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">
              The Silent
              <br />
              Co-Driver
            </h1>
            <p className="text-text-muted max-w-lg mt-2 border-l-2 border-racing-red pl-4">
              When the driver speaks, listen beyond the words.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link
                href="/dashboard"
                className="bg-racing-red text-white font-mono text-sm px-8 py-4 uppercase text-center hover:bg-racing-red-container transition-colors shadow-[0_0_15px_rgba(255,30,30,0.3)]"
              >
                INITIALIZE SYSTEM
              </Link>
            </div>
          </div>

          <div className="md:col-span-4 hidden md:flex justify-end">
            <div className="relative bg-black/60 backdrop-blur-md border border-outline p-6 w-full max-w-sm flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-surface-container-high pb-2">
                <span className="font-mono text-[11px] text-text-dim uppercase">Status Monitor</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-racing-red">LIVE</span>
                  <div className="w-2 h-2 rounded-full bg-racing-red animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] text-text-dim">DRIVER</span>
                <span className="font-mono text-lg text-white">#44 | RADIO ACTIVE</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] text-text-dim">VOCAL STATE</span>
                <div className="flex justify-between items-end">
                  <span className="font-mono text-lg text-racing-red">STRESSED</span>
                  <span className="font-mono text-[11px] text-text-dim">(87%)</span>
                </div>
                <div className="w-full h-1 bg-surface-container-high mt-1">
                  <div className="h-full bg-racing-red w-[87%]" />
                </div>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span className="font-mono text-[11px] text-text-dim">LAP 12 PERFORMANCE</span>
                <span className="font-mono text-lg text-white">
                  1:35.60 <span className="text-red-400 ml-2">+1.24S</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="py-24 px-6 md:px-16 border-t border-surface-container-high">
        <div className="max-w-5xl mx-auto flex flex-col gap-16">
          <h2 className="text-3xl md:text-5xl font-bold text-center uppercase tracking-tighter leading-tight">
            The radio hears everything.
            <br />
            <span className="text-text-dim">But engineers can&apos;t.</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-surface-container-highest">
            {[
              { title: "Radio", desc: "Raw, noisy driver comms captured in high-stress environments." },
              { title: "Vocal State", desc: "AI models extract pitch, tone, and urgency markers." },
              { title: "Lap Performance", desc: "Correlate emotional state directly to lap times." },
            ].map((item) => (
              <div key={item.title} className="bg-surface p-8 flex flex-col items-center text-center gap-4">
                <h3 className="font-mono text-white uppercase">{item.title}</h3>
                <p className="text-sm text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col gap-16">
          <h2 className="text-3xl font-bold uppercase tracking-tighter border-b border-surface-container-high pb-8">
            The Pipeline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-surface-container-highest">
            {[
              { n: "01", title: "Listen", desc: "Ingest raw audio from driver comms." },
              { n: "02", title: "Transcribe", desc: "Speech-to-text model outputs readable text." },
              { n: "03", title: "Understand", desc: "Acoustic analysis quantifies emotional state." },
              { n: "04", title: "Correlate", desc: "Match emotional state with lap performance." },
            ].map((step) => (
              <div key={step.n} className="bg-surface p-8 flex flex-col gap-8">
                <span className="font-mono text-text-dim">{step.n}</span>
                <h3 className="text-xl font-bold text-white uppercase">{step.title}</h3>
                <p className="text-sm text-text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 md:px-16 border-t border-surface-container-high flex flex-col items-center text-center gap-8">
        <h2 className="text-4xl md:text-6xl font-black text-racing-red uppercase tracking-tighter">
          Don&apos;t just listen.
          <br />
          Understand.
        </h2>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-12 py-5 bg-racing-red text-white font-mono uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,30,30,0.4)]"
        >
          Initialize System
        </Link>
      </section>
    </div>
  );
}