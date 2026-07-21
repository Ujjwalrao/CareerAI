import { useAppStore } from '../store/useAppStore';
import ScoreReadout from '../components/ui/ScoreReadout';
import ScoreTrendChart from '../components/shared/ScoreTrendChart';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Briefcase, ArrowUpRight, CheckCircle, Flame, Target } from 'lucide-react';

export default function Dashboard() {
  const { resumes, activeResumeId, applications, setActiveTab } = useAppStore();
  
  // Find active resume score
  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];
  const resumeScore = activeResume ? activeResume.score : 87;

  // Compute application stats
  const totalApps = applications.length;
  const interviewApps = applications.filter(a => a.status === 'Interview').length;
  const offerApps = applications.filter(a => a.status === 'Offer').length;
  
  // Custom readiness computation based on mock data
  const readinessScore = 82;

  // Compute funnel percentages
  const interviewRate = totalApps > 0 ? Math.round((interviewApps / totalApps) * 100) : 0;
  const offerRate = totalApps > 0 ? Math.round((offerApps / totalApps) * 100) : 0;

  return (
    <div id="dashboard-page" className="w-full bg-paper">
      
      {/* Editorial dark hero band */}
      <div className="w-full bg-ink text-paper py-14 px-6 md:px-12 border-b border-hairline-dark">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-[11px] uppercase tracking-widest text-signal">System Monitoring Activated</span>
          </div>
          <h1 className="font-heading text-[36px] sm:text-[44px] md:text-[52px] leading-[1.1] tracking-tight font-medium text-paper">
            Here's where you stand.
          </h1>
          <p className="mt-2 text-mid-grey text-[14px] sm:text-[15px] max-w-lg font-sans">
            Your metrics are locked. Review resume keyword coverage, interview confidence loops, and pipeline volumes below.
          </p>
        </div>
      </div>

      {/* Main dashboard grid on plain white paper */}
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        
        {/* Metric Row: Three ScoreReadouts separated by hairline dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4 border-b border-hairline pb-12">
          <div className="md:px-4">
            <ScoreReadout
              value={resumeScore}
              label="ATS alignment score: Optimal"
              subLabel="Key gaps identified: WCAG Accessibility and Browser Performance."
              suffix="%"
              delay={100}
            />
            <button 
              onClick={() => setActiveTab('resume', 'builder')}
              className="mt-4 text-xs font-sans text-ink hover:text-signal font-medium inline-flex items-center gap-1 cursor-pointer select-none"
            >
              Tune Resume Builder <ArrowUpRight size={14} />
            </button>
          </div>
          
          <div className="border-t md:border-t-0 md:border-x border-hairline pt-8 md:pt-0 md:px-8">
            <ScoreReadout
              value={readinessScore}
              label="Interview readiness index: Competitive"
              subLabel="Outstanding performance in virtualized state loops and telemetry answers."
              suffix="%"
              delay={250}
            />
            <button 
              onClick={() => setActiveTab('interview')}
              className="mt-4 text-xs font-sans text-ink hover:text-signal font-medium inline-flex items-center gap-1 cursor-pointer select-none"
            >
              Trigger Mock Coach <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="border-t md:border-t-0 md:border-r-0 pt-8 md:pt-0 md:px-8">
            <ScoreReadout
              value={totalApps}
              label="Active applications monitored: Active"
              subLabel={`${interviewApps} current interview cycles, ${offerApps} secured job offers.`}
              suffix={`/0${totalApps}`}
              delay={400}
            />
            <button 
              onClick={() => setActiveTab('tracker')}
              className="mt-4 text-xs font-sans text-ink hover:text-signal font-medium inline-flex items-center gap-1 cursor-pointer select-none"
            >
              Open Kanban Tracker <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* Charts & Funnel Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12">
          
          {/* Trend Chart (Left 7 Columns) */}
          <div className="lg:col-span-7 flex flex-col">
            <ScoreTrendChart />
          </div>

          {/* Application Pipeline (Right 5 Columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-hairline pb-4 mb-6">
                <span className="font-heading text-[15px] text-ink font-medium tracking-tight block">Pipeline Conversion Rates</span>
                <span className="font-sans text-[12px] text-mid-grey">Simulated funnel efficiency based on {totalApps} active logs.</span>
              </div>

              {/* Custom Thin Horizontal Bar Funnel */}
              <div className="flex flex-col gap-5 font-sans">
                {/* Step 1 */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-ink">1. Applications Logged</span>
                    <span className="text-mid-grey">{totalApps} logs · 100%</span>
                  </div>
                  <div className="w-full h-[6px] bg-ink/5 rounded-full overflow-hidden">
                    <div className="h-full bg-ink transition-all duration-1000" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-ink">2. Interview Stage</span>
                    <span className="text-mid-grey">{interviewApps} logs · {interviewRate}%</span>
                  </div>
                  <div className="w-full h-[6px] bg-ink/5 rounded-full overflow-hidden">
                    <div className="h-full bg-mid-grey transition-all duration-1000" style={{ width: `${interviewRate}%` }} />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-ink">3. Offers Secured</span>
                    <span className="text-mid-grey">{offerApps} logs · {offerRate}%</span>
                  </div>
                  <div className="w-full h-[6px] bg-ink/5 rounded-full overflow-hidden">
                    <div className="h-full bg-signal transition-all duration-1000" style={{ width: `${offerRate}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <Card variant="warm" className="mt-8 p-5 flex flex-col gap-4">
              <span className="font-heading text-xs font-medium tracking-wider uppercase text-ink select-none">Quick Actions</span>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => setActiveTab('match')} 
                  variant="light" 
                  className="py-2.5 text-[12px]"
                >
                  <Target size={14} className="text-signal" /> Match JDs
                </Button>
                <Button 
                  onClick={() => setActiveTab('content')} 
                  variant="light" 
                  className="py-2.5 text-[12px]"
                >
                  <Flame size={14} className="text-signal" /> AI Cover Letters
                </Button>
              </div>
            </Card>

          </div>
        </div>

        {/* Activity Stream Feed */}
        <div className="mt-16 pt-12 border-t border-hairline">
          <div className="flex items-center justify-between mb-6">
            <span className="font-heading text-[15px] text-ink font-medium tracking-tight">Active Operation Feed</span>
            <span className="font-mono text-[10px] text-positive uppercase tracking-wider bg-positive/5 px-2 py-0.5 rounded">All Channels Clear</span>
          </div>
          
          <div className="flex flex-col divide-y divide-hairline">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-signal shrink-0" />
                <span className="font-sans text-[14px] text-ink font-medium">Salary Negotiation Simulator unlocked</span>
              </div>
              <span className="font-mono text-[11px] text-mid-grey">2026-07-16 10:43 · Simulated Recruiter</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-positive shrink-0" />
                <span className="font-sans text-[14px] text-ink font-medium">Resume score synchronized (Senior Frontend Developer)</span>
              </div>
              <span className="font-mono text-[11px] text-mid-grey">2026-07-15 14:12 · ATS Sync Engine</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-mid-grey/40 shrink-0" />
                <span className="font-sans text-[14px] text-ink">Interview coaching records archived (Vercel Inc)</span>
              </div>
              <span className="font-mono text-[11px] text-mid-grey">2026-07-12 09:30 · Audio Transcript Engine</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
