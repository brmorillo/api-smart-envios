/**
 * Provedor de rastreamento para a transportadora "Carriers".
 */
import axios from 'axios';
import { CarriersTrackingResponseSchema, CarriersTrackingResponse } from '../schemas/tracking.schema';
import { ITrackingProvider } from './tracking-provider.interface';
import { config } from '../config/config';

export class CarriersTrackingProvider implements ITrackingProvider {
  // URL base da API da transportadora, obtida da configuração centralizada
  private readonly baseUrl: string = `${config.apiUrlCarriers}/Tracking`;

  /**
   * Consulta a API da transportadora para obter os dados de rastreamento.
   * @param trackingCode Código de rastreamento do pedido.
   * @returns Dados de rastreamento validados.
   * @throws Erro se o token não estiver definido ou se a requisição falhar.
   */
  async getTrackingInfo(trackingCode: string): Promise<CarriersTrackingResponse> {
    const url = `${this.baseUrl}/${trackingCode}`;
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
}
