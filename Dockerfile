FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm install
RUN cd server && npm install

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Create data directory for SQLite
RUN mkdir -p /app/server/data

# Expose port
EXPOSE $PORT

# Start server
CMD ["node", "server/server.js"]