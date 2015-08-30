FROM node:latest 

ENV NODE_PATH /usr/local/lib/node_modules/

EXPOSE 3000

COPY . /app

WORKDIR /app

RUN npm install

ENTRYPOINT ["node", "main.js"]