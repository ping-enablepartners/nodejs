# Core Module of PingOne SDK for JavaScript

The library consists of multiple parts that are usable on its own and together:
- helper class to work with fetch methods;
- logger methods.


## Content
 1. [Installation](#installation)
 1. [Http API Reference](#http-api-reference)
 1. [Logger API Reference](#logger-api-reference)
 
## Installation

To install all parts as one [@ping-identity/p14c-js-sdk-core](https://www.npmjs.com/package/@ping-identity/p14c-js-sdk-core) you can run these commands in your project root folder:

```bash
# yarn
yarn install @ping-identity/p14c-js-sdk-core
```
or
```
# npm
npm install --save @ping-identity/p14c-js-sdk-core
```
Adding the `--save` parameters will update the package.json file with instructions on what should be installed, so you can simply call npm install without any parameters to recreate this folder later.


To install some specific part please run these commands in your project root folder:

```bash
# yarn
yarn install @ping-identity/pingone-js-sdk-fetch
yarn install @ping-identity/pingone-js-sdk-logger
```
or
```
# npm
npm install --save @ping-identity/pingone-js-sdk-fetch
npm install --save @ping-identity/pingone-js-sdk-logger
```
## Http API Reference

General class to work with fetch methods based on [cross-fetch](https://www.npmjs.com/package/cross-fetch) universal WHATWG Fetch API for Node, Browsers and React Native. 

```javascript
const {Http} = require("@ping-identity/p14c-js-sdk-core");
const fetch = new Http();
const  response = await fetch.getJson("https://someUrl", {accessToken: "accessTokenValue"})
```
|    Method   |    Description   |
| ------------- |------------- |
| `fetch (uri, request)` | The basic rest method that is used in all methods below. Sets `Bearer` Authorization header if `accessToken` is present in `request`  |
| `delete (uri, request)` | Call the delete method on requested `uri` |
| `json (uri, request)`| Execute defined `request` with `Accept: "application/json"` header |
| `getJson (uri, request)`  | Execute `json (uri, request)` with `GET` method |
| `post (uri, request)` | Execute `fetch (uri, request)`  with `POST` method |
| `postJson (uri, request)`  | Execute `json (uri, request)` with `POST` method|
| `patchJson (uri, request)`  | Execute `json (uri, request)` with `PATCH` method |
| `putJson (uri, request)`   |  Execute `json (uri, request)` with `PUT` method |
| `put (uri, request)` | Execute `fetch (uri, request)`  with `PUT` method |

## Logger API Reference

A flexible abstraction over using `console` log.
```javascript
const {logger} = require("@ping-identity/p14c-js-sdk-core");
logger.info("Something has happened.");
logger.warn("Something bad has happened.");
logger.debug("Something has happened with such details.");
logger.error("Something really bad has happened.");
```
