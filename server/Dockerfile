FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist

ENV PORT=3001
ENV DATABASE_URL="file:/data/nullnotes_sync.db"
ENV JWT_SECRET="change_this_secret_in_production"

VOLUME /data
EXPOSE 3001

CMD ["node", "dist/index.js"]