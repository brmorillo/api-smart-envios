import pino from 'pino';

// Cria um transport com pino-pretty para formatar os logs no console
const transport = pino.transport({
  target: 'pino-pretty', // Target é o pino-pretty instalado
  options: {
    colorize: true, // Habilita cores nos logs
    translateTime: 'SYS:standard', // Formata o timestamp
  },
});

// Cria o logger com o transport configurado
const logger = pino(transport);

export default logger;
