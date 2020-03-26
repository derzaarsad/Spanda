FROM node:12-alpine

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.5.0/wait /wait
RUN chmod +x /wait
RUN mkdir -p /opt && cd /opt && wget https://github.com/mozilla/geckodriver/releases/download/v0.26.0/geckodriver-v0.26.0-linux64.tar.gz -O geckodriver.tar.gz && tar xvfz geckodriver.tar.gz && mv geckodriver /usr/local/bin/geckodriver && rm geckodriver.tar.gz

ADD . /app
WORKDIR /app