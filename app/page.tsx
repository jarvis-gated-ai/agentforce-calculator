'use client';

import { useState, useRef, useEffect } from 'react';

interface CalculatorInputs {
  monthlyConversations: number;
  avgHandleTime: number;
  agentHourlyCost: number;
  currentAgentCount: number;
  agentforceSeats: number;
  agentforceCostPerSeat: number;
}

interface CalculatorResults {
  currentLaborCost: number;
  agentforceCost: number;
  automationSavings: number;
  roi: number;
  paybackMonths: number;
  hiddenCosts: number;
  realAgentforceCost: number;
  realROI: number;
}

function calculate(inputs: CalculatorInputs): CalculatorResults {
  const hoursPerConversation = inputs.avgHandleTime / 60;
  const totalAgentHours = inputs.monthlyConversations * hoursPerConversation;
  const currentLaborCost = totalAgentHours * inputs.agentHourlyCost;

  const agentforceCost = inputs.agentforceSeats * inputs.agentforceCostPerSeat;

  // Salesforce typically bundles 1,000 conversations per seat/month
  const conversationsHandled = inputs.agentforceSeats * 1000;
  const remainingConversations = Math.max(0, inputs.monthlyConversations - conversationsHandled);
  const remainingLaborCost = (remainingConversations * hoursPerConversation) * inputs.agentHourlyCost;

  const automationSavings = currentLaborCost - remainingLaborCost - agentforceCost;

  // Hidden costs: implementation (~40k one-time), org config, ongoing admin
  const hiddenCosts = (agentforceCost * 0.3) + (40000 / 12);
  const realAgentforceCost = agentforceCost + hiddenCosts;
  const realSavings = currentLaborCost - remainingLaborCost - realAgentforceCost;

  const roi = agentforceCost > 0 ? (automationSavings / agentforceCost) * 100 : 0;
  const realROI = realAgentforceCost > 0 ? (realSavings / realAgentforceCost) * 100 : 0;
  const paybackMonths = automationSavings > 0 ? (40000 / automationSavings) : 999;

  return {
    currentLaborCost,
    agentforceCost,
    automationSavings,
    roi,
    paybackMonths,
    hiddenCosts,
    realAgentforceCost,
    realROI,
  };
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// Tooltip component
function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false);
      }
    }
    if (visible) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [visible]);

  return (
    <div className="relative inline-flex items-center" ref={ref}>
      <button
        type="button"
        className="ml-1.5 w-4 h-4 rounded-full bg-slate-600 hover:bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center transition-colors cursor-pointer"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        aria-label="More info"
      >
        i
      </button>
      {visible && (
        <div className="absolute z-50 left-6 top-1/2 -translate-y-1/2 w-60 bg-slate-800 border border-slate-600 text-slate-200 text-xs rounded-lg px-3 py-2 shadow-xl leading-relaxed pointer-events-none">
          {text}
        </div>
      )}
    </div>
  );
}

// Labeled input with optional tooltip
function InputField({
  label,
  tooltip,
  value,
  onChange,
}: {
  label: string;
  tooltip: string;
  value: number;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400 mb-1 flex items-center">
        {label}
        <Tooltip text={tooltip} />
      </span>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
      />
    </label>
  );
}

