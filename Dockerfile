# --- Stage 1: Builder ---
FROM node:20-alpine AS builder
WORKDIR /app

# Batasi penggunaan RAM Node.js agar tidak crash di VM 4GB
ENV NODE_OPTIONS="--max-old-space-size=2048"

COPY package*.json ./
# Perbaikan: Hapus --network-timeout yang menyebabkan error 404
RUN npm install

COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Tambahkan flag --webpack agar tidak bentrok dengan Turbopack Next.js 16
RUN npm run build -- --webpack

# --- Stage 2: Runner ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
