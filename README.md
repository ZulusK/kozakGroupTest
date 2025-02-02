# Kozak Group Test Task

| Master                                                                           | Develop                                                                       |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [![Build Status][travis-master]](https://travis-ci.org/ZulusK/kozakGroupTest-be) | [![Build Status][travis-dev]](https://travis-ci.org/ZulusK/kozakGroupTest-be) |
| [![codecov][codecov-master]](https://codecov.io/gh/ZulusK/kozakGroupTest-be)     | [![codecov][codecov-dev]](https://codecov.io/gh/ZulusK/kozakGroupTest-be)     |

## Documentation

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/9fdbbb16b4493c7db5e9)

## Getting Started

Install yarn:

```js
npm install -g yarn
```

Install dependencies:

```sh
yarn
```

Set environment (vars):

```sh
cp .env.example .env
```

Start server:

```sh
# Start server
yarn start

# Selectively set DEBUG env var to get logs
DEBUG=app:*
```

Refer [debug](https://www.npmjs.com/package/debug) to know how to selectively turn on logs.

Tests:

```sh
# Run tests written in ES6
yarn test

# Run test along with code coverage
yarn test:coverage

# Run tests on file change
yarn test:watch
```

Lint:

```sh
# Lint code with ESLint
yarn lint

# Run lint on any file change
yarn lint:watch
```

##### Deployment

```sh
# install production dependencies only
yarn --production
```

## Logging

Universal logging library [winston](https://www.npmjs.com/package/winston) is used for logging. You can find logs in a directory logs in root of project

#### API logging

Logs detailed info about each api request to console during development.
![Detailed API logging](https://cloud.githubusercontent.com/assets/4172932/12563354/f0a4b558-c3cf-11e5-9d8c-66f7ca323eac.JPG)

#### Error logging

Logs stacktrace of error to console along with other details. You should ideally store all error messages persistently.
![Error logging](https://cloud.githubusercontent.com/assets/4172932/12563361/fb9ef108-c3cf-11e5-9a58-3c5c4936ae3e.JPG)

## Code Coverage

Get code coverage summary on executing `yarn test`
![Code Coverage Text Summary](https://cloud.githubusercontent.com/assets/4172932/12827832/a0531e70-cba7-11e5-9b7c-9e7f833d8f9f.JPG)

`yarn test` also generates HTML code coverage report in `coverage/` directory. Open `lcov-report/index.html` to view it.
![Code coverage HTML report](https://cloud.githubusercontent.com/assets/4172932/12625331/571a48fe-c559-11e5-8aa0-f9aacfb8c1cb.jpg)

## Built With

| Server                                    |
| ----------------------------------------- |
| [Node.js](https://nodejs.org/)            |
| [Express](http://expressjs.com)           |
| [MongoDB](https://www.mongodb.com/)       |
| [Chai](http://chaijs.com)                 |
| [Mocha](https://mochajs.org)              |
| [Passport.js](http://www.passportjs.org/) |

## Authors

- **Kazimirov Danil** - _Full stack developer_ - [ZulusK](https://github.com/ZulusK)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

[codecov-dev]: https://codecov.io/gh/ZulusK/kozakGroupTest-be/branch/dev/graph/badge.svg "Code coverage develop"
[codecov-master]: https://codecov.io/gh/ZulusK/kozakGroupTest-be/branch/master/graph/badge.svg "Code coverage master"
[travis-dev]: https://travis-ci.org/ZulusK/kozakGroupTest-be.svg?branch=develop "Travis CI build status on develop"
[travis-master]: https://travis-ci.org/ZulusK/kozakGroupTest-be.svg?branch=master "Travis CI build status on master"
