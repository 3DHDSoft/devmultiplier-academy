import { describe, it, expect } from '@jest/globals';
import * as z from 'zod';

/**
 * Unit tests for authentication validation schemas
 */
describe('Authentication Schemas', () => {
  const signInSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  });

  describe('email validation', () => {
    it('should accept valid email', () => {
      const result = signInSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const result = signInSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const result = signInSchema.safeParse({
        email: '',
        password: 'password123',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('password validation', () => {
    it('should accept valid password (8+ characters)', () => {
      const result = signInSchema.safeParse({
        email: 'user@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('should reject short password (< 8 characters)', () => {
      const result = signInSchema.safeParse({
        email: 'user@example.com',
        password: 'pass123',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = signInSchema.safeParse({
        email: 'user@example.com',
        password: '',
      });
      expect(result.success).toBe(false);
    });
  });
});
