# Node base image
FROM node:lts-alpine AS base

LABEL mantainer="Alessandro Lucarini <alessandro.lucarini@smanapp.com>"

ENV TIMEZONE=Europe/Rome

# Node environment vars
ENV TZ=${TIMEZONE}

RUN apk --no-cache add --update tzdata \
    && cp /usr/share/zoneinfo/${TIMEZONE} /etc/localtime \
    && apk del tzdata \
    && rm -rf /var/cache/apk/*

# Copies in our code and runs NPM Install
FROM base AS builder

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN apk --no-cache add --virtual builds-deps build-base python \
    && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app
COPY package*.json ./
COPY . .

RUN ["npm", "install", "--quiet"]

# Lints code
FROM base AS linting

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .
RUN ["npm", "run", "lint"]

# Runs Unit Tests
FROM base AS unit-tests

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/ .
RUN ["npm", "run", "test"]

# Starts and serve API
FROM base AS serve

WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/ ./
COPY --from=builder /usr/src/app/package* ./
CMD ["npm", "run", "start:prod"]
