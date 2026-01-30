# Build from repo root – backend lives in sop-shared-backend/
FROM node:18-slim

WORKDIR /app

COPY sop-shared-backend/package.json ./
RUN npm install --production

COPY sop-shared-backend/index.js ./

EXPOSE 8080
CMD ["node", "index.js"]
