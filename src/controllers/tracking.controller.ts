/**
 * Controller de Rastreamento
 * Este módulo define a rota HTTP para consultas on-demand de rastreamento.
 * Ele recebe um código de rastreamento via query string, consulta a API externa,
 * realiza o upsert no MongoDB e retorna o documento armazenado.
 */
import { Router, Request, Response, NextFunction } from 'express';
import {
  getTrackingInfo,
  upsertTrackingData,
} from '../services/tracking.service';

export const trackingRouter = Router();

/**
 * GET /tracking?code=<trackingCode>
 * Consulta a API de rastreamento e armazena/atualiza os dados no MongoDB.
 * Retorna o documento de rastreamento armazenado.
 */
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
      // Consulta a API e realiza o upsert no MongoDB
      const carriersData = await getTrackingInfo(code);
      const storedData = await upsertTrackingData(carriersData);
      res.json(storedData);
    } catch (error: any) {
      next(error);
    }
  },
);
