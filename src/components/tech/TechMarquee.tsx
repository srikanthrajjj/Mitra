import { TECH_MARQUEE } from './techData';

/** Infinite CSS marquee of platform terms; pauses for reduced-motion users. */
export function TechMarquee() {
  const row = [...TECH_MARQUEE, ...TECH_MARQUEE];
  return (
    <div
      className="relative overflow-hidden border-y border-border bg-background py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
      aria-hidden
    >
      <div className="tech-marquee flex w-max gap-12">
        {row.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="flex items-center gap-12 font-display text-2xl font-extrabold uppercase tracking-[-0.02em] text-muted-foreground/60 md:text-4xl"
          >
            {t}
            <span className="h-2 w-2 rounded-full bg-brand-green" />
          </span>
        ))}
      </div>
      <style>{`
        @keyframes tech-marquee { to { transform: translateX(-50%); } }
        .tech-marquee { animation: tech-marquee 38s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .tech-marquee { animation: none; } }
      `}</style>
    </div>
  );
}
