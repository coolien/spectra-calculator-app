'use client';

import { useId } from 'react';

export function BrandRingLogo({ size = 28 }: { size?: number }) {
  return <img src="/icons/spectra-brand-v2-192.png" width={size} height={size} alt="" aria-hidden="true" />;
}

export function RingLogo({ stops, size = 28 }: { stops: string[]; size?: number }) {
  const id = useId().replaceAll(':', '');
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          {stops.map((color, index) => (
            <stop
              key={`${color}-${index}`}
              offset={`${(index / Math.max(stops.length - 1, 1)) * 100}%`}
              stopColor={color}
            />
          ))}
        </linearGradient>
      </defs>
      <circle cx="14" cy="14" r="10.5" stroke={`url(#${id})`} strokeWidth="7" />
    </svg>
  );
}
