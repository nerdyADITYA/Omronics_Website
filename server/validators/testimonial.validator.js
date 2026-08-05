import { z } from 'zod';
import { sendError } from '../utils/response.js';

const testimonialSchema = z.object({
  customer_name: z.string().min(2, 'Customer name must be at least 2 characters').max(150),
  company_name: z.string().max(150).nullable().optional(),
  designation: z.string().max(150).nullable().optional(),
  photo: z.string().max(500).nullable().optional(),
  rating: z.number().min(1).max(5).or(z.string().transform(Number)).nullable().optional(),
  review: z.string().min(5, 'Review must be at least 5 characters'),
  display_order: z.number().or(z.string().transform(Number)).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).passthrough();

export function validateTestimonial(req, res, next) {
  const result = testimonialSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return sendError(res, 'Validation failed.', 400, formattedErrors);
  }
  next();
}
