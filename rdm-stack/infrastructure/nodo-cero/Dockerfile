# nodo-cero — Next.js 16 (App Router) — Sistema Operativo Territorial
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm config set fetch-timeout 600000 && npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000 && npm config set fetch-retry-maxtimeout 120000 && npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

# Ejecutar como usuario no-root
RUN groupadd -r app && useradd -r -g app app && chown -R app:app /app
USER app

EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=10s --retries=5 \
  CMD node -e "fetch('http://localhost:3000/api/yun/status').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "start"]