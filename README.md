# Express.js
Boilerplate for creating nodejs app using Docker multistage build

## Technology stack

Key pillars of chosen application stack are:
* [swagger-node](https://github.com/swagger-api/swagger-node) - specification-first routing, request validation, using [Express](https://expressjs.com/) underneath.
* [Passport](http://passportjs.org/) - de-facto standard authentication middleware in Node.js
* [node.bcrypt.js](https://github.com/kelektiv/node.bcrypt.js) - used for hashing passwords associated with example User model
* [node-jwt-simple](https://github.com/hokaccha/node-jwt-simple) - encoding/decoding JSON Web Tokens, used for basic route authentication

## Application structure

```
src/api/controllers/ # actual API request handlers
src/api/models/ # Mongoose model
src/api/routes/ # Routes definitions
src/config/ # Common configuration files (es. swagger.json)
test/ # tests for controllers, models, other logical units - within properly reflected file structure
```

## Code style

Follow [Airbnb style guide](https://github.com/airbnb/javascript). [ESLint](http://eslint.org/) together with [Airbnb base config](https://www.npmjs.com/package/eslint-config-airbnb-base) is set-up to lint your code.

## Useful links

* Use [Swagger editor](editor.swagger.io) for defining new routes.
* Documentation for [OpenAPI specs](https://swagger.io/specification/v2/)

## Setup 

* Install [VSCode](https://code.visualstudio.com/) IDE
* Install VSCode extensions ESlint and Prettier
* Install [Docker](https://docs.docker.com/install/)
* Create your own `.env` file based on `default.env`
* Run `docker-compose up`

## Contributing

If something is unclear, confusing, or needs to be refactored, please let us know. Pull requests are always welcome, but note the minimalistic nature of the repository - it's designed as lean, universal starting point for actual projects, and nothing more.

## License
The MIT License (MIT)
