FROM node:18-alpine

WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

RUN npm install

# Copy application source code
COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
