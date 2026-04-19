FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* tsconfig.json ./
COPY src ./src

RUN npm install
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --only=production

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "dist/app.js"]