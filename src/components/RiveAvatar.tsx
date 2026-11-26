'use client';

import { useEffect, useRef, useState } from 'react';

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

export default function RiveAvatar({
  gestationalProgress,
  stage,
  skinTone,
  hairStyle,
  hairColor,
  outfit,
  className,
  width = 300,
  height = 400,
}: RiveAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const progress = Math.min(40, Math.max(0, gestationalProgress));

  // Try to load Rive if the .riv file exists
  useEffect(() => {
    if (!containerRef.current) return;

    // Attempt dynamic import of Rive only if the .riv file is available
    const checkRive = async () => {
      try {
        const res = await fetch('/rive/avatar.riv', { method: 'HEAD' });
        if (!res.ok) {
          setError(true);
          return;
        }
        // File exists - could load Rive here
        setIsLoaded(true);
      } catch {
        setError(true);
      }
    };

    checkRive();
  }, []);

  const bellySize = Math.min(100, progress * 2.5);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className ?? ''}`}
      style={{ width, height }}
    >
      {error && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-[#f3e8dd] border-2 border-dashed border-[#e7d5c3]"
          style={{ width, height }}
        >
          <div className="text-6xl mb-4">🤰</div>
          <p className="text-sm text-[#6b6b6b]">الصورة المتحركة غير متوفرة</p>
        </div>
      )}
      {!error && (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 300 400"
          className="max-w-full max-h-full drop-shadow-lg"
        >
          <defs>
            <radialGradient id="skinGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={skinTone || '#f3e8dd'} />
              <stop offset="100%" stopColor="#e7d5c3" />
            </radialGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.15" />
            </filter>
          </defs>

          {/* Head */}
          <circle
            cx="150"
            cy="90"
            r="45"
            fill="url(#skinGradient)"
            filter="url(#shadow)"
          />
          <circle cx="132" cy="82" r="5" fill="#453a32" opacity={0.6} />
          <circle cx="168" cy="82" r="5" fill="#453a32" opacity={0.6} />
          <path
            d="M 130 100 Q 150 110 170 100"
            fill="none"
            stroke="#453a32"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Hair */}
          <path
            d="M 105 70 Q 150 40 195 70 L 195 100 Q 150 110 105 100 Z"
            fill={hairColor || '#8b4513'}
            filter="url(#shadow)"
          />

          {/* Body */}
          <path
            d="M 110 135 Q 150 135 190 135 Q 210 200 150 320 Q 90 200 110 135 Z"
            fill="url(#skinGradient)"
            filter="url(#shadow)"
          />

          {/* Belly - grows with progress */}
          <ellipse
            cx="150"
            cy="240"
            rx={40 + bellySize * 0.8}
            ry={35 + bellySize * 0.7}
            fill="#e7d5c3"
            filter="url(#shadow)"
          >

            {/* Breathing animation */}
            <animate
              attributeName="ry"
              values={`${35 + bellySize * 0.7};${35 + bellySize * 0.75};${35 + bellySize * 0.7}`}
              dur="4s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Clothing */}
          <path
            d="M 110 135 Q 150 135 190 135 Q 200 180 150 240 Q 100 180 110 135 Z"
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="12"
            strokeLinecap="round"
            opacity={0.6}
          />

          {/* Heart marker */}
          <text x="150" y="265" textAnchor="middle" fontSize="20" fill="#ef4444">
            ❤️
          </text>
        </svg>
      )}

      {/* Progress label */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            stage === 'first'
              ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
              : stage === 'second'
              ? 'text-blue-600 bg-blue-50 border-blue-100'
              : 'text-pink-600 bg-pink-50 border-pink-100'
          }`}
        >
          أسبوع {Math.round(progress)} — {stage === 'first' ? 'الأول' : stage === 'second' ? 'الثاني' : 'الثالث'}
        </span>
      </div>
    </div>
  );
}
