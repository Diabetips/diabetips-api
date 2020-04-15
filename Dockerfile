ARG node_version=13.13

FROM node:${node_version} AS build
RUN useradd -m diabetips-api
USER diabetips-api
WORKDIR /home/diabetips-api
COPY package.json package-lock.json tsconfig.json ./
COPY patches ./patches
RUN npm install --production
COPY src ./src
RUN npm run build

FROM node:${node_version}
RUN useradd -m diabetips-api
USER diabetips-api
WORKDIR /home/diabetips-api
COPY package.json ./
COPY --from=build /home/diabetips-api/node_modules ./node_modules
COPY config ./config
COPY data ./data
COPY docs ./docs
COPY views ./views
COPY --from=build /home/diabetips-api/build ./build
