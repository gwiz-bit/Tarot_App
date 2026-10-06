import { useId, type ReactNode } from "react";
import { formatCardNumber, type TarotCard } from "@/data/cards";

type ArtworkPalette = {
  ink: string;
  paper: string;
  gold: string;
  blue: string;
  burgundy: string;
  fog: string;
};

const palette: ArtworkPalette = {
  ink: "#13191f",
  paper: "#eee6d5",
  gold: "#c6a567",
  blue: "#7890a6",
  burgundy: "#a45b64",
  fog: "#2d3a44",
};

// SVG coordinates must serialize identically across server/browser math engines.
function svgCoordinate(value: number) {
  return Number(value.toFixed(3));
}

/**
 * High-resolution antique esoteric woodcut tarot illustrations.
 * Cards 1–13 currently have bespoke AI-generated masterworks.
 * Cards 14–22 use intricate esoteric engraving vector compositions
 * with rich philosophical allegories and sacred geometry.
 */
const cardImageMap: Record<string, string> = {
  "the-reality": "/images/cards/the-reality.jpg",
  "the-mind": "/images/cards/the-mind.jpg",
  "the-connection": "/images/cards/the-connection.jpg",
  "the-flow": "/images/cards/the-flow.jpg",
  "the-conflict": "/images/cards/the-conflict.jpg",
  "the-leap": "/images/cards/the-leap.jpg",
  "the-spiral": "/images/cards/the-spiral.jpg",
  "the-individual": "/images/cards/the-individual.jpg",
  "the-cause": "/images/cards/the-cause.jpg",
  "the-chance": "/images/cards/the-chance.jpg",
  "the-form": "/images/cards/the-form.jpg",
  "the-essence": "/images/cards/the-essence.jpg",
  "the-possibility": "/images/cards/the-possibility.jpg",
  "the-practice": "/images/cards/the-practice.jpg",
  "the-truth": "/images/cards/the-truth.jpg",
  "the-ascent": "/images/cards/the-ascent.jpg",
  "the-forces": "/images/cards/the-forces.jpg",
  "the-structure": "/images/cards/the-structure.jpg",
  "the-society": "/images/cards/the-society.jpg",
  "the-human": "/images/cards/the-human.jpg",
  "the-masses": "/images/cards/the-masses.jpg",
  "the-turning": "/images/cards/the-turning.jpg",
};

function DotField({
  color,
  opacity = 0.45,
}: {
  color: string;
  opacity?: number;
}) {
  const dots = [
    [25, 48],
    [38, 67],
    [52, 40],
    [67, 57],
    [84, 32],
    [100, 51],
    [118, 38],
    [135, 58],
    [153, 35],
    [171, 51],
    [190, 40],
    [207, 63],
    [32, 205],
    [58, 219],
    [88, 201],
    [117, 218],
    [148, 204],
    [178, 219],
    [207, 201],
  ];
  return (
    <g fill={color} opacity={opacity}>
      {dots.map(([cx, cy], index) => (
        <circle key={index} cx={cx} cy={cy} r={index % 3 === 0 ? 1.7 : 0.9} />
      ))}
    </g>
  );
}

