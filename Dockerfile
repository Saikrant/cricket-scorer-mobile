FROM node:20.19.0

WORKDIR /app

COPY . .

RUN npm ci

RUN npm test
