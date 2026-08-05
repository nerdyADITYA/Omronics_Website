import dotenv from 'dotenv';
dotenv.config();

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'omronics_production_super_secret_jwt_key_2026_industrial_cms',
  expiresIn: process.env.JWT_EXPIRES_IN || '12h',
  algorithm: 'HS256',
};
