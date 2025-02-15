/**
 * Entry point da aplicação.
 * - Carrega variáveis de ambiente
 * - Inicializa o servidor Express
 * - Conecta ao MongoDB e ao Kafka
 * - Importa o scheduler para processamento periódico dos rastreamentos
 */
import dotenv from 'dotenv';
// Carrega as variáveis definidas no arquivo .env
dotenv.config();

import express from 'express';
import { json } from 'body-parser';
import mongoose from 'mongoose';
import { trackingRouter } from './controllers/tracking.controller';
import { connectProducer } from './services/kafka.producer';

// Importa o scheduler para iniciar as tarefas periódicas de atualização de rastreamento
import './scheduler/tracking.scheduler';

const app = express();
const PORT = process.env.PORT || 3000;

// Conecta ao MongoDB usando a URI definida nas variáveis de ambiente
const mongoUri =
  process.env.MONGO_URI || 'mongodb://localhost:27017/trackingdb';
mongoose
  .connect(mongoUri)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Middleware para interpretar JSON no corpo das requisições
app.use(json());

// Registra a rota para consultas on-demand de rastreamento
app.use('/tracking', trackingRouter);

// Inicia o servidor e, assim que ele estiver rodando, conecta ao Kafka Producer
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await connectProducer(); // Conecta ao Kafka para publicação de eventos
});
