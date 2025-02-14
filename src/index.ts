import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { json } from 'body-parser';
import mongoose from 'mongoose';
import { trackingRouter } from './controllers/tracking.controller';
import { connectProducer } from './services/kafka.producer';

// Importa o scheduler para iniciar as tarefas periódicas
import './scheduler/tracking.scheduler';

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB
const mongoUri =
  process.env.MONGO_URI || 'mongodb://localhost:27017/trackingdb';
mongoose
  .connect(mongoUri)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

app.use(json());

// Rota para consulta on-demand de rastreamento
app.use('/tracking', trackingRouter);

app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await connectProducer(); // Conecta ao Kafka
});
