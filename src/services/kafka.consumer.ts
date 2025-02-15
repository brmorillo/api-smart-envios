/**
 * Kafka Consumer
 * Este módulo implementa um consumidor simples que se inscreve no tópico de eventos
 * e registra as mensagens recebidas no console.
 */
import { Kafka, EachMessagePayload } from 'kafkajs';
import { config } from '../config/config';

const kafka = new Kafka({
  clientId: 'tracking-service-consumer',
  brokers: [config.kafkaBroker],
});

const consumer = kafka.consumer({ groupId: 'tracking-consumer-group' });

export async function connectConsumer() {
  await consumer.connect();
  await consumer.subscribe({
    topic: config.kafkaTopic,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      const prefix = `${topic}[${partition} | ${message.offset}]`;
      console.log(
        `${prefix} Received message: ${message.key} -> ${message.value?.toString()}`,
      );
    },
  });
}
