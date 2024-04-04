# Estágio de base com todas as dependências do sistema necessárias
FROM node:8.15.0

# Definindo o diretório de trabalho no container
WORKDIR /usr/src/app

# Agora, como pptruser, copie os arquivos package*.json no diretório de trabalho.
COPY package*.json ./

# Instalar as dependências do projeto Node.js especificadas no 'package.json'
RUN npm install

# Copie o restante dos arquivos para o diretório de trabalho, garantindo a propriedade correta.
COPY . .

# Comando para rodar o aplicativo usando npm start conforme especificado no seu package.json
CMD [ "npm", "start" ]