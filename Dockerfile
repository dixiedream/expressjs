# Node base image
FROM node:12-alpine AS base

LABEL mantainer="Alessandro Lucarini <alessandro.lucarini@smanapp.com>"

EXPOSE 3000

ENV NODE_ENV=production
ENV TINI_VERSION=v0.18.0

ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
RUN mkdir /app && chown -R node:node /app
WORKDIR /app

USER node

COPY --chown=node:node package.json package-lock.json* ./

RUN npm ci && npm cache clean --force

# Image for development
FROM base AS dev

ENV NODE_ENV=development
ENV PATH=/app/node_modules/.bin:$PATH

RUN npm install --only=development

CMD [ "nodemon", "./bin/www", "--inspect=127.0.0.1:9229" ]

# Source code
FROM base AS source
COPY --chown=node:node . .

# Testing image
FROM source AS test

ENV NODE_ENV=development
ENV PATH=/app/node_modules/.bin:$PATH

COPY --from=dev /app/node_modules /app/node_modules

RUN eslint .
RUN npm test
CMD [ "npm", "run", "test" ]

# Audit image
FROM test AS audit

USER root

RUN npm audit --audit-level critical
ARG MICROSCANNER_TOKEN
ADD https://get.aquasec.com/microscanner /
RUN chmod +x /microscanner
RUN /microscanner ${MICROSCANNER_TOKEN} --continue-on-failure

# Production image
FROM source AS prod
ENTRYPOINT [ "/tini", "--" ]
CMD [ "node", "./bin/www" ]