FROM oven/bun:alpine
WORKDIR /usr/src/app

COPY package.json bun.lock backend/package.json ./
RUN bun install

COPY . .
EXPOSE 3000
WORKDIR backend
CMD ["bun", "dev"]

# Add another stage for production
