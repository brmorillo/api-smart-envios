/**
 * Kafka Producer
 * Gerencia a conexão com o Kafka e a publicação de eventos de rastreamento.
 */
import { Kafka } from 'kafkajs';
import { config } from '../config/config';

const kafka = new Kafka({
  clientId: 'tracking-service',
  brokers: [config.kafkaBroker],
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
 * @param trackingData - Dados de rastreamento a serem enviados.
 */
export async function publishTrackingEvent(trackingData: any) {
  await producer.send({
    topic: config.kafkaTopic,
    messages: [
      {
        key: trackingData.trackingCode,
        value: JSON.stringify(trackingData),
      },
    ],
  });
}
