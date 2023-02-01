FROM node:19
WORKDIR /server

COPY . /server
RUN yarn install
