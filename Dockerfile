FROM node:latest 

RUN npm install -g express

ENV NODE_PATH /usr/local/lib/node_modules/

COPY . /app

WORKDIR /app

ENTRYPOINT ["node", "main.js"]