export function Logo({ className = "h-14 w-auto" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1809 555"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* AP Icon */}
      <g>
        {/* A */}
        <path
          d="M210 150L350 450M350 450H70M350 450L490 150M350 300H140"
          stroke="#D62828"
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* P */}
        <path
          d="M570 450V150M570 150H720C800 150 850 200 850 280C850 360 800 410 720 410H570M570 410H720"
          stroke="#D62828"
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Chat bubble */}
        <circle cx="950" cy="280" r="100" fill="none" stroke="#D62828" strokeWidth="30" />
        <circle cx="920" cy="260" r="12" fill="#D62828" />
        <circle cx="950" cy="260" r="12" fill="#D62828" />
        <circle cx="980" cy="260" r="12" fill="#D62828" />
        <path
          d="M920 330L880 380L920 360"
          fill="#D62828"
          stroke="#D62828"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Book lines */}
      <g>
        <path
          d="M100 480Q200 520 350 500"
          stroke="#C0C0C0"
          strokeWidth="30"
          strokeLinecap="round"
        />
        <path
          d="M80 530Q200 580 380 550"
          stroke="#D62828"
          strokeWidth="30"
          strokeLinecap="round"
        />
        <path
          d="M120 570Q220 620 420 580"
          stroke="#D62828"
          strokeWidth="30"
          strokeLinecap="round"
        />
      </g>

      {/* Text: ANDERSON PALAFOZ */}
      <text
        x="700"
        y="320"
        fontSize="180"
        fontWeight="700"
        fill="#000000"
        fontFamily="Arial, sans-serif"
      >
        ANDERSON
      </text>
      <text
        x="700"
        y="420"
        fontSize="180"
        fontWeight="700"
        fill="#D62828"
        fontFamily="Arial, sans-serif"
      >
        PALAFOZ
      </text>

      {/* Subtitle */}
      <text
        x="700"
        y="480"
        fontSize="50"
        fontWeight="400"
        fill="#000000"
        fontFamily="Arial, sans-serif"
      >
        PROFESSOR DE INGLÊS
      </text>

      {/* Decorative lines */}
      <line x1="650" y1="450" x2="680" y2="450" stroke="#D62828" strokeWidth="8" />
      <line x1="1500" y1="450" x2="1530" y2="450" stroke="#D62828" strokeWidth="8" />
    </svg>
  );
}
