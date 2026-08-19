import { z } from 'zod';
import { sendError } from '../utils/response.js';

const stringOrUrlObject = z
  .string()
  .or(z.object({ url: z.string() }).transform((obj) => obj.url))
  .nullable()
  .optional();

const serviceSchema = z.object({
  service_name: z.string().min(2, 'Service name must be at least 2 characters').max(200),
  slug: z.string().max(200).nullable().optional(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  key_features: z.string().nullable().optional(),
  solutions_provided: z.string().nullable().optional(),
  banner_image: stringOrUrlObject,
  thumbnail_image: stringOrUrlObject,
  seo_title: z.string().max(255).nullable().optional(),
  seo_description: z.string().nullable().optional(),
  sort_order: z.number().or(z.string().transform(Number)).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).passthrough();

export function validateService(req, res, next) {
  const result = serviceSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return sendError(res, 'Validation failed.', 400, formattedErrors);
  }
  next();
}
