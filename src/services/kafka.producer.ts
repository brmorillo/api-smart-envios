import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'tracking-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const producer = kafka.producer();

export async function connectProducer() {
  await producer.connect();
}

export async function disconnectProducer() {
  await producer.disconnect();
}

/**
 * Publica um evento de rastreamento atualizado no Kafka.
 * @param trackingData Dados de rastreamento a serem publicados.
 */
export async function publishTrackingEvent(trackingData: any) {
  const topic = process.env.KAFKA_TOPIC || 'tracking-events';
  await producer.send({
    topic,
    messages: [
      {
        key: trackingData.trackingCode,
        value: JSON.stringify(trackingData),
      },
    ],
  });
}
