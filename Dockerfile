FROM node:latest

WORKDIR /app

COPY  . .

RUN npm install
RUN npm i -g nodemon

EXPOSE 3000

CMD [ "npm", "start" ]