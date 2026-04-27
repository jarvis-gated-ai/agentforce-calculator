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

function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setVisible(false);
    }
    if (visible) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [visible]);

  return (
    <div className="relative inline-flex items-center" ref={ref}>
      <button
        type="button"
        style={{
          width: '16px',
          height: '16px',
          background: '#1A1A1A',
          border: '1px solid #2E2E2E',
          color: '#888',
          fontSize: '10px',
          fontWeight: '700',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '8px',
          cursor: 'pointer',
          transition: 'border-color 0.15s, color 0.15s',
          flexShrink: 0,
          borderRadius: '0',
        }}
        onMouseEnter={e => {
          setVisible(true);
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#00E5FF';
          (e.currentTarget as HTMLButtonElement).style.color = '#00E5FF';
        }}
        onMouseLeave={e => {
          setVisible(false);
          (e.currentTarget as HTMLButtonElement).style.borderColor = '#2E2E2E';
          (e.currentTarget as HTMLButtonElement).style.color = '#888';
        }}
        onClick={() => setVisible(v => !v)}
        aria-label="More info"
      >
        ?
      </button>
      {visible && (
        <div style={{
          position: 'absolute',
          zIndex: 50,
          left: '24px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '240px',
          background: '#1A1A1A',
          border: '1px solid #2E2E2E',
          color: '#CCCCCC',
          fontSize: '12px',
          padding: '10px 14px',
          lineHeight: '1.5',
          pointerEvents: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

function InputField({
  label,
  tooltip,
  value,
  onChange,
  prefix,
  suffix,
}: {
  label: string;
  tooltip: string;
  value: number;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{
        display: 'flex',
        alignItems: 'center',
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#666',
        marginBottom: '8px',
      }}>
        {label}
        <Tooltip text={tooltip} />
      </span>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <span style={{
            position: 'absolute',
            left: '14px',
            color: '#555',
            fontSize: '14px',
            fontFamily: 'monospace',
            pointerEvents: 'none',
          }}>{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            width: '100%',
            background: '#0D0D0D',
            border: '1px solid #2E2E2E',
            borderRadius: '0',
            padding: prefix ? '12px 14px 12px 26px' : suffix ? '12px 40px 12px 14px' : '12px 14px',
            color: '#F0F0F0',
            fontSize: '15px',
            fontFamily: 'monospace',
            fontWeight: '500',
            outline: 'none',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.target.style.borderColor = '#00E5FF')}
          onBlur={e => (e.target.style.borderColor = '#2E2E2E')}
        />
        {suffix && (
          <span style={{
            position: 'absolute',
            right: '14px',
            color: '#555',
            fontSize: '12px',
            fontFamily: 'monospace',
            pointerEvents: 'none',
          }}>{suffix}</span>
        )}
      </div>
    </label>
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

// Reusable stat row
function StatRow({
  label,
  value,
  valueColor,
  dimBorder,
}: {
  label: string;
  value: string;
  valueColor?: string;
  dimBorder?: boolean;
}) {
  return (
    <div className="stat-card" style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 0 14px 16px',
      borderBottom: `1px solid ${dimBorder ? '#181818' : '#1E1E1E'}`,
    }}>
      <span style={{ fontSize: '13px', color: '#666', letterSpacing: '0.01em' }}>{label}</span>
      <span style={{
        fontFamily: 'monospace',
        fontSize: '15px',
        fontWeight: '700',
        color: valueColor || '#F0F0F0',
        letterSpacing: '-0.01em',
      }}>{value}</span>
    </div>
  );
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

  const inputStyle = {
    width: '100%',
    background: '#0D0D0D',
    border: '1px solid #2E2E2E',
    borderRadius: '0',
    padding: '12px 14px',
    color: '#F0F0F0',
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <main style={{ minHeight: '100vh', background: '#080808', color: '#F0F0F0' }}>

      {/* Top nav bar */}
      <nav style={{
        borderBottom: '1px solid #1E1E1E',
        background: '#080808',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Thin cyan accent line */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, #00E5FF 0%, transparent 60%)' }} />
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '0 24px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <a href="https://gatedenterprise.com" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#00E5FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '900',
              fontSize: '15px',
              color: '#080808',
              letterSpacing: '-0.02em',
            }}>G</div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', letterSpacing: '0.02em', color: '#F0F0F0' }}>
                GATED ENTERPRISE
              </div>
              <div style={{ fontSize: '11px', color: '#444', letterSpacing: '0.05em' }}>
                SALESFORCE CONSULTING
              </div>
            </div>
          </a>
          <a
            href="https://gatedenterprise.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '12px',
              fontWeight: '600',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#00E5FF',
              textDecoration: 'none',
              border: '1px solid rgba(0,229,255,0.3)',
              padding: '6px 14px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,229,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            Book a Call
          </a>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        maxWidth: '1080px',
        margin: '0 auto',
        padding: '64px 24px 48px',
      }}>
        <div style={{ marginBottom: '56px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,229,255,0.08)',
            border: '1px solid rgba(0,229,255,0.2)',
            padding: '5px 12px',
            marginBottom: '24px',
          }}>
            <div style={{ width: '6px', height: '6px', background: '#00E5FF', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', color: '#00E5FF', textTransform: 'uppercase' }}>
              Free ROI Tool
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: '800',
            letterSpacing: '-0.03em',
            lineHeight: '1.05',
            marginBottom: '20px',
            color: '#F0F0F0',
          }}>
            Agentforce<br />
            <span style={{ color: '#00E5FF' }} className="pop-text-glow">Cost Shock</span>{' '}
            Calculator
          </h1>

          <p style={{
            fontSize: '16px',
            color: '#666',
            maxWidth: '540px',
            lineHeight: '1.6',
          }}>
            Salesforce's pitch sounds great. But what does Agentforce <em style={{ color: '#999', fontStyle: 'normal', fontWeight: '600' }}>actually</em> cost — after implementation, hidden fees, and org configuration? Find out in 60 seconds.
          </p>
        </div>

        {/* Two-column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '2px',
          background: '#1A1A1A',
        }}>

          {/* LEFT: Inputs */}
          <div style={{ background: '#080808', padding: '32px' }}>

            {/* Section: Current Ops */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px',
            }}>
              <div style={{ width: '3px', height: '20px', background: '#00E5FF' }} />
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#888',
              }}>Current Operations</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '36px' }}>
              <InputField
                label="Monthly Service Conversations"
                tooltip={TOOLTIPS.monthlyConversations}
                value={inputs.monthlyConversations}
                onChange={v => updateInput('monthlyConversations', v)}
                suffix="/ mo"
              />
              <InputField
                label="Avg Handle Time"
                tooltip={TOOLTIPS.avgHandleTime}
                value={inputs.avgHandleTime}
                onChange={v => updateInput('avgHandleTime', v)}
                suffix="min"
              />
              <InputField
                label="Agent Fully-Loaded Hourly Cost"
                tooltip={TOOLTIPS.agentHourlyCost}
                value={inputs.agentHourlyCost}
                onChange={v => updateInput('agentHourlyCost', v)}
                prefix="$"
                suffix="/ hr"
              />
              <InputField
                label="Current Number of Agents"
                tooltip={TOOLTIPS.currentAgentCount}
                value={inputs.currentAgentCount}
                onChange={v => updateInput('currentAgentCount', v)}
                suffix="agents"
              />
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#1A1A1A', marginBottom: '28px' }} />

            {/* Section: Agentforce Config */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '24px',
            }}>
              <div style={{ width: '3px', height: '20px', background: '#444' }} />
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#888',
              }}>Agentforce Configuration</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <InputField
                label="Seats Quoted"
                tooltip={TOOLTIPS.agentforceSeats}
                value={inputs.agentforceSeats}
                onChange={v => updateInput('agentforceSeats', v)}
                suffix="seats"
              />
              <InputField
                label="Cost per Seat / Month"
                tooltip={TOOLTIPS.agentforceCostPerSeat}
                value={inputs.agentforceCostPerSeat}
                onChange={v => updateInput('agentforceCostPerSeat', v)}
                prefix="$"
                suffix="/ mo"
              />
            </div>
          </div>

          {/* RIGHT: Results */}
          <div style={{ background: '#080808', padding: '32px', display: 'flex', flexDirection: 'column', gap: '2px' }}>

            {/* Snapshot card */}
            <div style={{
              background: '#111111',
              border: '1px solid #1E1E1E',
              padding: '24px',
              marginBottom: '2px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}>
                <div style={{ width: '3px', height: '20px', background: '#00E5FF' }} />
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#888',
                }}>Monthly Snapshot</span>
              </div>

              <StatRow
                label="Current Labor Cost"
                value={fmt(results.currentLaborCost)}
                dimBorder
              />
              <StatRow
                label="Agentforce License Cost"
                value={fmt(results.agentforceCost)}
                valueColor="#FFB800"
                dimBorder
              />
              <StatRow
                label="Stated Monthly Savings"
                value={fmt(results.automationSavings)}
                valueColor={results.automationSavings >= 0 ? '#00FF88' : '#FF4455'}
                dimBorder
              />
              <div className="stat-card" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 0 0 16px',
              }}>
                <span style={{ fontSize: '13px', color: '#666' }}>Stated ROI</span>
                <span style={{
                  fontFamily: 'monospace',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: results.roi >= 0 ? '#00FF88' : '#FF4455',
                }}>{results.roi.toFixed(0)}%</span>
              </div>
            </div>

            {/* Gated / Revealed section */}
            {gated ? (
              <div style={{
                background: '#0D0D0D',
                border: '1px solid rgba(0,229,255,0.2)',
                padding: '28px',
              }} className="pop-glow">
                <div style={{ marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#00E5FF',
                    marginBottom: '10px',
                  }}>
                    ▸ UNLOCK THE FULL REPORT
                  </div>
                  <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                    See the <strong style={{ color: '#F0F0F0', fontWeight: '600' }}>real Agentforce cost</strong> after hidden fees, implementation, and org configuration — plus your true ROI and payback period.
                  </p>
                </div>

                {!submitted ? (
                  <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      style={{ ...inputStyle }}
                      onFocus={e => (e.target.style.borderColor = '#00E5FF')}
                      onBlur={e => (e.target.style.borderColor = '#2E2E2E')}
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      required
                      style={{ ...inputStyle }}
                      onFocus={e => (e.target.style.borderColor = '#00E5FF')}
                      onBlur={e => (e.target.style.borderColor = '#2E2E2E')}
                    />
                    <input
                      type="email"
                      placeholder="Work Email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      style={{ ...inputStyle }}
                      onFocus={e => (e.target.style.borderColor = '#00E5FF')}
                      onBlur={e => (e.target.style.borderColor = '#2E2E2E')}
                    />
                    {error && <p style={{ color: '#FF4455', fontSize: '13px', margin: 0 }}>{error}</p>}
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        width: '100%',
                        background: '#00E5FF',
                        border: 'none',
                        padding: '14px',
                        color: '#080808',
                        fontSize: '13px',
                        fontWeight: '700',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.6 : 1,
                        transition: 'opacity 0.15s, background 0.15s',
                        marginTop: '4px',
                      }}
                      onMouseEnter={e => { if (!submitting) (e.currentTarget.style.background = '#33EEFF'); }}
                      onMouseLeave={e => { (e.currentTarget.style.background = '#00E5FF'); }}
                    >
                      {submitting ? 'Sending...' : 'Email Me the Full Report →'}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '11px', color: '#444', margin: 0 }}>
                      No spam. Just your numbers.
                    </p>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px 0' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#00E5FF', marginBottom: '6px', letterSpacing: '0.05em' }}>
                      ✓ REPORT SENT
                    </div>
                    <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>Sent to <strong style={{ color: '#F0F0F0' }}>{email}</strong> — check your inbox.</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                background: '#111111',
                border: '1px solid #1E1E1E',
                borderLeft: '2px solid #FF4455',
                padding: '24px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: '#FF4455',
                  }}>⚠ The Real Cost Breakdown</span>
                </div>

                <StatRow
                  label="Hidden Costs (monthly est.)"
                  value={`+${fmt(results.hiddenCosts)}`}
                  valueColor="#FF4455"
                  dimBorder
                />
                <StatRow
                  label="Real Agentforce Cost"
                  value={fmt(results.realAgentforceCost)}
                  valueColor="#FF4455"
                  dimBorder
                />
                <StatRow
                  label="Real Monthly ROI"
                  value={`${results.realROI.toFixed(0)}%`}
                  valueColor={results.realROI >= 0 ? '#00FF88' : '#FF4455'}
                  dimBorder
                />
                <div className="stat-card" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0 0 16px',
                  marginBottom: '24px',
                }}>
                  <span style={{ fontSize: '13px', color: '#666' }}>Implementation Payback</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: '700', color: '#F0F0F0' }}>
                    {results.paybackMonths > 99 ? 'Never' : `${results.paybackMonths.toFixed(1)} mo`}
                  </span>
                </div>

                <div style={{
                  background: '#0D0D0D',
                  border: '1px solid rgba(0,229,255,0.15)',
                  padding: '16px',
                  fontSize: '13px',
                  color: '#666',
                  lineHeight: '1.6',
                }}>
                  <strong style={{ color: '#F0F0F0', fontWeight: '600' }}>Want an expert review?</strong> We help IT and RevOps leaders pressure-test Salesforce proposals and architect implementations that actually pencil out.{' '}
                  <a
                    href="https://gatedenterprise.com"
                    style={{ color: '#00E5FF', textDecoration: 'none', fontWeight: '600' }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    Book a free 15-min call →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '64px',
          paddingTop: '24px',
          borderTop: '1px solid #1A1A1A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '12px', color: '#444', margin: 0 }}>
            © 2026 Gated Enterprise · Premium Salesforce Consulting ·{' '}
            <a href="https://gatedenterprise.com" target="_blank" rel="noopener noreferrer"
              style={{ color: '#555', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#00E5FF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
            >gatedenterprise.com</a>
            {' · '}
            <a href="mailto:info@gatedenterprise.com"
              style={{ color: '#555', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#00E5FF')}
              onMouseLeave={e => (e.currentTarget.style.color = '#555')}
            >info@gatedenterprise.com</a>
          </p>
          <p style={{ fontSize: '11px', color: '#333', margin: 0 }}>
            Estimates are illustrative. Actual costs vary by org complexity and contract terms.
          </p>
        </div>
      </div>
    </main>
  );
}
