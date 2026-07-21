import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { generateContent } from '../services/api';
import useTypewriter from '../hooks/useTypewriter';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { RefreshCw, FileText, Clipboard, Check, Flame } from 'lucide-react';

export default function ContentGenerator() {
  const { resumes, activeResumeId } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'cover-letter' | 'linkedin-about' | 'cold-outreach'>('cover-letter');
  const [role, setRole] = useState('');
  const [tone, setTone] = useState<'Formal' | 'Confident' | 'Warm'>('Confident');
  const [loading, setLoading] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  // Sync role input with current active resume on load
  useEffect(() => {
    if (activeResume) {
      setRole(activeResume.role);
    }
  }, [activeResumeId, activeResume]);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedText('');
    setCopied(false);
    try {
      const text = await generateContent(activeTab, role, tone);
      setGeneratedText(text);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Typewriter streaming reveal for generated output
  const StreamingOutput = ({ text }: { text: string }) => {
    const { displayed, done } = useTypewriter(text, { speed: 8, startDelay: 200 });
    return (
      <textarea
        readOnly={!done}
        value={displayed}
        onChange={(e) => {
          if (done) setGeneratedText(e.target.value);
        }}
        rows={16}
        className={`w-full bg-paper text-ink font-sans text-sm sm:text-[14px] leading-relaxed p-6 border border-hairline focus:outline-none focus:border-ink resize-none rounded-xl ${
          done ? '' : 'typewriter-cursor opacity-90'
        }`}
        style={{ fontFamily: 'Georgia, serif' }} // Pure agency editorial print format
      />
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="content-generator-page" className="w-full bg-paper min-h-[calc(100vh-4rem)] px-6 py-12 md:py-16">
      <div className="mx-auto max-w-5xl">
        
        {/* Page Header */}
        <div className="border-b border-hairline pb-6 mb-8">
          <span className="font-mono text-[10px] uppercase tracking-widest text-signal mb-1">Synthesizer Core</span>
          <h1 className="font-heading text-2xl sm:text-3xl text-ink font-medium tracking-tight">Application Content Generator</h1>
          <p className="font-sans text-[14px] text-mid-grey">
            Synthesize bespoke cover letters, LinkedIn profiles, and cold outreach scripts, tuned precisely to specified professional tones.
          </p>
        </div>

        {/* Custom Comma-Separated Tab Strip */}
        <div className="flex gap-2 text-xs font-sans border-b border-hairline pb-4 mb-8 select-none">
          <span className="text-mid-grey">Output Format:</span>
          {(['cover-letter', 'linkedin-about', 'cold-outreach'] as const).map((tab, idx, arr) => {
            const isActive = activeTab === tab;
            const labels = {
              'cover-letter': 'Print Cover Letter',
              'linkedin-about': 'LinkedIn About summary',
              'cold-outreach': 'Cold Outreach sequence'
            };
            return (
              <span key={tab} className="text-mid-grey">
                <button
                  onClick={() => {
                    setActiveTab(tab);
                    setGeneratedText('');
                    setCopied(false);
                  }}
                  className={`font-medium cursor-pointer transition-colors hover:text-signal ${
                    isActive ? 'border-b border-signal text-ink' : 'text-mid-grey/70'
                  }`}
                >
                  {labels[tab]}
                </button>
                {idx < arr.length - 1 && <span className="ml-1.5 text-mid-grey/40">,</span>}
              </span>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Form Inputs (Columns 5) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <Card variant="paper" className="p-6 rounded-3xl flex flex-col gap-5 border-hairline">
              <span className="font-heading text-xs uppercase tracking-wider text-mid-grey select-none">1. Set Synthesis Parameters</span>
              
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-[11px] font-medium text-ink">Target Position Title</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border border-hairline rounded-xl px-3 py-2 text-sm font-sans focus:border-ink focus:outline-none"
                  placeholder="e.g. Senior Frontend Architect"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans text-[11px] font-medium text-ink">Tone Matrix Vector</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Formal', 'Confident', 'Warm'] as const).map((t) => {
                    const isSelected = tone === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setTone(t)}
                        className={`rounded-full py-1.5 text-[11px] font-sans font-medium transition-all duration-200 cursor-pointer text-center ${
                          isSelected 
                            ? 'bg-ink text-paper border border-ink' 
                            : 'bg-paper text-ink border border-ink/10 hover:bg-paper-warm'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                variant="dark"
                disabled={loading || !role.trim()}
                className="py-3 mt-2 w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Synthesizing paragraphs...
                  </>
                ) : (
                  <>
                    <Flame size={14} className="text-signal" />
                    Compile Draft
                  </>
                )}
              </Button>
            </Card>
          </div>

          {/* Right Column: Interactive Document Canvas (Columns 7) */}
          <div className="lg:col-span-7">
            {!generatedText && !loading && (
              <div className="border border-dashed border-hairline bg-paper-warm/40 p-12 text-center rounded-3xl flex flex-col items-center justify-center min-h-[400px]">
                <FileText size={32} className="text-mid-grey/40 stroke-[1.25] mb-4" />
                <h3 className="font-heading text-base text-ink font-medium tracking-tight mb-1">Awaiting Paragraph Synthesis</h3>
                <p className="font-sans text-xs text-mid-grey max-w-xs leading-relaxed">
                  Adjust inputs on the left, then click compile. The compiled document will print live onto this canvas in high-end editorial formatting.
                </p>
              </div>
            )}

            {loading && (
              <div className="border border-hairline bg-paper-warm/25 p-12 text-center rounded-3xl flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative mb-6">
                  <div className="h-10 w-10 border-2 border-hairline border-t-signal rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RefreshCw size={14} className="text-mid-grey animate-pulse" />
                  </div>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-mid-grey">Compiling language embeddings</span>
                <p className="font-heading text-base text-ink font-medium mt-3 animate-pulse">
                  Drafting content vectors...
                </p>
              </div>
            )}

            {generatedText && !loading && (
              <div className="flex flex-col gap-4 animate-fade-in">
                
                {/* Header controls for Document page */}
                <div className="flex items-center justify-between font-sans text-xs select-none">
                  <span className="text-mid-grey font-medium">Editable Editorial Output Draft · Georgia Serif</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 font-medium text-ink hover:text-signal cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-positive" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Clipboard size={14} />
                        <span>Copy to Clipboard</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Printable styled canvas */}
                <div className="w-full relative shadow-sm">
                  <StreamingOutput text={generatedText} />
                </div>

                <p className="font-sans text-xs text-mid-grey leading-relaxed text-center select-none">
                  Draft compiled locally. Use of generated materials requires review to ensure accuracy.
                </p>

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
