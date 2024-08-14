FROM node:lts-buster-slim

WORKDIR /api

COPY package*.json ./
RUN npm i

EXPOSE 4000

CMD ["npm", "run", "start:dev"]