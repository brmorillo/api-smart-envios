import { z } from 'zod';

export const TrackingEventSchema = z.object({
  Data: z.string(),
  Status: z.string(),
  idStatus: z.number(),
  Descricao: z.string(),
});

export const DadosEntregaSchema = z.object({
  Recebedor: z.string(),
  'Doc Recebedor': z.string(),
  Parentesco: z.string(),
  'Data Protocolo': z.string(),
});

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

export type CarriersTrackingResponse = z.infer<
  typeof CarriersTrackingResponseSchema
>;
