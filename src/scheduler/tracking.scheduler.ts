import cron from 'node-cron';
import {
  getTrackingInfo,
  upsertTrackingData,
} from '../services/tracking.service';
import { publishTrackingEvent } from '../services/kafka.producer';
import TrackingModel, { ITracking } from '../models/tracking.model';

/**
 * Função auxiliar para obter o evento mais recente (maior timestamp) de um array.
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
 * Função que realiza a consulta, atualização no MongoDB e publicação no Kafka.
 */
async function processTracking() {
  try {
    // Busca todos os rastreamentos que NÃO possuem nenhum evento com idStatus 101
    const pendingTrackings = await TrackingModel.find({
      events: { $not: { $elemMatch: { idStatus: 101 } } },
    });
    if (pendingTrackings.length === 0) {
      console.log('Nenhum rastreamento pendente para atualização.');
      return;
    }
    for (const doc of pendingTrackings) {
      const code = doc.trackingCode;
      console.log(`Processando rastreamento para ${code}`);

      // Consulta os dados atuais da API
      const carriersData = await getTrackingInfo(code);

      // Extraímos os eventos do novo resultado (já transformados) e do documento armazenado
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
      // Ordena os novos eventos por timestamp decrescente e pega o mais recente
      newEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const newLatest = newEvents[0];

      // Para o documento armazenado, assumimos que 'doc.events' já está salvo
      const storedEvents = [...doc.events];
      storedEvents.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
      );
      const storedLatest = storedEvents[0];

      let hasChanged = false;
      if (!storedLatest) {
        hasChanged = true;
      } else {
        // Se o status ou idStatus for diferente, há alteração
        if (
          storedLatest.status !== newLatest.status ||
          storedLatest.idStatus !== newLatest.idStatus
        ) {
          hasChanged = true;
        }
      }

      // Atualiza o documento no MongoDB (upsert)
      const updatedData = await upsertTrackingData(carriersData);

      if (hasChanged) {
        console.log(
          `Status alterado para ${newLatest.status} no rastreamento ${code}, publicando evento no Kafka.`,
        );
        await publishTrackingEvent(updatedData);
      } else {
        console.log(`Nenhuma alteração no status para ${code}.`);
      }
    }
  } catch (error: any) {
    console.error(`Erro no processamento de rastreamentos: ${error.message}`);
  }
}

// Agenda a tarefa para ser executada a cada minuto
cron.schedule('* * * * *', () => {
  console.log('Executando tarefa agendada de rastreamento');
  processTracking();
});
