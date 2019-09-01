ARG node_version=12.9.1

FROM node:${node_version}
RUN useradd -m diabetips
WORKDIR /home/diabetips
USER diabetips
COPY package.json package-lock.json tsconfig.json ./
RUN npm install --production
COPY src ./src
RUN npm run build

FROM node:${node_version}
RUN useradd -m diabetips
WORKDIR /home/diabetips
USER diabetips
COPY package.json package-lock.json ./
RUN npm install --production
COPY --from=0 /home/diabetips/build ./build
