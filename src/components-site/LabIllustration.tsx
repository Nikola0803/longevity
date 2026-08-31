/**
 * Shared line-art illustration used to break up the site's text-only pages
 * (About, Quality, FAQ, Contact, Blog, Veterans currently had zero imagery
 * outside product photos). Deliberately not stock photography — built from
 * the same visual language already established elsewhere on the site (the
 * MS-spectrum chart in HeroSection.tsx, the procedural peptide helix in
 * HeroVial3D.tsx, .molecule-bg/.grid-overlay in globals.css): thin teal
 * line-art, small pulsing accent nodes, no literal photography of people,
 * facilities, or products that don't exist.
 *
 * Pure SVG, server-renderable (no "use client" needed) except for the pulse
 * animations, which use CSS/SMIL rather than JS state.
 */

type Variant = "molecule" | "flask" | "spectrum" | "shield" | "helix";

const TEAL = "rgb(var(--primary-500))";
const TEAL_DIM = "rgb(var(--primary-500) / 0.35)";
const PLATINUM = "rgb(var(--fg-400) / 0.6)";

function MoleculeArt() {
  const nodes = [
    { x: 90, y: 120 }, { x: 190, y: 70 }, { x: 290, y: 130 },
    { x: 260, y: 240 }, { x: 140, y: 250 }, { x: 210, y: 190 },
  ];
  const bonds = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 5], [1, 5], [3, 5]];
  return (
    <>
      {bonds.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={PLATINUM} strokeWidth="1.25" />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={i === 5 ? 9 : 6} fill="rgb(var(--bg-900))" stroke={TEAL} strokeWidth="1.5" />
          {i % 2 === 0 && (
            <circle cx={n.x} cy={n.y} r="2" fill={TEAL}>
              <animate attributeName="opacity" values="1;0.25;1" dur={`${2.4 + i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          )}
        </g>
      ))}
    </>
  );
}

function FlaskArt() {
  return (
    <>
      <path d="M165 60h70v55l45 105a14 14 0 0 1-13 20H133a14 14 0 0 1-13-20l45-105V60z" fill="none" stroke={TEAL} strokeWidth="1.75" />
      <line x1="158" y1="60" x2="242" y2="60" stroke={TEAL} strokeWidth="1.75" />
      <line x1="150" y1="150" x2="250" y2="150" stroke={PLATINUM} strokeWidth="1" strokeDasharray="3 4" />
      <path d="M150 150l-30 70a14 14 0 0 0 13 20h134a14 14 0 0 0 13-20l-30-70" fill="rgb(var(--primary-500) / 0.06)" stroke="none" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={175 + i * 22} cy={205 - i * 6} r="3" fill={TEAL}>
          <animate attributeName="cy" values={`${205 - i * 6};${185 - i * 6};${205 - i * 6}`} dur={`${3 + i}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0.2;0.9" dur={`${3 + i}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </>
  );
}

function SpectrumArt() {
  const peaks = [
    { x: 40, h: 20 }, { x: 70, h: 12 }, { x: 100, h: 30 }, { x: 140, h: 18 },
    { x: 180, h: 60 }, { x: 210, h: 34 }, { x: 260, h: 120 }, { x: 290, h: 26 },
    { x: 320, h: 40 }, { x: 350, h: 16 },
  ];
  return (
    <>
      <line x1="20" y1="260" x2="360" y2="260" stroke={PLATINUM} strokeWidth="1" />
      {peaks.map((p, i) => (
        <line
          key={i}
          x1={p.x} x2={p.x} y1="260" y2={260 - p.h}
          stroke={p.h > 100 ? TEAL : TEAL_DIM}
          strokeWidth={p.h > 100 ? 3 : 1.75}
          strokeLinecap="round"
        />
      ))}
      <circle cx="260" cy={260 - 120} r="4" fill={TEAL}>
        <animate attributeName="opacity" values="1;0.3;1" dur="2.2s" repeatCount="indefinite" />
      </circle>
    </>
  );
}

function ShieldArt() {
  return (
    <>
      <path
        d="M200 55l95 34v70c0 68-40 108-95 131-55-23-95-63-95-131V89l95-34z"
        fill="rgb(var(--primary-500) / 0.05)"
        stroke={TEAL}
        strokeWidth="1.75"
      />
      <path d="M155 195l35 35 60-75" fill="none" stroke={TEAL} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="200" cy="55" r="3" fill={TEAL}>
        <animate attributeName="opacity" values="1;0.3;1" dur="2.6s" repeatCount="indefinite" />
      </circle>
    </>
  );
}

function HelixArt() {
  const rows = 9;
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => {
        const y = 40 + i * 24;
        const t = i / (rows - 1);
        const leftX = 130 + Math.sin(t * Math.PI * 2.2) * 70;
        const rightX = 270 - Math.sin(t * Math.PI * 2.2) * 70;
        return (
          <g key={i}>
            <line x1={leftX} y1={y} x2={rightX} y2={y} stroke={PLATINUM} strokeWidth="1" opacity="0.5" />
            <circle cx={leftX} cy={y} r="4" fill={TEAL} opacity={0.5 + t * 0.5} />
            <circle cx={rightX} cy={y} r="4" fill={TEAL} opacity={0.5 + (1 - t) * 0.5} />
          </g>
        );
      })}
    </>
  );
}

const ART: Record<Variant, () => React.ReactElement> = {
  molecule: MoleculeArt,
  flask: FlaskArt,
  spectrum: SpectrumArt,
  shield: ShieldArt,
  helix: HelixArt,
};

export default function LabIllustration({
  variant,
  className = "",
}: {
  variant: Variant;
  className?: string;
}) {
  const Art = ART[variant];
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgb(var(--primary-500) / 0.1) 0%, transparent 70%)" }}
      />
      <svg viewBox="0 0 400 300" className="relative w-full h-full" fill="none">
        <Art />
      </svg>
    </div>
  );
}
