import { z } from 'zod';
import { sendError } from '../utils/response.js';

const industrySchema = z.object({
  industry_name: z.string().min(2, 'Industry name must be at least 2 characters').max(200),
  slug: z.string().max(200).nullable().optional(),
  description: z.string().nullable().optional(),
  banner_image: z.string().nullable().optional(),
  thumbnail_image: z.string().nullable().optional(),
  seo_title: z.string().max(255).nullable().optional(),
  seo_description: z.string().nullable().optional(),
  sort_order: z.number().or(z.string().transform(Number)).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).passthrough();

export function validateIndustry(req, res, next) {
  const result = industrySchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return sendError(res, 'Validation failed.', 400, formattedErrors);
  }
  next();
}
