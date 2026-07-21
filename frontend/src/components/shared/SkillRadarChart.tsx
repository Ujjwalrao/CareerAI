import React from 'react';

export interface RadarSkill {
  name: string;
  current: number; // 0-100
  target: number;  // 0-100
}

export interface SkillRadarChartProps {
  skills: RadarSkill[];
}

export default function SkillRadarChart({ skills }: SkillRadarChartProps) {
  const size = 320;
  const center = size / 2;
  const maxRadius = size * 0.35; // keep padding for labels

  const totalAxes = skills.length;

  // Helper to convert polar coordinates to Cartesian
  const getCoordinates = (index: number, value: number) => {
    // Offset by -Math.PI / 2 to make the first point point straight up
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    // Scale value to 0-100
    const r = (value / 100) * maxRadius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Generate background concentric polygons (at 25%, 50%, 75%, 100%)
  const concentricLevels = [25, 50, 75, 100];
  const gridPolygons = concentricLevels.map(level => {
    return Array.from({ length: totalAxes }).map((_, index) => {
      const { x, y } = getCoordinates(index, level);
      return `${x},${y}`;
    }).join(' ');
  });

  // Target points polygon
  const targetPoints = skills.map((skill, index) => {
    const { x, y } = getCoordinates(index, skill.target);
    return `${x},${y}`;
  }).join(' ');

  // Current points polygon
  const currentPoints = skills.map((skill, index) => {
    const { x, y } = getCoordinates(index, skill.current);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center justify-center py-6 w-full">
      <div className="w-full text-center mb-4">
        <span className="font-heading text-sm text-ink font-medium tracking-tight block">Skill Vector Alignment</span>
        <span className="font-sans text-xs text-mid-grey">Your active profile (amber) vs. target tier threshold (black).</span>
      </div>

      <div className="relative select-none flex justify-center items-center w-full max-w-[320px] aspect-square">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full">
          {/* Concentric Grid Polygons */}
          {gridPolygons.map((points, idx) => (
            <polygon
              key={idx}
              points={points}
              fill="none"
              stroke="var(--color-hairline)"
              strokeWidth="0.75"
            />
          ))}

          {/* Grid Level Labels */}
          {concentricLevels.map((level) => {
            const { x, y } = getCoordinates(0, level);
            return (
              <text
                key={level}
                x={x + 4}
                y={y + 10}
                className="font-mono text-[8px] fill-mid-grey/50"
              >
                {level}
              </text>
            );
          })}

          {/* Axis Spoke Lines & Text Labels */}
          {skills.map((skill, index) => {
            const outerCoord = getCoordinates(index, 100);
            const labelCoord = getCoordinates(index, 115); // place label slightly further out
            
            // Text alignment adjustments based on angle
            const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
            let textAnchor = "middle";
            if (Math.cos(angle) > 0.1) textAnchor = "start";
            if (Math.cos(angle) < -0.1) textAnchor = "end";

            return (
              <g key={skill.name}>
                {/* Spoke */}
                <line
                  x1={center}
                  y1={center}
                  x2={outerCoord.x}
                  y2={outerCoord.y}
                  stroke="var(--color-hairline)"
                  strokeWidth="0.75"
                />
                {/* Skill Name */}
                <text
                  x={labelCoord.x}
                  y={labelCoord.y + 3}
                  textAnchor={textAnchor}
                  className="font-sans text-[10px] font-medium fill-ink tracking-tight"
                >
                  {skill.name}
                </text>
              </g>
            );
          })}

          {/* Target Polygon (Ink / Black Surface) */}
          <polygon
            points={targetPoints}
            fill="rgba(10, 10, 10, 0.03)"
            stroke="var(--color-ink)"
            strokeWidth="1"
            className="transition-all duration-300"
          />

          {/* Current Polygon (Amber / Signal Surface) */}
          <polygon
            points={currentPoints}
            fill="rgba(227, 179, 65, 0.15)"
            stroke="var(--color-signal)"
            strokeWidth="1.75"
            className="transition-all duration-300"
          />

          {/* Core Center Dot */}
          <circle cx={center} cy={center} r="2" fill="var(--color-ink)" />
        </svg>
      </div>

      <div className="flex gap-4 mt-2 justify-center text-[11px] font-sans">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm bg-signal" />
          <span className="text-ink">Current Skill Vector</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-sm bg-ink" />
          <span className="text-mid-grey">Target Role Standard</span>
        </div>
      </div>
    </div>
  );
}
