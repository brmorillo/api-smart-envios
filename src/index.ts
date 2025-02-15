/**
 * Entry point da aplicação.
 * Carrega as configurações centralizadas, inicializa o servidor, conecta ao MongoDB,
 * ao Kafka e importa o scheduler para processamento periódico.
 */
import { config } from './config/config';
import express from 'express';
import { json } from 'body-parser';
import mongoose from 'mongoose';
import { trackingRouter } from './controllers/tracking.controller';
import { connectProducer } from './services/kafka.producer';

// Importa o scheduler para iniciar as tarefas periódicas
import './scheduler/tracking.scheduler';
import logger from './utils/logger';

const app = express();

// Conecta ao MongoDB usando a URI da configuração centralizada
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trackingdb')
  .then(() => logger.info('Conectado ao MongoDB'))
  .catch((err) => logger.error('Erro ao conectar ao MongoDB:', err));

app.use(json());

// Rota para consulta on-demand de rastreamento
app.use('/tracking', trackingRouter);

app.listen(config.port, async () => {
  logger.info(`Servidor rodando na porta ${config.port}`);
  await connectProducer(); // Conecta ao Kafka Producer
});
