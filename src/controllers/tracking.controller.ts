import { Router, Request, Response, NextFunction } from 'express';
import {
  getTrackingInfo,
  upsertTrackingData,
} from '../services/tracking.service';

export const trackingRouter = Router();

trackingRouter.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string') {
        res.status(400).json({
          error:
            'O código de rastreamento é obrigatório e deve ser uma string.',
        });
        return;
      }
      // Consulta a API e faz o upsert no MongoDB
      const carriersData = await getTrackingInfo(code);
      const storedData = await upsertTrackingData(carriersData);
      res.json(storedData);
    } catch (error: any) {
      next(error);
    }
  },
);
