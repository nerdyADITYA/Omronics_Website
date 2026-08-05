import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    const isGmail =
      (process.env.EMAIL_HOST || '').toLowerCase().includes('gmail') ||
      (process.env.EMAIL_USERNAME || '').toLowerCase().includes('gmail');

    console.log(`\n======================================================`);
    console.log(`[SMTP STEP 1] Initializing Nodemailer Transporter`);
    console.log(`   - HOST: "smtp.gmail.com"`);
    console.log(`   - PORT: 465 (Implicit SSL/TLS)`);
    console.log(`   - USER: "${process.env.EMAIL_USERNAME || 'NOT_SET'}"`);
    console.log(`   - IPv4 Forced: family 4`);
    console.log(`======================================================\n`);

    // Force direct SSL on Port 465 (NOT port 587 STARTTLS which is blocked on Render free tier)
    transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Direct SSL/TLS
      family: 4, // Force IPv4
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

/**
 * Actively verify SMTP connection
 */
export async function verifySmtpConnection() {
  try {
    console.log(`[SMTP STEP 2] Verifying Transporter Connection on Port 465 (SSL)...`);
    const t = getTransporter();
    await t.verify();
    console.log(`[SMTP STEP 2 SUCCESS] ✅ Transporter connection verified on Port 465!`);
    return { success: true, message: 'SMTP Transporter verified successfully.' };
  } catch (err) {
    console.error(`[SMTP STEP 2 ERROR] ❌ SMTP Verification Failed:`, err.message || err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Send email via Resend / HTTP API if configured
 */
async function sendViaResendHttp(to, subject, html) {
  if (!process.env.RESEND_API_KEY) return null;
  try {
    console.log(`[HTTP EMAIL] Attempting dispatch via Resend HTTPS API to: "${to}"`);
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Omronics Automation <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`[HTTP EMAIL SUCCESS] ✅ Email sent via Resend API: ${data.id}`);
      return { success: true, messageId: data.id, response: '200 OK via Resend HTTPS' };
    }
    console.error(`[HTTP EMAIL ERROR] Resend API returned error:`, data);
    return { success: false, error: JSON.stringify(data) };
  } catch (err) {
    console.error(`[HTTP EMAIL ERROR] Resend fetch error:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send email notification for new customer enquiry
 * Sends both Admin Alert & Customer Confirmation Receipt
 * @param {object} enquiry - Enquiry data object
 */
export async function sendEnquiryNotification(enquiry) {
  const username = process.env.EMAIL_USERNAME;
  const password = process.env.EMAIL_PASSWORD;

  console.log(`\n------------------------------------------------------`);
  console.log(`[EMAIL DISPATCH START] Processing Enquiry #${enquiry.id || 'N/A'} for "${enquiry.customer_name}" (${enquiry.email})`);

  // Check Resend HTTP API first if provided
  if (process.env.RESEND_API_KEY) {
    console.log(`[EMAIL ROUTE] Using Resend HTTPS API (Port 443)...`);
    const custRes = await sendViaResendHttp(
      enquiry.email,
      `Thank you for contacting Omronics - [Enquiry #${enquiry.id || 'N/A'}]`,
      `<p>Dear <strong>${enquiry.customer_name}</strong>,</p><p>Thank you for reaching out to Omronics Automation. We have received your technical requirement.</p>`
    );
    const adminRes = await sendViaResendHttp(
      username || 'adikadia05@gmail.com',
      `🚨 New Lead Enquiry: ${enquiry.subject || 'Website Enquiry'}`,
      `<p>New Enquiry from ${enquiry.customer_name} (${enquiry.email}): ${enquiry.requirement}</p>`
    );
    return { customer: custRes, admin: adminRes };
  }

  if (!username || !password) {
    console.warn(`[EMAIL WARN] ⚠️ Missing EMAIL_USERNAME or EMAIL_PASSWORD. Skipping email dispatch.`);
    return { success: false, reason: 'Credentials missing' };
  }

  const transporterInstance = getTransporter();
  const fromHeader = `"Omronics Industrial Automation" <${username}>`;

  // Try verifying connection
  const verifyRes = await verifySmtpConnection();
  if (!verifyRes.success) {
    console.warn(`[SMTP WARN] SMTP Port 465 verification timed out or was blocked by host firewall: ${verifyRes.error}`);
  }

  const results = { customer: null, admin: null };

  // 1. Send Customer Confirmation Copy
  if (enquiry.email) {
    console.log(`[EMAIL STEP 3] Preparing Customer Confirmation Email to: "${enquiry.email}"`);
    const customerMailOptions = {
      from: fromHeader,
      to: enquiry.email,
      subject: `Thank you for contacting Omronics - [Enquiry #${enquiry.id || 'N/A'}]`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <div style="background-color: #0b1329; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: #38bdf8; margin: 0; font-size: 24px;">Omronics Industrial Automation</h1>
          </div>
          <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #0f172a; margin-top: 0;">Enquiry Received</h2>
            <p>Dear <strong>${enquiry.customer_name}</strong>,</p>
            <p>Thank you for reaching out to Omronics Automation. We have received your technical requirement and an application engineer will review your specs and respond within 24 business hours.</p>
            <div style="background-color: #f8fafc; border-left: 4px solid #0066cc; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Submitted Requirement Details:</p>
              <p style="margin: 0; color: #475569;">${enquiry.requirement}</p>
            </div>
            <p>If you have any urgent inquiries, please feel free to call our engineering support line at <strong>+91 98765 43210</strong>.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">Omronics Motions and Control Pvt Ltd &bull; Plot 42, Sector 18, Gurugram, Haryana</p>
          </div>
        </div>
      `,
    };

    try {
      console.log(`[EMAIL STEP 4] Sending Customer Email via Nodemailer Port 465 SSL...`);
      const info = await transporterInstance.sendMail(customerMailOptions);
      console.log(`[EMAIL STEP 4 SUCCESS] ✅ Customer Email Dispatched! MessageId: ${info.messageId}`);
      results.customer = { success: true, messageId: info.messageId, response: info.response };
    } catch (err) {
      console.error(`[EMAIL STEP 4 ERROR] ❌ Customer Email Failed:`, err.message || err);
      results.customer = { success: false, error: err.message || String(err) };
    }
  }

  // 2. Send Admin Alert Copy
  console.log(`[EMAIL STEP 5] Preparing Admin Lead Notification Email to: "${username}"`);
  const adminMailOptions = {
    from: fromHeader,
    to: username,
    subject: `🚨 New Lead Enquiry [${enquiry.source_type}]: ${enquiry.subject || 'Website Enquiry'}`,
    html: `
      <h2>New Customer Enquiry Received</h2>
      <p><strong>Source:</strong> ${enquiry.source_type}</p>
      <p><strong>Customer Name:</strong> ${enquiry.customer_name}</p>
      <p><strong>Company:</strong> ${enquiry.company_name || 'N/A'}</p>
      <p><strong>Email:</strong> ${enquiry.email}</p>
      <p><strong>Phone:</strong> ${enquiry.phone || 'N/A'}</p>
      <p><strong>City / Country:</strong> ${enquiry.city || ''} ${enquiry.country || ''}</p>
      <p><strong>Requirement Details:</strong></p>
      <blockquote style="background:#f4f4f4; padding:12px; border-left:4px solid #0066cc;">
        ${enquiry.requirement}
      </blockquote>
      <p><small>Logged at ${new Date().toLocaleString()}</small></p>
    `,
  };

  try {
    console.log(`[EMAIL STEP 6] Sending Admin Email via Nodemailer Port 465 SSL...`);
    const info = await transporterInstance.sendMail(adminMailOptions);
    console.log(`[EMAIL STEP 6 SUCCESS] ✅ Admin Email Dispatched! MessageId: ${info.messageId}`);
    results.admin = { success: true, messageId: info.messageId, response: info.response };
  } catch (err) {
    console.error(`[EMAIL STEP 6 ERROR] ❌ Admin Email Failed:`, err.message || err);
    results.admin = { success: false, error: err.message || String(err) };
  }

  console.log(`[EMAIL DISPATCH COMPLETE] Finished processing Enquiry #${enquiry.id || 'N/A'}\n------------------------------------------------------\n`);
  return results;
}

/**
 * Diagnostic test email trigger
 */
export async function testDiagnosticEmail(toEmail) {
  const verifyRes = await verifySmtpConnection();

  const testEnquiry = {
    id: 999,
    source_type: 'DIAGNOSTIC_TEST',
    customer_name: 'Omronics Diagnostic System',
    email: toEmail || process.env.EMAIL_USERNAME,
    requirement: 'This is a live diagnostic email sent from the Omronics backend server.',
  };

  const dispatchResults = await sendEnquiryNotification(testEnquiry);
  return {
    success: true,
    verify: verifyRes,
    dispatch: dispatchResults,
  };
}
