import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { parseResume, saveResume } from '../../services/api';
import { useTypewriter } from '../../hooks/useTypewriter';
import ScoreReadout from '../../components/ui/ScoreReadout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Upload, ArrowRight, PenTool, Check, FileText, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import { ResumeVersion } from '../../types';

export default function ResumeView() {
  const { resumes, activeResumeId, addResume, updateResume, setActiveResumeId, activeSubView, setActiveTab } = useAppStore();
  
  const [currentView, setCurrentView] = useState<'upload' | 'parsing' | 'score' | 'builder'>(
    (activeSubView === 'builder' && resumes.length > 0) ? 'builder' : 'upload'
  );
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parseStep, setParseStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [activeResume, setActiveResume] = useState<ResumeVersion | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if active subview changes
  useEffect(() => {
    if (activeSubView === 'builder' && resumes.length > 0) {
      setCurrentView('builder');
    } else if (activeSubView === 'upload') {
      setCurrentView('upload');
    }
  }, [activeSubView, resumes]);

  // Handle active resume syncing
  useEffect(() => {
    const matching = resumes.find(r => r.id === activeResumeId) || resumes[0];
    if (matching) {
      setActiveResume(matching);
    }
  }, [activeResumeId, resumes]);

  // parsing typewriter messages
  const parseMessages = [
    "Reading document format and character streams...",
    "Extracting experience logs, summaries, and structural tags...",
    "Analyzing skill vectors against 200+ ATS parsing protocols..."
  ];

  const currentMessage = parseMessages[parseStep] || "";
  const { displayed: typedParseMsg, done: parseMsgDone } = useTypewriter(currentMessage, { speed: 12, startDelay: 100 });

  useEffect(() => {
    if (currentView === 'parsing' && parseMsgDone) {
      const timer = setTimeout(() => {
        if (parseStep < parseMessages.length - 1) {
          setParseStep(prev => prev + 1);
        } else {
          // Finished parsing!
          completeParsing();
        }
      }, 1200); // Wait 1.2s before moving to next step
      return () => clearTimeout(timer);
    }
  }, [currentView, parseMsgDone, parseStep]);

  const completeParsing = async () => {
    if (uploadedFile) {
      const parsed = await parseResume(uploadedFile);
      addResume(parsed);
      setActiveResumeId(parsed.id);
      setActiveResume(parsed);
      setCurrentView('score');
    } else {
      // Fallback
      setCurrentView('score');
    }
  };

  // Drag Drop Handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startParsingFlow(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value && e.target.files && e.target.files[0]) {
      startParsingFlow(e.target.files[0]);
    }
  };

  const startParsingFlow = (file: File) => {
    setUploadedFile(file);
    setParseStep(0);
    setCurrentView('parsing');
  };

  // Form modification handlers for Resume Builder
  const handleSummaryChange = (val: string) => {
    if (!activeResume) return;
    const updated = { ...activeResume, summary: val };
    setActiveResume(updated);
    updateResume(updated);
  };

  const handleSkillChange = (index: number, val: string) => {
    if (!activeResume) return;
    const updatedSkills = [...activeResume.skills];
    updatedSkills[index] = val;
    const updated = { ...activeResume, skills: updatedSkills };
    setActiveResume(updated);
    updateResume(updated);
  };

  const addSkill = () => {
    if (!activeResume) return;
    const updated = { ...activeResume, skills: [...activeResume.skills, 'New Skill'] };
    setActiveResume(updated);
    updateResume(updated);
  };

  const removeSkill = (index: number) => {
    if (!activeResume) return;
    const updatedSkills = activeResume.skills.filter((_, idx) => idx !== index);
    const updated = { ...activeResume, skills: updatedSkills };
    setActiveResume(updated);
    updateResume(updated);
  };

  const handleExpChange = (expIdx: number, field: string, val: any) => {
    if (!activeResume) return;
    const updatedExperience = activeResume.experience.map((exp, i) => {
      if (i === expIdx) {
        return { ...exp, [field]: val };
      }
      return exp;
    });
    const updated = { ...activeResume, experience: updatedExperience };
    setActiveResume(updated);
    updateResume(updated);
  };

  const handleBulletChange = (expIdx: number, bulletIdx: number, val: string) => {
    if (!activeResume) return;
    const updatedExperience = activeResume.experience.map((exp, i) => {
      if (i === expIdx) {
        const updatedBullets = [...exp.bullets];
        updatedBullets[bulletIdx] = val;
        return { ...exp, bullets: updatedBullets };
      }
      return exp;
    });
    const updated = { ...activeResume, experience: updatedExperience };
    setActiveResume(updated);
    updateResume(updated);
  };

  const addBullet = (expIdx: number) => {
    if (!activeResume) return;
    const updatedExperience = activeResume.experience.map((exp, i) => {
      if (i === expIdx) {
        return { ...exp, bullets: [...exp.bullets, "New quantified impact statement."] };
      }
      return exp;
    });
    const updated = { ...activeResume, experience: updatedExperience };
    setActiveResume(updated);
    updateResume(updated);
  };

  const removeBullet = (expIdx: number, bulletIdx: number) => {
    if (!activeResume) return;
    const updatedExperience = activeResume.experience.map((exp, i) => {
      if (i === expIdx) {
        return { ...exp, bullets: exp.bullets.filter((_, bIdx) => bIdx !== bulletIdx) };
      }
      return exp;
    });
    const updated = { ...activeResume, experience: updatedExperience };
    setActiveResume(updated);
    updateResume(updated);
  };

  return (
    <div className="w-full bg-paper min-h-[calc(100vh-4rem)]">
      
      {/* ----------------- UPLOAD VIEW ----------------- */}
      {currentView === 'upload' && (
        <div className="mx-auto max-w-4xl px-6 py-16 text-center flex flex-col items-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-signal mb-2">Resume Vector Alignment</span>
          <h2 className="font-heading text-3xl sm:text-4xl text-ink font-medium tracking-tight mb-2">
            Upload your technical resume.
          </h2>
          <p className="font-sans text-[14px] text-mid-grey max-w-md leading-relaxed mb-10">
            Upload a modern resume document (PDF, DOCX). Our parser will deconstruct headings, calculate ATS compatibility, and highlight critical keyword gaps.
          </p>

          {/* Large Drag Target */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`w-full max-w-2xl aspect-[16/9] border-2 border-dashed rounded-3xl flex flex-col justify-center items-center p-8 transition-all duration-300 relative select-none ${
              dragActive ? 'border-signal bg-paper-warm' : 'border-hairline hover:border-ink/20 bg-paper-warm/40'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.docx,.txt"
              onChange={handleFileInput}
              className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
            />
            <div className="p-4 bg-paper rounded-full border border-hairline mb-4">
              <Upload size={24} className="text-mid-grey stroke-[1.5]" />
            </div>
            <span className="font-heading text-base text-ink font-medium tracking-tight mb-1">
              Drag file here, or click to choose from system files
            </span>
            <p className="font-sans text-xs text-mid-grey">
              Supported standards: PDF, DOCX, TXT. (Up to 10MB)
            </p>
          </div>

          <div className="mt-8 flex items-center gap-2 text-xs font-sans text-mid-grey">
            <span className="h-1.5 w-1.5 rounded-full bg-positive" />
            <span>Encrypted local file processing. No data is stored permanently without consent.</span>
          </div>

          {resumes.length > 0 && (
            <div className="mt-14 border-t border-hairline pt-10 w-full max-w-2xl text-left">
              <span className="font-heading text-xs uppercase tracking-widest text-mid-grey block mb-4 select-none">OR PRE-LOAD WORKSPACE FILE</span>
              <div className="flex flex-col gap-3">
                {resumes.map((resume) => (
                  <div 
                    key={resume.id}
                    onClick={() => {
                      setActiveResumeId(resume.id);
                      setActiveResume(resume);
                      setCurrentView('score');
                    }}
                    className="flex items-center justify-between p-4 border border-hairline rounded-xl hover:border-ink/20 cursor-pointer transition-colors bg-paper hover:bg-paper-warm/30"
                  >
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-signal" />
                      <div className="flex flex-col">
                        <span className="font-sans text-sm font-medium text-ink">{resume.role}</span>
                        <span className="font-mono text-[10px] text-mid-grey">Indexed on {resume.updatedAt}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm font-medium text-ink bg-ink/5 px-2.5 py-0.5 rounded">ATS: {resume.score}%</span>
                      <ArrowRight size={14} className="text-mid-grey" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- PARSING SEQUENCE (THEATER MODE) ----------------- */}
      {currentView === 'parsing' && (
        <div className="mx-auto max-w-2xl px-6 py-28 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="relative mb-8">
            <div className="h-12 w-12 border-2 border-hairline border-t-signal rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText size={16} className="text-mid-grey" />
            </div>
          </div>
          
          <span className="font-mono text-[10px] uppercase tracking-widest text-mid-grey mb-3 block">
            Deconstructing Resume Vector · Step {parseStep + 1}/3
          </span>

          <div className="h-12 flex items-center justify-center">
            <p className="font-heading text-lg sm:text-xl text-ink font-medium tracking-tight typewriter-cursor select-none">
              {typedParseMsg}
            </p>
          </div>

          <p className="font-sans text-xs text-mid-grey mt-6 max-w-xs leading-relaxed animate-pulse">
            Simulating model classification loops. Perceived latency replicates deep-parsing response bounds.
          </p>
        </div>
      )}

      {/* ----------------- SCORE VIEW ----------------- */}
      {currentView === 'score' && activeResume && (
        <div className="mx-auto max-w-5xl px-6 py-12 md:py-16">
          <button 
            onClick={() => setCurrentView('upload')}
            className="font-sans text-xs text-mid-grey hover:text-ink flex items-center gap-1.5 mb-8 cursor-pointer"
          >
            <ChevronLeft size={14} /> Back to file upload
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            {/* Left Score Card (Column 5) */}
            <div className="md:col-span-5 flex flex-col border-b md:border-b-0 md:border-r border-hairline pb-10 md:pb-0 md:pr-10">
              <span className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Index Summary Report</span>
              <h2 className="font-heading text-2xl text-ink font-medium tracking-tight mb-4">{activeResume.role}</h2>
              
              <div className="bg-paper-warm/50 border border-hairline p-8 rounded-3xl flex justify-center text-center my-4">
                <ScoreReadout
                  value={activeResume.score}
                  label="General compatibility index: Strong"
                  suffix="%"
                  delay={100}
                />
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <Button 
                  onClick={() => setCurrentView('builder')}
                  variant="dark" 
                  className="py-3 w-full"
                >
                  <PenTool size={14} /> Edit in Resume Builder
                </Button>
                <Button 
                  onClick={() => setActiveTab('match')}
                  variant="light" 
                  className="py-3 w-full"
                >
                  Compare Against Target JD <ArrowRight size={14} />
                </Button>
              </div>
            </div>

            {/* Right Detailed Grid Row (Column 7) */}
            <div className="md:col-span-7 flex flex-col gap-8">
              <div>
                <h3 className="font-heading text-lg text-ink font-medium tracking-tight">Parser Audit Breakdown</h3>
                <p className="font-sans text-xs text-mid-grey">Calculated evaluation bounds scoring your resume compliance.</p>
              </div>

              {/* Plain Rows with Filling Hairline on mount */}
              <div className="flex flex-col gap-6 font-sans">
                
                {/* Metric 1 */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-ink">1. Formatting & Section Structure</span>
                    <span className="text-positive">Perfect compliance · 100/100</span>
                  </div>
                  <div className="w-full h-[1px] bg-hairline relative">
                    <div className="absolute top-0 left-0 h-full bg-positive transition-all duration-1000" style={{ width: '100%' }} />
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="flex items-center justify-between text-xs font-medium border-b border-hairline pb-4">
                  <div>
                    <span className="text-ink block">2. Syntactic Action Verbs</span>
                    <span className="text-mid-grey text-[11px] font-normal">Highly robust utilization of active descriptors (Spearheaded, Engineered).</span>
                  </div>
                  <span className="text-positive font-heading text-base font-medium">92%</span>
                </div>

                {/* Metric 3 */}
                <div className="flex items-center justify-between text-xs font-medium border-b border-hairline pb-4">
                  <div>
                    <span className="text-ink block">3. Quantified Impact Metrics</span>
                    <span className="text-mid-grey text-[11px] font-normal">Identified numeric deltas in 80% of current role descriptors. Great.</span>
                  </div>
                  <span className="text-positive font-heading text-base font-medium">85%</span>
                </div>

                {/* Metric 4 */}
                <div className="flex items-center justify-between text-xs font-medium border-b border-hairline pb-4">
                  <div>
                    <span className="text-ink block">4. Keyword / Skill Coverage</span>
                    <span className="text-mid-grey text-[11px] font-normal">Missing target tags: WCAG Accessibility standards, Browser execution memory diagnostics.</span>
                  </div>
                  <span className="text-negative font-heading text-base font-medium">68%</span>
                </div>

              </div>

              {/* Identified Skills Card */}
              <div className="mt-4">
                <span className="font-heading text-xs font-medium uppercase tracking-wider text-mid-grey block mb-3">Extracted Skill Vector</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeResume.skills.map((skill) => (
                    <span 
                      key={skill}
                      className="text-xs font-sans text-ink bg-paper-warm border border-hairline px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ----------------- BUILDER WORKSPACE VIEW ----------------- */}
      {currentView === 'builder' && activeResume && (
        <div className="mx-auto max-w-7xl px-6 py-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline pb-6 mb-8 gap-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentView('score')}
                className="p-2 border border-hairline rounded-full hover:bg-paper-warm transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-widest text-mid-grey">Active Workspace</span>
                <h2 className="font-heading text-xl text-ink font-medium tracking-tight">Interactive Resume Editor</h2>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setCurrentView('score');
                }}
                variant="light"
              >
                View ATS Analysis
              </Button>
              <Button 
                onClick={async () => {
                  setIsSaving(true);
                  setSaveSuccess(false);
                  const saved = await saveResume(activeResume);
                  updateResume(saved);
                  setIsSaving(false);
                  setSaveSuccess(true);
                  setTimeout(() => setSaveSuccess(false), 3000);
                }}
                variant={saveSuccess ? "signal" : "dark"}
                disabled={isSaving}
              >
                {isSaving ? "Compiling..." : saveSuccess ? "✓ Compiled successfully!" : "Compile Workspace"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Form Editor (Columns 6) */}
            <div className="lg:col-span-6 flex flex-col gap-6 max-h-[calc(100vh-14rem)] overflow-y-auto pr-2">
              
              {/* SECTION: Header */}
              <Card variant="paper" className="p-5 flex flex-col gap-4 rounded-2xl">
                <span className="font-heading text-xs uppercase tracking-wider text-mid-grey select-none">1. Role & Profile Summary</span>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] font-medium text-ink">Target Role Name</label>
                  <input
                    type="text"
                    value={activeResume.role}
                    onChange={(e) => {
                      const updated = { ...activeResume, role: e.target.value };
                      setActiveResume(updated);
                      updateResume(updated);
                    }}
                    className="w-full border border-hairline rounded-xl px-3 py-2 text-sm focus:border-ink focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-sans text-[11px] font-medium text-ink">Executive Brief</label>
                  <textarea
                    rows={3}
                    value={activeResume.summary}
                    onChange={(e) => handleSummaryChange(e.target.value)}
                    className="w-full border border-hairline rounded-xl px-3 py-2 text-sm focus:border-ink focus:outline-none resize-none leading-relaxed"
                  />
                </div>
              </Card>

              {/* SECTION: Experience */}
              <Card variant="paper" className="p-5 flex flex-col gap-6 rounded-2xl">
                <span className="font-heading text-xs uppercase tracking-wider text-mid-grey select-none">2. Professional Chronicles</span>
                
                {activeResume.experience.map((exp, expIdx) => (
                  <div key={expIdx} className="flex flex-col gap-3 pb-6 border-b border-hairline last:border-b-0 last:pb-0">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[10px] font-medium text-ink">Organization</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleExpChange(expIdx, 'company', e.target.value)}
                          className="w-full border border-hairline rounded-xl px-3 py-1.5 text-xs focus:border-ink focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="font-sans text-[10px] font-medium text-ink">Period</label>
                        <input
                          type="text"
                          value={exp.period}
                          onChange={(e) => handleExpChange(expIdx, 'period', e.target.value)}
                          className="w-full border border-hairline rounded-xl px-3 py-1.5 text-xs focus:border-ink focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="font-sans text-[10px] font-medium text-ink">Position Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleExpChange(expIdx, 'role', e.target.value)}
                        className="w-full border border-hairline rounded-xl px-3 py-1.5 text-xs focus:border-ink focus:outline-none"
                      />
                    </div>

                    {/* Bullet Points */}
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center justify-between">
                        <label className="font-sans text-[10px] font-medium text-mid-grey uppercase">Quantified Performance Logs</label>
                        <button 
                          onClick={() => addBullet(expIdx)}
                          className="text-[10px] font-sans font-medium text-ink hover:text-signal flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus size={10} /> Add bullet
                        </button>
                      </div>

                      {exp.bullets.map((bullet, bulletIdx) => (
                        <div key={bulletIdx} className="flex gap-2 items-start">
                          <textarea
                            rows={2}
                            value={bullet}
                            onChange={(e) => handleBulletChange(expIdx, bulletIdx, e.target.value)}
                            className="w-full border border-hairline rounded-xl px-3 py-1.5 text-xs focus:border-ink focus:outline-none resize-none leading-relaxed"
                          />
                          <button
                            onClick={() => removeBullet(expIdx, bulletIdx)}
                            className="p-1 border border-hairline text-negative hover:bg-negative/5 rounded-lg cursor-pointer mt-1"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </Card>

              {/* SECTION: Skills */}
              <Card variant="paper" className="p-5 flex flex-col gap-4 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs uppercase tracking-wider text-mid-grey select-none">3. Technical Skill Matrix</span>
                  <button 
                    onClick={addSkill}
                    className="text-[10px] font-sans font-medium text-ink hover:text-signal flex items-center gap-0.5 cursor-pointer"
                  >
                    <Plus size={10} /> Add skill tag
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activeResume.skills.map((skill, index) => (
                    <div key={index} className="flex gap-1.5 items-center border border-hairline rounded-xl px-2.5 py-1 bg-paper-warm/50">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                        className="w-full bg-transparent text-xs font-sans text-ink focus:outline-none focus:border-b focus:border-ink"
                      />
                      <button 
                        onClick={() => removeSkill(index)}
                        className="text-mid-grey hover:text-negative cursor-pointer"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

            </div>

            {/* Right Column: Physical Resume Template Preview (Columns 6) */}
            <div className="lg:col-span-6 lg:sticky lg:top-24 bg-paper-warm border border-hairline p-6 rounded-3xl select-none">
              <span className="font-mono text-[9px] uppercase tracking-wider text-mid-grey mb-3 block text-center">Rendered Template Preview · Letter Format</span>
              
              {/* Physical Resume Page Wrapper (Minimalist clean look, distinct from app UI) */}
              <div className="bg-paper border border-ink/5 shadow-sm p-8 min-h-[640px] flex flex-col gap-5 text-ink leading-relaxed font-sans max-h-[calc(100vh-14rem)] overflow-y-auto">
                {/* Header */}
                <div className="border-b border-ink/10 pb-4 text-center">
                  <h1 className="font-heading text-2xl font-bold tracking-tight uppercase text-ink">{useAppStore.getState().user.name}</h1>
                  <div className="flex justify-center gap-4 text-[10px] text-mid-grey font-mono mt-1">
                    <span>{useAppStore.getState().user.email}</span>
                    <span>·</span>
                    <span>San Francisco, CA</span>
                  </div>
                </div>

                {/* Subtitle Target */}
                <div className="text-center font-heading text-xs font-medium tracking-widest uppercase text-mid-grey">
                  Target: {activeResume.role}
                </div>

                {/* Executive Brief */}
                <div className="text-[11.5px] font-normal leading-relaxed italic text-ink/90">
                  {activeResume.summary}
                </div>

                {/* Experience Chronicles */}
                <div className="flex flex-col gap-4">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-widest text-ink border-b border-ink/5 pb-1">Chronological Professional Experience</span>
                  
                  {activeResume.experience.map((exp, expIdx) => (
                    <div key={expIdx} className="flex flex-col gap-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[12px] font-bold text-ink">{exp.company}</span>
                        <span className="text-[10px] font-mono text-mid-grey">{exp.period}</span>
                      </div>
                      <div className="text-[11px] font-medium text-mid-grey italic">{exp.role}</div>
                      
                      <ul className="list-disc pl-4 mt-1 flex flex-col gap-1">
                        {exp.bullets.map((bullet, bulletIdx) => (
                          <li key={bulletIdx} className="text-[11px] text-ink/80 leading-relaxed pl-1">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Technical Skills */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-widest text-ink border-b border-ink/5 pb-1">Skill Matrix & Key Tools</span>
                  <div className="text-[11px] leading-relaxed font-normal text-ink/90">
                    <span className="font-bold">Extracted stack competencies:</span> {activeResume.skills.join(', ')}.
                  </div>
                </div>

                {/* Education */}
                <div className="flex flex-col gap-2 mt-2">
                  <span className="font-heading text-[11px] font-bold uppercase tracking-widest text-ink border-b border-ink/5 pb-1">Academic Credentials</span>
                  {activeResume.education.map((edu, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span><span className="font-bold">{edu.institution}</span> — {edu.degree}</span>
                      <span className="font-mono text-mid-grey">{edu.period}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
