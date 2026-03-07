import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { MedBedController } from '../controllers/medbed.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validation.middleware.js';
import { asyncHandler } from '../utils/errors.js';

const router = Router();
const controller = new MedBedController();

const createBookingSchema = z.object({
  medBedId: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  paymentIntentId: z.string().startsWith('pi_').optional(),
});

// Public routes
router.get(
  '/',
  asyncHandler((req: Request, res: Response) => controller.getAllMedBeds(req, res))
);

// Protected routes
router.post(
  '/bookings',
  authenticate,
  validateBody(createBookingSchema),
  asyncHandler((req: Request, res: Response) => controller.createBooking(req, res))
);
router.get(
  '/bookings',
  authenticate,
  asyncHandler((req: Request, res: Response) => controller.getUserBookings(req, res))
);
router.post(
  '/bookings/:id/cancel',
  authenticate,
  asyncHandler((req: Request, res: Response) => controller.cancelBooking(req, res))
);

export default router;
