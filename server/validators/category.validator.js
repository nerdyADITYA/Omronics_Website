import { z } from 'zod';
import { sendError } from '../utils/response.js';

const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(150),
  slug: z.string().max(200).nullable().optional(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  banner_image: z.string().nullable().optional(),
  thumbnail_image: z.string().nullable().optional(),
  seo_title: z.string().max(255).nullable().optional(),
  seo_description: z.string().nullable().optional(),
  sort_order: z.number().or(z.string().transform(Number)).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).passthrough();

export function validateCategory(req, res, next) {
  const result = categorySchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return sendError(res, 'Validation failed.', 400, formattedErrors);
  }
  next();
}