const TOOLTIPS = {
  monthlyConversations:
    'Total inbound service interactions per month across all channels — phone, chat, email, web. Use your current ticketing or contact center volume.',
  avgHandleTime:
    'Average handle time (AHT) in minutes per conversation, including talk time and after-call work. Industry average is 6–10 minutes.',
  agentHourlyCost:
    'Fully-loaded cost per agent hour: base salary + benefits + overhead + tooling. Typically $18–$35/hr for US-based support.',
  currentAgentCount:
    'Your current headcount of full-time customer service / support agents, excluding supervisors and QA.',
  agentforceSeats:
    'Number of Agentforce Digital Labour seats in the Salesforce quote. Each seat typically handles ~1,000 automated conversations/month.',
  agentforceCostPerSeat:
    'Monthly license cost per Agentforce seat as quoted by Salesforce. Standard list price is $150/seat/month, but varies by tier and negotiation.',
};

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthlyConversations: 5000,
    avgHandleTime: 8,
    agentHourlyCost: 22,
    currentAgentCount: 15,
    agentforceSeats: 10,
    agentforceCostPerSeat: 150,
  });

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [gated, setGated] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const results = calculate(inputs);

  const updateInput = (key: keyof CalculatorInputs, value: string) => {
    setInputs(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, company, inputs, results }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSubmitted(true);
      setGated(false);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Hero */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center gap-4">
          <a href="https://gatedenterprise.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 no-underline">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-lg">G</div>
            <div>
              <div className="font-semibold text-lg tracking-tight text-white">Gated Enterprise</div>
              <div className="text-xs text-blue-300">gatedenterprise.com</div>
            </div>
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-block bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1 text-sm text-blue-300 mb-4">
            Free ROI Tool
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Agentforce Cost Shock <span className="text-blue-400">Calculator</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Salesforce's pitch sounds great. But what does Agentforce <em>actually</em> cost — after implementation, hidden fees, and org configuration? Find out in 60 seconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="font-semibold text-lg text-white">Your Current Operations</h2>

            <div className="space-y-4">
              <InputField
                label="Monthly Service Conversations"
                tooltip={TOOLTIPS.monthlyConversations}
                value={inputs.monthlyConversations}
                onChange={v => updateInput('monthlyConversations', v)}
              />
              <InputField
                label="Avg Handle Time (minutes)"
                tooltip={TOOLTIPS.avgHandleTime}
                value={inputs.avgHandleTime}
                onChange={v => updateInput('avgHandleTime', v)}
              />
              <InputField
                label="Agent Fully-Loaded Hourly Cost ($)"
                tooltip={TOOLTIPS.agentHourlyCost}
                value={inputs.agentHourlyCost}
                onChange={v => updateInput('agentHourlyCost', v)}
              />
              <InputField
                label="Current # of Agents"
                tooltip={TOOLTIPS.currentAgentCount}
                value={inputs.currentAgentCount}
                onChange={v => updateInput('currentAgentCount', v)}
              />
            </div>

            <h2 className="font-semibold text-lg text-white pt-2 border-t border-white/10">Agentforce Configuration</h2>

            <div className="space-y-4">
              <InputField
                label="Agentforce Seats Quoted"
                tooltip={TOOLTIPS.agentforceSeats}
                value={inputs.agentforceSeats}
                onChange={v => updateInput('agentforceSeats', v)}
              />
              <InputField
                label="Cost per Seat / Month ($)"
                tooltip={TOOLTIPS.agentforceCostPerSeat}
                value={inputs.agentforceCostPerSeat}
                onChange={v => updateInput('agentforceCostPerSeat', v)}
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Preview cards - always visible */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-semibold text-lg mb-4">Monthly Snapshot</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-slate-400">Current Labor Cost</span>
                  <span className="font-mono font-semibold text-white">{fmt(results.currentLaborCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-slate-400">Agentforce License Cost</span>
                  <span className="font-mono font-semibold text-yellow-400">{fmt(results.agentforceCost)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-slate-400">Stated Monthly Savings</span>
                  <span className={`font-mono font-semibold ${results.automationSavings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {fmt(results.automationSavings)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400">Stated ROI</span>
                  <span className={`font-mono font-semibold ${results.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {results.roi.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Gated section */}
            {gated ? (
              <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border border-blue-500/30 rounded-2xl p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl mb-2">🔒</div>
                  <h3 className="font-bold text-lg mb-2">Get the Full Cost Shock Report</h3>
                  <p className="text-slate-400 text-sm">
                    See the <strong className="text-white">real Agentforce cost</strong> after hidden fees, implementation, and org config — plus your true ROI and payback period. Emailed to you instantly.
                  </p>
                </div>

                {!submitted ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                    <input
                      type="email"
                      placeholder="Work Email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                    />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 text-white font-semibold rounded-lg px-6 py-3 transition-colors"
                    >
                      {submitting ? 'Sending...' : 'Email Me the Full Report →'}
                    </button>
                    <p className="text-center text-xs text-slate-500">No spam. Just your numbers.</p>
                  </form>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-4xl mb-3">✅</div>
                    <p className="font-semibold">Report sent to {email}</p>
                    <p className="text-slate-400 text-sm mt-1">Check your inbox — the full breakdown is on its way.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4 text-red-400">⚠️ The Real Cost Breakdown</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-slate-400">Hidden Costs (monthly est.)</span>
                    <span className="font-mono font-semibold text-red-400">+{fmt(results.hiddenCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-slate-400">Real Agentforce Cost</span>
                    <span className="font-mono font-semibold text-red-400">{fmt(results.realAgentforceCost)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/10">
                    <span className="text-slate-400">Real Monthly ROI</span>
                    <span className={`font-mono font-semibold ${results.realROI >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {results.realROI.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-400">Implementation Payback</span>
                    <span className="font-mono font-semibold text-white">
                      {results.paybackMonths > 99 ? 'Never' : `${results.paybackMonths.toFixed(1)} months`}
                    </span>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/30 rounded-xl text-sm text-blue-200">
                  <strong>Want an expert review?</strong> We help IT and RevOps leaders pressure-test Salesforce proposals and architect implementations that actually pencil out.{' '}
                  <a href="https://gatedenterprise.com" className="underline hover:text-white">Book a free 15-min call →</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
          <p>© 2026 Gated Enterprise · Premium Salesforce Consulting · <a href="https://gatedenterprise.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300">gatedenterprise.com</a> · <a href="mailto:info@gatedenterprise.com" className="hover:text-slate-300">info@gatedenterprise.com</a></p>
          <p className="mt-1 text-xs">Estimates are illustrative. Actual costs vary by org complexity and contract terms.</p>
        </div>
      </div>
    </main>
  );
}
