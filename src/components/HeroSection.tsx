"use client";

import { Link } from "react-router-dom";

const TEAL   = "rgb(var(--primary-500))";
const TEAL_D = "rgb(var(--hero-dim))";
const TEAL_L = "rgb(var(--hero-emphasis))";
const BG     = "rgb(var(--bg-900))";
const FG_DIM = "rgb(var(--fg-100) / 0.48)";

// A real longevity-peps product photo, not video/animation — no Vertalis
// footage or particle-canvas effect.
const HERO_IMAGE = "https://longevitytech-lab.store/__l5e/assets-v1/65c3b5d2-d359-4179-b379-666cae6b7a4e/main-cover.png";

export default function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        height: "calc(100vh - 72px)",
        minHeight: 560,
        maxHeight: 880,
        background: BG,
      }}
    >
      {/* Static hero image, right-aligned — object-contain so the real
          product photo is never cropped, whatever its native composition. */}
      <img
        src={HERO_IMAGE}
        alt=""
        className="absolute inset-0 z-0 w-full h-full object-contain object-right pointer-events-none"
        aria-hidden="true"
      />

      {/* Radial ambient */}
      <div className="absolute inset-0 z-0" style={{
        background: "radial-gradient(ellipse 58% 75% at 70% 50%, rgb(var(--primary-500) / 0.06) 0%, transparent 65%)",
      }} />

      {/* Grid */}
      <div className="absolute inset-0 z-[1] grid-overlay opacity-[0.07] pointer-events-none" />

      {/* Left fade so text stays readable over the hero image. */}
      <div className="absolute inset-0 z-[2] pointer-events-none" style={{
        background: "linear-gradient(to right, rgb(var(--bg-900) / 1) 0%, rgb(var(--bg-900) / 0.97) 16%, rgb(var(--bg-900) / 0.86) 30%, rgb(var(--bg-900) / 0.65) 42%, rgb(var(--bg-900) / 0.4) 54%, rgb(var(--bg-900) / 0.2) 64%, rgb(var(--bg-900) / 0.06) 74%, rgb(var(--bg-900) / 0) 84%)",
      }} />

      {/* ── Text + visual panel · both anchored to the same 1440px grid so left/right gutters match exactly ── */}
      <div className="relative z-[8] h-full w-full max-w-[1440px] mx-auto px-6 md:px-10 flex items-center justify-between gap-10 lg:gap-16">
        <div className="max-w-[580px]">

          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-7" style={{ animation: "nvFadeUp 0.8s ease forwards 0.25s", opacity: 0 }}>
            <span style={{ width: 28, height: 1, background: TEAL, display: "inline-block" }}/>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: TEAL_D }}>
              Australian Research Grade Peptides
            </p>
          </div>

          {/* Main headline · Longevity Peptides's own copy */}
          <div style={{ marginBottom: 14 }}>
            <h1 style={{
              fontSize: "clamp(44px, 5.8vw, 82px)", lineHeight: 0.9,
              fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
              letterSpacing: "-0.03em", color: "rgb(var(--fg-100))",
              animation: "nvFadeUp 0.9s ease forwards 0.42s", opacity: 0,
            }}>
              Research‑Grade
            </h1>
            <h1 style={{
              fontSize: "clamp(44px, 5.8vw, 82px)", lineHeight: 0.9,
              fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
              letterSpacing: "-0.03em",
              background: `linear-gradient(135deg, ${TEAL_D} 0%, ${TEAL_L} 40%, ${TEAL} 80%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "nvFadeUp 0.9s ease forwards 0.56s", opacity: 0,
            }}>
              Peptides.
            </h1>
            <h1 style={{
              fontSize: "clamp(44px, 5.8vw, 82px)", lineHeight: 0.9,
              fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700,
              letterSpacing: "-0.03em",
              color: "transparent", WebkitTextStroke: `1.5px ${TEAL_D}`,
              animation: "nvFadeUp 0.9s ease forwards 0.7s", opacity: 0,
            }}>
              Verified.
            </h1>
          </div>

          {/* Sub-label */}
          <p style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: "clamp(9px,1vw,12px)",
            color: TEAL_D, letterSpacing: "0.22em", textTransform: "uppercase",
            marginBottom: 16, animation: "nvFadeUp 0.9s ease forwards 0.84s", opacity: 0,
          }}>
            Precision Synthesis · Independent COA · Lyophilized
          </p>

          {/* Divider */}
          <div style={{
            width: 280, height: 1,
            background: `linear-gradient(to right, ${TEAL}, rgb(var(--primary-500) / 0.06))`,
            marginBottom: 16, animation: "nvFadeUp 0.8s ease forwards 0.94s", opacity: 0,
          }} />

          {/* Body */}
          <p style={{
            fontSize: "clamp(12px,1.2vw,14px)", lineHeight: 1.75, color: FG_DIM,
            maxWidth: 420, marginBottom: 4,
            animation: "nvFadeUp 0.9s ease forwards 1.04s", opacity: 0,
          }}>
            Premium research-grade peptides lyophilized and verified in Australia. Engineered for consistency, stability, and analytical reliability.
          </p>
          <p style={{
            fontSize: 10, fontStyle: "italic", color: "rgb(var(--fg-100) / 0.2)",
            marginBottom: 20, animation: "nvFadeUp 0.9s ease forwards 1.12s", opacity: 0,
          }}>
            *For Research Use Only. Not intended for human consumption.*
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-2" style={{ marginBottom: 24, animation: "nvFadeUp 0.9s ease forwards 1.18s", opacity: 0 }}>
            {["≥99% PURITY", "3RD PARTY TESTED", "LYOPHILIZED · NO COLD-CHAIN"].map((b) => (
              <div key={b} className="flex items-center gap-2" style={{
                padding: "5px 12px", border: `1px solid rgb(var(--primary-500) / 0.25)`,
                background: "rgb(var(--primary-500) / 0.04)",
                fontFamily: "'JetBrains Mono',monospace", fontSize: 9.5,
                letterSpacing: "0.13em", color: TEAL,
              }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: TEAL, display: "inline-block", animation: "nvPulse 2s ease-in-out infinite" }}/>
                {b}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-5" style={{ marginBottom: 30, animation: "nvFadeUp 0.9s ease forwards 1.3s", opacity: 0 }}>
            <Link to="/shop" className="inline-flex items-center gap-3 transition-all duration-200 whitespace-nowrap"
              style={{ background: TEAL, color: BG, padding: "13px 30px", fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = TEAL_L; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = TEAL; }}>
              Shop Catalog <i className="ri-arrow-right-line"/>
            </Link>
            <Link to="/coa" className="transition-all duration-200 whitespace-nowrap"
              style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, letterSpacing: "0.14em", color: TEAL_D, borderBottom: `1.5px solid rgb(var(--primary-500) / 0.28)`, paddingBottom: 2 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = TEAL; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = TEAL_D; }}>
              Verify a COA →
            </Link>
          </div>

        </div>

        {/* Right side · the product photo lives in the full-bleed background
            image (positioned right), so this column just reserves the
            matching gutter and hosts the trust chip. */}
        <div className="hidden lg:block relative shrink-0" style={{ width: "48%", maxWidth: 760, height: "88%" }}>
          {/* Compact trust chip, floated over the bottom of the visual */}
          <div
            className="absolute left-1/2 bottom-2 -translate-x-1/2 w-[86%] max-w-[420px]"
            style={{ animation: "nvFadeUp 0.9s ease forwards 1.3s", opacity: 0 }}
          >
            <Link
              to="/coa"
              className="flex items-center justify-between gap-4 rounded-xl border border-background-200/60 bg-background-900/70 backdrop-blur-sm px-6 py-4 hover:bg-primary-500/[0.05] transition-colors duration-300 cursor-pointer"
              style={{ boxShadow: "0 30px 80px -24px rgba(0,0,0,0.55)" }}
            >
              <span className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" style={{ animation: "nvPulse 2s ease-in-out infinite" }} />
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "rgb(var(--fg-100) / 0.75)" }}>
                  99.15% Purity · Batch VTX‑24‑1142‑C
                </span>
              </span>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, letterSpacing: "0.1em", color: TEAL, whiteSpace: "nowrap" }}>
                View COA →
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 z-[9]" style={{ height: 1, background: `linear-gradient(to right, ${TEAL}, rgb(var(--primary-500) / 0.05))`, opacity: 0.25 }}/>

      {/* Edge vignette */}
      <div className="absolute inset-0 z-[6] pointer-events-none" style={{ background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 46%, rgba(5,5,5,0.55) 100%)" }}/>

      <style>{`
        @keyframes nvFadeUp {
          from { opacity:0; transform:translateY(14px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes nvPulse {
          0%,100% { opacity:0.9; transform:scale(1); }
          50%     { opacity:0.5; transform:scale(0.85); }
        }
        @keyframes nvFloat {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-8px); }
        }
        @keyframes nvFloat2 {
          0%,100% { transform:translateY(0); }
          50%     { transform:translateY(-5px); }
        }
      `}</style>
    </section>
  );
}
