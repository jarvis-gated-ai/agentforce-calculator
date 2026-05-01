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
  const conversationsHandled = inputs.agentforceSeats * 1000;
  const remainingConversations = Math.max(0, inputs.monthlyConversations - conversationsHandled);
  const remainingLaborCost = (remainingConversations * hoursPerConversation) * inputs.agentHourlyCost;
  const automationSavings = currentLaborCost - remainingLaborCost - agentforceCost;
  const hiddenCosts = (agentforceCost * 0.3) + (40000 / 12);
  const realAgentforceCost = agentforceCost + hiddenCosts;
  const realSavings = currentLaborCost - remainingLaborCost - realAgentforceCost;
  const roi = agentforceCost > 0 ? (automationSavings / agentforceCost) * 100 : 0;
  const realROI = realAgentforceCost > 0 ? (realSavings / realAgentforceCost) * 100 : 0;
  const paybackMonths = automationSavings > 0 ? (40000 / automationSavings) : 999;
  return { currentLaborCost, agentforceCost, automationSavings, roi, paybackMonths, hiddenCosts, realAgentforceCost, realROI };
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

// ─── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function out(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setVisible(false);
    }
    if (visible) document.addEventListener('mousedown', out);
    return () => document.removeEventListener('mousedown', out);
  }, [visible]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }} ref={ref}>
      <button
        type="button"
        style={{
          width: '15px', height: '15px',
          background: '#EAEAEA', border: '1px solid #D0D0D0',
          color: '#999', fontSize: '9px', fontWeight: '700',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          marginLeft: '7px', cursor: 'pointer', transition: 'all 0.12s',
          borderRadius: '0', flexShrink: 0,
        }}
        onMouseEnter={e => {
          setVisible(true);
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#FF4F00';
          (e.currentTarget as HTMLButtonElement).style.color = '#FF4F00';
        }}
        onMouseLeave={e => {
          setVisible(false);
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#D0D0D0';
          (e.currentTarget as HTMLButtonElement).style.color = '#999';
        }}
        onClick={() => setVisible(v => !v)}
        aria-label="More info"
      >?</button>
      {visible && (
        <div style={{
          position: 'absolute', zIndex: 50, left: '22px', top: '50%', transform: 'translateY(-50%)',
          width: '240px', background: '#0A0A0A', border: '1px solid #1A1A1A',
          color: '#CCCCCC', fontSize: '12px', padding: '10px 14px',
          lineHeight: '1.55', pointerEvents: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

// ─── InputField ────────────────────────────────────────────────────────────────
function InputField({ label, tooltip, value, onChange, prefix, suffix }: {
  label: string; tooltip: string; value: number; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{
        display: 'flex', alignItems: 'center',
        fontSize: '11px', fontWeight: '600', letterSpacing: '0.08em',
        textTransform: 'uppercase', color: '#888', marginBottom: '7px',
      }}>
        {label}<Tooltip text={tooltip} />
      </span>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: '12px', color: '#AAA',
            fontSize: '14px', fontFamily: 'monospace', pointerEvents: 'none',
          }}>{prefix}</span>
        )}
        <input
          type="number" value={value} onChange={e => onChange(e.target.value)}
          style={{
            width: '100%', background: '#F0F0F0', border: '1px solid #E0E0E0', borderRadius: '0',
            padding: prefix ? '11px 40px 11px 24px' : suffix ? '11px 44px 11px 12px' : '11px 12px',
            color: '#0A0A0A', fontSize: '15px', fontFamily: 'monospace', fontWeight: '600',
            outline: 'none', transition: 'border-color 0.15s, background 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = '#FF4F00'; e.target.style.background = '#FFFFFF'; }}
          onBlur={e => { e.target.style.borderColor = '#E0E0E0'; e.target.style.background = '#F0F0F0'; }}
        />
        {suffix && (
          <span style={{
            position: 'absolute', right: '12px', color: '#BBB',
            fontSize: '11px', fontFamily: 'monospace', pointerEvents: 'none', letterSpacing: '0.04em',
          }}>{suffix}</span>
        )}
      </div>
    </label>
  );
}

// ─── StatRow ───────────────────────────────────────────────────────────────────
function StatRow({ label, value, color, last }: { label: string; value: string; color?: string; last?: boolean }) {
  return (
    <div className="stat-row" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 0 13px 14px',
      borderBottom: last ? 'none' : '1px solid #F0F0F0',
    }}>
      <span style={{ fontSize: '13px', color: '#777' }}>{label}</span>
      <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: '700', color: color || '#0A0A0A' }}>
        {value}
      </span>
    </div>
  );
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────
function SectionLabel({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
      <div style={{ width: '3px', height: '18px', background: accent ? '#FF4F00' : '#CCCCCC' }} />
      <span style={{
        fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
        textTransform: 'uppercase', color: accent ? '#FF4F00' : '#999',
      }}>{children}</span>
    </div>
  );
}

