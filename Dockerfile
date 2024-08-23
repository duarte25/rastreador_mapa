# Use a imagem oficial do Node.js como base
FROM node:20-alpine

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copie os arquivos package.json e package-lock.json
COPY package*.json ./

# Instale as dependências de produção
RUN npm install

# Copie o restante dos arquivos do projeto
COPY . .

# Execute a build de produção do Next.js
RUN npm run build

# Exponha a porta que a aplicação vai rodar (3000 no caso do Next.js)
EXPOSE 3000

# Comando para rodar a aplicação em produção
CMD ["npm", "run", "start"]
