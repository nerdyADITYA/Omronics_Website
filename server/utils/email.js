import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    console.log(`[SMTP INIT] Initializing Nodemailer for local/custom SMTP...`);
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '465', 10),
      secure: true,
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return transporter;
}

/**
 * Dispatch email using Resend HTTPS API (Port 443)
 * 100% Unblocked on Render, AWS, Vercel & Netlify
 */
async function sendViaResend(to, subject, htmlContent) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  console.log(`[HTTPS EMAIL] 🚀 Dispatching via Resend API (Port 443) to: "${to}"...`);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        from: 'Omronics Industrial Automation <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[HTTPS EMAIL SUCCESS] ✅ Resend Email Delivered! Message ID: ${data.id}`);
      return { success: true, messageId: data.id, provider: 'Resend HTTPS' };
    } else {
      console.error(`[HTTPS EMAIL ERROR] ❌ Resend API Error:`, data);
      return { success: false, error: data.message || JSON.stringify(data), provider: 'Resend HTTPS' };
    }
  } catch (err) {
    console.error(`[HTTPS EMAIL ERROR] ❌ Resend Network Exception:`, err.message);
    return { success: false, error: err.message, provider: 'Resend HTTPS' };
  }
}

/**
 * Dispatch email using Brevo HTTPS API (Port 443)
 */
async function sendViaBrevo(to, subject, htmlContent) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return null;

  console.log(`[HTTPS EMAIL] 🚀 Dispatching via Brevo API (Port 443) to: "${to}"...`);
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey.trim(),
      },
      body: JSON.stringify({
        sender: { name: 'Omronics Industrial Automation', email: process.env.EMAIL_USERNAME || 'notifications@omronics.com' },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`[HTTPS EMAIL SUCCESS] ✅ Brevo Email Delivered! Message ID: ${data.messageId}`);
      return { success: true, messageId: data.messageId, provider: 'Brevo HTTPS' };
    } else {
      console.error(`[HTTPS EMAIL ERROR] ❌ Brevo API Error:`, data);
      return { success: false, error: JSON.stringify(data), provider: 'Brevo HTTPS' };
    }
  } catch (err) {
    console.error(`[HTTPS EMAIL ERROR] ❌ Brevo Network Exception:`, err.message);
    return { success: false, error: err.message, provider: 'Brevo HTTPS' };
  }
}

/**
 * Dispatch email via Nodemailer SMTP fallback
 */
async function sendViaNodemailer(to, subject, htmlContent) {
  const username = process.env.EMAIL_USERNAME;
  const password = process.env.EMAIL_PASSWORD;

  if (!username || !password) {
    console.warn(`[SMTP WARN] ⚠️ Missing EMAIL_USERNAME or EMAIL_PASSWORD. Skipping Nodemailer dispatch.`);
    return { success: false, error: 'SMTP credentials missing' };
  }

  const transporterInstance = getTransporter();
  const fromHeader = `"Omronics Industrial Automation" <${username}>`;

  try {
    console.log(`[SMTP EMAIL] Dispatching via Nodemailer SMTP to: "${to}"...`);
    const info = await transporterInstance.sendMail({
      from: fromHeader,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`[SMTP EMAIL SUCCESS] ✅ Nodemailer Email Delivered! Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId, provider: 'Nodemailer SMTP' };
  } catch (err) {
    console.error(`[SMTP EMAIL ERROR] ❌ Nodemailer Dispatch Failed:`, err.message || err);
    return { success: false, error: err.message || String(err), provider: 'Nodemailer SMTP' };
  }
}

/**
 * Universal multi-provider email dispatch entry point
 */
export async function sendEnquiryNotification(enquiry) {
  console.log(`\n======================================================`);
  console.log(`[EMAIL ENGINE START] Processing Enquiry #${enquiry.id || 'N/A'} for "${enquiry.customer_name}" (${enquiry.email})`);
  console.log(`======================================================`);

  const customerSubject = `Thank you for contacting Omronics - [Enquiry #${enquiry.id || 'N/A'}]`;
  const customerHtml = `
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
  `;

  const adminSubject = `🚨 New Lead Enquiry [${enquiry.source_type}]: ${enquiry.subject || 'Website Enquiry'}`;
  const adminHtml = `
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
  `;

  const adminRecipient = process.env.EMAIL_USERNAME || 'adikadia05@gmail.com';

  let customerResult = null;
  let adminResult = null;

  // Provider Priority: 1. Resend HTTPS API, 2. Brevo HTTPS API, 3. Nodemailer SMTP
  if (process.env.RESEND_API_KEY) {
    customerResult = await sendViaResend(enquiry.email, customerSubject, customerHtml);
    adminResult = await sendViaResend(adminRecipient, adminSubject, adminHtml);
  } else if (process.env.BREVO_API_KEY) {
    customerResult = await sendViaBrevo(enquiry.email, customerSubject, customerHtml);
    adminResult = await sendViaBrevo(adminRecipient, adminSubject, adminHtml);
  } else {
    customerResult = await sendViaNodemailer(enquiry.email, customerSubject, customerHtml);
    adminResult = await sendViaNodemailer(adminRecipient, adminSubject, adminHtml);
  }

  console.log(`[EMAIL ENGINE COMPLETE] Finished processing Enquiry #${enquiry.id || 'N/A'}\n`);
  return { customer: customerResult, admin: adminResult };
}

/**
 * Diagnostic test email trigger
 */
export async function testDiagnosticEmail(toEmail) {
  const testEnquiry = {
    id: 999,
    source_type: 'DIAGNOSTIC_TEST',
    customer_name: 'Omronics Diagnostic System',
    email: toEmail || process.env.EMAIL_USERNAME || 'adikadia05@gmail.com',
    requirement: 'This is a live diagnostic test email sent from the Omronics backend server.',
  };

  const dispatchResults = await sendEnquiryNotification(testEnquiry);
  return {
    success: true,
    dispatch: dispatchResults,
  };
}
