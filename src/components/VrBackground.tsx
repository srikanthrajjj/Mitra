interface VrBackgroundProps {
  variant?: 'full' | 'subtle';
}

/** Decorative VR/HUD layers — neon accent kept minimal (~10% of visual weight). */
export default function VrBackground({ variant = 'full' }: VrBackgroundProps) {
  if (variant === 'subtle') {
    return (
      <div className="vr-bg-subtle" aria-hidden>
        <div className="vr-bg-rays" />
        <div className="vr-bg-stars" />
      </div>
    );
  }

  return (
    <div className="vr-bg-environment" aria-hidden>
      <div className="vr-bg-rays" />
      <div className="vr-bg-stars" />
      <div className="vr-bg-grid" />
    </div>
  );
}
