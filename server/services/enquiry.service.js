import enquiryRepository from '../repositories/enquiry.repository.js';
import { sendEnquiryNotification } from '../utils/email.js';
import { AppError } from '../middlewares/error.middleware.js';
import { MESSAGES } from '../constants/messages.js';

export class EnquiryService {
  async getAll(params) {
    return enquiryRepository.findAll(params);
  }

  async getById(id) {
    const enquiry = await enquiryRepository.findById(id, false);
    if (!enquiry) throw new AppError(MESSAGES.NOT_FOUND, 404);
    return enquiry;
  }

  async create(data) {
    let variantDetailsJson = null;
    if (data.variant_details) {
      variantDetailsJson = typeof data.variant_details === 'object'
        ? JSON.stringify(data.variant_details)
        : String(data.variant_details);
    }

    const payload = {
      source_type: data.source_type || 'CONTACT',
      reference_id: data.reference_id || null,
      customer_name: data.customer_name,
      company_name: data.company_name || null,
      email: data.email,
      phone: data.phone || null,
      city: data.city || null,
      country: data.country || null,
      subject: data.subject || null,
      requirement: data.requirement,
      variant_details: variantDetailsJson,
      attachment: data.attachment || null,
      status: 'NEW',
    };

    const enquiry = await enquiryRepository.create(payload);
    // Attach parsed variant_details object for email template rendering
    enquiry.variant_details = data.variant_details;

    // Send email notification asynchronously in background for instant HTTP response (<100ms)
    sendEnquiryNotification(enquiry).catch((err) => {
      console.error('Enquiry notification email dispatch error:', err.message || err);
    });

    return enquiry;
  }

  async updateStatus(id, status, remarks = null) {
    await this.getById(id);
    const updatePayload = { status };
    if (remarks !== null) updatePayload.remarks = remarks;
    return enquiryRepository.update(id, updatePayload);
  }

  async delete(id) {
    await this.getById(id);
    return enquiryRepository.delete(id, false);
  }

  async getStats() {
    return enquiryRepository.getStatusStats();
  }
}

export default new EnquiryService();
