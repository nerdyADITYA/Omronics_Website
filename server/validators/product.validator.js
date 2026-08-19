import { z } from 'zod';
import { sendError } from '../utils/response.js';

const booleanOrNumberOrString = z
  .boolean()
  .or(z.number().transform((v) => v === 1))
  .or(z.string().transform((v) => v === 'true' || v === '1' || v === 'true'))
  .nullable()
  .optional();

const stringOrUrlObject = z
  .string()
  .or(z.object({ url: z.string() }).transform((obj) => obj.url))
  .or(z.object({ document_url: z.string() }).transform((obj) => obj.document_url))
  .nullable()
  .optional();

const productSchema = z.object({
  category_id: z.number().or(z.string().transform(Number)),
  product_name: z.string().min(2, 'Product name must be at least 2 characters').max(255),
  slug: z.string().max(255).nullable().optional(),
  model_number: z.string().max(100).nullable().optional(),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  features: z.string().nullable().optional(),
  specifications: z.string().nullable().optional(),
  applications: z.string().nullable().optional(),
  thumbnail_image: stringOrUrlObject,
  datasheet_available: booleanOrNumberOrString,
  featured: booleanOrNumberOrString,
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  sort_order: z.number().or(z.string().transform(Number)).nullable().optional(),
  seo_title: z.string().max(255).nullable().optional(),
  seo_description: z.string().nullable().optional(),
  images: z.array(
    z.object({
      image_url: z.string(),
      alt_text: z.string().nullable().optional(),
      display_order: z.number().optional(),
    }).passthrough()
  ).nullable().optional(),
  documents: z.array(
    z.object({
      document_name: z.string(),
      document_url: z.string(),
      document_type: z.string().nullable().optional(),
      display_order: z.number().optional(),
    }).passthrough()
  ).nullable().optional(),
}).passthrough();

export function validateProduct(req, res, next) {
  const result = productSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return sendError(res, 'Validation failed.', 400, formattedErrors);
  }
  next();
}
