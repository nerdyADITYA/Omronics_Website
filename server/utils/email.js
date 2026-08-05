import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    const isGmail =
      (process.env.EMAIL_HOST || '').toLowerCase().includes('gmail') ||
      (process.env.EMAIL_USERNAME || '').toLowerCase().includes('gmail');

    console.log(`\n======================================================`);
    console.log(`[SMTP STEP 1] Initializing Nodemailer Transporter`);
    console.log(`   - EMAIL_HOST: "${process.env.EMAIL_HOST || 'smtp.gmail.com'}"`);
    console.log(`   - EMAIL_PORT: "${process.env.EMAIL_PORT || '587'}"`);
    console.log(`   - EMAIL_USERNAME: "${process.env.EMAIL_USERNAME || 'NOT_SET'}"`);
    console.log(`   - EMAIL_PASSWORD: "${process.env.EMAIL_PASSWORD ? '****** (Set)' : 'NOT_SET'}"`);
    console.log(`   - Mode: ${isGmail ? 'Gmail Native Service (Port 465 SSL)' : 'Custom SMTP'}`);
    console.log(`======================================================\n`);

    if (isGmail) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    } else {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587', 10),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
  }
  return transporter;
}

/**
 * Actively verify SMTP connection
 */
export async function verifySmtpConnection() {
  try {
    console.log(`[SMTP STEP 2] Verifying Transporter Connection with SMTP Server...`);
    const t = getTransporter();
    await t.verify();
    console.log(`[SMTP STEP 2 SUCCESS] ✅ Transporter connection verified and ready!`);
    return { success: true, message: 'SMTP Transporter verified successfully.' };
  } catch (err) {
    console.error(`[SMTP STEP 2 ERROR] ❌ SMTP Verification Failed:`, err.message || err);
    return { success: false, error: err.message || String(err) };
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
  console.log(`[SMTP DISPATCH START] Processing Enquiry #${enquiry.id || 'N/A'} for "${enquiry.customer_name}" (${enquiry.email})`);

  if (!username || !password) {
    console.warn(`[SMTP WARN] ⚠️ Missing EMAIL_USERNAME or EMAIL_PASSWORD. Skipping email dispatch.`);
    return { success: false, reason: 'Credentials missing' };
  }

  const transporterInstance = getTransporter();
  const fromHeader = `"Omronics Industrial Automation" <${username}>`;

  // Verify connection first
  await verifySmtpConnection();

  const results = { customer: null, admin: null };

  // 1. Send Customer Confirmation Copy
  if (enquiry.email) {
    console.log(`[SMTP STEP 3] Preparing Customer Confirmation Email to: "${enquiry.email}"`);
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
      console.log(`[SMTP STEP 4] Sending Customer Email via Nodemailer...`);
      const info = await transporterInstance.sendMail(customerMailOptions);
      console.log(`[SMTP STEP 4 SUCCESS] ✅ Customer Email Dispatched!`);
      console.log(`   - MessageId: ${info.messageId}`);
      console.log(`   - Accepted: ${JSON.stringify(info.accepted)}`);
      console.log(`   - Rejected: ${JSON.stringify(info.rejected)}`);
      console.log(`   - Response: ${info.response}`);
      results.customer = { success: true, messageId: info.messageId, response: info.response };
    } catch (err) {
      console.error(`[SMTP STEP 4 ERROR] ❌ Customer Email Failed:`, err.message || err);
      console.error(err);
      results.customer = { success: false, error: err.message || String(err) };
    }
  }

  // 2. Send Admin Alert Copy
  console.log(`[SMTP STEP 5] Preparing Admin Lead Notification Email to: "${username}"`);
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
    console.log(`[SMTP STEP 6] Sending Admin Email via Nodemailer...`);
    const info = await transporterInstance.sendMail(adminMailOptions);
    console.log(`[SMTP STEP 6 SUCCESS] ✅ Admin Email Dispatched!`);
    console.log(`   - MessageId: ${info.messageId}`);
    console.log(`   - Accepted: ${JSON.stringify(info.accepted)}`);
    console.log(`   - Rejected: ${JSON.stringify(info.rejected)}`);
    console.log(`   - Response: ${info.response}`);
    results.admin = { success: true, messageId: info.messageId, response: info.response };
  } catch (err) {
    console.error(`[SMTP STEP 6 ERROR] ❌ Admin Email Failed:`, err.message || err);
    console.error(err);
    results.admin = { success: false, error: err.message || String(err) };
  }

  console.log(`[SMTP DISPATCH COMPLETE] Finished processing Enquiry #${enquiry.id || 'N/A'}\n------------------------------------------------------\n`);
  return results;
}

/**
 * Diagnostic test email trigger
 */
export async function testDiagnosticEmail(toEmail) {
  const verifyRes = await verifySmtpConnection();
  if (!verifyRes.success) {
    return { success: false, verify: verifyRes };
  }

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
