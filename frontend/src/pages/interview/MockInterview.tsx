import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getInterviewQA, sendInterviewAnswer } from '../../services/api';
import { useTypewriter } from '../../hooks/useTypewriter';
import ScoreReadout from '../../components/ui/ScoreReadout';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Mic, MicOff, Play, Send, ChevronRight, BarChart2, Shield, Flame, RotateCcw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { InterviewExchange } from '../../types';

export default function MockInterview() {
  const { resumes, activeResumeId } = useAppStore();
  
  // Session states
  const [sessionActive, setSessionActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<InterviewExchange[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [confidence, setConfidence] = useState(80);
  
  // Chat dialogue log
  const [chatLog, setChatLog] = useState<{ sender: 'ai' | 'user'; text: string; done?: boolean }[]>([]);
  const [answersFeedback, setAnswersFeedback] = useState<{
    qa: InterviewExchange;
    userAns: string;
    score: number;
    strengths: string[];
    gaps: string[];
    betterWording: string;
  }[]>([]);

  // Speech Recognition references
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Timer states
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<any>(null);

  const activeResume = resumes.find(r => r.id === activeResumeId) || resumes[0];

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setUserAnswer(prev => prev + ' ' + finalTranscript);
        }
      };

      rec.onerror = (e: any) => {
        console.error("Speech Recognition Error", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (sessionActive) {
      setElapsed(0);
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [sessionActive]);

  // Start the session
  const handleStartSession = async () => {
    setLoading(true);
    setAnswersFeedback([]);
    setChatLog([]);
    setCurrentIdx(0);
    setConfidence(80);
    
    try {
      const qList = await getInterviewQA(activeResume.role);
      setQuestions(qList);
      setSessionActive(true);
      
      // Inject first question
      if (qList.length > 0) {
        setChatLog([{ sender: 'ai', text: qList[0].question, done: false }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Toggle microphone
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Submit Answer & trigger AI analysis
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim() || loading) return;
    
    const ansText = userAnswer;
    setUserAnswer('');
    
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Add user's answer to log
    setChatLog(prev => [...prev, { sender: 'user', text: ansText }]);
    setLoading(true);

    try {
      const currentQ = questions[currentIdx];
      const feedback = await sendInterviewAnswer(currentQ.id, ansText);

      // Record feedback
      setAnswersFeedback(prev => [...prev, {
        qa: currentQ,
        userAns: ansText,
        score: feedback.score,
        strengths: feedback.strengths,
        gaps: feedback.gaps,
        betterWording: feedback.betterWording
      }]);

      // Modulate Confidence
      setConfidence(prev => {
        const delta = feedback.score - 80;
        return Math.min(99, Math.max(50, prev + Math.floor(delta / 3)));
      });

      // Move forward
      if (currentIdx < questions.length - 1) {
        const nextQ = questions[currentIdx + 1];
        setTimeout(() => {
          setChatLog(prev => [...prev, { sender: 'ai', text: nextQ.question, done: false }]);
          setCurrentIdx(prev => prev + 1);
          setLoading(false);
        }, 1000);
      } else {
        // Complete the session
        setTimeout(() => {
          setSessionActive(false);
          setLoading(false);
        }, 1200);
      }

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Format Elapsed Time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Typewriter reveal component for interview questions
  const ActiveQuestionText = ({ text }: { text: string }) => {
    const { displayed, done } = useTypewriter(text, { speed: 20, startDelay: 300 });
    return (
      <p className={`font-heading text-[16px] sm:text-lg leading-relaxed font-medium text-paper ${done ? '' : 'typewriter-cursor'}`}>
        {displayed}
      </p>
    );
  };

  // Collapsible cards for report view
  const [expandedFeedbackIdx, setExpandedFeedbackIdx] = useState<number | null>(0);

  const toggleFeedbackExpand = (idx: number) => {
    setExpandedFeedbackIdx(expandedFeedbackIdx === idx ? null : idx);
  };

  // Compute final score
  const finalScore = answersFeedback.length > 0 
    ? Math.round(answersFeedback.reduce((sum, item) => sum + item.score, 0) / answersFeedback.length)
    : 82;

  return (
    <div className={`w-full min-h-[calc(100vh-4rem)] transition-colors duration-300 ${sessionActive ? 'bg-ink text-paper' : 'bg-paper text-ink'}`}>
      
      {/* ----------------- INTRO VIEW ----------------- */}
      {!sessionActive && answersFeedback.length === 0 && (
        <div className="mx-auto max-w-4xl px-6 py-16 text-center flex flex-col items-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-signal mb-2">Simulated Board Interview</span>
          <h1 className="font-heading text-3xl sm:text-4xl font-medium tracking-tight mb-2">
            AI-Powered Mock Interview Coach
          </h1>
          <p className="font-sans text-[14px] text-mid-grey max-w-md leading-relaxed mb-10">
            Step into the dark board room to practice custom conversational scenarios. Answer mock questions using your keyboard or live mic stream for direct evaluations.
          </p>

          <Card variant="warm" className="p-6 text-left rounded-3xl max-w-2xl w-full mb-8 border-hairline">
            <span className="font-heading text-xs font-semibold text-ink block mb-2 select-none uppercase tracking-wider">Session Specifications</span>
            <div className="flex flex-col gap-3 font-sans text-xs text-mid-grey">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-signal" />
                <span>Target Stack Scope: <span className="font-semibold text-ink">{activeResume.role}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-signal" />
                <span>Speech Processing: Web Speech Synthesis & Recognition enabled.</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-signal" />
                <span>Format: 3 progressive behavioral & architectural evaluations.</span>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleStartSession}
            variant="dark"
            disabled={loading}
            className="px-10 py-3.5"
          >
            <Play size={14} className="text-signal fill-signal" /> Lock In & Begin Session
          </Button>
        </div>
      )}

      {/* ----------------- ACTIVE SESSION VIEW (WHITE ON BLACK ROOM) ----------------- */}
      {sessionActive && (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)] w-full">
          
          {/* Main Chat Stream Column (Columns 9) */}
          <div className="lg:col-span-9 flex flex-col justify-between px-6 py-8 md:p-12 border-b lg:border-b-0 lg:border-r border-hairline-dark">
            
            {/* Dialogue Header */}
            <div className="flex items-center justify-between border-b border-hairline-dark pb-4 opacity-80 select-none">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-signal animate-pulse" />
                <span className="font-mono text-xs tracking-wider uppercase text-paper">Active Interview Channel</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-sans text-mid-grey">
                <Shield size={12} className="text-signal" />
                <span>Client Audio Stream Encrypted</span>
              </div>
            </div>

            {/* Conversational Stream Frame */}
            <div className="flex-1 my-8 overflow-y-auto pr-2 flex flex-col gap-8 max-h-[360px]">
              {chatLog.map((chat, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col max-w-xl ${chat.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
                >
                  <span className="font-mono text-[9px] text-mid-grey uppercase tracking-widest mb-1.5 select-none">
                    {chat.sender === 'ai' ? 'COACH' : 'GOPAL RAO (YOU)'}
                  </span>
                  <div 
                    className={`p-5 rounded-2xl ${
                      chat.sender === 'user' 
                        ? 'bg-paper text-ink font-sans' 
                        : 'bg-white/5 border border-hairline-dark'
                    }`}
                  >
                    {chat.sender === 'ai' && idx === chatLog.length - 1 ? (
                      <ActiveQuestionText text={chat.text} />
                    ) : (
                      <p className="font-sans text-[14px] leading-relaxed">{chat.text}</p>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="self-start flex flex-col items-start max-w-sm">
                  <span className="font-mono text-[9px] text-mid-grey uppercase tracking-widest mb-1.5 select-none">COACH</span>
                  <div className="p-4 bg-white/5 border border-hairline-dark rounded-2xl flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-signal animate-bounce" />
                    <div className="h-1.5 w-1.5 rounded-full bg-signal animate-bounce delay-75" />
                    <div className="h-1.5 w-1.5 rounded-full bg-signal animate-bounce delay-150" />
                    <span className="text-xs font-mono text-mid-grey ml-1">Analyzing answer metrics...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Controls Panel */}
            <div className="flex flex-col gap-4">
              <div className="relative flex items-center">
                <textarea
                  rows={2}
                  disabled={loading}
                  placeholder={isListening ? "Listening to your voice audio stream..." : "Type your technical response here..."}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitAnswer();
                    }
                  }}
                  className="w-full bg-white/5 border border-hairline-dark rounded-3xl py-3.5 pl-4 pr-32 text-sm text-paper placeholder:text-mid-grey/40 focus:outline-none focus:border-signal resize-none leading-relaxed"
                />

                {/* Right Aligned CTA Controls inside text-area */}
                <div className="absolute right-3 flex items-center gap-1.5">
                  {speechSupported && (
                    <button
                      onClick={toggleListening}
                      disabled={loading}
                      title={isListening ? "Mute Microphone" : "Speak Answer"}
                      className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                        isListening 
                          ? 'bg-negative text-paper animate-pulse' 
                          : 'bg-white/10 text-mid-grey hover:text-paper hover:bg-white/20'
                      }`}
                    >
                      {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                    </button>
                  )}
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={loading || !userAnswer.trim()}
                    className="h-9 w-16 rounded-full bg-signal text-ink flex items-center justify-center font-semibold text-xs hover:bg-paper hover:text-ink transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] font-sans text-mid-grey">
                <span>Press Enter to dispatch. Shift+Enter for new line.</span>
                <button 
                  onClick={() => setSessionActive(false)}
                  className="text-negative hover:underline font-medium cursor-pointer"
                >
                  Force Terminate Session
                </button>
              </div>
            </div>

          </div>

          {/* Right Sidebar: Operational Instruments (Columns 3) */}
          <div className="lg:col-span-3 bg-[#0e0e0e] p-8 flex flex-col justify-between">
            <div className="flex flex-col gap-8">
              <div>
                <span className="font-mono text-[9px] text-signal uppercase tracking-widest block mb-1">Session Analytics</span>
                <span className="font-heading text-sm text-paper font-medium tracking-tight">Active Instruments</span>
              </div>

              {/* Typographic Large Readouts */}
              <div className="flex flex-col gap-6">
                
                {/* Meter 1: Elapsed Time */}
                <div className="flex flex-col">
                  <span className="font-heading text-[32px] font-medium leading-none text-paper">{formatTime(elapsed)}</span>
                  <span className="font-sans text-[11px] text-mid-grey mt-1">Elapsed session clock</span>
                </div>

                {/* Meter 2: Question progress */}
                <div className="flex flex-col border-t border-hairline-dark pt-4">
                  <span className="font-heading text-[32px] font-medium leading-none text-paper">0{currentIdx + 1} <span className="text-sm text-mid-grey font-heading font-medium">/0{questions.length}</span></span>
                  <span className="font-sans text-[11px] text-mid-grey mt-1">Evaluated question index</span>
                </div>

                {/* Meter 3: Running Confidence */}
                <div className="flex flex-col border-t border-hairline-dark pt-4">
                  <span className="font-heading text-[32px] font-medium leading-none text-signal">{confidence}%</span>
                  <span className="font-sans text-[11px] text-mid-grey mt-1">Simulated confidence telemetry</span>
                </div>

              </div>
            </div>

            <div className="border-t border-hairline-dark pt-6 select-none opacity-60 flex items-center gap-2">
              <AlertCircle size={14} className="text-signal" />
              <span className="font-sans text-[10px] text-mid-grey">
                Microphone stream processed locally. Speech-to-text operates via browser bindings.
              </span>
            </div>

          </div>

        </div>
      )}

      {/* ----------------- PERFORMANCE REPORT VIEW (WHITE PAPER) ----------------- */}
      {!sessionActive && answersFeedback.length > 0 && (
        <div className="mx-auto max-w-4xl px-6 py-12 md:py-16 animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-hairline pb-6 mb-8 gap-4">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-widest text-signal">Evaluation Terminal Complete</span>
              <h1 className="font-heading text-2xl sm:text-3xl text-ink font-medium tracking-tight">Interview Performance Audit</h1>
            </div>
            <Button 
              onClick={handleStartSession}
              variant="dark"
            >
              <RotateCcw size={14} /> Initialize New Session
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Overall Index Score (Columns 4) */}
            <div className="md:col-span-4 flex flex-col border-b md:border-b-0 md:border-r border-hairline pb-8 md:pb-0 md:pr-8">
              <div className="bg-paper-warm border border-hairline p-6 rounded-3xl flex justify-center text-center">
                <ScoreReadout
                  value={finalScore}
                  label="General readiness index: Solid"
                  suffix="%"
                  delay={100}
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 font-sans text-xs text-mid-grey">
                <span className="font-heading text-[11px] uppercase tracking-wider text-ink font-bold select-none">COACH METRIC BRIEF</span>
                <p className="leading-relaxed">
                  Your response structures demonstrated outstanding depth in technical vocabularies and performance-oriented design thinking. 
                </p>
                <p className="leading-relaxed">
                  To achieve tier-1 perfect compatibility, focus on introducing further hard metrics and detailing downstream side-effects of architectural changes.
                </p>
              </div>
            </div>

            {/* Right Column: Collapsible Q&A breakdown (Columns 8) */}
            <div className="md:col-span-8 flex flex-col gap-5">
              <div>
                <span className="font-heading text-[13px] text-ink font-medium block">Deconstructed Dialogue Transcript</span>
                <span className="font-sans text-[11px] text-mid-grey">Review questions, answers, and optimization feedback below.</span>
              </div>

              <div className="flex flex-col gap-3">
                {answersFeedback.map((item, idx) => {
                  const isExpanded = expandedFeedbackIdx === idx;
                  return (
                    <div 
                      key={idx}
                      className="border border-hairline rounded-xl overflow-hidden font-sans bg-paper"
                    >
                      {/* Header */}
                      <div 
                        onClick={() => toggleFeedbackExpand(idx)}
                        className="flex items-center justify-between p-4 bg-paper-warm/50 cursor-pointer select-none border-b border-hairline"
                      >
                        <div className="flex flex-col gap-1 pr-4">
                          <span className="font-mono text-[9px] text-mid-grey uppercase tracking-widest">QUESTION 0{idx+1} · EVALUATED</span>
                          <span className="text-xs sm:text-sm font-semibold text-ink line-clamp-1">{item.qa.question}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            item.score >= 85 ? 'text-positive bg-positive/5' : 'text-signal bg-signal/5'
                          }`}>Score: {item.score}%</span>
                          {isExpanded ? <ChevronUp size={16} className="text-mid-grey" /> : <ChevronDown size={16} className="text-mid-grey" />}
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="p-5 flex flex-col gap-4 text-xs sm:text-[13px]">
                          
                          {/* Section 1: Question */}
                          <div className="flex flex-col gap-1 bg-paper-warm p-4 rounded-xl border border-hairline">
                            <span className="font-mono text-[9px] text-mid-grey uppercase tracking-widest font-semibold">Question</span>
                            <span className="font-heading font-medium text-ink leading-relaxed text-[13px]">{item.qa.question}</span>
                          </div>

                          {/* Section 2: Your Answer */}
                          <div className="flex flex-col gap-1 pl-3 border-l-2 border-hairline-dark">
                            <span className="font-mono text-[9px] text-mid-grey uppercase tracking-widest font-semibold">Your Response</span>
                            <span className="text-ink leading-relaxed italic">"{item.userAns}"</span>
                          </div>

                          {/* Section 3: Strengths */}
                          <div className="flex flex-col gap-1 mt-1">
                            <span className="font-mono text-[9px] text-positive uppercase tracking-widest font-semibold">Identified Strengths</span>
                            <ul className="list-disc pl-4 flex flex-col gap-0.5 text-mid-grey">
                              {item.strengths.map((str, sIdx) => <li key={sIdx}>{str}</li>)}
                            </ul>
                          </div>

                          {/* Section 4: Gaps */}
                          <div className="flex flex-col gap-1">
                            <span className="font-mono text-[9px] text-negative uppercase tracking-widest font-semibold">Identified Gaps</span>
                            <ul className="list-disc pl-4 flex flex-col gap-0.5 text-mid-grey">
                              {item.gaps.map((gap, gIdx) => <li key={gIdx}>{gap}</li>)}
                            </ul>
                          </div>

                          {/* Section 5: Better Wording */}
                          <div className="flex flex-col gap-1.5 bg-signal/5 border border-signal/15 p-4 rounded-xl mt-1">
                            <span className="font-mono text-[9px] text-signal uppercase tracking-widest font-bold">Suggested Refinement</span>
                            <p className="text-ink leading-relaxed font-medium">{item.betterWording}</p>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
