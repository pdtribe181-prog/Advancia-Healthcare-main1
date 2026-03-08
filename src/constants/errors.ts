/**
 * Shared error message constants to avoid hardcoded string duplication.
 * Use with AppError factory methods, e.g. `throw AppError.notFound(ERRORS.PROVIDER_PROFILE)`
 * AppError.notFound(resource) produces: `${resource} not found`
 */
export const ERRORS = {
  PROVIDER_PROFILE: 'Provider profile',
  APPOINTMENT: 'Appointment',
  SERVICE: 'Service',
} as const;
