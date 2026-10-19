# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN cd frontend && npm ci --no-audit --no-fund

COPY frontend/ ./frontend/
COPY specs/ ./specs/

ARG NUXT_PUBLIC_SITE_URL=https://aumsu.ru
ENV NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL}
ENV NODE_ENV=production

RUN cd frontend && npm run generate:static

FROM node:24-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

RUN apk add --no-cache tzdata

COPY --chown=node:node --from=builder /app/frontend/.output/public ./public
COPY --chown=node:node --from=builder /app/frontend/server.mjs ./server.mjs

USER node
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
