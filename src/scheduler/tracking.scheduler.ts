/**
 * Scheduler de Rastreamento
 * Este módulo executa periodicamente (a cada minuto) a atualização dos rastreamentos pendentes.
 * Para cada rastreamento que não tenha um evento com idStatus 101 (entregue), ele consulta a API,
 * atualiza o MongoDB e, se houver alteração no status, publica um evento no Kafka.
 */
import cron from 'node-cron';
import {
  getTrackingInfo,
  upsertTrackingData,
} from '../services/tracking.service';
import { publishTrackingEvent } from '../services/kafka.producer';
import TrackingModel, { ITracking } from '../models/tracking.model';
import logger from '../utils/logger';

/**
 * Função auxiliar para obter o evento mais recente baseado no timestamp.
 * @param events - Array de eventos.
 * @returns O evento com o maior timestamp ou null se não houver eventos.
 */
function getLatestEvent(
  events: { timestamp: Date; status: string; idStatus: number }[],
) {
  if (!events || events.length === 0) return null;
  return events.reduce((latest, evt) =>
    latest.timestamp.getTime() > evt.timestamp.getTime() ? latest : evt,
  );
}

/**
 * Processa os rastreamentos pendentes.
 * - Busca rastreamentos que não tenham nenhum evento com idStatus 101.
 * - Consulta a API para obter dados atualizados.
 * - Compara o último evento armazenado com o novo; se houver alteração, publica no Kafka.
 */
async function processTracking() {
  try {
    // Seleciona documentos sem nenhum evento com idStatus 101 (entregue)
    const pendingTrackings = await TrackingModel.find({
      events: { $not: { $elemMatch: { idStatus: 101 } } },
    });
    if (pendingTrackings.length === 0) {
      logger.info('Nenhum rastreamento pendente para atualizacao.');
      return;
    }
    for (const doc of pendingTrackings) {
      const code = doc.trackingCode;
      logger.info(`Processando rastreamento para ${code}`);

      // Consulta os dados atuais da API para este rastreamento
      const carriersData = await getTrackingInfo(code);

      // Extrai os novos eventos do resultado da API
      const newEvents = carriersData.Eventos.map((evt) => {
        const [datePart, timePart] = evt.Data.split(' ');
        const [day, month, year] = datePart.split('-');
        const isoString = `${year}-${month}-${day}T${timePart}`;
        return {
          timestamp: new Date(isoString),
          status: evt.Descricao,
          idStatus: evt.idStatus,
        };
      });
      // Ordena os eventos novos para identificar o mais recente
      newEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const newLatest = newEvents[0];

      // Ordena os eventos armazenados para identificar o mais recente
      const storedEvents = [...doc.events];
      storedEvents.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );
      const storedLatest = storedEvents[0];

      // Verifica se houve mudança no status ou idStatus do último evento
      let hasChanged = false;
      if (!storedLatest) {
        hasChanged = true;
      } else if (
        storedLatest.status !== newLatest.status ||
        storedLatest.idStatus !== newLatest.idStatus
      ) {
        hasChanged = true;
      }

      // Atualiza o documento com os dados mais recentes
      const updatedData = await upsertTrackingData(carriersData);

      // Se houver alteração, publica um evento no Kafka
      if (hasChanged) {
        logger.info(
          `Status alterado para ${newLatest.status} no rastreamento ${code}, publicando evento no Kafka.`,
        );
        await publishTrackingEvent(updatedData);
        return;
      }
      logger.info(`Nenhuma alteração no status para ${code}.`);
    }
  } catch (error: any) {
    logger.error(`Erro no processamento de rastreamentos: ${error.message}`);
  }
}

// Agenda a tarefa para ser executada a cada minuto
cron.schedule('* * * * *', () => {
  logger.info('Executando tarefa agendada de rastreamento');
  processTracking();
});
