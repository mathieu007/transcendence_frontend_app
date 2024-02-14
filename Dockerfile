FROM debian:latest

RUN apt-get update -y && apt-get upgrade -y && apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    ca-certificates

RUN curl -fsSL https://deb.nodesource.com/setup_21.x 

RUN apt-get upgrade -y
RUN apt-get update -y
RUN apt-get install nodejs npm vite -y

WORKDIR /app
RUN npm install vite

COPY app/package*.json ./app
COPY app/ /app
EXPOSE 8085
RUN npm run build

CMD ["npm", "run", "start"]
