FROM node:24-alpine AS base
EXPOSE 3000
ENV TZ=Europe/Rome
ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache bash tzdata && \
  cp /usr/share/zoneinfo/${TZ} /etc/localtime && \
  echo "${TZ}" >  /etc/timezone && \
  apk del tzdata

ENV PATH=/app/node_modules/.bin:$PATH

WORKDIR /app

RUN npm config list




FROM base AS dev
ENV NODE_ENV=development
CMD ["sh"]






FROM dev AS test
USER root
ENV NODE_ENV=development
ENV JWT_PRIVATE_KEY=notSoSecretPassword
ENV JWT_REFRESH_PRIVATE_KEY=notSoSecretPassword
ENV JWT_ISSUER=https://dummy.issuer.com
COPY . .
RUN npm install \
  && npm cache clean --force
RUN standard
RUN jest ./tests/unit/*
# To run with docker-compose
CMD [ "jest", "./tests/integration/*", "-b", "--ci", "--coverage", "--maxWorkers=1" ]







FROM test AS audit
USER root
RUN npm audit --audit-level critical
COPY --from=aquasec/trivy:latest /usr/local/bin/trivy /usr/local/bin/trivy
RUN trivy filesystem --no-progress /






FROM base AS build

COPY . .
RUN npm ci && npm cache clean --force
RUN tsc -p .








FROM base AS production

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/dist /app

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER node

HEALTHCHECK --interval=30s CMD node ./bin/hc.js
ENTRYPOINT [ "docker-entrypoint.sh" ]
CMD [ "node", "./bin/www" ]
