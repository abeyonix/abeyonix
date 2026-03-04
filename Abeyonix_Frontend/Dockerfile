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

# install static server
RUN pnpm add -g serve

# copy built files
COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]