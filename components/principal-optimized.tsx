export function PrincipalOptimized() {
  return (
    <svg
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background */}
      <rect width="400" height="400" fill="#fce4ec" />

      {/* Book - Left Page */}
      <path
        d="M 80 100 L 140 100 L 140 300 L 80 300 Z"
        fill="#dc2626"
        stroke="none"
      />

      {/* Book - Right Page */}
      <path
        d="M 140 100 L 200 100 L 200 300 L 140 300 Z"
        fill="#ef4444"
        stroke="none"
      />

      {/* Book Spine */}
      <line x1="140" y1="100" x2="140" y2="300" stroke="#991b1b" strokeWidth="2" />

      {/* "A" Letter - Large */}
      <text
        x="110"
        y="240"
        fontSize="120"
        fontWeight="bold"
        fill="#fce4ec"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
      >
        A
      </text>

      {/* "P" Letter - Large */}
      <text
        x="170"
        y="240"
        fontSize="120"
        fontWeight="bold"
        fill="#fce4ec"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
      >
        P
      </text>

      {/* Chat Bubble */}
      <circle cx="280" cy="140" r="45" fill="white" stroke="#dc2626" strokeWidth="3" />
      <path
        d="M 260 185 L 250 210 L 270 195 Z"
        fill="white"
        stroke="#dc2626"
        strokeWidth="2"
      />

      {/* Chat Dots */}
      <circle cx="270" cy="135" r="4" fill="#dc2626" />
      <circle cx="280" cy="135" r="4" fill="#dc2626" />
      <circle cx="290" cy="135" r="4" fill="#dc2626" />
    </svg>
  );
}
