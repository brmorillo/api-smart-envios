/**
 * Configuração Centralizada
 * Este módulo carrega as variáveis de ambiente e exporta um objeto de configuração
 * para ser utilizado em toda a aplicação.
 */
import dotenv from 'dotenv';

// Carrega as variáveis definidas no arquivo .env
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  // String de conexão do MongoDB
  mongoUri:
    process.env.MONGO_URI ||
    'mongodb://root:QWp3dtwmT%2Am7hHQqdzuo82jYuuL%40Ls@localhost:27017/trackingdb?authSource=admin',
  // Configuração do Kafka
  kafkaBroker: process.env.KAFKA_BROKER || 'localhost:9092',
  kafkaTopic: process.env.KAFKA_TOPIC || 'tracking-events',
  // Token da API da transportadora
  carriersApiToken: process.env.CARRIERS_API_TOKEN || '',
  // URL base da API da transportadora
  apiUrlCarriers:
    process.env.API_URL_CARRIERS ||
    'http://api.carriers.com.br/client/Carriers',
  logLevel: process.env.LOG_LEVEL || 'info',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};
