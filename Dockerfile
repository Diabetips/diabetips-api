ARG node_version=12.9.1
ARG diabetips_env=dev

FROM node:${node_version}
RUN useradd -m diabetips
WORKDIR /home/diabetips
USER diabetips
COPY package.json package-lock.json tsconfig.json ./
RUN npm install --production
COPY src ./src
RUN npm run build

FROM node:${node_version}
ENV DIABETIPS_ENV=${diabetips_env}
RUN useradd -m diabetips
WORKDIR /home/diabetips
USER diabetips
COPY config views package.json package-lock.json ./
COPY --from=0 /home/diabetips/node_modules ./
COPY --from=0 /home/diabetips/build ./
