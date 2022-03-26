# tz-wrapped-frontend

The frontend component of the tz-wrapped application.

The backend can be found [here](https://github.com/airgap-it/tz-wrapped-backend).

## Build

1. yarn install
2. yarn fix-crypto
3. yarn build:local

To build for different environments just change the build command to `yarn build:dev` for development or `yarn build:prod` for production.

## Development server

Run `yarn start:local`.

To start the development server for different environments just change the start command to `yarn start:dev` for development or `yarn start:prod` for production.

## Running unit tests

Run `yarn test`.

## Configuration

The node URL and the backend URL are configured in the environment files under `src/environments`. Depending on the environment you are running, change the corresponding file and provide a valid node and backend URL.