function ArtFrame({
  uid,
  imageSrc,
  children,
}: {
  uid: string;
  imageSrc?: string;
  children?: ReactNode;
}) {
  if (imageSrc) {
    const cardWidth = 146.67;
    const cardHeight = 220;
    const cardX = (240 - cardWidth) / 2; // 46.67
    const cardY = 15;

    return (
      <>
        {/* Background panel */}
        <rect
          x="11"
          y="11"
          width="218"
          height="228"
          rx="2"
          fill={palette.ink}
        />
        {/* Subtle grid background around card */}
        <rect
          x="17"
          y="17"
          width="206"
          height="216"
          fill={`url(#${uid}-grid)`}
          opacity="0.2"
        />
        {/* Full 2:3 Tarot Card without cropping head or tail, with 3px bleed to eliminate raw deckled edge */}
        <clipPath id={`${uid}-img-clip`}>
          <rect
            x={cardX}
            y={cardY}
            width={cardWidth}
            height={cardHeight}
            rx="3"
          />
        </clipPath>
        <image
          href={imageSrc}
          x={cardX - 3}
          y={cardY - 4.5}
          width={cardWidth + 6}
          height={cardHeight + 9}
          preserveAspectRatio="none"
          clipPath={`url(#${uid}-img-clip)`}
        />
        {/* Gilded card frame */}
        <rect
          x={cardX}
          y={cardY}
          width={cardWidth}
          height={cardHeight}
          rx="3"
          fill="none"
          stroke={palette.gold}
          strokeWidth="0.8"
          strokeOpacity="0.5"
        />
        {/* Corner marks for the Tarot card */}
        <path
          d={`M${cardX + 10} ${cardY}v6m-6-1h6m${cardWidth - 10} -5v6m6-1h-6M${cardX + 10} ${cardY + cardHeight}v-6m-6 1h6m${cardWidth - 10} 5v-6m6 1h-6`}
          stroke={palette.gold}
          strokeOpacity="0.75"
          strokeWidth="1"
        />
      </>
    );
  }

  return (
    <>
      <rect
        x="11"
        y="11"
        width="218"
        height="228"
        rx="2"
        fill={`url(#${uid}-paper)`}
      />
      <rect
        x="17"
        y="17"
        width="206"
        height="216"
        fill={`url(#${uid}-grid)`}
        opacity="0.3"
      />
      <path
        d="M18 39h204M18 211h204"
        stroke={palette.gold}
        strokeOpacity="0.22"
      />
      <path
        d="M28 18v12m-10-2h12m182-10v12m10-2h-12M28 232v-12m-10 2h12m182 10v-12m10 2h-12"
        stroke={palette.gold}
        strokeOpacity="0.6"
        strokeWidth="1.2"
      />
      <g strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
      <DotField color={palette.paper} opacity={0.16} />
      <rect
        x="17"
        y="17"
        width="206"
        height="216"
        fill={`url(#${uid}-grain)`}
        opacity="0.22"
      />
      <path d="M24 225h192" stroke={palette.gold} strokeOpacity="0.22" />
    </>
  );
}

