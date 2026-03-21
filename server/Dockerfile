# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled files from builder
# Since outDir isn't set in tsconfig, tsc generates .js files in the same directory
COPY --from=builder /app/*.js ./

EXPOSE 3001
ENV PORT=3001

CMD ["node", "index.js"]
