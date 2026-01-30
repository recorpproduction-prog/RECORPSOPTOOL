# Cloud Run backend – only needs cloud-run-backend.js at repo root (no folders)
FROM node:18-slim

WORKDIR /app

RUN echo '{"name":"sop-shared-backend","version":"1.0.0","main":"cloud-run-backend.js","engines":{"node":">=18"},"dependencies":{"googleapis":"^128.0.0"}}' > package.json
RUN npm install --production

COPY cloud-run-backend.js ./

EXPOSE 8080
CMD ["node", "cloud-run-backend.js"]
