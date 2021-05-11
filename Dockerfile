# Node base image
FROM node:14-alpine AS base
LABEL org.opencontainers.image.authors=alessandro.lucarini@smanapp.com
LABEL org.opencontainers.image.title="ExpressJs boilerplate"
LABEL org.opencontainers.image.licenses=MIT
EXPOSE 3000
ENV TZ=Europe/Rome
ENV NODE_ENV=production
ENV PORT 3000
RUN apk add --no-cache bash tini tzdata && \
  cp /usr/share/zoneinfo/${TZ} /etc/localtime && \
  echo "${TZ}" >  /etc/timezone && \
  apk del tzdata
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm config list
RUN npm ci && \
  npm cache clean --force
ENV PATH=/app/node_modules/.bin:$PATH

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT [ "docker-entrypoint.sh" ]
CMD [ "node", "./bin/www" ]

# Image for development
FROM base AS dev
ENV NODE_ENV=development
RUN npm config list
RUN npm install --only=development \
  && npm cache clean --force
USER node
CMD [ "nodemon", "--inspect=0.0.0.0", "./bin/www"]

# Testing image
FROM dev AS test
ENV NODE_ENV=development
ENV JWT_PRIVATE_KEY=notSoSecretPassword
ENV JWT_ISSUER=https://dummy.issuer.com
COPY . .
RUN eslint .
RUN jest ./tests/unit/*
# To run with docker-compose
CMD [ "jest", "./tests/integration/*", "--ci", "--runInBand", "--coverage" ]

# Audit image
FROM test AS audit
USER root
RUN npm audit --audit-level critical
COPY --from=aquasec/trivy:latest /usr/local/bin/trivy /usr/local/bin/trivy
RUN trivy filesystem --no-progress /

# Cleaning image before production
FROM test AS pre-prod
USER root
RUN rm -rf ./tests && \
  rm -rf ./node_modules

# Production image
FROM base AS prod
COPY --from=pre-prod /app /app
HEALTHCHECK --interval=30s CMD node hc.js
USER node