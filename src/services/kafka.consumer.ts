/**
 * Kafka Consumer
 * Este módulo implementa um consumidor simples que se inscreve no tópico de eventos de rastreamento
 * e registra as mensagens recebidas no console. Essa implementação demonstra a integração end-to-end.
 */
import { Kafka, EachMessagePayload } from 'kafkajs';

// Cria uma instância do cliente Kafka
const kafka = new Kafka({
  clientId: 'tracking-service-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

// Cria um consumidor pertencente ao grupo 'tracking-consumer-group'
const consumer = kafka.consumer({ groupId: 'tracking-consumer-group' });

/**
 * Conecta o consumidor ao Kafka, inscreve-se no tópico de eventos e inicia o consumo.
 */
export async function connectConsumer() {
  await consumer.connect();
  await consumer.subscribe({
    topic: process.env.KAFKA_TOPIC || 'tracking-events',
    fromBeginning: true, // Lê mensagens desde o início
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
      const prefix = `${topic}[${partition} | ${message.offset}]`;
      console.log(
        `${prefix} Received message: ${message.key} -> ${message.value?.toString()}`,
      );
      // Aqui você pode integrar ações adicionais, como atualizar outros microsserviços.
    },
  });
}
