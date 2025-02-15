import axios from 'axios';
import {
  CarriersTrackingResponseSchema,
  CarriersTrackingResponse,
} from '../schemas/tracking.schema';
import TrackingModel, { ITracking } from '../models/tracking.model';
import { API_URL_CARRIERS } from '../constants/url.constant';

// URL base da API da transportadora
const API_URL = `${API_URL_CARRIERS}/Tracking`;

/**
 * Consulta a API da transportadora para obter os dados de rastreamento.
 * @param trackingCode Código de rastreamento.
 * @returns Dados de rastreamento validados.
 */
export async function getTrackingInfo(
  trackingCode: string,
): Promise<CarriersTrackingResponse> {
  const url = `${API_URL}/${trackingCode}`;
  const token = process.env.CARRIERS_API_TOKEN;
  if (!token) {
    throw new Error(
      'Token de autorização não definido nas variáveis de ambiente.',
    );
  }
  try {
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = CarriersTrackingResponseSchema.parse(response.data);
    return data;
  } catch (error: any) {
    throw new Error(`Erro ao consultar API de rastreamento: ${error.message}`);
  }
}

/**
 * Transforma a resposta da API para o formato de armazenamento no MongoDB.
 * @param carriersData Dados retornados pela API da transportadora.
 * @returns Objeto formatado para o modelo do MongoDB.
 */
function transformToTrackingDocument(
  carriersData: CarriersTrackingResponse,
): Partial<ITracking> {
  const trackingCode = carriersData.PedidoCliente;
  const carrier = 'Carriers';
  const events = carriersData.Eventos.map((evt) => {
    // Converte a data do formato "DD-MM-YYYY HH:mm:ss" para ISO
    const [datePart, timePart] = evt.Data.split(' ');
    const [day, month, year] = datePart.split('-');
    const isoString = `${year}-${month}-${day}T${timePart}`;
    return {
      timestamp: new Date(isoString),
      status: evt.Descricao,
      idStatus: evt.idStatus, // incluído para comparação
      location: '', // Não fornecido pela API
    };
  });
  return { trackingCode, carrier, events };
}

/**
 * Atualiza ou insere os dados de rastreamento no MongoDB.
 * @param carriersData Dados retornados pela API da transportadora.
 */
export async function upsertTrackingData(
  carriersData: CarriersTrackingResponse,
): Promise<ITracking> {
  const trackingDoc = transformToTrackingDocument(carriersData);
  const existing = await TrackingModel.findOne({
    trackingCode: trackingDoc.trackingCode,
  });
  if (existing) {
    existing.events = trackingDoc.events || [];
    return await existing.save();
  } else {
    const newDoc = new TrackingModel(trackingDoc);
    return await newDoc.save();
  }
}
