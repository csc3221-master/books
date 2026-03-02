FROM node:20-alpine

WORKDIR /app

# Install deps first (better Docker layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY src ./src

# Runtime env + port
ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "start"]