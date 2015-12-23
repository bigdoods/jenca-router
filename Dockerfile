FROM node:5.2.0-slim
MAINTAINER connor@jenca.io
COPY . /app
WORKDIR /app
RUN npm install
ENTRYPOINT ["node", "index.js"]