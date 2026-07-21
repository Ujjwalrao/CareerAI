import { mockScoreTrends } from '../../data/mockData';

export default function ScoreTrendChart() {
  const data = mockScoreTrends;
  const width = 600;
  const height = 240;
  const paddingLeft = 40;
  const paddingRight = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  // X and Y scaling helpers
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * chartWidth;
  };

  const getY = (score: number) => {
    // Scores range from 50 to 100 on the y-axis
    const minScore = 50;
    const maxScore = 100;
    const ratio = (score - minScore) / (maxScore - minScore);
    return paddingTop + chartHeight - ratio * chartHeight;
  };

  // Generate SVG paths
  const resumePoints = data.map((d, i) => `${getX(i)},${getY(d.resumeScore)}`).join(' ');
  const readinessPoints = data.map((d, i) => `${getX(i)},${getY(d.readinessScore)}`).join(' ');

  const latestIndex = data.length - 1;
  const latestResumeX = getX(latestIndex);
  const latestResumeY = getY(data[latestIndex].resumeScore);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between border-b border-hairline pb-4 mb-6">
        <div className="flex flex-col">
          <span className="font-heading text-[15px] text-ink font-medium tracking-tight">Performance History</span>
          <span className="font-sans text-[12px] text-mid-grey">Simulated score trajectory over previous 8 operational weeks.</span>
        </div>
        <div className="flex gap-4 text-xs font-sans select-none">
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-6 bg-ink" />
            <span className="text-mid-grey">Resume Match (Latest: {data[latestIndex].resumeScore}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-6 bg-mid-grey border-t-2 border-dashed border-mid-grey" />
            <span className="text-mid-grey">Mock Readiness ({data[latestIndex].readinessScore}%)</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full min-w-[500px] h-auto select-none"
        >
          {/* Horizontal Grid lines & labels */}
          {[50, 75, 100].map((score) => {
            const y = getY(score);
            return (
              <g key={score} className="opacity-40">
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="var(--color-hairline)" 
                  strokeWidth="1"
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="font-mono text-[9px] fill-mid-grey"
                >
                  {score}%
                </text>
              </g>
            );
          })}

          {/* X Axis Weeks labels */}
          {data.map((d, i) => {
            const x = getX(i);
            return (
              <text
                key={i}
                x={x}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                className="font-mono text-[9px] fill-mid-grey opacity-80"
              >
                {d.week}
              </text>
            );
          })}

          {/* Line 2: Readiness Score (Dashed line) */}
          <polyline
            fill="none"
            stroke="var(--color-mid-grey)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            points={readinessPoints}
            className="transition-all duration-300"
          />

          {/* Line 1: Resume Score (Solid Black line) */}
          <polyline
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="2.25"
            points={resumePoints}
            className="transition-all duration-300"
          />

          {/* Single Pulse Amber Dot on the latest point of Resume Score */}
          <circle
            cx={latestResumeX}
            cy={latestResumeY}
            r="8"
            fill="var(--color-signal)"
            fillOpacity="0.25"
            className="animate-pulse"
          />
          <circle
            cx={latestResumeX}
            cy={latestResumeY}
            r="4.5"
            fill="var(--color-signal)"
            stroke="var(--color-ink)"
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </div>
  );
}
