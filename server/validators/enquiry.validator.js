import { z } from 'zod';
import { sendError } from '../utils/response.js';

const enquirySchema = z.object({
  source_type: z.enum(['CONTACT', 'PRODUCT', 'SERVICE', 'INDUSTRY']).optional(),
  reference_id: z.number().or(z.string().transform(Number)).optional(),
  customer_name: z.string().min(2, 'Name must be at least 2 characters').max(150),
  company_name: z.string().max(200).optional(),
  email: z.string().email('Invalid email address format').max(150),
  phone: z.string().max(30).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  subject: z.string().max(255).optional(),
  requirement: z.string().min(5, 'Requirement details must be at least 5 characters'),
  attachment: z.string().max(500).optional(),
});

export function validateEnquiry(req, res, next) {
  const result = enquirySchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => e.message);
    return sendError(res, 'Validation failed.', 400, formattedErrors);
  }
  next();
}
