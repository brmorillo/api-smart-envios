import { CarriersTrackingResponse } from '../schemas/tracking.schema';

/**
 * Interface para provedores de rastreamento.
 * Qualquer serviço de rastreamento deve implementar essa interface.
 */
export interface ITrackingProvider {
  /**
   * Consulta o serviço de rastreamento e retorna os dados validados.
   * @param trackingCode Código de rastreamento do pedido.
   * @returns Dados de rastreamento.
   */
  getTrackingInfo(trackingCode: string): Promise<CarriersTrackingResponse>;
}
