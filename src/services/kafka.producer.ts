/**
 * Kafka Producer
 * Este módulo gerencia a conexão com o Kafka e a publicação de eventos de rastreamento.
 */
import { Kafka } from 'kafkajs';

// Inicializa o cliente Kafka usando as configurações definidas nas variáveis de ambiente
const kafka = new Kafka({
  clientId: 'tracking-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

/**
 * Conecta o producer ao Kafka.
 */
export async function connectProducer() {
  await producer.connect();
}

/**
 * Desconecta o producer do Kafka.
 */
export async function disconnectProducer() {
  await producer.disconnect();
}

/**
 * Publica um evento de rastreamento atualizado no Kafka.
 * @param trackingData - Dados de rastreamento a serem enviados, convertidos para JSON.
 */
export async function publishTrackingEvent(trackingData: any) {
  const topic = process.env.KAFKA_TOPIC || 'tracking-events';
  await producer.send({
    topic,
    messages: [
      {
        key: trackingData.trackingCode, // Utiliza o código de rastreamento como chave
        value: JSON.stringify(trackingData), // Converte os dados para string JSON
      },
    ],
  });
}
