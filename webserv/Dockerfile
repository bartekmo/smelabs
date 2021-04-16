FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY --chown=node:node . .

EXPOSE 8080
USER node
CMD ["node", "server.js"]
