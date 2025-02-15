import { Kafka, EachMessagePayload } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'tracking-service-consumer',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
});

const consumer = kafka.consumer({ groupId: 'tracking-consumer-group' });

export async function connectConsumer() {
  await consumer.connect();
  await consumer.subscribe({
    topic: process.env.KAFKA_TOPIC || 'tracking-events',
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
