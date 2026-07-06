export function LogoSVG({ className = "h-12 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1809 555"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* AP Logo */}
      <g>
        {/* A */}
        <path
          d="M 150 100 L 280 350 L 200 350 L 170 280 L 80 280 L 50 350 L 0 350 L 130 100 Z M 125 230 L 95 150 L 65 230 Z"
          fill="#DC2626"
        />
        {/* P */}
        <path
          d="M 320 100 L 420 100 Q 480 100 480 160 Q 480 200 420 200 L 380 200 L 380 350 L 320 350 Z M 380 150 L 380 200 L 420 200 Q 450 200 450 160 Q 450 150 420 150 L 380 150 Z"
          fill="#DC2626"
        />
        {/* Book shape */}
        <path
          d="M 50 380 Q 50 360 70 360 L 350 360 Q 370 360 370 380 L 370 480 Q 370 500 350 500 L 70 500 Q 50 500 50 480 Z"
          fill="none"
          stroke="#DC2626"
          strokeWidth="20"
        />
        {/* Book pages */}
        <path d="M 120 400 Q 150 420 180 400" stroke="#DC2626" strokeWidth="15" fill="none" />
        <path d="M 120 450 Q 150 470 180 450" stroke="#DC2626" strokeWidth="15" fill="none" />
        {/* Divider line */}
        <line x1="420" y1="80" x2="420" y2="520" stroke="#DC2626" strokeWidth="8" />
      </g>

      {/* Text */}
      <g>
        {/* ANDERSON */}
        <text
          x="550"
          y="280"
          fontSize="180"
          fontWeight="900"
          fontFamily="Arial, sans-serif"
          fill="#000000"
          letterSpacing="5"
        >
          ANDERSON
        </text>
        {/* PALAFOZ */}
        <text
          x="550"
          y="400"
          fontSize="180"
          fontWeight="900"
          fontFamily="Arial, sans-serif"
          fill="#DC2626"
          letterSpacing="5"
        >
          PALAFOZ
        </text>
        {/* PROFESSOR DE INGLÊS */}
        <text
          x="550"
          y="480"
          fontSize="50"
          fontWeight="normal"
          fontFamily="Arial, sans-serif"
          fill="#000000"
          letterSpacing="2"
        >
          – PROFESSOR DE INGLÊS –
        </text>
      </g>
    </svg>
  );
}
