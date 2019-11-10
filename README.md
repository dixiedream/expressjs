# Express.js
Boilerplate for creating nodejs app using Docker multistage build

## Application structure

```
src/api/controllers/ # actual API request handlers
src/api/models/ # Mongoose model
src/api/routes/ # Routes definitions
src/config/ # Common configuration files (es. openapi.json)
tests/ # tests for controllers, models, other logical units - within properly reflected file structure
```

## Code style

Follow [Airbnb style guide](https://github.com/airbnb/javascript). [ESLint](http://eslint.org/) together with [Airbnb base config](https://www.npmjs.com/package/eslint-config-airbnb-base) is set-up to lint your code.

## Useful links

- Use [Swagger editor](editor.swagger.io) for defining new routes.
- Documentation for [OpenAPI specs](https://swagger.io/specification)

## Setup

- Install [VSCode](https://code.visualstudio.com/) IDE
- Install VSCode extensions ESlint and Prettier
- Install [Docker](https://docs.docker.com/install/)
- Create your own `.env` file based on `default.env`
- Run `docker-compose up`
- For development it'll be necessary to run `docker-compose run backend npm i` for installing dependencies on host machine after the initial build failed.

## Extra

To connect with a GUI to the dev mongo db instance us [MongoDb Compass](https://www.mongodb.com/download-center/compass)

## ToDo
- Better dealing with Node.js shutdown using [Connection tracking](https://github.com/hunterloftis/stoppable)

## Contributing

If something is unclear, confusing, or needs to be refactored, please let us know. Pull requests are always welcome, but note the minimalistic nature of the repository - it's designed as lean, universal starting point for actual projects, and nothing more.

## License

The MIT License (MIT)
