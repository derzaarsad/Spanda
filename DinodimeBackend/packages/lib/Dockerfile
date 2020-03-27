FROM node:12-alpine

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.5.0/wait /wait
RUN chmod +x /wait
ADD . /app
WORKDIR /app
