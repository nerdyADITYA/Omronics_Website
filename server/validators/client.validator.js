import { z } from 'zod';
import { sendError } from '../utils/response.js';

const clientSchema = z.object({
  client_name: z.string().min(2, 'Client name must be at least 2 characters').max(255),
  logo_url: z.string().min(1, 'Logo URL is required'),
  website_url: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  sort_order: z.number().or(z.string().transform(Number)).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).passthrough();

export function validateClient(req, res, next) {
  const result = clientSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return sendError(res, 'Validation failed.', 400, formattedErrors);
  }
  next();
}
