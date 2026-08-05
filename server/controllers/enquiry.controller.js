import enquiryService from '../services/enquiry.service.js';
import { testDiagnosticEmail } from '../utils/email.js';
import { getPagination } from '../utils/pagination.js';
import { sendPaginated, sendSuccess } from '../utils/response.js';

export class EnquiryController {
  async getAll(req, res, next) {
    try {
      const pagination = getPagination(req.query);
      const status = req.query.status || null;
      const sourceType = req.query.source_type || null;

      const result = await enquiryService.getAll({
        ...pagination,
        status,
        sourceType,
      });

      return sendPaginated(res, result.data, result.pagination, 'Enquiries retrieved successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getById(req, res, next) {
    try {
      const enquiry = await enquiryService.getById(req.params.id);
      return sendSuccess(res, enquiry, 'Enquiry details retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async create(req, res, next) {
    try {
      const enquiry = await enquiryService.create(req.body);
      return sendSuccess(res, enquiry, 'Thank you! Your enquiry has been submitted successfully.', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const { status, remarks } = req.body;
      const enquiry = await enquiryService.updateStatus(req.params.id, status, remarks);
      return sendSuccess(res, enquiry, 'Enquiry status updated successfully.');
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      await enquiryService.delete(req.params.id);
      return sendSuccess(res, {}, 'Enquiry deleted successfully.');
    } catch (err) {
      next(err);
    }
  }

  async getStats(req, res, next) {
    try {
      const stats = await enquiryService.getStats();
      return sendSuccess(res, stats, 'Enquiry statistics retrieved.');
    } catch (err) {
      next(err);
    }
  }

  async testEmail(req, res, next) {
    try {
      const toEmail = req.query.to || process.env.EMAIL_USERNAME;
      const result = await testDiagnosticEmail(toEmail);
      return sendSuccess(res, result, 'Email diagnostic test executed.');
    } catch (err) {
      next(err);
    }
  }
}

export default new EnquiryController();
