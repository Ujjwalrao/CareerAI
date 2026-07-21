import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getGapAnalysis } from '../services/api';
import SkillRadarChart from '../components/shared/SkillRadarChart';
import Card from '../components/ui/Card';
import { TargetRoleGap } from '../types';
import { Calendar, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';

export default function GapAnalysis() {
  const { resumes, activeResumeId } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [gapData, setGapData] = useState<TargetRoleGap | null>(null);

  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  useEffect(() => {
    let active = true;
    const fetchGaps = async () => {
      setLoading(true);
      try {
        const data = await getGapAnalysis(activeResumeId);
        if (active) {
          setGapData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchGaps();

    return () => {
      active = false;
    };
  }, [activeResumeId]);

  return (
    <div id="gap-analysis-page" className="w-full bg-paper min-h-[calc(100vh-4rem)] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        
        {/* Page Header */}
        <div className="border-b border-hairline pb-6 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Skill Gap Visualizer</span>
          <h1 className="font-heading text-2xl sm:text-3xl text-ink font-medium tracking-tight">Profile Gap Analysis</h1>
          <p className="font-sans text-[14px] text-mid-grey">
            Map your current technological capabilities (radar) against tier standards and track structured quarterly learning milestones.
          </p>
        </div>

        {loading && (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <RefreshCw size={24} className="animate-spin text-mid-grey mb-4" />
            <p className="font-heading text-base text-ink font-medium">Resolving vector skill matrices...</p>
          </div>
        )}

        {!loading && gapData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-fade-in">
            
            {/* Left: SkillRadarChart (Columns 5) */}
            <div className="lg:col-span-5 flex flex-col items-center border-b lg:border-b-0 lg:border-r border-hairline pb-10 lg:pb-0 lg:pr-10">
              <SkillRadarChart skills={gapData.skills} />
              
              {/* Delta highlights table */}
              <div className="w-full mt-6 flex flex-col font-sans text-xs gap-3">
                <span className="font-heading text-[11px] uppercase tracking-wider text-mid-grey block select-none">CRITICAL SKILL DELTAS</span>
                <div className="flex flex-col divide-y divide-hairline">
                  {gapData.skills.map((skill) => {
                    const delta = skill.target - skill.current;
                    return (
                      <div key={skill.name} className="flex justify-between py-2 items-center">
                        <span className="text-ink font-medium">{skill.name}</span>
                        <div className="flex gap-3 items-center">
                          <span className="text-mid-grey">Current: {skill.current}% · Target: {skill.target}%</span>
                          {delta > 0 ? (
                            <span className="text-negative font-semibold">-{delta}% delta</span>
                          ) : (
                            <span className="text-positive font-semibold">Match!</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Milestone Timeline (Columns 7) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div>
                <span className="font-heading text-[13px] text-ink font-medium block mb-1">Suggested Learning Milestones</span>
                <span className="font-sans text-[12px] text-mid-grey">Quarterly trajectories customized for your active target role.</span>
              </div>

              {/* Plain timeline styling */}
              <div className="flex flex-col gap-8 relative pl-6 before:absolute before:left-[5px] before:top-2 before:bottom-2 before:w-[1px] before:bg-hairline mt-4">
                {gapData.milestones.map((ms, idx) => (
                  <div key={idx} className="relative flex flex-col gap-3">
                    {/* Ring dot indicator */}
                    <div className="absolute left-[-26px] top-1.5 h-3.5 w-3.5 rounded-full border border-ink bg-paper flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-signal" />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-heading text-[15px] font-medium text-ink">{ms.title}</span>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-mid-grey shrink-0">
                        <Calendar size={12} />
                        <span>{ms.timeframe}</span>
                      </div>
                    </div>

                    <p className="font-sans text-xs sm:text-[13px] text-mid-grey leading-relaxed">
                      {ms.description}
                    </p>

                    {/* Resources list */}
                    <div className="flex flex-col gap-2 mt-1">
                      <span className="font-heading text-[10px] uppercase tracking-wider text-mid-grey flex items-center gap-1 select-none">
                        <BookOpen size={10} /> Reference Materials
                      </span>
                      <div className="flex flex-col gap-1.5">
                        {ms.resources.map((res, resIdx) => (
                          <a
                            key={resIdx}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-xs text-ink hover:text-signal font-medium inline-flex items-center gap-1 w-fit border-b border-dashed border-ink/25 hover:border-signal transition-colors"
                          >
                            {res.name}
                            <ExternalLink size={10} className="text-mid-grey" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
