# Etapa de build
FROM node:22-alpine AS builder
WORKDIR /app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Compila a aplicação
RUN npm run build

# Etapa de produção
FROM node:22-alpine
WORKDIR /app

# Copia somente os arquivos necessários para produção
COPY package*.json ./

# Instala apenas as dependências de produção
RUN npm install --only=production

# Copia os arquivos compilados da etapa anterior
COPY --from=builder /app/dist ./dist

# Expõe a porta que sua aplicação utiliza
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