export function Artwork({ card }: { card: TarotCard }) {
  const uid = useId().replaceAll(":", "");
  const { ink, paper, gold, blue, burgundy, fog } = palette;
  const id = card.id;
  const imageSrc = cardImageMap[id];
  let composition: ReactNode = null;

  if (!imageSrc) {
    switch (id) {
      /* ──────────────────────────────────────────────────────────────────────
       * 14 · THE PRACTICE — Thực tiễn
       * Concept: Material activity transforming nature and society; the anvil
       * and hammer of human labor forging reality under the rising sun.
       * ────────────────────────────────────────────────────────────────── */
      case "the-practice":
        composition = (
          <g transform="translate(120 125)">
            {/* Radiant celestial sunburst */}
            <circle cx="0" cy="-65" r="16" fill={gold} opacity="0.35" />
            <circle cx="0" cy="-65" r="7" fill={gold} />
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i * Math.PI) / 8;
              const r1 = 18;
              const r2 = i % 2 === 0 ? 32 : 24;
              return (
                <line
                  key={i}
                  x1={svgCoordinate(Math.cos(a) * r1)}
                  y1={svgCoordinate(-65 + Math.sin(a) * r1)}
                  x2={svgCoordinate(Math.cos(a) * r2)}
                  y2={svgCoordinate(-65 + Math.sin(a) * r2)}
                  stroke={gold}
                  strokeWidth="1.2"
                  opacity="0.6"
                />
              );
            })}
            {/* The Great Celestial Anvil */}
            <path
              d="M-45 25h90c0 0-10 12-15 15h-60c-5-3-15-15-15-15Z"
              fill={blue}
              opacity="0.6"
              stroke={paper}
              strokeWidth="1.5"
            />
            <path
              d="M-25 40v30h50v-30"
              fill={fog}
              opacity="0.8"
              stroke={paper}
              strokeWidth="1.5"
            />
            <path
              d="M-40 70h80v12h-80Z"
              fill={ink}
              stroke={gold}
              strokeWidth="1.2"
            />
            {/* Glowing molten star/ingot on anvil */}
            <ellipse cx="0" cy="22" rx="14" ry="5" fill={gold} opacity="0.9" />
            {/* Descending divine hammer of labor */}
            <g transform="translate(15 -10) rotate(-35)">
              <rect
                x="-5"
                y="-45"
                width="10"
                height="50"
                rx="2"
                fill={paper}
                opacity="0.75"
                stroke={gold}
              />
              <path
                d="M-18 -55h36v20h-36Z"
                fill={burgundy}
                opacity="0.85"
                stroke={paper}
                strokeWidth="1.5"
              />
              <path d="M-22 -45h44" stroke={gold} strokeWidth="1.5" />
            </g>
            {/* Striking sparks of practice creating history */}
            {[-45, -20, 0, 25, 45].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const len = i % 2 === 0 ? 30 : 20;
              return (
                <line
                  key={i}
                  x1="0"
                  y1="20"
                  x2={svgCoordinate(Math.sin(rad) * len)}
                  y2={svgCoordinate(20 - Math.cos(rad) * len)}
                  stroke={gold}
                  strokeWidth="1.6"
                  strokeDasharray="2 2"
                />
              );
            })}
            {/* Furrows of cultivated fertile earth */}
            <path
              d="M-80 65c30-6 60-6 80 0s50 6 80 0"
              stroke={gold}
              strokeWidth="1.2"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M-85 78c35-5 65-5 85 0s50 5 85 0"
              stroke={gold}
              strokeWidth="1"
              fill="none"
              opacity="0.4"
            />
          </g>
        );
        break;

      /* ──────────────────────────────────────────────────────────────────────
       * 15 · THE TRUTH — Chân lý
       * Concept: Objective truth verified by practice; the eternal beacon
       * atop the mountain pillar and balanced scales of reason.
       * ────────────────────────────────────────────────────────────────── */
      case "the-truth":
        composition = (
          <g transform="translate(120 125)">
            {/* Sacred halo and celestial aura */}
            <circle
              cx="0"
              cy="-35"
              r="45"
              stroke={gold}
              strokeWidth="1"
              strokeDasharray="2 4"
              opacity="0.45"
            />
            <circle
              cx="0"
              cy="-35"
              r="30"
              stroke={gold}
              strokeWidth="0.8"
              opacity="0.6"
            />
            {/* The Eternal Flame of Truth */}
            <path
              d="M0 -75c-15 18-20 28-20 40 0 14 9 22 20 22s20-8 20-22c0-12-5-22-20-40Z"
              fill={gold}
              opacity="0.85"
            />
            <path
              d="M0 -65c-8 12-10 18-10 26 0 9 5 14 10 14s10-5 10-14c0-8-2-14-10-26Z"
              fill={paper}
              opacity="0.9"
            />
            <path
              d="M0 -55c-4 6-5 9-5 13 0 4 2 7 5 7s5-3 5-7c0-4-1-7-5-13Z"
              fill={burgundy}
            />
            {/* Temple Pedestal / Altar */}
            <path
              d="M-35 -13h70v8h-70Z"
              fill={paper}
              opacity="0.8"
              stroke={gold}
              strokeWidth="1.2"
            />
            <path
              d="M-28 -5v80h56v-80Z"
              fill={fog}
              opacity="0.6"
              stroke={paper}
              strokeWidth="1.2"
            />
            {/* Column fluting */}
            {[-18, -9, 0, 9, 18].map((x, i) => (
              <line
                key={i}
                x1={x}
                y1="-5"
                x2={x}
                y2="75"
                stroke={gold}
                strokeWidth="0.8"
                opacity="0.5"
              />
            ))}
            <path
              d="M-40 75h80v14h-80Z"
              fill={paper}
              opacity="0.8"
              stroke={gold}
              strokeWidth="1.2"
            />
            {/* The Balanced Celestial Scales */}
            <path d="M-60 15h120" stroke={gold} strokeWidth="2" />
            <circle cx="0" cy="15" r="4" fill={gold} />
            {/* Left Pan */}
            <path
              d="M-55 15l-15 35h30Z"
              fill="none"
              stroke={gold}
              strokeWidth="1"
              opacity="0.75"
            />
            <circle
              cx="-55"
              cy="48"
              r="6"
              fill={blue}
              opacity="0.8"
              stroke={paper}
            />
            {/* Right Pan */}
            <path
              d="M55 15l-15 35h30Z"
              fill="none"
              stroke={gold}
              strokeWidth="1"
              opacity="0.75"
            />
            <circle
              cx="55"
              cy="48"
              r="6"
              fill={burgundy}
              opacity="0.8"
              stroke={paper}
            />
            {/* All-seeing Eye of Truth at top */}
            <ellipse
              cx="0"
              cy="-88"
              rx="14"
              ry="8"
              fill="none"
              stroke={gold}
              strokeWidth="1.5"
            />
            <circle cx="0" cy="-88" r="4" fill={gold} />
          </g>
        );
        break;

      /* ──────────────────────────────────────────────────────────────────────
       * 16 · THE ASCENT — Quá trình nhận thức
       * Concept: Epistemological climb: from living perception, through
       * abstract thought, ascending back to enriched practice.
       * ────────────────────────────────────────────────────────────────── */
      case "the-ascent":
        composition = (
          <g transform="translate(120 125)">
            {/* Monumental Stairway of Cognition */}
            <path
              d="M-75 80h30v-25h30v-25h30v-25h30v-25h30"
              stroke={gold}
              strokeWidth="2.5"
              fill="none"
            />
            <path
              d="M-75 80h30v-25h30v-25h30v-25h30v-25h30v85h-150Z"
              fill={blue}
              opacity="0.25"
            />
            {/* Step 1: Sensory Observation (Mystic Eye in the Valley) */}
            <g transform="translate(-60 55)">
              <ellipse
                cx="0"
                cy="0"
                rx="15"
                ry="9"
                fill={fog}
                stroke={paper}
                strokeWidth="1.2"
              />
              <circle cx="0" cy="0" r="5" fill={burgundy} />
              <circle cx="0" cy="0" r="2" fill={gold} />
              <path
                d="M-15 15c10-3 20-3 30 0"
                stroke={blue}
                strokeWidth="1"
                fill="none"
              />
            </g>
            {/* Step 2: Abstract Reasoning (Sacred Hexagram & Geometric Prism) */}
            <g transform="translate(0 5)">
              <polygon
                points="0,-16 14,8 -14,8"
                fill="none"
                stroke={gold}
                strokeWidth="1.4"
              />
              <polygon
                points="0,16 14,-8 -14,-8"
                fill="none"
                stroke={paper}
                strokeWidth="1.4"
                opacity="0.8"
              />
              <circle cx="0" cy="0" r="4" fill={gold} />
            </g>
            {/* Step 3: Practical Mastery (Compass & Celestial Crown at Summit) */}
            <g transform="translate(55 -45)">
              <circle cx="0" cy="0" r="16" fill={gold} opacity="0.3" />
              <circle cx="0" cy="0" r="8" fill={gold} />
              <path
                d="M-12 12L0 -14L12 12"
                stroke={paper}
                strokeWidth="1.6"
                fill="none"
              />
              <path d="M-8 4h16" stroke={gold} strokeWidth="1.4" />
            </g>
            {/* Ascending Spiral Arrow connecting the three levels */}
            <path
              d="M-60 35c20-35 50-10 50-30s30-50 65-50"
              stroke={gold}
              strokeWidth="1.5"
              strokeDasharray="3 3"
              fill="none"
            />
            {/* Return arc from practice to new perception */}
            <path
              d="M60 -60c25 40 10 110-120 135"
              stroke={paper}
              strokeWidth="1"
              strokeDasharray="2 4"
              opacity="0.4"
              fill="none"
            />
          </g>
        );
        break;

      /* ──────────────────────────────────────────────────────────────────────
       * 17 · THE FORCES — Lực lượng sản xuất — Quan hệ sản xuất
       * Concept: Productive forces (tools, skills, energy) dynamic and primary,
       * interacting with production relations (cooperation, property).
       * ────────────────────────────────────────────────────────────────── */
      case "the-forces":
        composition = (
          <g transform="translate(120 125)">
            {/* Outer Sacred Geometrical Orbit */}
            <circle
              cx="0"
              cy="0"
              r="82"
              stroke={gold}
              strokeWidth="1"
              strokeDasharray="3 5"
              opacity="0.4"
            />
            {/* Great Primary Industrial Gear (Forces) */}
            <g transform="translate(-25 -10)">
              <circle
                cx="0"
                cy="0"
                r="40"
                fill={blue}
                opacity="0.3"
                stroke={paper}
                strokeWidth="1.5"
              />
              <circle
                cx="0"
                cy="0"
                r="28"
                fill={fog}
                opacity="0.8"
                stroke={gold}
                strokeWidth="1.2"
              />
              {Array.from({ length: 8 }).map((_, i) => {
                return (
                  <rect
                    key={i}
                    x="-5"
                    y="-45"
                    width="10"
                    height="10"
                    fill={paper}
                    opacity="0.8"
                    transform={`rotate(${(i * 360) / 8})`}
                  />
                );
              })}
              <circle cx="0" cy="0" r="10" fill={gold} />
            </g>
            {/* Harmonizing Secondary Gear (Relations) */}
            <g transform="translate(35 25)">
              <circle
                cx="0"
                cy="0"
                r="30"
                fill={burgundy}
                opacity="0.35"
                stroke={paper}
                strokeWidth="1.5"
              />
              <circle
                cx="0"
                cy="0"
                r="20"
                fill={ink}
                opacity="0.9"
                stroke={gold}
                strokeWidth="1.2"
              />
              {Array.from({ length: 6 }).map((_, i) => (
                <rect
                  key={i}
                  x="-4"
                  y="-34"
                  width="8"
                  height="8"
                  fill={gold}
                  opacity="0.8"
                  transform={`rotate(${(i * 360) / 6})`}
                />
              ))}
              <circle cx="0" cy="0" r="8" fill={paper} />
            </g>
            {/* Twin classical architectural pillars of social structure */}
            <rect
              x="-85"
              y="-60"
              width="10"
              height="120"
              fill={paper}
              opacity="0.4"
              stroke={gold}
            />
            <rect
              x="75"
              y="-60"
              width="10"
              height="120"
              fill={paper}
              opacity="0.4"
              stroke={gold}
            />
            {/* Arch uniting the forces across the top */}
            <path
              d="M-85 -60c0-25 170-25 170 0"
              stroke={gold}
              strokeWidth="2"
              fill="none"
            />
            {/* Lightning bolt of technological revolution in between */}
            <path
              d="M5 -35l-10 25h12l-8 25"
              stroke={gold}
              strokeWidth="2.2"
              fill="none"
            />
          </g>
        );
        break;

      /* ──────────────────────────────────────────────────────────────────────
       * 18 · THE STRUCTURE — Cơ sở hạ tầng — Kiến trúc thượng tầng
       * Concept: Deep economic bedrock supporting a towering celestial temple
       * of philosophy, law, and culture.
       * ────────────────────────────────────────────────────────────────── */
      case "the-structure":
        composition = (
          <g transform="translate(120 125)">
            {/* Subterranean Bedrock Strata (Economic Base) */}
            <rect
              x="-85"
              y="35"
              width="170"
              height="55"
              rx="2"
              fill={burgundy}
              opacity="0.6"
              stroke={paper}
              strokeWidth="1.5"
            />
            {[-70, -35, 0, 35, 70].map((x, i) => (
              <path
                key={i}
                d={`M${x - 12} 35v55`}
                stroke={gold}
                strokeWidth="1"
                opacity="0.4"
              />
            ))}
            <path
              d="M-85 52h170M-85 70h170"
              stroke={paper}
              strokeWidth="0.8"
              opacity="0.35"
            />
            {/* Four Monumental Colonnades */}
            {[-65, -22, 22, 65].map((x, i) => (
              <g key={i} transform={`translate(${x} 0)`}>
                <rect
                  x="-6"
                  y="-35"
                  width="12"
                  height="70"
                  fill={paper}
                  opacity="0.75"
                  stroke={gold}
                  strokeWidth="1"
                />
                <path d="M-9 -35h18M-9 35h18" stroke={gold} strokeWidth="1.5" />
              </g>
            ))}
            {/* Entablature and Classical Pediment (Superstructure) */}
            <rect
              x="-80"
              y="-45"
              width="160"
              height="10"
              fill={fog}
              stroke={paper}
              strokeWidth="1.2"
            />
            <polygon
              points="0,-85 -85,-45 85,-45"
              fill={blue}
              opacity="0.75"
              stroke={gold}
              strokeWidth="1.8"
            />
            {/* Sacred Pediment Eye & Cosmic Urn */}
            <ellipse
              cx="0"
              cy="-62"
              rx="14"
              ry="8"
              fill={ink}
              stroke={gold}
              strokeWidth="1.2"
            />
            <circle cx="0" cy="-62" r="4" fill={gold} />
            {/* Radiating beams of social consciousness illuminating the sky */}
            {[-40, -20, 0, 20, 40].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1={svgCoordinate(Math.sin(rad) * 20)}
                  y1={svgCoordinate(-85 - Math.cos(rad) * 10)}
                  x2={svgCoordinate(Math.sin(rad) * 45)}
                  y2={svgCoordinate(-85 - Math.cos(rad) * 25)}
                  stroke={gold}
                  strokeWidth="1.2"
                  opacity="0.6"
                />
              );
            })}
          </g>
        );
        break;

      /* ──────────────────────────────────────────────────────────────────────
       * 19 · THE SOCIETY — Tồn tại xã hội — Ý thức xã hội
       * Concept: Social Being (material landscape of human labor) condensing
       * into Social Consciousness (celestial constellations guiding history).
       * ────────────────────────────────────────────────────────────────── */
      case "the-society":
        composition = (
          <g transform="translate(120 125)">
            {/* Celestial Hemisphere of Social Consciousness */}
            <path
              d="M-80 -10c0-50 160-50 160 0"
              stroke={gold}
              strokeWidth="1.5"
              strokeDasharray="2 3"
              fill="none"
              opacity="0.6"
            />
            {/* Constellations of Law, Morality, and Philosophy */}
            {[
              [-45, -55],
              [-15, -70],
              [15, -70],
              [45, -55],
              [0, -45],
            ].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="3" fill={gold} />
                <circle
                  cx={cx}
                  cy={cy}
                  r="6"
                  stroke={gold}
                  strokeWidth="0.6"
                  opacity="0.5"
                />
              </g>
            ))}
            <path
              d="M-45 -55L-15 -70L0 -45L15 -70L45 -55"
              stroke={paper}
              strokeWidth="0.8"
              opacity="0.5"
              fill="none"
            />
            {/* The Great Radiant Lantern of Social Consciousness */}
            <ellipse
              cx="0"
              cy="-25"
              rx="18"
              ry="12"
              fill={burgundy}
              opacity="0.6"
              stroke={gold}
            />
            <circle cx="0" cy="-25" r="5" fill={gold} />
            {/* Streams of Social Being rising to form consciousness */}
            {[-50, -25, 0, 25, 50].map((x, i) => (
              <path
                key={i}
                d={`M${x} 40c${i % 2 === 0 ? 15 : -15} -25 0 -45 0 -60`}
                stroke={gold}
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.45"
                fill="none"
              />
            ))}
            {/* Material Earth & Civilization (Social Being) */}
            <path
              d="M-85 45c30-5 70-5 85 0s60 5 85 0v45h-170Z"
              fill={blue}
              opacity="0.5"
              stroke={paper}
              strokeWidth="1.2"
            />
            {/* Bridges, masonry, and fields of productive human community */}
            <path
              d="M-60 45c0 20 40 20 40 0"
              stroke={paper}
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M20 45c0 20 40 20 40 0"
              stroke={paper}
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="-40" cy="55" r="4" fill={gold} />
            <circle cx="40" cy="55" r="4" fill={gold} />
          </g>
        );
        break;

      /* ──────────────────────────────────────────────────────────────────────
       * 20 · THE HUMAN — Con người và bản chất con người
       * Concept: Humanity as the ensemble of social relations; the conscious
       * subject and creator of history in the cosmic Vitruvian mandala.
       * ────────────────────────────────────────────────────────────────── */
      case "the-human":
        composition = (
          <g transform="translate(120 125)">
            {/* Sacred Vitruvian Mandala */}
            <circle
              cx="0"
              cy="0"
              r="75"
              stroke={gold}
              strokeWidth="1.4"
              opacity="0.5"
              fill="none"
            />
            <polygon
              points="0,-75 75,0 0,75 -75,0"
              stroke={paper}
              strokeWidth="1"
              opacity="0.35"
              fill="none"
            />
            <circle
              cx="0"
              cy="0"
              r="50"
              stroke={blue}
              strokeWidth="1"
              opacity="0.4"
              fill="none"
            />
            {/* Central Noble Figure of Humanity */}
            <circle
              cx="0"
              cy="-40"
              r="14"
              fill={paper}
              stroke={gold}
              strokeWidth="1.6"
            />
            {/* Torso & Spinal Column */}
            <path
              d="M0 -26v55"
              stroke={paper}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Arms outstretched touching the circumference of nature and society */}
            <path
              d="M-65 -15L0 -18L65 -15"
              stroke={gold}
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Legs firmly planted in material reality */}
            <path
              d="M0 29L-45 72M0 29L45 72"
              stroke={paper}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Luminous Heart of Social Relations */}
            <circle cx="0" cy="-5" r="9" fill={burgundy} opacity="0.85" />
            <circle cx="0" cy="-5" r="4" fill={gold} />
            {/* Radiating cords of community and history */}
            {[-60, -30, 30, 60].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              return (
                <line
                  key={i}
                  x1="0"
                  y1="-5"
                  x2={svgCoordinate(Math.sin(rad) * 65)}
                  y2={svgCoordinate(-5 - Math.cos(rad) * 65)}
                  stroke={gold}
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  opacity="0.6"
                />
              );
            })}
          </g>
        );
        break;

      /* ──────────────────────────────────────────────────────────────────────
       * 21 · THE MASSES — Quần chúng — Cá nhân
       * Concept: The masses as the true creators of history; an immense wave
       * of torch-bearers moving mountains under the guidance of the herald.
       * ────────────────────────────────────────────────────────────────── */
      case "the-masses":
        composition = (
          <g transform="translate(120 125)">
            {/* The Great Tidal Wave of History */}
            <path
              d="M-85 70c40-30 80-60 120-40s40 30 50 40v20h-170Z"
              fill={blue}
              opacity="0.45"
            />
            {/* Sea of Golden Torches of the Collective */}
            {[
              [-70, 45],
              [-55, 30],
              [-40, 20],
              [-25, 12],
              [-10, 5],
              [5, 15],
              [20, 25],
              [35, 40],
              [-60, 60],
              [-35, 45],
              [-15, 35],
              [10, 48],
              [30, 58],
              [50, 65],
            ].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="15"
                  stroke={paper}
                  strokeWidth="1"
                  opacity="0.7"
                />
                <circle cx="0" cy="-2" r="3.5" fill={gold} />
                <path d="M0 -7l-2 5h4Z" fill={burgundy} opacity="0.9" />
              </g>
            ))}
            {/* The Visionary Herald / Leader standing at the crest */}
            <g transform="translate(45 -25)">
              <circle
                cx="0"
                cy="-20"
                r="7"
                fill={gold}
                stroke={paper}
                strokeWidth="1.2"
              />
              <path d="M0 -13v30" stroke={paper} strokeWidth="2" />
              {/* Grand Standard / Golden Banner of the Future */}
              <path
                d="M0 -25l40 -15v25l-40 10Z"
                fill={gold}
                opacity="0.85"
                stroke={paper}
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="-35"
                x2="0"
                y2="35"
                stroke={gold}
                strokeWidth="2.5"
              />
              <circle cx="20" cy="-25" r="5" fill={burgundy} />
            </g>
            {/* Rising dawn of a new historical epoch */}
            <circle cx="-50" cy="-45" r="28" fill={gold} opacity="0.2" />
            <circle cx="-50" cy="-45" r="14" fill={gold} opacity="0.4" />
          </g>
        );
        break;

      /* ──────────────────────────────────────────────────────────────────────
       * 22 · THE TURNING — Biến đổi xã hội
       * Concept: Social revolution; the Great Wheel of History breaking
       * ancient chains and crumbling stone gates to usher in human liberation.
       * ────────────────────────────────────────────────────────────────── */
      case "the-turning":
        composition = (
          <g transform="translate(120 125)">
            {/* Shattered Chains of the Old Order */}
            <path
              d="M-75 55l15 -10m5 -5l15 -10"
              stroke={paper}
              strokeWidth="2.5"
              strokeDasharray="4 2"
              opacity="0.6"
            />
            <path
              d="M75 55l-15 -10m-5 -5l-15 -10"
              stroke={paper}
              strokeWidth="2.5"
              strokeDasharray="4 2"
              opacity="0.6"
            />
            {/* The Great Wheel of Revolution (8-spoked Solar Wheel) */}
            <circle
              cx="0"
              cy="0"
              r="58"
              fill={fog}
              opacity="0.4"
              stroke={gold}
              strokeWidth="2.5"
            />
            <circle
              cx="0"
              cy="0"
              r="48"
              stroke={paper}
              strokeWidth="1"
              strokeDasharray="3 4"
              opacity="0.6"
            />
            <circle
              cx="0"
              cy="0"
              r="22"
              fill={burgundy}
              opacity="0.75"
              stroke={gold}
              strokeWidth="1.5"
            />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI) / 4;
              return (
                <line
                  key={i}
                  x1={svgCoordinate(Math.cos(a) * 22)}
                  y1={svgCoordinate(Math.sin(a) * 22)}
                  x2={svgCoordinate(Math.cos(a) * 58)}
                  y2={svgCoordinate(Math.sin(a) * 58)}
                  stroke={gold}
                  strokeWidth="2.2"
                />
              );
            })}
            <circle cx="0" cy="0" r="8" fill={gold} />
            {/* Radiant Sunburst of Liberation Breaking Above */}
            <g transform="translate(0 -68)">
              <circle cx="0" cy="0" r="15" fill={gold} opacity="0.4" />
              <circle cx="0" cy="0" r="7" fill={gold} />
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i * Math.PI) / 6;
                return (
                  <line
                    key={i}
                    x1={svgCoordinate(Math.cos(a) * 9)}
                    y1={svgCoordinate(Math.sin(a) * 9)}
                    x2={svgCoordinate(Math.cos(a) * 24)}
                    y2={svgCoordinate(Math.sin(a) * 24)}
                    stroke={gold}
                    strokeWidth="1.5"
                  />
                );
              })}
            </g>
            {/* The Soaring Phoenix of Renewal */}
            <path
              d="M-28 -40c10-15 28-20 28-20s18 5 28 20c-10 2-28 6-28 6s-18-4-28-6Z"
              fill={gold}
              opacity="0.9"
            />
          </g>
        );
        break;

      default:
        composition = (
          <circle cx="120" cy="125" r="50" fill={blue} stroke={gold} />
        );
    }
  }

  return (
    <svg
      className="symbol-art editorial-art"
      viewBox="0 0 240 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`${uid}-paper`}
          x1="18"
          y1="18"
          x2="221"
          y2="231"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={fog} />
          <stop offset="0.52" stopColor={ink} />
          <stop offset="1" stopColor="#202b34" />
        </linearGradient>
        <pattern
          id={`${uid}-grid`}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M20 0H0V20"
            stroke={blue}
            strokeOpacity="0.12"
            strokeWidth="0.7"
          />
          <circle cx="3" cy="14" r="0.8" fill={gold} fillOpacity="0.2" />
        </pattern>
        <pattern
          id={`${uid}-grain`}
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3" cy="4" r="0.6" fill={paper} fillOpacity="0.4" />
          <circle cx="17" cy="8" r="0.45" fill={gold} fillOpacity="0.45" />
          <circle cx="9" cy="19" r="0.5" fill={paper} fillOpacity="0.34" />
          <circle cx="21" cy="21" r="0.35" fill={blue} fillOpacity="0.5" />
        </pattern>
      </defs>
      <ArtFrame uid={uid} imageSrc={imageSrc}>
        {composition}
      </ArtFrame>
    </svg>
  );
}

export function CardFace({
  card,
  reversed = false,
}: {
  card: TarotCard;
  reversed?: boolean;
}) {
  return (
    <div className="card-border">
      <div className="card-top">
        <span>BIỆN CHỨNG</span>
        <span>{formatCardNumber(card.number)}</span>
      </div>
      <div className={`card-artwork ${reversed ? "reversed" : ""}`}>
        <Artwork card={card} />
      </div>
      <div className="card-name">{card.concept}</div>
      <div className="card-english">{card.name.toUpperCase()}</div>
      <div className="card-bottom">
        <span>✧</span>
        <span>TAROT BIỆN CHỨNG</span>
        <span>✧</span>
      </div>
    </div>
  );
}
