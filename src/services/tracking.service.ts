/**
 * Serviço de Rastreamento
 * Fornece funções para consultar a API da transportadora, validar a resposta e transformá-la para
 * armazenamento no MongoDB.
 */
import axios from 'axios';
import {
  CarriersTrackingResponseSchema,
  CarriersTrackingResponse,
} from '../schemas/tracking.schema';
import TrackingModel, { ITracking } from '../models/tracking.model';
import { API_URL_CARRIERS } from '../constants/url.constant';

// Define a URL base para consultas à API da transportadora
const API_URL = `${API_URL_CARRIERS}/Tracking`;

/**
 * Consulta a API da transportadora para obter os dados de rastreamento.
 * @param trackingCode - Código de rastreamento do pedido.
 * @returns Dados de rastreamento validados conforme o schema.
 * @throws Erro se o token não estiver definido ou se a requisição falhar.
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
    // Realiza a chamada GET à API com o token de autorização
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Valida a resposta com o schema do Zod
    const data = CarriersTrackingResponseSchema.parse(response.data);
    return data;
  } catch (error: any) {
    throw new Error(`Erro ao consultar API de rastreamento: ${error.message}`);
  }
}

/**
 * Transforma os dados retornados pela API para o formato de armazenamento no MongoDB.
 * @param carriersData - Dados retornados pela API da transportadora.
 * @returns Objeto formatado para o modelo do MongoDB.
 */
function transformToTrackingDocument(
  carriersData: CarriersTrackingResponse,
): Partial<ITracking> {
  const trackingCode = carriersData.PedidoCliente;
  const carrier = 'Carriers';
  // Mapeia os eventos retornados, convertendo a data para formato ISO e incluindo idStatus
  const events = carriersData.Eventos.map((evt) => {
    const [datePart, timePart] = evt.Data.split(' ');
    const [day, month, year] = datePart.split('-');
    const isoString = `${year}-${month}-${day}T${timePart}`;
    return {
      timestamp: new Date(isoString),
      status: evt.Descricao,
      idStatus: evt.idStatus, // Importante para comparar alterações de status
      location: '', // Valor padrão, pois a API não fornece essa informação
    };
  });
  return { trackingCode, carrier, events };
}

/**
 * Realiza o upsert (atualiza ou insere) dos dados de rastreamento no MongoDB.
 * @param carriersData - Dados validados da API da transportadora.
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
    // Atualiza os eventos se o documento já existir
    existing.events = trackingDoc.events || [];
    return await existing.save();
  } else {
    // Cria um novo documento caso não exista
    const newDoc = new TrackingModel(trackingDoc);
    return await newDoc.save();
  }
}
