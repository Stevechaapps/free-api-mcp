FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

COPY index.js ./
COPY lib/ ./lib/
COPY api-data.json ./

EXPOSE 3000

CMD ["node", "index.js"]
