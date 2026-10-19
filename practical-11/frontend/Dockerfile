FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm install

# Copy application source code and build production bundle
COPY . .
RUN npm run build

EXPOSE 5173

# Serve production build using Vite preview accessible across Docker bridge network
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
