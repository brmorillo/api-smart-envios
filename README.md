# API Smart Envios

Esta é uma solução de microserviço para rastreamento de pedidos, que automatiza a consulta à API da transportadora "Carriers" e integra com a arquitetura de microsserviços da Smart Envios. A aplicação consulta periodicamente os dados de rastreamento, atualiza os eventos no MongoDB e publica atualizações no Kafka para que outros serviços (como notificações e dashboards) possam reagir às mudanças de status dos pedidos.

## Sumário

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Recursos](#recursos)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
  - [Localmente (Modo Desenvolvimento)](#localmente-modo-desenvolvimento)
  - [Com Docker Compose](#com-docker-compose)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Testes](#testes)
- [Contribuição](#contribuição)
- [Licença](#licença)
- [Observações Finais](#observações-finais)

## Visão Geral

Este microserviço realiza as seguintes funções:

- **Consulta Síncrona (HTTP):** Realiza chamadas à API da transportadora para obter dados de rastreamento de pedidos.
- **Armazenamento no MongoDB:** Armazena ou atualiza os eventos de rastreamento em um banco de dados NoSQL.
- **Publicação no Kafka:** Publica atualizações de rastreamento em um tópico Kafka para que outros microsserviços possam ser notificados.
- **Scheduler:** Executa periodicamente (a cada minuto) a consulta e atualização dos rastreamentos que ainda não foram finalizados (ou seja, que não possuem um evento com `idStatus` igual a 101).
- **Kafka Consumer (Exemplo):** Um exemplo de consumidor de Kafka que registra os eventos recebidos, demonstrando uma integração end-to-end.

## Arquitetura

A solução é composta pelos seguintes componentes:

1. **Microserviço de Rastreamento de Pedidos**
   - Consulta a API da transportadora e atualiza os eventos de rastreamento.
2. **Banco de Dados (MongoDB)**
   - Armazena os documentos de rastreamento com flexibilidade para diferentes formatos de eventos.
3. **Kafka Producer**
   - Publica eventos de rastreamento atualizados para um tópico Kafka.
4. **Scheduler**
   - Agendador (node-cron) que dispara a consulta à API periodicamente e atualiza os dados.
5. **Kafka Consumer (Exemplo)**
   - Consome os eventos publicados, simulando a integração com outros microsserviços.

O fluxo da solução é o seguinte:

- **Consulta Inicial:** Um endpoint HTTP recebe o código de rastreamento, consulta a API da transportadora e realiza um upsert no MongoDB.
- **Atualização Periódica:** Um scheduler busca os rastreamentos pendentes (sem o evento de entrega, `idStatus: 101`), consulta novamente a API e, se houver alteração de status, atualiza o MongoDB e publica a atualização no Kafka.
- **Publicação e Consumo:** As atualizações são publicadas no Kafka para que outros serviços possam processá-las.

## Recursos

- **TypeScript** – Tipagem e segurança de código.
- **Express** – Framework web para Node.js.
- **MongoDB com Mongoose** – Armazenamento NoSQL.
- **Kafka (KafkaJS)** – Mensageria para integração assíncrona.
- **node-cron** – Scheduler para execuções periódicas.
- **Zod** – Validação e tipagem dos dados da API.
- **Configuração Centralizada** – Gerenciamento de variáveis de ambiente via `src/config/config.ts`.

## Pré-requisitos

- [Node.js (versão 20 ou superior)](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/) (local ou em contêiner)
- [Kafka](https://kafka.apache.org/) e [Zookeeper](https://zookeeper.apache.org/) (local ou em contêiner)

## Instalação e Execução

### Localmente (Modo Desenvolvimento)

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/brmorillo/api-smart-envios.git
   cd api-smart-envios
   ```

2. **Instale as dependências:**

   Se estiver usando **pnpm**:

   ```bash
   pnpm install
   ```

   Ou com **npm**:

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**

   Crie um arquivo `.env` na raiz do projeto (veja [Variáveis de Ambiente](#variáveis-de-ambiente) abaixo).

4. **Rodar em modo desenvolvimento com hot-reload:**

   ```bash
   pnpm dev
   ```

### Com Docker Compose

1. **Configure o arquivo `docker-compose.yml`:**

   O arquivo já está configurado para iniciar:

   - Zookeeper
   - Kafka
   - MongoDB

2. **Inicie os contêineres:**

   ```bash
   docker-compose up -d
   ```

3. **Ajuste a variável de ambiente `MONGO_URI` no seu `.env` para apontar para o MongoDB no Docker:**

   ```env
   MONGO_URI=mongodb://root:QWp3dtwmT%2Am7hHQqdzuo82jYuuL%40Ls@localhost:27017/trackingdb?authSource=admin
   ```

4. **Inicie a aplicação.**

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes configurações (ajuste conforme necessário):

```env
# Configurações disponíveis em .env.example na raiz do repositório.
```

## Endpoints da API

### GET /tracking?code=<trackingCode>

- **Descrição:** Consulta a API da transportadora para o código informado, realiza o upsert dos dados no MongoDB e retorna o documento atualizado.
- **Exemplo:**

  ```bash
  curl --request GET "http://localhost:3000/tracking?code=SM82886187440BM"
  ```

## Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório.
2. Crie uma branch para sua feature: `git checkout -b minha-feature`
3. Realize as alterações e envie um pull request.

## Observações Finais

- **Logging e Monitoramento:**
  Atualmente, o projeto utiliza `console.log` para logs. Em produção, considere utilizar bibliotecas de logging robustas como [Winston](https://github.com/winstonjs/winston) ou [Pino](https://github.com/pinojs/pino).

- **Testes Automatizados:**
  Adicionar testes unitários e de integração pode aumentar a robustez da solução.

- **Escalabilidade:**
  A arquitetura modular facilita a integração com outros microsserviços, como consumidores de Kafka para notificações e dashboards.
