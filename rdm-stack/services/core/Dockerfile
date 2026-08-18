# RDM Hub — Core (TanStack Start SSR on Bun)
# Imagen pineda para builds reproducibles.
FROM oven/bun:1.3.14-alpine AS build
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
RUN bun install
COPY . .
RUN bunx prisma generate
RUN bun run build

FROM oven/bun:1.3.14-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8000
COPY --from=build /app/.output ./.output
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./

# Ejecutar como usuario no-root
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 8000
HEALTHCHECK --interval=15s --timeout=5s --retries=5 \
  CMD bun -e "fetch('http://localhost:8000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", ".output/server/index.mjs"]