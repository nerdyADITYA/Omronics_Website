import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '587', 10);
    const isSecure = process.env.EMAIL_SECURE !== undefined 
      ? process.env.EMAIL_SECURE === 'true' 
      : port === 465;

    console.log(`[SMTP INIT] Initializing Nodemailer for ${host}:${port} (secure: ${isSecure})...`);

    const transportConfig = {
      host: host,
      port: port,
      secure: isSecure,
      family: 4,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, '') : '',
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

    if (host.includes('gmail.com') || process.env.EMAIL_SERVICE === 'gmail') {
      transportConfig.service = 'gmail';
    }

    transporter = nodemailer.createTransport(transportConfig);
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

  let variant = null;
  if (enquiry.variant_details) {
    if (typeof enquiry.variant_details === 'string') {
      try {
        variant = JSON.parse(enquiry.variant_details);
      } catch (e) {
        variant = null;
      }
    } else if (typeof enquiry.variant_details === 'object') {
      variant = enquiry.variant_details;
    }
  }

  let variantHtml = '';
  if (variant && (variant.part_code || variant.product_name)) {
    variantHtml = `
      <div style="margin: 16px 0; padding: 16px; background-color: #f0f9ff; border: 1px solid #b9e6fe; border-radius: 8px; font-family: Arial, sans-serif;">
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #0284c7; margin-bottom: 8px;">
          Requested Part Code Spec Breakdown
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #0f172a;">
          ${variant.product_name ? `<tr><td style="padding: 4px 0; color: #64748b; width: 150px;">Product Name:</td><td style="padding: 4px 0; font-weight: bold; color: #0369a1;">${variant.product_name}</td></tr>` : ''}
          ${variant.part_code ? `<tr><td style="padding: 4px 0; color: #64748b;">Selected Part Code:</td><td style="padding: 4px 0; font-family: monospace; font-weight: bold; color: #0284c7;">${variant.part_code}</td></tr>` : ''}
          ${variant.frame_size ? `<tr><td style="padding: 4px 0; color: #64748b;">Frame Size:</td><td style="padding: 4px 0; font-weight: bold;">${variant.frame_size}</td></tr>` : ''}
          ${variant.motor_type ? `<tr><td style="padding: 4px 0; color: #64748b;">Motor / Power Spec:</td><td style="padding: 4px 0; font-weight: bold;">${variant.motor_type}</td></tr>` : ''}
          ${variant.cable_dimension ? `<tr><td style="padding: 4px 0; color: #64748b;">Cable Dimensions:</td><td style="padding: 4px 0; font-weight: bold;">${variant.cable_dimension}</td></tr>` : ''}
          ${variant.connectors ? `<tr><td style="padding: 4px 0; color: #64748b;">Connectors:</td><td style="padding: 4px 0; font-weight: bold;">${variant.connectors}</td></tr>` : ''}
          ${variant.default_length ? `<tr><td style="padding: 4px 0; color: #64748b;">Cable Length:</td><td style="padding: 4px 0; font-weight: bold;">${variant.default_length}m</td></tr>` : ''}
          ${variant.variant_price ? `<tr><td style="padding: 4px 0; color: #64748b;">Variant Unit Price:</td><td style="padding: 4px 0; font-weight: bold; color: #15803d; font-size: 15px;">₹${Number(variant.variant_price).toLocaleString('en-IN')} / Piece</td></tr>` : ''}
        </table>
      </div>
    `;
  }

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
        
        ${variantHtml}

        <div style="background-color: #f8fafc; border-left: 4px solid #0066cc; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0; font-weight: bold; color: #1e293b;">Submitted Requirement / Message:</p>
          <p style="margin: 0; color: #475569;">${enquiry.requirement}</p>
        </div>
        <p>If you have any urgent inquiries, please feel free to call our engineering support line at <strong>+91 98765 43210</strong>.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">Omronics Motions and Control Pvt Ltd &bull; Plot 42, Sector 18, Gurugram, Haryana</p>
      </div>
    </div>
  `;

  const adminSubject = `🚨 New Quote Enquiry ${variant && variant.part_code ? `[Part Code: ${variant.part_code}]` : `[${enquiry.source_type}]`}: ${enquiry.customer_name}`;
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; color: #333; line-height: 1.6;">
      <div style="background-color: #113F67; padding: 18px; border-radius: 8px 8px 0 0; text-align: center;">
        <h2 style="color: #ffffff; margin: 0; font-size: 20px;">🚨 New Quote Enquiry Received</h2>
      </div>
      <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; background-color: #ffffff;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px;">
          <tr><td style="padding: 6px 0; color: #64748b; width: 140px; font-weight: bold;">Customer Name:</td><td style="padding: 6px 0; font-weight: bold; color: #113F67;">${enquiry.customer_name}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b; font-weight: bold;">Company Name:</td><td style="padding: 6px 0;">${enquiry.company_name || 'N/A'}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b; font-weight: bold;">Email Address:</td><td style="padding: 6px 0;"><a href="mailto:${enquiry.email}" style="color: #226597; font-weight: bold;">${enquiry.email}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #64748b; font-weight: bold;">Phone Number:</td><td style="padding: 6px 0;">${enquiry.phone || 'N/A'}</td></tr>
          <tr><td style="padding: 6px 0; color: #64748b; font-weight: bold;">Location / City:</td><td style="padding: 6px 0;">${enquiry.city || 'N/A'}</td></tr>
        </table>

        ${variantHtml}

        <p style="font-weight: bold; color: #113F67; margin-bottom: 6px;">Customer Notes / Technical Requirement:</p>
        <blockquote style="background-color: #f8fafc; padding: 14px; border-left: 4px solid #226597; margin: 0; font-size: 13px; color: #334155; border-radius: 4px;">
          ${enquiry.requirement}
        </blockquote>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">Logged via Website Lead System at ${new Date().toLocaleString()}</p>
      </div>
    </div>
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
