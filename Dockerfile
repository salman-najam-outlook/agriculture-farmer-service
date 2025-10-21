FROM node:18-alpine
WORKDIR /src
COPY package*.json ./
COPY .npmrc ./
EXPOSE 3000
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
RUN apk update && apk add --no-cache fontconfig curl curl-dev 
RUN apk add --no-cache  chromium --repository=http://dl-cdn.alpinelinux.org/alpine/v3.10/main
RUN npm cache clean --force 
RUN npm install -g sequelize-cli webpack husky
RUN npm install --force
RUN npm install puppeteer --unsafe-perm=true --allow-root
COPY . .
RUN sh -c "npm link webpack"
