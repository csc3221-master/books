# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install deps first (cache-friendly)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

EXPOSE 5173

# Run Vite dev server, accessible from host
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]