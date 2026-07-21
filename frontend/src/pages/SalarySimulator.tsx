import { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { simulateNegotiation } from '../services/api';
import useTypewriter from '../hooks/useTypewriter';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { DollarSign, MessageSquare, Send, ShieldCheck, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';

export default function SalarySimulator() {
  // Simulator input state
  const [baseOffer, setBaseOffer] = useState(150000);
  const [targetOffer, setTargetOffer] = useState(175000);
  
  // Negotiation active chat state
  const [userMsg, setUserMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentOffer, setCurrentOffer] = useState(150000);
  const [recruiterSentiment, setRecruiterSentiment] = useState<'reluctant' | 'neutral' | 'favorable'>('neutral');

  // Conversational back-and-forth log
  const [chatLog, setChatLog] = useState<{ sender: 'recruiter' | 'user'; text: string }[]>([
    {
      sender: 'recruiter',
      text: "We are thrilled to offer you the Senior UI Engineer position. Our initial budget is structured at $150,000 on annual base. Let us know if you're ready to review sign-on parameters."
    }
  ]);

  // Visual bounds calculations
  const minBound = 120000;
  const maxBound = 200000;
  
  const getPercent = (value: number) => {
    const clamped = Math.min(maxBound, Math.max(minBound, value));
    return ((clamped - minBound) / (maxBound - minBound)) * 100;
  };

  const handleSendMessage = async (customMessage?: string) => {
    const msg = customMessage || userMsg;
    if (!msg.trim() || loading) return;

    setUserMsg('');
    setChatLog(prev => [...prev, { sender: 'user', text: msg }]);
    setLoading(true);

    try {
      const response = await simulateNegotiation(msg, currentOffer);
      
      setChatLog(prev => [...prev, { sender: 'recruiter', text: response.responseText }]);
      setCurrentOffer(response.counterOffer);
      setRecruiterSentiment(response.sentiment);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Canned Scenario Helpers
  const scenarios = [
    { label: "Request annual base correction", text: "Based on my 6+ years of expertise and deep systems background, I'd like to discuss bringing the base closer to the $175,000 market average." },
    { label: "Propose Signing Bonus discussion", text: "To offset my immediate vestings, would we be able to explore a $10,000 sign-on incentive?" },
    { label: "Explore Equity incentives", text: "I'm highly committed to NeuralCraft's long-term scale. Can we augment base with options incentives?" }
  ];

  // Custom typewriter reveal for recruiter messages
  const RecruiterBubble = ({ text }: { text: string }) => {
    const { displayed, done } = useTypewriter(text, { speed: 18, startDelay: 200 });
    return (
      <p className={`font-sans text-[13px] sm:text-[14px] leading-relaxed text-paper ${done ? '' : 'typewriter-cursor'}`}>
        {displayed}
      </p>
    );
  };

  return (
    <div id="salary-simulator-page" className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)] w-full">
      
      {/* LEFT PANEL: Range visualizer (Columns 5) - Plain paper white */}
      <div className="lg:col-span-5 bg-paper p-8 md:p-12 border-b lg:border-b-0 lg:border-r border-hairline flex flex-col justify-between">
        <div className="flex flex-col gap-8">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-signal block mb-1">Compensation Analyst</span>
            <h1 className="font-heading text-2xl text-ink font-medium tracking-tight">Base Offer Calibration</h1>
            <p className="font-sans text-[13px] text-mid-grey">
              Review current offer vectors against verified market ranges (SF Bay Area software standards).
            </p>
          </div>

          {/* Form Tuning */}
          <div className="flex flex-col gap-4 font-sans text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-ink">Active Baseline Offer</label>
              <div className="relative flex items-center">
                <DollarSign size={14} className="absolute left-3 text-mid-grey" />
                <input
                  type="number"
                  disabled
                  value={currentOffer}
                  className="w-full border border-hairline bg-paper-warm/50 rounded-xl py-2.5 pl-8 pr-4 text-sm font-sans font-semibold text-ink"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="font-medium text-ink">Your Targeted Threshold</label>
              <div className="relative flex items-center">
                <DollarSign size={14} className="absolute left-3 text-mid-grey" />
                <input
                  type="number"
                  value={targetOffer}
                  onChange={(e) => setTargetOffer(Number(e.target.value))}
                  className="w-full border border-hairline rounded-xl py-2.5 pl-8 pr-4 text-sm font-sans focus:border-ink focus:outline-none text-ink"
                />
              </div>
            </div>
          </div>

          {/* RANGE VISUALIZATION: Plain horizontal hairline with labels and amber tick */}
          <div className="py-8 border-t border-hairline">
            <span className="font-heading text-xs font-medium uppercase tracking-wider text-mid-grey block mb-8 select-none">Compensation Band Mapping</span>
            
            <div className="relative w-full pt-4 pb-2 select-none">
              {/* Thin Hairline Axis */}
              <div className="w-full h-[1px] bg-ink/20 relative">
                {/* Min Label Tick */}
                <div className="absolute left-0 -top-1 h-2 w-[1px] bg-ink" />
                
                {/* Median Label Tick */}
                <div className="absolute left-[50%] -top-1 h-2 w-[1px] bg-ink" />
                
                {/* Max Label Tick */}
                <div className="absolute left-[100%] -top-1 h-2 w-[1px] bg-ink" />

                {/* Target Offer Indicator Tick (Amber Tick) */}
                <div 
                  className="absolute -top-3.5 flex flex-col items-center transition-all duration-300"
                  style={{ left: `${getPercent(targetOffer)}%` }}
                >
                  <div className="h-4 w-[2px] bg-signal" />
                  <span className="font-mono text-[9px] text-signal font-bold mt-1 uppercase tracking-wider">Target</span>
                </div>

                {/* Recruiter Current Counter Tick (Ink Tick) */}
                <div 
                  className="absolute -top-3.5 flex flex-col items-center transition-all duration-300"
                  style={{ left: `${getPercent(currentOffer)}%` }}
                >
                  <div className="h-4 w-[2px] bg-ink" />
                  <span className="font-mono text-[9px] text-ink font-bold mt-1 uppercase tracking-wider">Offer</span>
                </div>
              </div>

              {/* Typographic Axis Labels (min/median/max) */}
              <div className="flex justify-between font-sans text-[11px] text-mid-grey mt-6">
                <div className="flex flex-col">
                  <span className="font-medium text-ink">$120,000</span>
                  <span>Minimum baseline</span>
                </div>
                <div className="flex flex-col text-center">
                  <span className="font-medium text-ink">$160,000</span>
                  <span>Median band</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-medium text-ink">$200,000+</span>
                  <span>Target cap</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informative advice */}
        <div className="border-t border-hairline pt-6 flex gap-2 font-sans text-xs text-mid-grey select-none">
          <HelpCircle size={15} className="text-signal shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Market bands evaluate structural software engineers. Current recruiter sentiment is classified dynamically based on active conversation loops.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL: Recruiter negotiation roleplay (Columns 7) - White on black dark room */}
      <div className="lg:col-span-7 bg-ink p-8 md:p-12 text-paper flex flex-col justify-between min-h-[460px]">
        
        {/* Dialogue Header */}
        <div className="flex items-center justify-between border-b border-hairline-dark pb-4 opacity-85 select-none">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-signal animate-pulse" />
            <span className="font-mono text-xs tracking-wider uppercase">Negotiation Simulator Terminal</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-mid-grey font-sans">
            <ShieldCheck size={14} className="text-positive" />
            <span>Recruiter State: <span className="font-semibold capitalize text-paper">{recruiterSentiment}</span></span>
          </div>
        </div>

        {/* Conversational Stream Viewport */}
        <div className="flex-1 my-8 overflow-y-auto pr-2 flex flex-col gap-6 max-h-[300px]">
          {chatLog.map((chat, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col max-w-lg ${chat.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}
            >
              <span className="font-mono text-[9px] text-mid-grey uppercase tracking-widest mb-1.5 select-none">
                {chat.sender === 'recruiter' ? 'RECRUITER COHORT' : 'GOPAL RAO (YOU)'}
              </span>
              <div 
                className={`p-4 rounded-2xl ${
                  chat.sender === 'user' 
                    ? 'bg-paper text-ink font-sans' 
                    : 'bg-white/5 border border-hairline-dark'
                }`}
              >
                {chat.sender === 'recruiter' && idx === chatLog.length - 1 ? (
                  <RecruiterBubble text={chat.text} />
                ) : (
                  <p className="font-sans text-[13px] sm:text-[14px] leading-relaxed">{chat.text}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="self-start flex flex-col items-start max-w-sm">
              <span className="font-mono text-[9px] text-mid-grey uppercase tracking-widest mb-1.5 select-none font-bold">RECRUITER</span>
              <div className="p-3 bg-white/5 border border-hairline-dark rounded-2xl flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-signal animate-bounce" />
                <div className="h-1.5 w-1.5 rounded-full bg-signal animate-bounce delay-75" />
                <div className="h-1.5 w-1.5 rounded-full bg-signal animate-bounce delay-150" />
                <span className="text-xs font-mono text-mid-grey ml-1">Calibrating bands...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Panel with scenario templates */}
        <div className="flex flex-col gap-4 font-sans">
          
          {/* Canned triggers row */}
          {chatLog.length < 5 && (
            <div className="flex flex-col gap-2">
              <span className="font-heading text-[10px] uppercase tracking-wider text-mid-grey select-none">Select Scenario Proposal</span>
              <div className="flex flex-wrap gap-2">
                {scenarios.map((sc, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(sc.text)}
                    disabled={loading}
                    className="text-[11px] font-medium border border-white/10 hover:border-signal/50 bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-colors text-left cursor-pointer"
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Textarea input */}
          <div className="relative flex items-center mt-1">
            <textarea
              rows={2}
              disabled={loading}
              placeholder="Write a custom negotiation response..."
              value={userMsg}
              onChange={(e) => setUserMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="w-full bg-white/5 border border-hairline-dark rounded-3xl py-3.5 pl-4 pr-16 text-sm text-paper placeholder:text-mid-grey/40 focus:outline-none focus:border-signal resize-none leading-relaxed"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={loading || !userMsg.trim()}
              className="absolute right-3 h-9 w-9 rounded-full bg-signal text-ink flex items-center justify-center hover:bg-paper hover:text-ink transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Send size={13} />
            </button>
          </div>

          <div className="flex justify-between text-[11px] text-mid-grey">
            <span>All entries evaluated in real-time context.</span>
            <button 
              onClick={() => {
                setCurrentOffer(150000);
                setRecruiterSentiment('neutral');
                setChatLog([
                  {
                    sender: 'recruiter',
                    text: "Negotiation loop reset. Our baseline target is $150,000 on annual base. Let's start the dialogue fresh."
                  }
                ]);
              }}
              className="text-negative hover:underline cursor-pointer"
            >
              Reset Dialogue Loop
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
