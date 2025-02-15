import cron from 'node-cron';
import {
  getTrackingInfo,
  upsertTrackingData,
} from '../services/tracking.service';
import { publishTrackingEvent } from '../services/kafka.producer';
import TrackingModel from '../models/tracking.model';

/**
 * Função que realiza a consulta, atualização no MongoDB e publicação no Kafka.
 */
async function processTracking() {
  try {
    // Busca todos os rastreamentos que não tenham nenhum evento com idStatus 101 (entrega realizada)
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
      const carriersData = await getTrackingInfo(code);
      const updatedData = await upsertTrackingData(carriersData);
      await publishTrackingEvent(updatedData);
      console.log(`Atualizado e publicado rastreamento para ${code}`);
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
