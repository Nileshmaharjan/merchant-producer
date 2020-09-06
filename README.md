# Merchant

[![Nodejs](https://i.imgur.com/yheB1Rm.png)](https://nodejs.org/)

### Tech

[![pipeline status](https://gitlab.com/Rosebay/cobuna-backend/badges/master/pipeline.svg)](https://gitlab.com/Rosebay/Triple-A/commits/master)
[![version](https://img.shields.io/badge/version-1.0-blue.svg)](https://gitlab.com/Rosebay/Triple-A/blob/master/package.json)
[![nest-version](https://img.shields.io/npm/dependency-version/nestjs-easyconfig/dev/@nestjs/core)](https://gitlab.com/Rosebay/Triple-A/blob/master/package.json)
[![npm-version](https://img.shields.io/npm/v/npm)](https://gitlab.com/Rosebay/Triple-A/blob/master/package.json)

TripleA uses a number of open source projects to work properly:


* [Node.js] - evented I/O for the backend
* [Typescript] - TypeScript brings you optional static type-checking along with the latest ECMAScript features.
* [Nestjs] - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
* [Typeorm] - A nodejs orm for working with sql databases 
* [Jest] - Jest is a delightful JavaScript Testing Framework with a focus on simplicity.
* [Helmet] - Helmet helps you secure your Express apps by setting various HTTP headers. It's not a                silver bullet, but it can help!
* [Tslint] - TSLint is an open source TypeScript linting utility




### Installation

TripleA requires [Node.js](https://nodejs.org/) v7+ to run.

Install the dependencies and devDependencies and start the server.


## Install ⚙️

```sh
npm i
```

## Usage 🚀 

```sh
npm run start:dev
```

## Run tests 📈 

```sh
npm run test
```

For production environments...

```sh
$ npm install --production
$ npm run start:prod
```


### Docker 🐳 
Triple A is very easy to install and deploy in a Docker container.

By default, the Docker will expose port 8000, so change this within the docker-compose if necessary. When ready, simply use the docker-compose file to build the image.

```sh
cd triple-a
docker-compose up

```
This will create the all the services required to run cobuna and pull in the necessary dependencies. 

Once done, Verify the deployment by navigating to your server address in your preferred browser.

```sh
127.0.0.1:8000
```
If you get any permission error in docker-compose up, try with sudo.

When you are done


```sh
docker-compose down

```
Removes all created containers and networks. USe -v flag to delete the persisted volume too

```sh

docker-compose stop

```

Alternatively, you can also use the deploy.sh script for automated build and deploy.

```sh

.scripts/deploy.sh
```
### Author

* Mohan Bhandari <mohan.bhandari@rosebayconsult.com>

* Gitlab: [@kr0nos](https://gitlab.com/kr0nos)

### Todos

 - Write MORE Tests
 - Code Coverage
 - Localize language

 
