import { Request, Response } from 'express';
import { MedBedService } from '../services/medbed.service.js';
import { requireUser } from '../utils/errors.js';

const medBedService = new MedBedService();

export class MedBedController {
  /**
   * Get all available MedBeds
   */
  getAllMedBeds = async (_req: Request, res: Response) => {
    const medBeds = await medBedService.getAllMedBeds();
    res.json(medBeds);
  };

  /**
   * Create a booking
   */
  createBooking = async (req: Request, res: Response) => {
    const { id: userId } = requireUser(req);
    const { medBedId, startTime, endTime } = req.body;
    const booking = await medBedService.createBooking(userId, medBedId, startTime, endTime);
    res.status(201).json(booking);
  };

  /**
   * Get user bookings
   */
  getUserBookings = async (req: Request, res: Response) => {
    const { id: userId } = requireUser(req);
    const bookings = await medBedService.getUserBookings(userId);
    res.json(bookings);
  };

  /**
   * Cancel booking
   */
  cancelBooking = async (req: Request, res: Response) => {
    const { id: userId } = requireUser(req);
    const id = String(req.params.id);
    const booking = await medBedService.cancelBooking(id, userId);
    res.json(booking);
  };
}
