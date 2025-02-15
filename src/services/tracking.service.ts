/**
 * Serviço de Rastreamento
 * Utiliza o provedor de rastreamento definido pela fábrica para consultar a API,
 * validar a resposta e transformar os dados para armazenamento.
 */
import { TrackingProviderFactory } from './tracking-provider.factory';
import { CarriersTrackingResponse } from '../schemas/tracking.schema';
import TrackingModel, { ITracking } from '../models/tracking.model';

// Opção: definir o provedor via configuração (ou hardcode para "carriers")
const providerType = 'carriers';
// Obtém o provedor apropriado
const trackingProvider = TrackingProviderFactory.getProvider(providerType);

/**
 * Consulta a API de rastreamento usando o provedor selecionado.
 * @param trackingCode - Código de rastreamento do pedido.
 * @returns Dados de rastreamento validados.
 */
export async function getTrackingInfo(
  trackingCode: string,
): Promise<CarriersTrackingResponse> {
  return await trackingProvider.getTrackingInfo(trackingCode);
}

/**
 * Transforma os dados retornados pela API para o formato do MongoDB.
 * @param carriersData - Dados retornados pela API do provedor.
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