const TOOLTIPS = {
  monthlyConversations: 'Total inbound service interactions per month across all channels — phone, chat, email, web. Use your current ticketing or contact center volume.',
  avgHandleTime: 'Average handle time (AHT) in minutes per conversation, including talk time and after-call work. Industry average is 6–10 minutes.',
  agentHourlyCost: 'Fully-loaded cost per agent hour: base salary + benefits + overhead + tooling. Typically $18–$35/hr for US-based support.',
  currentAgentCount: 'Your current headcount of full-time customer service / support agents, excluding supervisors and QA.',
  agentforceSeats: 'Number of Agentforce Digital Labour seats in the Salesforce quote. Each seat typically handles ~1,000 automated conversations/month.',
  agentforceCostPerSeat: 'Monthly license cost per Agentforce seat as quoted by Salesforce. Standard list price is $150/seat/month, but varies by tier and negotiation.',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>({
    monthlyConversations: 5000, avgHandleTime: 8, agentHourlyCost: 22,
    currentAgentCount: 15, agentforceSeats: 10, agentforceCostPerSeat: 150,
  });
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [gated, setGated] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const results = calculate(inputs);
  const update = (key: keyof CalculatorInputs, v: string) =>
    setInputs(p => ({ ...p, [key]: parseFloat(v) || 0 }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, company, inputs, results }),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true); setGated(false);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setSubmitting(false); }
  };

  const sharedInputStyle = {
    width: '100%', background: '#F0F0F0', border: '1px solid #E0E0E0', borderRadius: '0',
    padding: '11px 12px', color: '#0A0A0A', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#F4F4F4' }}>

      {/* ── Nav ── */}
      <nav style={{
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E8E8',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Orange accent line */}
        <div style={{ height: '3px', background: '#FF4F00' }} />
        <div style={{
          maxWidth: '1080px', margin: '0 auto', padding: '0 28px',
          height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <a href="https://gatedenterprise.com" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '34px', height: '34px', background: '#0A0A0A',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '900', fontSize: '16px', color: '#FF4F00',
            }}>G</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '13px', letterSpacing: '0.06em', color: '#0A0A0A' }}>
                GATED ENTERPRISE
              </div>
              <div style={{ fontSize: '11px', color: '#AAAAAA', letterSpacing: '0.04em' }}>
                SALESFORCE CONSULTING
              </div>
            </div>
          </a>
          <a href="https://gatedenterprise.com" target="_blank" rel="noopener noreferrer"
            style={{
              fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#FFFFFF', textDecoration: 'none', background: '#FF4F00',
              padding: '8px 18px', transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#E04400')}
            onMouseLeave={e => (e.currentTarget.style.background = '#FF4F00')}
          >Book a Call</a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '60px 28px 44px' }}>
        <div style={{ marginBottom: '48px' }}>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: '1px solid #E0E0E0', padding: '5px 12px', marginBottom: '22px', background: '#FFFFFF',
          }}>
            <div style={{ width: '6px', height: '6px', background: '#FF4F00', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', color: '#FF4F00', textTransform: 'uppercase' }}>
              Free ROI Tool
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(30px, 5vw, 54px)', fontWeight: '800',
            letterSpacing: '-0.035em', lineHeight: '1.04', color: '#0A0A0A',
            marginBottom: '18px',
          }}>
            Agentforce<br />
            <span style={{ color: '#FF4F00' }}>Cost Shock</span>{' '}
            Calculator
          </h1>

          <p style={{ fontSize: '16px', color: '#777', maxWidth: '520px', lineHeight: '1.65', margin: 0 }}>
            Salesforce's pitch sounds great. But what does Agentforce{' '}
            <strong style={{ color: '#0A0A0A', fontWeight: '600' }}>actually</strong>{' '}
            cost — after implementation, hidden fees, and org configuration? Find out in 60 seconds.
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px' }}>

          {/* LEFT: Inputs */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', padding: '32px' }}>

            <SectionLabel accent>Current Operations</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
              <InputField label="Monthly Service Conversations" tooltip={TOOLTIPS.monthlyConversations}
                value={inputs.monthlyConversations} onChange={v => update('monthlyConversations', v)} suffix="/ mo" />
              <InputField label="Avg Handle Time" tooltip={TOOLTIPS.avgHandleTime}
                value={inputs.avgHandleTime} onChange={v => update('avgHandleTime', v)} suffix="min" />
              <InputField label="Agent Fully-Loaded Hourly Cost" tooltip={TOOLTIPS.agentHourlyCost}
                value={inputs.agentHourlyCost} onChange={v => update('agentHourlyCost', v)} prefix="$" suffix="/ hr" />
              <InputField label="Current Number of Agents" tooltip={TOOLTIPS.currentAgentCount}
                value={inputs.currentAgentCount} onChange={v => update('currentAgentCount', v)} suffix="agents" />
            </div>

            <div style={{ height: '1px', background: '#F0F0F0', marginBottom: '28px' }} />

            <SectionLabel>Agentforce Configuration</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <InputField label="Seats Quoted" tooltip={TOOLTIPS.agentforceSeats}
                value={inputs.agentforceSeats} onChange={v => update('agentforceSeats', v)} suffix="seats" />
              <InputField label="Cost per Seat / Month" tooltip={TOOLTIPS.agentforceCostPerSeat}
                value={inputs.agentforceCostPerSeat} onChange={v => update('agentforceCostPerSeat', v)} prefix="$" suffix="/ mo" />
            </div>
          </div>

          {/* RIGHT: Results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Snapshot card */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E8E8', padding: '28px' }}>
              <SectionLabel>Monthly Snapshot</SectionLabel>
              <StatRow label="Current Labor Cost" value={fmt(results.currentLaborCost)} />
              <StatRow label="Agentforce License Cost" value={fmt(results.agentforceCost)} color="#D4820A" />
              <StatRow label="Stated Monthly Savings"
                value={fmt(results.automationSavings)}
                color={results.automationSavings >= 0 ? '#00A651' : '#D42020'} />
              <StatRow label="Stated ROI"
                value={`${results.roi.toFixed(0)}%`}
                color={results.roi >= 0 ? '#00A651' : '#D42020'} last />
            </div>

            {/* Gated / Unlocked */}
            {gated ? (
              <div style={{
                background: '#FFFFFF',
                border: '1px solid #E8E8E8',
                borderTop: '3px solid #FF4F00',
                padding: '28px',
              }}>
                <div style={{ marginBottom: '22px' }}>
                  <div style={{
                    fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                    textTransform: 'uppercase', color: '#FF4F00', marginBottom: '10px',
                  }}>Unlock the Full Report</div>
                  <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.6', margin: 0 }}>
                    See the <strong style={{ color: '#0A0A0A' }}>real Agentforce cost</strong> after hidden fees, implementation, and org config — plus your true ROI and payback period.
                  </p>
                </div>

                {!submitted ? (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {['Your Name', 'Company', 'Work Email'].map((ph, i) => (
                      <input key={ph}
                        type={i === 2 ? 'email' : 'text'} placeholder={ph} required
                        value={i === 0 ? name : i === 1 ? company : email}
                        onChange={e => [setName, setCompany, setEmail][i](e.target.value)}
                        style={{ ...sharedInputStyle }}
                        onFocus={e => { e.target.style.borderColor = '#FF4F00'; e.target.style.background = '#FFFFFF'; }}
                        onBlur={e => { e.target.style.borderColor = '#E0E0E0'; e.target.style.background = '#F0F0F0'; }}
                      />
                    ))}
                    {error && <p style={{ color: '#D42020', fontSize: '12px', margin: 0 }}>{error}</p>}
                    <button type="submit" disabled={submitting} style={{
                      width: '100%', background: '#FF4F00', border: 'none', padding: '13px',
                      color: '#FFFFFF', fontSize: '13px', fontWeight: '700', letterSpacing: '0.08em',
                      textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer',
                      opacity: submitting ? 0.6 : 1, transition: 'background 0.15s', marginTop: '4px',
                    }}
                      onMouseEnter={e => { if (!submitting) (e.currentTarget.style.background = '#E04400'); }}
                      onMouseLeave={e => { (e.currentTarget.style.background = '#FF4F00'); }}
                    >{submitting ? 'Sending...' : 'Email Me the Full Report →'}</button>
                    <p style={{ textAlign: 'center', fontSize: '11px', color: '#BBB', margin: 0 }}>
                      No spam. Just your numbers.
                    </p>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#00A651', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      ✓ REPORT SENT
                    </div>
                    <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>
                      Sent to <strong style={{ color: '#0A0A0A' }}>{email}</strong> — check your inbox.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: '#FFFFFF', border: '1px solid #E8E8E8',
                borderLeft: '3px solid #D42020', padding: '28px',
              }}>
                <div style={{
                  fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: '#D42020', marginBottom: '16px',
                }}>⚠ The Real Cost Breakdown</div>

                <StatRow label="Hidden Costs (monthly est.)" value={`+${fmt(results.hiddenCosts)}`} color="#D42020" />
                <StatRow label="Real Agentforce Cost" value={fmt(results.realAgentforceCost)} color="#D42020" />
                <StatRow label="Real Monthly ROI"
                  value={`${results.realROI.toFixed(0)}%`}
                  color={results.realROI >= 0 ? '#00A651' : '#D42020'} />
                <StatRow label="Implementation Payback"
                  value={results.paybackMonths > 99 ? 'Never' : `${results.paybackMonths.toFixed(1)} mo`} last />

                {/* ── Conversion CTA ── */}
                <div style={{
                  marginTop: '28px',
                  background: '#0A0A0A',
                  borderRadius: '14px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', background: '#FF4F00',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '900', fontSize: '15px', color: '#fff', flexShrink: 0,
                    }}>G</div>
                    <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: '#666', textTransform: 'uppercase' }}>
                      Gated Enterprise · Salesforce Consulting
                    </div>
                  </div>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#FFFFFF', lineHeight: '1.35', letterSpacing: '-0.02em' }}>
                    Your numbers are real.<br />Let&apos;s talk about what to do with them.
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#888', lineHeight: '1.6' }}>
                    We help IT and RevOps directors pressure-test Salesforce proposals, untangle Agentforce licensing, and architect implementations that actually pencil out — before you sign.
                  </p>
                  <a
                    href="https://gatedenterprise.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      background: '#FF4F00', color: '#fff', textDecoration: 'none',
                      fontWeight: '700', fontSize: '13px', letterSpacing: '0.04em',
                      padding: '12px 22px', borderRadius: '8px', alignSelf: 'flex-start',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#E04400')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#FF4F00')}
                  >
                    Book a Free 15-Min Call →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          marginTop: '60px', paddingTop: '24px', borderTop: '1px solid #E8E8E8',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', textAlign: 'center',
        }}>
          <p style={{ fontSize: '12px', color: '#AAAAAA', margin: 0 }}>
            © 2026 Gated Enterprise · Premium Salesforce Consulting ·{' '}
            <a href="https://gatedenterprise.com" target="_blank" rel="noopener noreferrer"
              style={{ color: '#BBBBBB', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FF4F00')}
              onMouseLeave={e => (e.currentTarget.style.color = '#BBBBBB')}
            >gatedenterprise.com</a>
            {' · '}
            <a href="mailto:info@gatedenterprise.com"
              style={{ color: '#BBBBBB', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FF4F00')}
              onMouseLeave={e => (e.currentTarget.style.color = '#BBBBBB')}
            >info@gatedenterprise.com</a>
          </p>
          <p style={{ fontSize: '11px', color: '#CCCCCC', margin: 0 }}>
            Estimates are illustrative. Actual costs vary by org complexity and contract terms.
          </p>
        </div>
      </div>
    </main>
  );
}
