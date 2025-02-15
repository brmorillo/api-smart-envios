/**
 * Serviço de Rastreamento
 * Consulta a API da transportadora, valida a resposta e transforma os dados para armazenamento.
 */
import axios from 'axios';
import {
  CarriersTrackingResponseSchema,
  CarriersTrackingResponse,
} from '../schemas/tracking.schema';
import TrackingModel, { ITracking } from '../models/tracking.model';
import { config } from '../config/config';

// URL base da API da transportadora
const API_URL = `${config.apiUrlCarriers}/Tracking`;

/**
 * Consulta a API da transportadora para obter os dados de rastreamento.
 * @param trackingCode - Código de rastreamento do pedido.
 * @returns Dados de rastreamento validados.
 * @throws Erro se o token não estiver definido ou se a requisição falhar.
 */
export async function getTrackingInfo(
  trackingCode: string,
): Promise<CarriersTrackingResponse> {
  const url = `${API_URL}/${trackingCode}`;
  const token = config.carriersApiToken;
  if (!token) {
    throw new Error('Token de autorização não definido nas configurações.');
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
 * Transforma os dados retornados pela API para o formato do MongoDB.
 * @param carriersData - Dados da API da transportadora.
 * @returns Objeto formatado para o modelo de rastreamento.
 */
function transformToTrackingDocument(
  carriersData: CarriersTrackingResponse,
): Partial<ITracking> {
  const trackingCode = carriersData.PedidoCliente;
  const carrier = 'Carriers';
  const events = carriersData.Eventos.map((evt) => {
    const [datePart, timePart] = evt.Data.split(' ');
    const [day, month, year] = datePart.split('-');
    const isoString = `${year}-${month}-${day}T${timePart}`;
    return {
      timestamp: new Date(isoString),
      status: evt.Descricao,
      idStatus: evt.idStatus,
      location: '',
    };
  });
  return { trackingCode, carrier, events };
}

/**
 * Realiza o upsert (atualiza ou insere) dos dados de rastreamento no MongoDB.
 * @param carriersData - Dados validados da API.
 * @returns Documento atualizado ou criado no MongoDB.
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
