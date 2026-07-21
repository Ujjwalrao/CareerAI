import { useAppStore } from '../store/useAppStore';
import ScoreTrendChart from '../components/shared/ScoreTrendChart';
import Card from '../components/ui/Card';
import { BarChart3, TrendingUp, Compass, Award, Activity } from 'lucide-react';

export default function Analytics() {
  const { applications, resumes } = useAppStore();

  const totalApps = applications.length;
  const interviewApps = applications.filter(a => a.status === 'Interview').length;
  const offerApps = applications.filter(a => a.status === 'Offer').length;
  const rejectedApps = applications.filter(a => a.status === 'Rejected').length;

  // Custom missing skills counting data
  const missingSkillsData = [
    { name: 'WCAG Accessibility', count: 5, color: 'var(--color-negative)' },
    { name: 'Browser Execution Performance', count: 4, color: 'var(--color-signal)' },
    { name: 'Vector Database (pgvector)', count: 3, color: 'var(--color-ink)' },
    { name: 'Prompt Orchestration Security', count: 2, color: 'var(--color-ink)' },
    { name: 'TypeScript Core generics', count: 2, color: 'var(--color-ink)' }
  ];

  // Helper max value for scaling bar charts
  const maxCount = 6;

  return (
    <div id="analytics-page" className="w-full bg-paper min-h-[calc(100vh-4rem)] px-6 py-12 md:py-16 font-sans">
      <div className="mx-auto max-w-5xl">
        
        {/* Page Header */}
        <div className="border-b border-hairline pb-6 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Operational Analytics Terminal</span>
          <h1 className="font-heading text-2xl sm:text-3xl text-ink font-medium tracking-tight">System Performance Metrics</h1>
          <p className="font-sans text-[14px] text-mid-grey">
            Audit comprehensive multi-channel telemetry regarding resume revisions, interview progress indices, and pipeline volumes.
          </p>
        </div>

        {/* Highlight Grid Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 text-ink">
          
          <Card variant="warm" className="p-5 rounded-2xl flex flex-col justify-between">
            <span className="font-heading text-[10px] uppercase tracking-wider text-mid-grey">MONITORED WORKSPACES</span>
            <div className="flex items-baseline gap-1.5 mt-3 select-none">
              <span className="font-heading text-3xl font-medium">0{resumes.length}</span>
              <span className="text-xs text-mid-grey">Files</span>
            </div>
          </Card>

          <Card variant="warm" className="p-5 rounded-2xl flex flex-col justify-between">
            <span className="font-heading text-[10px] uppercase tracking-wider text-mid-grey">TOTAL PIPELINE THREADS</span>
            <div className="flex items-baseline gap-1.5 mt-3 select-none">
              <span className="font-heading text-3xl font-medium">0{totalApps}</span>
              <span className="text-xs text-mid-grey">Jobs</span>
            </div>
          </Card>

          <Card variant="warm" className="p-5 rounded-2xl flex flex-col justify-between">
            <span className="font-heading text-[10px] uppercase tracking-wider text-mid-grey">INTERVIEW CONVERSIONS</span>
            <div className="flex items-baseline gap-1.5 mt-3 select-none">
              <span className="font-heading text-3xl font-medium">0{interviewApps}</span>
              <span className="text-xs text-mid-grey">Threads</span>
            </div>
          </Card>

          <Card variant="warm" className="p-5 rounded-2xl flex flex-col justify-between">
            <span className="font-heading text-[10px] uppercase tracking-wider text-mid-grey">SECURED OFFER RATIO</span>
            <div className="flex items-baseline gap-1.5 mt-3 select-none">
              <span className="font-heading text-3xl font-medium">
                {totalApps > 0 ? Math.round((offerApps / totalApps) * 100) : 0}
              </span>
              <span className="text-xs text-mid-grey">% Yield</span>
            </div>
          </Card>

        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          {/* Chart Card 1: Resume Score Trend over Time */}
          <div className="border border-hairline p-6 rounded-3xl flex flex-col justify-between min-h-[340px]">
            <ScoreTrendChart />
          </div>

          {/* Chart Card 2: Most Common Missing Skills across JD matches */}
          <div className="border border-hairline p-6 rounded-3xl flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="border-b border-hairline pb-4 mb-6 select-none">
                <span className="font-heading text-sm text-ink font-medium tracking-tight block">Skill Vector Vulnerabilities</span>
                <span className="font-sans text-xs text-mid-grey">Frequency of missing requirements across simulated JDs.</span>
              </div>

              {/* Horizontal Custom SVG Bar Chart */}
              <div className="flex flex-col gap-4 font-sans text-xs mt-2">
                {missingSkillsData.map((skill) => {
                  const widthPercent = (skill.count / maxCount) * 100;
                  return (
                    <div key={skill.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between font-medium">
                        <span className="text-ink">{skill.name}</span>
                        <span className="text-mid-grey">{skill.count} matching profiles</span>
                      </div>
                      
                      {/* Bar container */}
                      <div className="w-full h-[6px] bg-ink/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-1000" 
                          style={{ 
                            width: `${widthPercent}%`,
                            backgroundColor: skill.color 
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <span className="font-sans text-[11px] text-mid-grey select-none block mt-4 border-t border-hairline pt-3">
              * Resolving the top delta (Accessibility) boosts alignment average across 80% of pipelines.
            </span>
          </div>

          {/* Chart Card 3: Deep-dive conversion funnel */}
          <div className="border border-hairline p-6 rounded-3xl flex flex-col justify-between min-h-[340px] md:col-span-2">
            <div>
              <div className="border-b border-hairline pb-4 mb-6 select-none">
                <span className="font-heading text-sm text-ink font-medium tracking-tight block">Pipeline Stage Distribution</span>
                <span className="font-sans text-xs text-mid-grey">Overview of your organizational funnel logs.</span>
              </div>

              {/* Dynamic conversion logs */}
              {totalApps === 0 ? (
                <div className="text-center py-10 font-sans text-xs text-mid-grey">
                  No applications logged to render funnel distribution.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 text-center">
                  <div className="border-r border-hairline last:border-0 p-3">
                    <span className="font-heading text-[28px] font-bold text-ink">0{applications.filter(a => a.status === 'Applied').length}</span>
                    <span className="font-sans text-xs text-mid-grey block mt-1">Applied Stage</span>
                  </div>
                  <div className="border-r border-hairline last:border-0 p-3">
                    <span className="font-heading text-[28px] font-bold text-ink">0{applications.filter(a => a.status === 'Interview').length}</span>
                    <span className="font-sans text-xs text-mid-grey block mt-1">Interview Loops</span>
                  </div>
                  <div className="border-r border-hairline last:border-0 p-3">
                    <span className="font-heading text-[28px] font-bold text-signal">0{applications.filter(a => a.status === 'Offer').length}</span>
                    <span className="font-sans text-xs text-mid-grey block mt-1">Offers Secured</span>
                  </div>
                  <div className="last:border-0 p-3">
                    <span className="font-heading text-[28px] font-bold text-mid-grey">0{applications.filter(a => a.status === 'Rejected').length}</span>
                    <span className="font-sans text-xs text-mid-grey block mt-1">Rejected Channels</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-hairline pt-4 flex gap-4 text-xs font-sans text-mid-grey mt-6 select-none">
              <div className="flex items-center gap-1.5">
                <Activity size={14} className="text-positive animate-pulse" />
                <span>Simulated state metrics refreshed locally.</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
