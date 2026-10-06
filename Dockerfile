# Self-contained image: npm build → node runtime serving dist/ + /api.
# Used by `docker build` AND Vercel (builds the root Dockerfile). Pinned
# tag+digest — bump deliberately (CSA scans this exact image).
FROM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
COPY public ./public
RUN npm run build

FROM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1
# Bump packages with known fixes beyond the pinned base (CSA findings)
RUN apk upgrade --no-cache libexpat \
 && npm install -g npm@12.2.0 && npm cache clean --force
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server ./server
COPY --from=build /app/dist ./dist
USER node
EXPOSE 8080
CMD ["node", "server/index.js"]
