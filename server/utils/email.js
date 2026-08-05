import nodemailer from 'nodemailer';
import { logger } from './logger.js';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    console.log('📧 Creating Nodemailer SMTP Transporter for:', process.env.EMAIL_USERNAME);
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
  return transporter;
}

/**
 * Send email notification for new customer enquiry
 * Sends both Admin Alert & Customer Confirmation Receipt
 * @param {object} enquiry - Enquiry data object
 */
export async function sendEnquiryNotification(enquiry) {
  const username = process.env.EMAIL_USERNAME;
  const password = process.env.EMAIL_PASSWORD;

  if (!username || !password) {
    console.warn('⚠️ SMTP Warning: EMAIL_USERNAME or EMAIL_PASSWORD environment variable is missing on Render. Skipping email dispatch.');
    return;
  }

  const transporterInstance = getTransporter();
  // For Gmail SMTP, from header MUST match authenticated account (e.g. adikadia05@gmail.com)
  const fromHeader = `"Omronics Industrial Automation" <${username}>`;

  // 1. Send Customer Confirmation Copy (to the user who submitted the form)
  if (enquiry.email) {
    const customerMailOptions = {
      from: fromHeader,
      to: enquiry.email,
      subject: `Thank you for contacting Omronics - [Enquiry #${enquiry.id}]`,
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
      const customerInfo = await transporterInstance.sendMail(customerMailOptions);
      console.log(`✅ Customer confirmation email dispatched to ${enquiry.email}: ${customerInfo.messageId}`);
    } catch (err) {
      console.error(`❌ Failed to send customer confirmation email to ${enquiry.email}:`, err.message || err);
    }
  }

  // 2. Send Admin Alert Copy (to admin inbox)
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
    const adminInfo = await transporterInstance.sendMail(adminMailOptions);
    console.log(`✅ Admin notification email sent to ${username}: ${adminInfo.messageId}`);
  } catch (err) {
    console.error(`❌ Failed to send admin notification email to ${username}:`, err.message || err);
  }
}
