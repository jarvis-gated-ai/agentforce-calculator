import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, company, inputs, results } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Agentforce Cost Shock Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, #1e3a5f, #1e1b4b); border-radius: 16px; padding: 32px; margin-bottom: 24px; text-align: center; }
    .logo { font-size: 14px; color: #93c5fd; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
    h1 { font-size: 28px; font-weight: 700; margin: 0 0 8px; color: white; }
    .subtitle { color: #94a3b8; font-size: 15px; }
    .section { background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
    .section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 16px; }
    .row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #334155; }
    .row:last-child { border-bottom: none; }
    .label { color: #94a3b8; font-size: 14px; }
    .value { font-weight: 600; font-size: 15px; font-family: monospace; }
    .value.green { color: #4ade80; }
    .value.red { color: #f87171; }
    .value.yellow { color: #fbbf24; }
    .value.white { color: white; }
    .cta { background: linear-gradient(135deg, #1d4ed8, #7c3aed); border-radius: 12px; padding: 28px; text-align: center; margin-top: 24px; }
    .cta h3 { color: white; font-size: 20px; margin: 0 0 8px; }
    .cta p { color: #bfdbfe; font-size: 14px; margin: 0 0 20px; }
    .btn { display: inline-block; background: white; color: #1d4ed8; font-weight: 600; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 15px; }
    .footer { text-align: center; color: #475569; font-size: 12px; margin-top: 24px; }
    .shock-badge { display: inline-block; background: #dc2626; color: white; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 700; margin-left: 8px; vertical-align: middle; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Gated Enterprise</div>
      <h1>Agentforce Cost Shock Report</h1>
      <p class="subtitle">Prepared for ${name} · ${company}</p>
    </div>

    <div class="section">
      <div class="section-title">Your Current Operations</div>
      <div class="row"><span class="label">Monthly Conversations</span><span class="value white">${inputs.monthlyConversations.toLocaleString()}</span></div>
      <div class="row"><span class="label">Avg Handle Time</span><span class="value white">${inputs.avgHandleTime} min</span></div>
      <div class="row"><span class="label">Agent Hourly Cost</span><span class="value white">${fmt(inputs.agentHourlyCost)}</span></div>
      <div class="row"><span class="label">Current Agent Headcount</span><span class="value white">${inputs.currentAgentCount}</span></div>
      <div class="row"><span class="label">Current Monthly Labor Cost</span><span class="value yellow">${fmt(results.currentLaborCost)}</span></div>
    </div>

    <div class="section">
      <div class="section-title">What Salesforce Shows You</div>
      <div class="row"><span class="label">Agentforce Seats Quoted</span><span class="value white">${inputs.agentforceSeats} × ${fmt(inputs.agentforceCostPerSeat)}/seat</span></div>
      <div class="row"><span class="label">Stated License Cost</span><span class="value yellow">${fmt(results.agentforceCost)}/mo</span></div>
      <div class="row"><span class="label">Stated Savings</span><span class="value ${results.automationSavings >= 0 ? 'green' : 'red'}">${fmt(results.automationSavings)}/mo</span></div>
      <div class="row"><span class="label">Stated ROI</span><span class="value ${results.roi >= 0 ? 'green' : 'red'}">${results.roi.toFixed(0)}%</span></div>
    </div>

    <div class="section">
      <div class="section-title">The Real Cost <span class="shock-badge">COST SHOCK</span></div>
      <div class="row"><span class="label">Implementation Amortized</span><span class="value red">+${fmt(40000 / 12)}/mo</span></div>
      <div class="row"><span class="label">Ongoing Admin & Config (est. 30%)</span><span class="value red">+${fmt(results.agentforceCost * 0.3)}/mo</span></div>
      <div class="row"><span class="label">Total Hidden Costs</span><span class="value red">+${fmt(results.hiddenCosts)}/mo</span></div>
      <div class="row"><span class="label">Real Agentforce Total Cost</span><span class="value red">${fmt(results.realAgentforceCost)}/mo</span></div>
      <div class="row"><span class="label">Real ROI</span><span class="value ${results.realROI >= 0 ? 'green' : 'red'}">${results.realROI.toFixed(0)}%</span></div>
      <div class="row"><span class="label">Implementation Payback Period</span><span class="value white">${results.paybackMonths > 99 ? 'Does not pay back' : results.paybackMonths.toFixed(1) + ' months'}</span></div>
    </div>

    <div class="cta">
      <h3>Want us to pressure-test the proposal?</h3>
      <p>We help IT Directors and RevOps leaders validate Salesforce numbers and architect implementations that actually pencil out — no fluff, no upsell.</p>
      <a href="https://gated.enterprise" class="btn">Book a Free 15-Min Call →</a>
    </div>

    <div class="footer">
      <p>© 2026 Gated Enterprise · Premium Salesforce Consulting</p>
      <p>Estimates are illustrative. Actual costs vary by org complexity and contract terms.</p>
      <p>You received this because you requested a report at our Agentforce Calculator.</p>
    </div>
  </div>
</body>
</html>
    `;

    await resend.emails.send({
      from: 'Gated Enterprise <noreply@gated.enterprise>',
      to: email,
      subject: `Your Agentforce Cost Shock Report — Real ROI: ${results.realROI.toFixed(0)}%`,
      html,
    });

    // Also notify Adeel
    await resend.emails.send({
      from: 'Agentforce Calculator <noreply@gated.enterprise>',
      to: 'adeel@gated.enterprise',
      subject: `🎯 New Lead: ${name} @ ${company}`,
      html: `<p>New calculator submission:</p><ul><li><strong>Name:</strong> ${name}</li><li><strong>Company:</strong> ${company}</li><li><strong>Email:</strong> ${email}</li><li><strong>Monthly Conversations:</strong> ${inputs.monthlyConversations}</li><li><strong>Current Labor Cost:</strong> ${fmt(results.currentLaborCost)}/mo</li><li><strong>Real ROI:</strong> ${results.realROI.toFixed(0)}%</li></ul>`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
