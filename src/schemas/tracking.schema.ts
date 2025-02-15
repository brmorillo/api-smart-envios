/**
 * Schemas de Validação para a Resposta da API de Rastreamento
 * Utiliza a biblioteca Zod para validar e tipar os dados retornados pela API da transportadora.
 */
import { z } from 'zod';

// Schema para um evento individual retornado pela API
export const TrackingEventSchema = z.object({
  Data: z.string(),
  Status: z.string(),
  idStatus: z.number(),
  Descricao: z.string(),
});

// Schema para os dados de entrega retornados pela API
export const DadosEntregaSchema = z.object({
  Recebedor: z.string(),
  'Doc Recebedor': z.string(),
  Parentesco: z.string(),
  'Data Protocolo': z.string(),
});

// Schema para a resposta completa da API de rastreamento
export const CarriersTrackingResponseSchema = z.object({
  PedidoCliente: z.string(),
  ValorFrete: z.number(),
  idItemParceiro: z.number(),
  Cliente: z.string(),
  dtPrevista: z.string(),
  Destinatario: z.string(),
  codigoRastreio: z.string(),
  Url: z.string().url(),
  UrlProtocolo: z.string().url(),
  DadosEntrega: DadosEntregaSchema,
  Eventos: z.array(TrackingEventSchema),
});

// Tipo TypeScript derivado do schema da resposta da API
export type CarriersTrackingResponse = z.infer<
  typeof CarriersTrackingResponseSchema
>;
