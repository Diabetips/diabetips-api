ARG node_version=12.9.1

FROM node:${node_version}
RUN useradd -m diabetips-api
USER diabetips-api
WORKDIR /home/diabetips-api
COPY package.json package-lock.json tsconfig.json ./
RUN npm install --production
COPY src ./src
RUN npm run build

FROM node:${node_version}
RUN useradd -m diabetips-api
USER diabetips-api
WORKDIR /home/diabetips-api
COPY package.json ./
COPY --from=0 /home/diabetips-api/node_modules ./node_modules
COPY config ./config
COPY docs ./docs
COPY views ./views
COPY --from=0 /home/diabetips-api/build ./build
