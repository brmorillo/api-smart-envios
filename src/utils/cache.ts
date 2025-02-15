import { createClient } from 'redis';
import { config } from '../config/config';
import logger from './logger';

// Cria o cliente Redis
const redisClient = createClient({
  url: config.redisUrl || 'redis://localhost:6379',
});

// Conecta ao Redis e trata possíveis erros
redisClient.on('error', (err) => logger.error('Redis Client Error', err));
redisClient.connect().then(() => {
  logger.info('Conectado ao Redis');
});

export default redisClient;
