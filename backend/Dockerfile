# === Build Stage ===
FROM node:22-alpine AS builder

WORKDIR /app

# Kopiere Abhängigkeiten
COPY package.json package-lock.json ./
RUN npm install

# Kopiere Source + Config
COPY tsconfig.json ./
COPY types ./types
COPY src ./src

# Build der App (kompiliert TypeScript zu JavaScript)
RUN npm run build

# === Production Stage ===
FROM node:22-alpine

WORKDIR /app
EXPOSE 5000

# Kopiere nur das Nötigste ins finale Image
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Startbefehl
CMD ["node", "dist/index.js"]
