/**
 * Fábrica de Provedores de Rastreamento.
 * Baseada em uma configuração ou parâmetro, retorna o provedor adequado.
 */
import { ITrackingProvider } from './tracking-provider.interface';
import { CarriersTrackingProvider } from './carriers-tracking.provider';

export class TrackingProviderFactory {
  /**
   * Retorna o provedor de rastreamento com base no tipo.
   * Atualmente, apenas o "Carriers" está implementado.
   * @param providerType Tipo do provedor (ex.: "carriers").
   */
  static getProvider(providerType: string): ITrackingProvider {
    switch (providerType.toLowerCase()) {
      case 'carriers':
        return new CarriersTrackingProvider();
      // Aqui você pode adicionar outros casos para provedores adicionais.
      default:
        throw new Error(`Provedor de rastreamento desconhecido: ${providerType}`);
    }
  }
}
