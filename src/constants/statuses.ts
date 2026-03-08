/**
 * Shared status string constants used across routes and controllers.
 * Eliminates hardcoded string duplication and enables safe refactoring.
 */

export const USER_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

export const APPOINTMENT_STATUS = {
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  COMPLETED: 'completed',
} as const;
