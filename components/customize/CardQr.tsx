// A stylized QR graphic used on card backs. Purely decorative (a real QR is
// generated at fulfillment) but reads convincingly as a scannable code.
export default function CardQr({ dark = "#111827", size = 56 }: { dark?: string; size?: number }) {
  const cell = size / 7;
  const finder = (gx: number, gy: number) => (
    <g key={`f-${gx}-${gy}`}>
      <rect x={gx * cell} y={gy * cell} width={cell * 3} height={cell * 3} rx={1} fill={dark} />
      <rect x={(gx + 0.55) * cell} y={(gy + 0.55) * cell} width={cell * 1.9} height={cell * 1.9} rx={0.5} fill="#fff" />
      <rect x={(gx + 1) * cell} y={(gy + 1) * cell} width={cell} height={cell} fill={dark} />
    </g>
  );
  const dots: [number, number][] = [
    [4, 0], [5, 1], [4, 2], [6, 2], [3, 3], [2, 4], [3, 5], [5, 4], [6, 5], [4, 6], [5, 6], [6, 4],
  ];
  return (
    <div className="rounded-lg bg-white p-1.5 shadow-sm">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <rect width={size} height={size} fill="#fff" />
        {finder(0, 0)}
        {finder(4, 0)}
        {finder(0, 4)}
        {dots.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x * cell + 0.5} y={y * cell + 0.5} width={cell - 1} height={cell - 1} fill={dark} />
        ))}
      </svg>
    </div>
  );
}
