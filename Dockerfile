FROM node:24-alpine

WORKDIR /app

ADD . /app

RUN npm ci

RUN npm run build
CMD ["sh", "-c", "npm run migrate && exec node .output/server/index.mjs"]