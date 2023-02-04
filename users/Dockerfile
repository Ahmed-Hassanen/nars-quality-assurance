FROM node

WORKDIR /users

COPY package*.json ./

RUN npm install -g nodemon && npm install

COPY . .

CMD ["npm","run","dev"]
