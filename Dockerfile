# ── Stage 1: Build ──────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

ARG APP_VERSION
ARG GIT_COMMIT_SHA
ARG APP_BUILD_DATE
ENV APP_VERSION=${APP_VERSION}
ENV GIT_COMMIT_SHA=${GIT_COMMIT_SHA}
ENV APP_BUILD_DATE=${APP_BUILD_DATE}

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build --configuration=production

# ── Stage 2: Serve ──────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/dist/vasilis/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
