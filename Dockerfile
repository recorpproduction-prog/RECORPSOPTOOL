# Build from repo root – only needs sop-shared-backend/index.js (package.json created here)
FROM node:18-slim

WORKDIR /app

# Create package.json so we never depend on it being in the repo
RUN echo '{"name":"sop-shared-backend","version":"1.0.0","main":"index.js","engines":{"node":">=18"},"dependencies":{"googleapis":"^128.0.0"}}' > package.json
RUN npm install --production

COPY sop-shared-backend/index.js ./

EXPOSE 8080
CMD ["node", "index.js"]
