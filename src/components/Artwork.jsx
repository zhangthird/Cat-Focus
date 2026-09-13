export const Artwork = {
  bag: (stroke) => (
    <svg viewBox={"0 0 100 100"} className={"w-full h-full drop-shadow-sm"}>
      <path
        d={
          "M20,80 Q20,95 50,95 Q80,95 80,80 L85,40 Q85,30 50,30 Q15,30 15,40 Z"
        }
        fill={"#E0E0E0"}
        stroke={stroke}
        strokeWidth={"2.5"}
        strokeLinejoin={"round"}
      />
      <path
        d={"M25,40 L25,30 Q25,20 35,20 L65,20 Q75,20 75,30 L75,40"}
        fill={"none"}
        stroke={stroke}
        strokeWidth={"2.5"}
      />
      <path
        d={"M22,50 L78,50 M20,65 L80,65 M21,80 L79,80"}
        stroke={stroke}
        strokeWidth={"1.5"}
        opacity={"0.5"}
      />
      <path
        d={"M35,35 L35,90 M50,35 L50,92 M65,35 L65,90"}
        stroke={stroke}
        strokeWidth={"1.5"}
        opacity={"0.5"}
      />
      <path
        d={
          "M40,65 Q35,55 50,55 Q65,55 60,65 L65,70 L60,70 Q65,80 50,80 Q35,80 40,70 L35,70 Z"
        }
        fill={"#42A5F5"}
        stroke={stroke}
        strokeWidth={"1"}
      />
      <circle cx={"35"} cy={"25"} r={"5"} fill={"#FF7043"} stroke={stroke} />
      <path d={"M55,20 L65,10 L70,25"} fill={"#66BB6A"} stroke={stroke} />
    </svg>
  ),
  lamp: (stroke) => (
    <svg viewBox={"0 0 100 200"} className={"w-full h-full drop-shadow-md"}>
      <path
        d={"M20,50 L30,20 Q50,15 70,20 L80,50 Q50,55 20,50 Z"}
        fill={"#FFECB3"}
        stroke={stroke}
        strokeWidth={"2.5"}
        strokeLinejoin={"round"}
      />
      <path
        d={
          "M30,20 L30,52 M40,18 L40,53 M50,17 L50,54 M60,18 L60,53 M70,20 L70,52"
        }
        stroke={stroke}
        strokeWidth={"1"}
        opacity={"0.4"}
      />
      <path
        d={"M50,54 L50,180"}
        stroke={stroke}
        strokeWidth={"4"}
        strokeLinecap={"round"}
      />
      <path
        d={"M30,180 Q50,190 70,180"}
        stroke={stroke}
        strokeWidth={"4"}
        strokeLinecap={"round"}
      />
    </svg>
  ),
  table: (stroke) => (
    <svg viewBox={"0 0 100 100"} className={"w-full h-full drop-shadow-sm"}>
      <path
        d={"M10,30 Q50,25 90,30 L80,40 Q50,45 20,40 Z"}
        fill={"#D7CCC8"}
        stroke={stroke}
        strokeWidth={"2.5"}
        strokeLinejoin={"round"}
      />
      <path
        d={"M50,42 L50,80"}
        stroke={stroke}
        strokeWidth={"4"}
        strokeLinecap={"round"}
      />
      <path
        d={"M30,80 L70,80"}
        stroke={stroke}
        strokeWidth={"4"}
        strokeLinecap={"round"}
      />
    </svg>
  ),
  chair: (stroke, fill) => (
    <svg viewBox={"0 0 200 200"} className={"w-full h-full drop-shadow-lg"}>
      <path
        d={"M60,150 L50,180 M140,150 L150,180 M90,160 L90,185"}
        stroke={stroke}
        strokeWidth={"5"}
        strokeLinecap={"round"}
      />
      <path
        d={
          "M50,140 Q40,100 60,60 Q80,40 120,40 Q160,40 170,80 Q175,120 160,150 Q120,170 50,140 Z"
        }
        fill={fill}
        stroke={stroke}
        strokeWidth={"3"}
        strokeLinejoin={"round"}
      />
      <path
        d={"M60,130 Q100,140 140,130"}
        stroke={stroke}
        strokeWidth={"2"}
        fill={"none"}
        opacity={"0.3"}
      />
    </svg>
  ),
  cat: (stroke, fill) => (
    <svg viewBox={"0 0 100 100"} className={"w-full h-full drop-shadow-md"}>
      <path
        d={
          "M30,60 Q20,40 40,30 Q50,25 60,30 Q80,40 70,60 Q80,70 70,80 Q50,90 30,80 Q20,70 30,60 Z"
        }
        fill={fill}
        stroke={stroke}
        strokeWidth={"2.5"}
        strokeLinejoin={"round"}
      />
      <path
        d={"M40,32 L35,15 L50,28"}
        fill={fill}
        stroke={stroke}
        strokeWidth={"2.5"}
        strokeLinejoin={"round"}
      />
      <path
        d={"M60,32 L65,15 L50,28"}
        fill={fill}
        stroke={stroke}
        strokeWidth={"2.5"}
        strokeLinejoin={"round"}
      />
      <path
        d={"M70,75 Q90,80 90,60 Q85,50 75,65"}
        fill={"none"}
        stroke={stroke}
        strokeWidth={"4"}
        strokeLinecap={"round"}
      />
      <circle cx={"45"} cy={"45"} r={"2"} fill={stroke} />
      <circle cx={"55"} cy={"45"} r={"2"} fill={stroke} />
      <path d={"M50,50 L48,55 L52,55 Z"} fill={stroke} />
    </svg>
  ),
};
