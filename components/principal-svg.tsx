export function PrincipalSVG({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background circle */}
      <circle cx="200" cy="200" r="200" fill="#FDE2E4" />

      {/* AP Logo - Large */}
      <g>
        {/* A */}
        <path
          d="M 100 80 L 180 280 L 130 280 L 110 230 L 50 230 L 30 280 L 0 280 L 80 80 Z M 65 190 L 45 120 L 25 190 Z"
          fill="#DC2626"
        />
        {/* P */}
        <path
          d="M 200 80 L 270 80 Q 310 80 310 120 Q 310 150 270 150 L 240 150 L 240 280 L 200 280 Z M 240 110 L 240 150 L 270 150 Q 290 150 290 120 Q 290 110 270 110 L 240 110 Z"
          fill="#DC2626"
        />
        {/* Chat bubble */}
        <circle cx="280" cy="100" r="35" fill="#DC2626" />
        <circle cx="280" cy="100" r="30" fill="white" />
        <circle cx="275" cy="95" r="3" fill="#DC2626" />
        <circle cx="285" cy="95" r="3" fill="#DC2626" />
        <circle cx="295" cy="95" r="3" fill="#DC2626" />
        {/* Bubble tail */}
        <path d="M 260 130 L 250 150 L 270 140 Z" fill="white" />
      </g>

      {/* Book shape at bottom */}
      <g>
        {/* Left page */}
        <path
          d="M 80 300 L 80 380 Q 80 390 90 390 L 160 390 L 160 300 Z"
          fill="none"
          stroke="#DC2626"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Right page */}
        <path
          d="M 160 300 L 160 390 L 230 390 Q 240 390 240 380 L 240 300 Z"
          fill="none"
          stroke="#DC2626"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Spine */}
        <line x1="160" y1="300" x2="160" y2="390" stroke="#DC2626" strokeWidth="12" />
        {/* Lines on pages */}
        <line x1="100" y1="320" x2="140" y2="320" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" />
        <line x1="100" y1="345" x2="140" y2="345" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" />
        <line x1="100" y1="370" x2="140" y2="370" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" />
        <line x1="180" y1="320" x2="220" y2="320" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" />
        <line x1="180" y1="345" x2="220" y2="345" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" />
        <line x1="180" y1="370" x2="220" y2="370" stroke="#DC2626" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
