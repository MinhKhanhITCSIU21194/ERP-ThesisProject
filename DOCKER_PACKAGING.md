# Docker Packaging Guide for ERP System

This guide explains how to package your ERP System project with Docker. It covers the backend and frontend separately, then shows how to combine them with Docker Compose.

---

## 1. Understand your application structure

Your repository has two primary services:

- `back-end/`: Node.js + TypeScript backend using Express and TypeORM
- `front-end/`: React + Vite frontend

### Why this matters

- The backend needs compilation from TypeScript to JavaScript.
- The frontend needs a static build that can be served by a web server.
- Packaging them separately keeps each service optimized for its runtime.

### Key note

If you package both in one image, the image becomes larger and harder to manage. Use separate containers for cleaner deployment.

---

## 2. Create a Dockerfile for the backend

### What to do

1. Create `back-end/Dockerfile`
2. Use a multi-stage build: one stage for TypeScript compilation, one for runtime
3. Install only production dependencies in the final image
4. Expose the backend port

### Why this matters

- Multi-stage builds reduce image size.
- Installing only production dependencies keeps the runtime image smaller and more secure.
- Exposing the correct port allows Docker to map the container port to the host.

### Example backend Dockerfile

```dockerfile
# back-end/Dockerfile
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
```

### Key points

- `COPY package-lock.json*` is optional but recommended for reproducible builds.
- Use `npm run build` to generate the `dist/` folder.
- The final image only contains built JavaScript and production dependencies.

---

## 3. Create a Dockerfile for the frontend

### What to do

1. Create `front-end/Dockerfile`
2. Build the React/Vite app inside Docker
3. Serve the compiled static files with Nginx

### Why this matters

- A production React app should be served as static assets.
- Nginx is fast and stable for serving frontend builds.
- This keeps frontend deployment simple and efficient.

### Example frontend Dockerfile

```dockerfile
# front-end/Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* tsconfig.json vite.config.ts ./
COPY public ./public
COPY src ./src

RUN npm install
RUN npm run build

FROM nginx:stable-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Key points

- The build stage packages the frontend sources into `/app/dist`.
- The runtime stage serves the generated files from Nginx.
- If your frontend needs runtime environment variables, you may later add an env-injection step.

---

## 4. Add `.dockerignore` files

### What to do

Create `.dockerignore` in each service folder:

- `back-end/.dockerignore`
- `front-end/.dockerignore`

### Why this matters

- Reduces image build time.
- Prevents local files from being copied into the image.
- Keeps the image smaller and cleaner.

### Example `.dockerignore`

```text
node_modules
dist
npm-debug.log
.env
```

### Key points

- Exclude `node_modules` because dependencies are installed inside the image.
- Exclude `.env` because it often contains secrets.
- Exclude build output so Docker rebuilds cleanly.

---

## 5. Use Docker Compose for multi-service setup

### What to do

Create `docker-compose.yml` at the repository root.

### Why this matters

- Docker Compose starts the backend, frontend, and database together.
- It makes environment configuration repeatable.
- It simplifies local development and testing.

### Example `docker-compose.yml`

```yaml
version: "3.9"

services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: erp_user
      POSTGRES_PASSWORD: erp_password
      POSTGRES_DB: erp_system
    volumes:
      - db-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./back-end
    restart: always
    ports:
      - "5000:5000"
    env_file:
      - ./back-end/.env
    environment:
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: erp_user
      DB_PASSWORD: erp_password
      DB_NAME: erp_system
      PORT: 5000
      JWT_SECRET: your_jwt_secret
      EMAIL_USER: your_email
      EMAIL_PASSWORD: your_email_password
    depends_on:
      - postgres

  frontend:
    build:
      context: ./front-end
    restart: always
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  db-data:
```

### Key points

- Use `depends_on` so services start in the correct order.
- Inside Compose, the backend should connect to `postgres`, not `localhost`.
- Keep production secrets out of version control.

---

## 6. Build and run in Docker

### Build images manually

From the repository root:

```powershell
docker build -t erp-backend ./back-end
docker build -t erp-frontend ./front-end
```

### Run containers manually

Backend:

```powershell
docker run --rm -p 5000:5000 --env-file back-end/.env erp-backend
```

Frontend:

```powershell
docker run --rm -p 3000:80 erp-frontend
```

### Use Docker Compose

```powershell
docker compose up --build
```

### Key points

- `docker compose up --build` is the easiest way to start all services.
- Use `-d` to run detached: `docker compose up --build -d`
- Confirm backend is reachable on `http://localhost:5000` and frontend on `http://localhost:3000`.

---

## 7. Verify and adjust

### What to check

- Backend connects successfully to PostgreSQL.
- Frontend calls the correct backend URL.
- Environment variables like `JWT_SECRET`, `DB_PASSWORD`, and email credentials are set.
- If your backend needs migrations, decide whether to run them before startup.

### Why this matters

- Docker builds the application, but runtime issues often come from config.
- Network and environment differences inside containers may expose issues not seen locally.

### Key points

- Use `docker logs` to inspect container startup errors.
- If the backend cannot connect to the database, verify Compose hostnames and env vars.
- If the frontend fails, check CORS settings and API endpoint URLs.

---

## 8. Best practices summary

- Separate backend and frontend Docker images.
- Use multi-stage builds for production images.
- Exclude local files with `.dockerignore`.
- Keep secrets out of images and version control.
- Prefer `docker compose` for local orchestration.
- Test each service individually, then together.

---

## Quick commands

```powershell
docker compose up --build
# or
docker compose up --build -d
```

```powershell
docker build -t erp-backend ./back-end
docker build -t erp-frontend ./front-end
```

```powershell
docker run --rm -p 5000:5000 --env-file back-end/.env erp-backend
```

---

## Final note

This guide is meant to help you package your ERP application cleanly and reliably. If you want, I can also generate the exact Dockerfiles and `docker-compose.yml` file for your repository.
