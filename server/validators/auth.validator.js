import { z } from 'zod';
import { sendError } from '../utils/response.js';

const loginSchema = z.object({
  email: z.string().email('Invalid email address format').max(150),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain uppercase, lowercase, and a number'),
});

export function validateLogin(req, res, next) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => e.message);
    return sendError(res, 'Validation failed.', 400, formattedErrors);
  }
  next();
}

export function validateChangePassword(req, res, next) {
  const result = changePasswordSchema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.errors.map((e) => e.message);
    return sendError(res, 'Validation failed.', 400, formattedErrors);
  }
  next();
}
