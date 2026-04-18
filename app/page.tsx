'use client';

import { useState } from 'react';

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
          <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-lg">G</div>
          <div>
            <div className="font-semibold text-lg tracking-tight">Gated Enterprise</div>
            <div className="text-xs text-blue-300">Premium Salesforce Consulting</div>
          </div>
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
              <label className="block">
                <span className="text-sm text-slate-400 mb-1 block">Monthly Service Conversations</span>
                <input
                  type="number"
                  value={inputs.monthlyConversations}
                  onChange={e => updateInput('monthlyConversations', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-400 mb-1 block">Avg Handle Time (minutes)</span>
                <input
                  type="number"
                  value={inputs.avgHandleTime}
                  onChange={e => updateInput('avgHandleTime', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-400 mb-1 block">Agent Fully-Loaded Hourly Cost ($)</span>
                <input
                  type="number"
                  value={inputs.agentHourlyCost}
                  onChange={e => updateInput('agentHourlyCost', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-400 mb-1 block">Current # of Agents</span>
                <input
                  type="number"
                  value={inputs.currentAgentCount}
                  onChange={e => updateInput('currentAgentCount', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </label>
            </div>

            <h2 className="font-semibold text-lg text-white pt-2 border-t border-white/10">Agentforce Configuration</h2>

            <div className="space-y-4">
              <label className="block">
                <span className="text-sm text-slate-400 mb-1 block">Agentforce Seats Quoted</span>
                <input
                  type="number"
                  value={inputs.agentforceSeats}
                  onChange={e => updateInput('agentforceSeats', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </label>

              <label className="block">
                <span className="text-sm text-slate-400 mb-1 block">Cost per Seat / Month ($)</span>
                <input
                  type="number"
                  value={inputs.agentforceCostPerSeat}
                  onChange={e => updateInput('agentforceCostPerSeat', e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-400"
                />
              </label>
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
                  <a href="mailto:adeel@gated.enterprise" className="underline hover:text-white">Book a free 15-min call →</a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-slate-500 text-sm">
          <p>© 2026 Gated Enterprise · Premium Salesforce Consulting · <a href="mailto:adeel@gated.enterprise" className="hover:text-slate-300">adeel@gated.enterprise</a></p>
          <p className="mt-1 text-xs">Estimates are illustrative. Actual costs vary by org complexity and contract terms.</p>
        </div>
      </div>
    </main>
  );
}
