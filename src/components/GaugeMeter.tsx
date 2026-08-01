import React from 'react';

interface GaugeMeterProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  title: string;
  specMin?: number;
  specMax?: number;
  isPass?: boolean;
  formattedValue?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const GaugeMeter: React.FC<GaugeMeterProps> = ({
  value,
  min,
  max,
  unit,
  title,
  specMin,
  specMax,
  isPass,
  formattedValue,
  size = 'md',
}) => {
  // Clamp value within gauge bounds
  const clampedValue = Math.max(min, Math.min(max, value));
  
  // Angle conversion: -120 deg (min) to +120 deg (max)
  const totalAngle = 240;
  const startAngle = -120;
  const percent = max > min ? (clampedValue - min) / (max - min) : 0;
  const needleAngle = startAngle + percent * totalAngle;

  // Determine visual color scheme
  let statusColor = 'text-cyan-400';
  let statusBg = 'border-cyan-500/30 bg-cyan-950/20';
  let glowClass = 'glow-cyan';
  let needleColor = '#06b6d4';

  if (isPass === true) {
    statusColor = 'text-emerald-400';
    statusBg = 'border-emerald-500/30 bg-emerald-950/20';
    glowClass = 'glow-emerald';
    needleColor = '#10b981';
  } else if (isPass === false) {
    statusColor = 'text-rose-400';
    statusBg = 'border-rose-500/30 bg-rose-950/20';
    glowClass = 'glow-rose';
    needleColor = '#f43f5e';
  }

  // Radius parameters for SVG arc
  const svgSize = size === 'sm' ? 160 : size === 'lg' ? 260 : 210;
  const strokeWidth = size === 'sm' ? 10 : 14;
  const radius = (svgSize - strokeWidth * 2) / 2;
  const cx = svgSize / 2;
  const cy = svgSize / 2;

  // Helpers for SVG Arc math
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  const bgArc = describeArc(cx, cy, radius, -120, 120);
  const valueArc = describeArc(cx, cy, radius, -120, Math.min(120, needleAngle));

  // Spec Range Overlay Arc if defined
  let specArcPath = '';
  if (specMin !== undefined && specMax !== undefined && max > min) {
    const specMinClamped = Math.max(min, Math.min(max, specMin));
    const specMaxClamped = Math.max(min, Math.min(max, specMax));
    const specStartAngle = startAngle + ((specMinClamped - min) / (max - min)) * totalAngle;
    const specEndAngle = startAngle + ((specMaxClamped - min) / (max - min)) * totalAngle;
    if (specEndAngle > specStartAngle) {
      specArcPath = describeArc(cx, cy, radius, specStartAngle, specEndAngle);
    }
  }

  // Generate tick marks
  const tickCount = 9;
  const ticks = Array.from({ length: tickCount }).map((_, i) => {
    const tickAngle = startAngle + (i / (tickCount - 1)) * totalAngle;
    const innerPoint = polarToCartesian(cx, cy, radius - strokeWidth - 2, tickAngle);
    const outerPoint = polarToCartesian(cx, cy, radius - 4, tickAngle);
    const tickVal = min + (i / (tickCount - 1)) * (max - min);
    return { innerPoint, outerPoint, angle: tickAngle, value: tickVal };
  });

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl beveled-panel border transition-all ${statusBg}`}>
      {/* Title Header */}
      <div className="flex items-center justify-between w-full mb-2">
        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-display">
          {title}
        </span>
        {isPass !== undefined && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border ${
              isPass
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}
          >
            {isPass ? 'PASS' : 'OUT OF SPEC'}
          </span>
        )}
      </div>

      {/* Analog SVG Dial Gauge */}
      <div className="relative flex items-center justify-center my-1">
        <svg width={svgSize} height={svgSize} className="overflow-visible">
          {/* Background Arc */}
          <path d={bgArc} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} strokeLinecap="round" />

          {/* Target Spec Arc overlay (highlighted region in emerald/cyan) */}
          {specArcPath && (
            <path
              d={specArcPath}
              fill="none"
              stroke="#10b98144"
              strokeWidth={strokeWidth + 4}
              strokeLinecap="butt"
            />
          )}

          {/* Active Value Arc */}
          <path
            d={valueArc}
            fill="none"
            stroke={needleColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ transition: 'd 0.3s ease-out, stroke 0.3s' }}
          />

          {/* Tick Marks */}
          {ticks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={tick.innerPoint.x}
                y1={tick.innerPoint.y}
                x2={tick.outerPoint.x}
                y2={tick.outerPoint.y}
                stroke="#64748b"
                strokeWidth={idx % 2 === 0 ? 2 : 1}
              />
            </g>
          ))}

          {/* Needle Pointer */}
          <g style={{ transform: `rotate(${needleAngle}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - radius + strokeWidth + 8}
              stroke={needleColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="8" fill="#0f172a" stroke={needleColor} strokeWidth="3" />
            <circle cx={cx} cy={cy} r="3" fill={needleColor} />
          </g>
        </svg>

        {/* Min / Max Labels under gauge arc */}
        <div className="absolute bottom-2 left-4 text-[10px] text-slate-500 font-mono-tech">
          MIN: {min}
        </div>
        <div className="absolute bottom-2 right-4 text-[10px] text-slate-500 font-mono-tech">
          MAX: {max}
        </div>
      </div>

      {/* Digital LCD Numerical Readout */}
      <div className={`w-full mt-2 px-4 py-2 rounded-lg text-center lcd-display flex flex-col items-center justify-center ${glowClass}`}>
        <div className="text-[10px] uppercase font-mono-tech tracking-widest text-emerald-500/80 mb-0.5">
          OBSERVED VALUE
        </div>
        <div className={`text-2xl md:text-3xl font-bold font-mono-tech tracking-tight ${statusColor}`}>
          {formattedValue || value.toFixed(2)}{' '}
          <span className="text-xs font-normal text-slate-400">{unit}</span>
        </div>

        {/* Spec Limits Subtext */}
        {(specMin !== undefined || specMax !== undefined) && (
          <div className="mt-1 text-[11px] font-mono text-slate-400 flex items-center gap-3">
            <span>SPEC RANGE:</span>
            <span className="text-slate-200 font-semibold">
              {specMin ?? 0} - {specMax ?? '∞'} {unit}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
