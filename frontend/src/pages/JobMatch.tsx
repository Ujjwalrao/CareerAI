import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { analyzeJobMatch } from '../services/api';
import ScoreReadout from '../components/ui/ScoreReadout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Target, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function JobMatch() {
  const { resumes, activeResumeId, setActiveResumeId } = useAppStore();
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    inResume: string[];
    missingFromJD: string[];
  } | null>(null);

  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  const handleAnalyze = async () => {
    if (!jdText.trim()) return;
    setLoading(true);
    try {
      const matchData = await analyzeJobMatch(jdText, activeResumeId);
      setResults(matchData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="job-match-page" className="w-full bg-paper min-h-[calc(100vh-4rem)] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        
        {/* Page Header */}
        <div className="border-b border-hairline pb-6 mb-10">
          <span className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">ATS Semantic Engine</span>
          <h1 className="font-heading text-2xl sm:text-3xl text-ink font-medium tracking-tight">Job Description Match</h1>
          <p className="font-sans text-[14px] text-mid-grey">
            Paste a target role description to evaluate semantic alignment, find missing stack competencies, and estimate score metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Form / Paste area (Columns 6) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <Card variant="paper" className="p-6 rounded-3xl flex flex-col gap-4">
              <span className="font-heading text-xs uppercase tracking-wider text-mid-grey select-none">1. Set Comparison Scope</span>
              
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-medium text-ink">Active Resume Version</label>
                <select
                  value={activeResumeId}
                  onChange={(e) => setActiveResumeId(e.target.value)}
                  className="w-full border border-hairline rounded-xl px-3 py-2.5 text-sm font-sans bg-paper text-ink focus:border-ink focus:outline-none"
                >
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.role} ({r.score}%)</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-medium text-ink">Paste Job Description (JD)</label>
                <textarea
                  rows={8}
                  placeholder="Paste the full job posting, specifications, and core stack requirements here..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  className="w-full border border-hairline rounded-xl px-3 py-3 text-sm font-sans text-ink placeholder:text-mid-grey/40 focus:border-ink focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <Button
                onClick={handleAnalyze}
                variant="dark"
                disabled={loading || !jdText.trim()}
                className="py-3 w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Calculating vector proximity...
                  </>
                ) : (
                  <>
                    <Target size={14} className="text-signal" />
                    Perform Match Analysis
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* Right Column: Visual Result Feedback (Columns 6) */}
          <div className="lg:col-span-6">
            {!results && !loading && (
              <div className="border border-dashed border-hairline bg-paper-warm/40 p-12 text-center rounded-3xl flex flex-col items-center justify-center aspect-[4/3]">
                <Target size={32} className="text-mid-grey/40 stroke-[1.25] mb-4" />
                <h3 className="font-heading text-base text-ink font-medium tracking-tight mb-1">Awaiting JD Input</h3>
                <p className="font-sans text-xs text-mid-grey max-w-xs leading-relaxed">
                  Provide comparison text on the left, then trigger matching to calculate your semantic ATS vector.
                </p>
              </div>
            )}

            {loading && (
              <div className="border border-hairline bg-paper-warm/25 p-12 text-center rounded-3xl flex flex-col items-center justify-center aspect-[4/3]">
                <div className="relative mb-6">
                  <div className="h-10 w-10 border-2 border-hairline border-t-signal rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw size={14} className="text-mid-grey animate-pulse" />
                  </div>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-mid-grey">Evaluating contextual clusters</span>
                <p className="font-heading text-base text-ink font-medium mt-3 animate-pulse">
                  Deconstructing semantic boundaries...
                </p>
              </div>
            )}

            {results && !loading && (
              <div className="flex flex-col gap-8 animate-fade-in">
                
                {/* Large Center Readout */}
                <div className="border border-hairline bg-paper-warm/40 p-8 rounded-3xl flex justify-center text-center">
                  <ScoreReadout
                    value={results.score}
                    label={results.score >= 80 ? "High semantic alignment detected." : "Moderate gaps identified. Optimization suggested."}
                    suffix="%"
                    delay={100}
                  />
                </div>

                {/* Diff Grid Section */}
                <div className="grid grid-cols-2 gap-6 font-sans">
                  
                  {/* Verified Skills Column */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-hairline pb-2">
                      <CheckCircle2 size={14} className="text-positive" />
                      <span className="text-xs font-bold uppercase tracking-wider text-ink">In your resume ({results.inResume.length})</span>
                    </div>
                    {results.inResume.length === 0 ? (
                      <span className="text-xs text-mid-grey italic">No matching keywords.</span>
                    ) : (
                      <div className="flex flex-col gap-1.5 text-xs text-positive font-medium">
                        {results.inResume.map((skill) => (
                          <span key={skill} className="flex items-center gap-1.5">
                            · {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Missing Skills Column */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2 border-b border-hairline pb-2">
                      <AlertTriangle size={14} className="text-negative" />
                      <span className="text-xs font-bold uppercase tracking-wider text-ink">Missing from JD ({results.missingFromJD.length})</span>
                    </div>
                    {results.missingFromJD.length === 0 ? (
                      <span className="text-xs text-positive font-medium">0 critical gaps found. Ready!</span>
                    ) : (
                      <div className="flex flex-col gap-1.5 text-xs text-negative font-medium">
                        {results.missingFromJD.map((skill) => (
                          <span key={skill} className="flex items-center gap-1.5">
                            · {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Closing Advice */}
                <Card variant="warm" className="p-4 rounded-2xl flex flex-col gap-2">
                  <span className="font-heading text-xs font-medium text-ink select-none">ATS Optimization Recommendation</span>
                  <p className="font-sans text-xs text-mid-grey leading-relaxed">
                    To elevate alignment to {Math.min(99, results.score + 10)}%, incorporate the missing skills above inside your active resume executive brief or experience chronicles in the Builder.
                  </p>
                </Card>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
