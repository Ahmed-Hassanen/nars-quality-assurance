FROM node

WORKDIR /programs

COPY package*.json ./

RUN npm install -g nodemon && npm install

COPY . .

CMD ["npm","run","dev"]
