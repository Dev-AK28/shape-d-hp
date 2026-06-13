type FaviconImageProps = {
  size: number;
};

export function FaviconImage({ size }: FaviconImageProps) {
  const symbolSize = Math.round(size * 0.52);
  const shadowBlur = Math.max(4, Math.round(size * 0.12));

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(145deg, #0A192F 0%, #1e1b4b 55%, #312e81 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: symbolSize,
          fontWeight: 700,
          fontFamily: 'serif',
          background: 'linear-gradient(135deg, #93c5fd 0%, #60a5fa 45%, #a78bfa 100%)',
          backgroundClip: 'text',
          color: 'transparent',
          filter: `drop-shadow(0 ${Math.round(size * 0.04)}px ${shadowBlur}px rgba(96, 165, 250, 0.65))`,
          letterSpacing: '-0.05em',
        }}
      >
        ∞
      </div>
    </div>
  );
}
