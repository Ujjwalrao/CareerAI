import { useState, useEffect } from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';

export interface ScoreReadoutProps {
  value: number;
  label: string;
  subLabel?: string;
  speed?: number; // duration in ms
  delay?: number; // delay before start in ms
  suffix?: string;
  id?: string;
}

// Math helpers for SVG Arc drawing
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

export default function ScoreReadout({
  value,
  label,
  subLabel,
  speed = 1000,
  delay = 100,
  suffix = '',
  id
}: ScoreReadoutProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const { displayed: typedLabel, done } = useTypewriter(label, { speed: 18, startDelay: delay + 300 });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setDisplayValue(value);
      return;
    }

    let start: number | null = null;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const progressRatio = Math.min(progress / speed, 1);
      
      // Smooth cubic ease-out
      const easedRatio = 1 - Math.pow(1 - progressRatio, 3);
      
      setDisplayValue(Math.floor(easedRatio * value));

      if (progress < speed) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    const timer = setTimeout(() => {
      frameId = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frameId);
    };
  }, [value, speed, delay]);

  // Arc range: from -115 degrees to +115 degrees (230 deg sweep)
  const startAngle = -115;
  const endAngle = 115;
  const sweepAngle = endAngle - startAngle;
  const currentRatio = value > 0 ? displayValue / 100 : 0;
  const activeEndAngle = startAngle + currentRatio * sweepAngle;

  const cx = 100;
  const cy = 85;
  const radius = 65;

  // Generate ticks from 0 to 100 with steps of 5 for cockpit dial texture
  const ticks = Array.from({ length: 21 }, (_, i) => i * 5);

  return (
    <div id={id} className="flex flex-col items-center justify-center py-4 px-2 select-none">
      
      {/* Dynamic SVG Instrument Dial */}
      <div className="relative w-full max-w-[290px] aspect-[11/10] flex items-center justify-center">
        <svg viewBox="0 0 200 170" className="w-full h-full overflow-visible">
          <defs>
            {/* Active Gradient for glowing status */}
            <linearGradient id="activeArcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#E3B341" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3FA796" stopOpacity="1" />
            </linearGradient>
            
            {/* Subtle glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Outer Ring Segment */}
          <path
            d={describeArc(cx, cy, radius, startAngle, endAngle)}
            fill="none"
            stroke="var(--color-hairline)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Track Inset Accent */}
          <path
            d={describeArc(cx, cy, radius - 8, startAngle, endAngle)}
            fill="none"
            stroke="var(--color-hairline)"
            strokeWidth="0.75"
            strokeDasharray="1.5 2.5"
          />

          {/* Active Lit Meter Segment */}
          {displayValue > 0 && (
            <path
              d={describeArc(cx, cy, radius, startAngle, activeEndAngle)}
              fill="none"
              stroke="url(#activeArcGradient)"
              strokeWidth="5.5"
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
            />
          )}

          {/* Cockpit-Style Ticks & Labels */}
          {ticks.map((tick) => {
            const angle = startAngle + (tick / 100) * sweepAngle;
            const isMajor = tick % 25 === 0;
            const innerR = isMajor ? radius - 6 : radius - 3.5;
            const outerR = isMajor ? radius + 2.5 : radius + 0.5;
            
            const innerPoint = polarToCartesian(cx, cy, innerR, angle);
            const outerPoint = polarToCartesian(cx, cy, outerR, angle);
            const textPoint = polarToCartesian(cx, cy, radius - 15, angle);
            const isPassed = tick <= displayValue;

            return (
              <g key={tick} className="opacity-95">
                {/* Tick Mark Line */}
                <line
                  x1={innerPoint.x}
                  y1={innerPoint.y}
                  x2={outerPoint.x}
                  y2={outerPoint.y}
                  stroke={isPassed ? "var(--color-positive)" : "var(--color-mid-grey)"}
                  strokeWidth={isMajor ? "1.5" : "0.75"}
                  strokeOpacity={isMajor ? "0.9" : "0.5"}
                  className="transition-colors duration-200"
                />
                
                {/* Numeric Legend for major ticks */}
                {isMajor && (
                  <text
                    x={textPoint.x}
                    y={textPoint.y + 2.5}
                    textAnchor="middle"
                    fontSize="7.5"
                    style={{ fontFamily: 'var(--font-mono)' }}
                    className="fill-mid-grey/80 font-medium tracking-tighter"
                  >
                    {tick}
                  </text>
                )}
              </g>
            );
          })}

          {/* Center Hub Structure (Extremely refined, non-overlapping) */}
          <circle cx={cx} cy={cy} r="6" fill="var(--color-ink)" />
          <circle cx={cx} cy={cy} r="2.5" fill="var(--color-signal)" />

          {/* Physical Needle/Pointer */}
          {(() => {
            const needleAngle = startAngle + (displayValue / 100) * sweepAngle;
            const tip = polarToCartesian(cx, cy, radius - 10, needleAngle);
            const baseLeft = polarToCartesian(cx, cy, 3.5, needleAngle - 90);
            const baseRight = polarToCartesian(cx, cy, 3.5, needleAngle + 90);

            return (
              <g className="transition-all duration-100 ease-out">
                {/* Needle shadow */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={tip.x}
                  y2={tip.y}
                  stroke="rgba(11, 18, 32, 0.12)"
                  strokeWidth="2.5"
                  className="translate-x-0.5 translate-y-0.5"
                />
                {/* Sleek needle body */}
                <polygon
                  points={`${tip.x},${tip.y} ${baseLeft.x},${baseLeft.y} ${baseRight.x},${baseRight.y}`}
                  fill="var(--color-signal)"
                  filter="url(#glow)"
                />
              </g>
            );
          })()}

          {/* Digital HUD HUD label centered under hub */}
          <text
            x={cx}
            y={cy + 30}
            textAnchor="middle"
            style={{ fontFamily: 'var(--font-mono)' }}
            className="fill-mid-grey/60 text-[8px] uppercase tracking-widest font-semibold"
          >
            HUD readout
          </text>

          {/* Large dynamic readout number placed cleanly in the bottom gap */}
          <text
            x={cx}
            y={cy + 58}
            textAnchor="middle"
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}
            className="fill-ink text-[34px] tracking-tight tabular-nums"
          >
            {displayValue}
            {suffix && (
              <tspan 
                fontSize="16" 
                fontWeight="500" 
                style={{ fontFamily: 'var(--font-sans)' }} 
                className="fill-mid-grey ml-0.5"
              >
                {suffix}
              </tspan>
            )}
          </text>
        </svg>
      </div>

      {/* Label and detailed description with gorgeous typewriter animation */}
      <div className="text-center mt-2 max-w-[260px]">
        <div className={`font-serif text-[15px] text-ink font-semibold tracking-tight leading-snug ${done ? '' : 'typewriter-cursor'}`}>
          {typedLabel}
        </div>
        {subLabel && done && (
          <div className="text-[12px] text-mid-grey mt-1 font-sans leading-relaxed select-none animate-fade-in">
            {subLabel}
          </div>
        )}
      </div>
    </div>
  );
}
