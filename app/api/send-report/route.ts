import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY ?? 're_placeholder');

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export async function POST(req: NextRequest) {
  try {
    const { email, name, company, inputs, results } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // ─── Submitter email (full report, email-client-safe) ───────────────────
    const submitterHtml = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <title>Your Agentforce Cost Shock Report</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style type="text/css">
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    /* General */
    body { margin: 0 !important; padding: 0 !important; background-color: #0f172a; width: 100% !important; }
    .email-wrapper { background-color: #0f172a; padding: 24px 12px; }
    .email-container { max-width: 600px; margin: 0 auto; }
    /* Typography */
    h1 { margin: 0; padding: 0; }
    p  { margin: 0; padding: 0; }
    a  { color: #60a5fa; }
    /* Mobile */
    @media only screen and (max-width: 600px) {
      .mobile-pad { padding-left: 16px !important; padding-right: 16px !important; }
      .mobile-text { font-size: 22px !important; }
    }
  </style>
</head>
<body>
<div class="email-wrapper">
  <table role="presentation" class="email-container" width="100%" cellpadding="0" cellspacing="0" border="0">

    <!-- ═══ HEADER ═══ -->
    <tr>
      <td style="padding-bottom: 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="background: linear-gradient(135deg, #1e3a5f 0%, #1e1b4b 100%); border-radius: 16px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 36px 32px 28px;" class="mobile-pad">
              <!-- Logo row -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
                <tr>
                  <td width="36" height="36" style="background-color: #3b82f6; border-radius: 8px; text-align: center; vertical-align: middle;">
                    <span style="color: #ffffff; font-family: Arial, sans-serif; font-size: 18px; font-weight: 700; line-height: 36px;">G</span>
                  </td>
                  <td style="padding-left: 10px; vertical-align: middle;">
                    <span style="color: #ffffff; font-family: Arial, sans-serif; font-size: 15px; font-weight: 600;">Gated Enterprise</span><br />
                    <a href="https://gatedenterprise.com" style="color: #93c5fd; font-family: Arial, sans-serif; font-size: 11px; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">gatedenterprise.com</a>
                  </td>
                </tr>
              </table>
              <!-- Title -->
              <h1 class="mobile-text" style="color: #ffffff; font-family: Arial, sans-serif; font-size: 28px; font-weight: 700; line-height: 1.2; margin-bottom: 8px;">
                Agentforce Cost Shock Report
              </h1>
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
                Prepared for <strong style="color: #e2e8f0;">${name}</strong>${company ? ' &middot; ' + company : ''}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- SPACER -->
    <tr><td height="20"></td></tr>

    <!-- ═══ SECTION: CURRENT OPERATIONS ═══ -->
    <tr>
      <td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="background-color: #1e293b; border-radius: 12px; overflow: hidden;">
          <!-- Section header -->
          <tr>
            <td colspan="2" style="padding: 18px 24px 10px;" class="mobile-pad">
              <p style="color: #64748b; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 0;">Your Current Operations</p>
            </td>
          </tr>
          <!-- Rows -->
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Monthly Conversations</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #f1f5f9; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">${inputs.monthlyConversations.toLocaleString()}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Avg Handle Time</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #f1f5f9; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">${inputs.avgHandleTime} min</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Agent Hourly Cost (fully loaded)</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #f1f5f9; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">${fmt(inputs.agentHourlyCost)}/hr</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Current Agent Headcount</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #f1f5f9; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">${inputs.currentAgentCount}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 24px 18px; border-top: 1px solid #334155; background-color: #0f1d30; border-radius: 0 0 0 12px;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600;">Current Monthly Labor Cost</p>
            </td>
            <td align="right" style="padding: 14px 24px 18px; border-top: 1px solid #334155; background-color: #0f1d30; border-radius: 0 0 12px 0;" class="mobile-pad">
              <p style="color: #fbbf24; font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 700;">${fmt(results.currentLaborCost)}/mo</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- SPACER -->
    <tr><td height="12"></td></tr>

    <!-- ═══ SECTION: SALESFORCE PITCH ═══ -->
    <tr>
      <td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="background-color: #1e293b; border-radius: 12px; overflow: hidden;">
          <tr>
            <td colspan="2" style="padding: 18px 24px 10px;" class="mobile-pad">
              <p style="color: #64748b; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">What Salesforce Shows You</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Agentforce Seats Quoted</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #f1f5f9; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">${inputs.agentforceSeats} &times; ${fmt(inputs.agentforceCostPerSeat)}/seat</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Stated License Cost</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #fbbf24; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">${fmt(results.agentforceCost)}/mo</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Stated Monthly Savings</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #334155;" class="mobile-pad">
              <p style="color: ${results.automationSavings >= 0 ? '#4ade80' : '#f87171'}; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">${fmt(results.automationSavings)}/mo</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 24px 18px; border-top: 1px solid #334155; background-color: #0f1d30; border-radius: 0 0 0 12px;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600;">Stated ROI</p>
            </td>
            <td align="right" style="padding: 14px 24px 18px; border-top: 1px solid #334155; background-color: #0f1d30; border-radius: 0 0 12px 0;" class="mobile-pad">
              <p style="color: ${results.roi >= 0 ? '#4ade80' : '#f87171'}; font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 700;">${results.roi.toFixed(0)}%</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- SPACER -->
    <tr><td height="12"></td></tr>

    <!-- ═══ SECTION: REAL COST SHOCK ═══ -->
    <tr>
      <td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="background-color: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid #7f1d1d;">
          <tr>
            <td colspan="2" style="padding: 18px 24px 10px; background-color: #450a0a; border-radius: 12px 12px 0 0;" class="mobile-pad">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <p style="color: #fca5a5; font-family: Arial, sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">The Real Cost</p>
                  </td>
                  <td style="padding-left: 10px; vertical-align: middle;">
                    <span style="background-color: #dc2626; color: #ffffff; font-family: Arial, sans-serif; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px;">COST SHOCK</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #7f1d1d;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Implementation (amortized 12 mo)</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #7f1d1d;" class="mobile-pad">
              <p style="color: #f87171; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">+${fmt(40000 / 12)}/mo</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #7f1d1d;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Ongoing Admin &amp; Config (est. 30%)</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #7f1d1d;" class="mobile-pad">
              <p style="color: #f87171; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">+${fmt(results.agentforceCost * 0.3)}/mo</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #7f1d1d;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Total Hidden Costs</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #7f1d1d;" class="mobile-pad">
              <p style="color: #f87171; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">+${fmt(results.hiddenCosts)}/mo</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #7f1d1d;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Real Agentforce Total Cost</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #7f1d1d;" class="mobile-pad">
              <p style="color: #f87171; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">${fmt(results.realAgentforceCost)}/mo</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 24px; border-top: 1px solid #7f1d1d;" class="mobile-pad">
              <p style="color: #94a3b8; font-family: Arial, sans-serif; font-size: 14px;">Real ROI</p>
            </td>
            <td align="right" style="padding: 12px 24px; border-top: 1px solid #7f1d1d;" class="mobile-pad">
              <p style="color: ${results.realROI >= 0 ? '#4ade80' : '#f87171'}; font-family: 'Courier New', Courier, monospace; font-size: 15px; font-weight: 700;">${results.realROI.toFixed(0)}%</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 14px 24px 18px; border-top: 1px solid #7f1d1d; background-color: #3b0606; border-radius: 0 0 0 12px;" class="mobile-pad">
              <p style="color: #fca5a5; font-family: Arial, sans-serif; font-size: 14px; font-weight: 600;">Implementation Payback Period</p>
            </td>
            <td align="right" style="padding: 14px 24px 18px; border-top: 1px solid #7f1d1d; background-color: #3b0606; border-radius: 0 0 12px 0;" class="mobile-pad">
              <p style="color: #fca5a5; font-family: 'Courier New', Courier, monospace; font-size: 16px; font-weight: 700;">${results.paybackMonths > 99 ? 'Does not pay back' : results.paybackMonths.toFixed(1) + ' months'}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- SPACER -->
    <tr><td height="20"></td></tr>

    <!-- ═══ CTA ═══ -->
    <tr>
      <td>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
               style="background: linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%); border-radius: 12px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 32px 28px;" class="mobile-pad">
              <h1 style="color: #ffffff; font-family: Arial, sans-serif; font-size: 20px; font-weight: 700; margin-bottom: 10px; line-height: 1.3;">
                Want us to pressure-test the proposal?
              </h1>
              <p style="color: #bfdbfe; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6; margin-bottom: 24px; max-width: 440px;">
                We help IT Directors and RevOps leaders validate Salesforce numbers and architect implementations that actually pencil out &mdash; no fluff, no upsell.
              </p>
              <!-- Bulletproof button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #ffffff; border-radius: 8px;">
                    <a href="https://gatedenterprise.com"
                       style="display: inline-block; background-color: #ffffff; color: #1d4ed8; font-family: Arial, sans-serif; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                      Book a Free 15-Min Call &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- SPACER -->
    <tr><td height="24"></td></tr>

    <!-- ═══ FOOTER ═══ -->
    <tr>
      <td align="center" style="padding: 0 24px 8px;">
        <p style="color: #475569; font-family: Arial, sans-serif; font-size: 12px; line-height: 1.8;">
          &copy; 2026 Gated Enterprise &middot; Premium Salesforce Consulting<br />
          <a href="https://gatedenterprise.com" style="color: #60a5fa; text-decoration: none;">gatedenterprise.com</a>
          &nbsp;&middot;&nbsp;
          <a href="mailto:info@gatedenterprise.com" style="color: #60a5fa; text-decoration: none;">info@gatedenterprise.com</a>
        </p>
        <p style="color: #334155; font-family: Arial, sans-serif; font-size: 11px; margin-top: 8px;">
          Estimates are illustrative. Actual costs vary by org complexity and contract terms.<br />
          You received this because you requested a report at our Agentforce Calculator.
        </p>
      </td>
    </tr>

  </table>
</div>
</body>
</html>
    `;

    // ─── Internal lead notification (full report data for pre-call prep) ────
    const internalHtml = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>New Lead</title>
  <style type="text/css">
    body { font-family: Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .badge { display: inline-block; background: #16a34a; color: #fff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
    h2 { color: #f1f5f9; font-size: 20px; margin: 0 0 4px; }
    .meta { color: #94a3b8; font-size: 13px; margin-bottom: 24px; }
    .section { background: #1e293b; border-radius: 10px; margin-bottom: 12px; overflow: hidden; }
    .section-title { background: #0f172a; color: #64748b; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 12px 20px 8px; }
    table.rows { width: 100%; border-collapse: collapse; }
    table.rows td { padding: 10px 20px; font-size: 14px; border-top: 1px solid #334155; vertical-align: top; }
    table.rows td.lbl { color: #94a3b8; width: 55%; }
    table.rows td.val { color: #f1f5f9; font-family: 'Courier New', Courier, monospace; font-weight: 700; text-align: right; }
    .green { color: #4ade80 !important; }
    .red   { color: #f87171 !important; }
    .yellow { color: #fbbf24 !important; }
    .footer { color: #475569; font-size: 11px; text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
<div class="container">

  <div class="badge">&#127919; New Lead</div>
  <h2>${name} @ ${company}</h2>
  <p class="meta">
    <strong style="color:#e2e8f0;">Email:</strong> <a href="mailto:${email}" style="color:#60a5fa;">${email}</a>
    &nbsp;&nbsp;|&nbsp;&nbsp;
    Submitted via <a href="https://tools.gatedenterprise.com" style="color:#60a5fa;">tools.gatedenterprise.com</a>
  </p>

  <!-- Contact -->
  <div class="section">
    <div class="section-title">Contact Info</div>
    <table class="rows" role="presentation">
      <tr><td class="lbl">Name</td><td class="val">${name}</td></tr>
      <tr><td class="lbl">Company</td><td class="val">${company || '—'}</td></tr>
      <tr><td class="lbl">Email</td><td class="val"><a href="mailto:${email}" style="color:#60a5fa;">${email}</a></td></tr>
    </table>
  </div>

  <!-- Inputs they entered -->
  <div class="section">
    <div class="section-title">Calculator Inputs (what they told us)</div>
    <table class="rows" role="presentation">
      <tr><td class="lbl">Monthly Conversations</td><td class="val">${inputs.monthlyConversations.toLocaleString()}</td></tr>
      <tr><td class="lbl">Avg Handle Time</td><td class="val">${inputs.avgHandleTime} min</td></tr>
      <tr><td class="lbl">Agent Hourly Cost (loaded)</td><td class="val">${fmt(inputs.agentHourlyCost)}/hr</td></tr>
      <tr><td class="lbl">Current Agent Headcount</td><td class="val">${inputs.currentAgentCount}</td></tr>
      <tr><td class="lbl">Agentforce Seats Quoted</td><td class="val">${inputs.agentforceSeats}</td></tr>
      <tr><td class="lbl">Cost per Seat / Month</td><td class="val">${fmt(inputs.agentforceCostPerSeat)}</td></tr>
    </table>
  </div>

  <!-- Salesforce pitch numbers -->
  <div class="section">
    <div class="section-title">What Salesforce Showed Them</div>
    <table class="rows" role="presentation">
      <tr><td class="lbl">Current Monthly Labor Cost</td><td class="val yellow">${fmt(results.currentLaborCost)}/mo</td></tr>
      <tr><td class="lbl">Agentforce License Cost</td><td class="val yellow">${fmt(results.agentforceCost)}/mo</td></tr>
      <tr><td class="lbl">Stated Monthly Savings</td><td class="val ${results.automationSavings >= 0 ? 'green' : 'red'}">${fmt(results.automationSavings)}/mo</td></tr>
      <tr><td class="lbl">Stated ROI</td><td class="val ${results.roi >= 0 ? 'green' : 'red'}">${results.roi.toFixed(0)}%</td></tr>
    </table>
  </div>

  <!-- Real cost shock -->
  <div class="section">
    <div class="section-title">&#9888; Real Cost Shock Numbers</div>
    <table class="rows" role="presentation">
      <tr><td class="lbl">Implementation Amortized</td><td class="val red">+${fmt(40000 / 12)}/mo</td></tr>
      <tr><td class="lbl">Ongoing Admin &amp; Config (30%)</td><td class="val red">+${fmt(results.agentforceCost * 0.3)}/mo</td></tr>
      <tr><td class="lbl">Total Hidden Costs</td><td class="val red">+${fmt(results.hiddenCosts)}/mo</td></tr>
      <tr><td class="lbl">Real Agentforce Total Cost</td><td class="val red">${fmt(results.realAgentforceCost)}/mo</td></tr>
      <tr><td class="lbl">Real ROI</td><td class="val ${results.realROI >= 0 ? 'green' : 'red'}">${results.realROI.toFixed(0)}%</td></tr>
      <tr><td class="lbl">Implementation Payback Period</td><td class="val">${results.paybackMonths > 99 ? 'Does not pay back' : results.paybackMonths.toFixed(1) + ' months'}</td></tr>
    </table>
  </div>

  <p class="footer">Gated Enterprise &middot; <a href="https://gatedenterprise.com" style="color:#60a5fa;">gatedenterprise.com</a></p>
</div>
</body>
</html>
    `;

    await resend.emails.send({
      from: 'Gated Enterprise <noreply@mail.gatedenterprise.com>',
      to: email,
      subject: `Your Agentforce Cost Shock Report — Real ROI: ${results.realROI.toFixed(0)}%`,
      html: submitterHtml,
    });

    await resend.emails.send({
      from: 'Agentforce Calculator <noreply@mail.gatedenterprise.com>',
      to: 'info@gatedenterprise.com',
      subject: `🎯 New Lead: ${name} @ ${company} — Real ROI ${results.realROI.toFixed(0)}%`,
      html: internalHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
