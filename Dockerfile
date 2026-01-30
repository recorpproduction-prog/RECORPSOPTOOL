# SOP Shared Backend – for Google Cloud Run
# Use Node 18 (matches package.json engines)
FROM node:18-slim

WORKDIR /app

# Copy package files first so install is cached
COPY package*.json ./
RUN npm install --production

# Copy app code
COPY index.js ./

# Cloud Run sets PORT (default 8080)
EXPOSE 8080
CMD ["node", "index.js"]
