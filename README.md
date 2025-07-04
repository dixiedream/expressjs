# Express.js
Boilerplate for creating nodejs app using Docker multistage build

## Application structure

```
src/api/controllers/ # actual API request handlers
src/api/models/ # Mongoose model
src/api/routes/ # Routes definitions
src/config/ # Common configuration/setup files (es. db connection, logger, production stuff)
src/middleware/ # Just middlewares
src/shared/ # The place to put other common stuff (es. errors, mail handling)
tests/ # tests for controllers, models, other logical units - within properly reflected file structure
```

## Code style

Following the old StandardJs now embraced by [neostandard](https://github.com/neostandard/neostandard) team

## Setup

- Install [Docker](https://docs.docker.com/install/)
- Create your own `.env` file based on `default.env`
- For development it'll be necessary to run `docker-compose run backend npm i` for installing dependencies on host machine after the initial build failed.
- Run `docker-compose up` for a dev environment. The API endpoint is `localhost:3000/api`
- For debugging use the handy [Chrome DevTools](https://chromedevtools.github.io/devtools-protocol/)
- For local env testing `sh devtests.sh`

## Extra

To connect with a GUI to the dev mongo db instance use MongoDb Express provided at `localhost:8081`

## Contributing

If something is unclear, confusing, or needs to be refactored, please let us know. Pull requests are always welcome, but note the minimalistic nature of the repository - it's designed as lean, universal starting point for actual projects, and nothing more.

## License

The MIT License (MIT)
