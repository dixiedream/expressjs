# Node base image
FROM node:12-alpine AS base
LABEL org.opencontainers.image.authors=alessandro.lucarini@smanapp.com
LABEL org.opencontainers.image.title="SmanApp drive API"
LABEL org.opencontainers.image.licenses=MIT
EXPOSE 3000
ENV NODE_ENV=production
ENV PORT 3000
ENV PATH=/app/node_modules/.bin:$PATH
ENV TINI_VERSION=v0.18.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
RUN chmod +x /tini
RUN mkdir /app && chown -R node:node /app
WORKDIR /app
USER node
COPY --chown=node:node package.json package-lock.json* ./
RUN npm config list
RUN npm ci && npm cache clean --force

# Image for development
FROM base AS dev
ENV NODE_ENV=development
RUN npm config list
RUN npm install --only=development \
  && npm cache clean --force
USER node
CMD [ "nodemon", "--inspect=0.0.0.0", "./bin/www" ]

# Source code
FROM base AS source
COPY --chown=node:node . .

# Testing image
FROM source AS test
ENV NODE_ENV=development
ENV JWT_PRIVATE_KEY=notSoSecretPassword
ENV JWT_ISSUER=https://dummy.issuer.com
COPY --from=dev /app/node_modules /app/node_modules
RUN eslint .
RUN npm run test:unit
# To run with docker-compose
CMD [ "npm", "run", "test:integration" ] 

# Audit image
FROM test AS audit
USER root
RUN npm audit --audit-level critical
ARG MICROSCANNER_TOKEN
ADD https://get.aquasec.com/microscanner /
RUN chmod +x /microscanner
RUN apk add --no-cache ca-certificates && update-ca-certificates
RUN /microscanner ${MICROSCANNER_TOKEN} --continue-on-failure

# Production image
FROM source AS prod
RUN rm -rf ./tests
ENTRYPOINT [ "/tini", "--" ]
HEALTHCHECK --interval=30s CMD node hc.js
USER node
CMD [ "node", "./bin/www" ]