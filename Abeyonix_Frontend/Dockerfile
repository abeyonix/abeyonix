# ---------- Builder ----------
FROM node:22-slim AS builder

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@10.12.4 --activate

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build


# ---------- Runner ----------
FROM node:22-slim

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@10.12.4 --activate

ENV NODE_ENV=production

COPY --from=builder /app/package.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["pnpm", "start"]