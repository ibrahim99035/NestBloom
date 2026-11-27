'use client';

import { useId } from 'react';

interface RiveAvatarProps {
  gestationalProgress: number; // 0 to 40
  stage: 'first' | 'second' | 'third' | 'postpartum';
  skinTone?: string;
  hairStyle?: string;
  hairColor?: string;
  outfit?: string;
  className?: string;
  width?: number;
  height?: number;
}

const STAGE_OUTFIT: Record<RiveAvatarProps['stage'], string> = {
  first: '#8b5cf6',
  second: '#0ea5e9',
  third: '#ec4899',
  postpartum: '#f59e0b',
};

export default function RiveAvatar({
  gestationalProgress,
  stage,
  skinTone,
  hairColor,
  outfit,
  className,
  width = 300,
  height = 400,
}: RiveAvatarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const skin = skinTone || '#f3e8dd';
  const hair = hairColor || '#8b4513';
  const dress = outfit || STAGE_OUTFIT[stage] || '#8b5cf6';

  const progress = Math.min(40, Math.max(0, gestationalProgress));
  // Belly grows from 0 → 1 across the pregnancy.
  const belly = progress / 40;
  const bellyRx = 34 + belly * 46;
  const bellyRy = 30 + belly * 40;
  const bellyCy = 236 + belly * 8;

  return (
    <div
      className={`relative flex items-center justify-center ${className ?? ''}`}
      style={{ width, height }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 400"
        role="img"
        aria-label="رسم توضيحي لنمو الجنين"
        className="max-w-full max-h-full"
      >
        <defs>
          <radialGradient id={`skin-${uid}`} cx="45%" cy="35%" r="70%">
            <stop offset="0%" stopColor={skin} />
            <stop offset="100%" stopColor="#e2cbb6" />
          </radialGradient>
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fdfbf7" />
            <stop offset="100%" stopColor="#f3e8dd" />
          </linearGradient>
          <filter id={`soft-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="5" stdDeviation="7" floodOpacity="0.16" />
          </filter>
        </defs>

        <rect x="0" y="0" width="300" height="400" rx="28" fill={`url(#bg-${uid})`} />

        {/* Glow behind the figure */}
        <ellipse cx="150" cy="230" rx={110 + belly * 25} ry="130" fill="#ffffff" opacity="0.45" />

        {/* Hair back */}
        <path
          d="M 100 92 Q 96 38 150 34 Q 204 38 200 92 L 200 128 Q 150 118 100 128 Z"
          fill={hair}
          opacity="0.95"
        />

        {/* Head */}
        <circle cx="150" cy="92" r="44" fill={`url(#skin-${uid})`} filter={`url(#soft-${uid})`} />

        {/* Hair fringe */}
        <path
          d="M 106 82 Q 120 46 150 46 Q 180 46 194 82 Q 168 66 150 72 Q 132 66 106 82 Z"
          fill={hair}
        />

        {/* Face */}
        <circle cx="134" cy="90" r="4.5" fill="#453a32" opacity="0.7" />
        <circle cx="166" cy="90" r="4.5" fill="#453a32" opacity="0.7" />
        <path
          d="M 138 108 Q 150 117 162 108"
          fill="none"
          stroke="#453a32"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="124" cy="103" r="6" fill="#ef9a9a" opacity="0.35" />
        <circle cx="176" cy="103" r="6" fill="#ef9a9a" opacity="0.35" />

        {/* Neck */}
        <rect x="140" y="130" width="20" height="16" rx="7" fill={`url(#skin-${uid})`} />

        {/* Body / dress */}
        <path
          d="M 112 148 Q 150 138 188 148 Q 214 214 196 300 Q 150 330 104 300 Q 86 214 112 148 Z"
          fill={dress}
          opacity="0.92"
          filter={`url(#soft-${uid})`}
        />

        {/* Belly */}
        <ellipse
          cx="150"
          cy={bellyCy}
          rx={bellyRx}
          ry={bellyRy}
          fill={`url(#skin-${uid})`}
          stroke="#ffffff"
          strokeWidth="3"
          opacity="0.95"
        >
          <animate
            attributeName="ry"
            values={`${bellyRy};${bellyRy * 1.03};${bellyRy}`}
            dur="4s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Baby heart */}
        <text
          x="150"
          y={bellyCy + 8}
          textAnchor="middle"
          fontSize={18 + belly * 8}
          fill="#ef4444"
        >
          ❤️
        </text>

        {/* Arms */}
        <path
          d="M 112 160 Q 84 196 92 236"
          fill="none"
          stroke={dress}
          strokeWidth="17"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 188 160 Q 216 196 208 236"
          fill="none"
          stroke={dress}
          strokeWidth="17"
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle cx="92" cy="240" r="9" fill={`url(#skin-${uid})`} />
        <circle cx="208" cy="240" r="9" fill={`url(#skin-${uid})`} />
      </svg>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border whitespace-nowrap ${
            stage === 'first'
              ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
              : stage === 'second'
              ? 'text-sky-600 bg-sky-50 border-sky-100'
              : stage === 'third'
              ? 'text-pink-600 bg-pink-50 border-pink-100'
              : 'text-amber-600 bg-amber-50 border-amber-100'
          }`}
        >
          {stage === 'postpartum'
            ? 'بعد الولادة'
            : `الأسبوع ${Math.floor(progress)} — ${
                stage === 'first' ? 'الثلث الأول' : stage === 'second' ? 'الثلث الثاني' : 'الثلث الثالث'
              }`}
        </span>
      </div>
    </div>
  );
}
