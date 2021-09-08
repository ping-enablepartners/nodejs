# JWT Verification Module of PingOne SDK for JavaScript

This module allows you to decode and verify JSON Web Token.

It validates if the JWT:
 1. is well-formed - contains three base64url encoded segments, separated by two period ('.') characters: Header, Payload and Signature;
  1. is correctly signed using the proper key;
   1. has correct standard claims: token expiration, issuer and audience.


## Content
 1. [Installation](#installation)
 1. [Module API Reference](#module-api-reference)
 
## Installation

To install [@ping-identity/p14c-js-sdk-jwt](https://www.npmjs.com/package/@ping-identity/p14c-js-sdk-jwt) you can run these commands in your project root folder:

```bash
# yarn
yarn install @ping-identity/p14c-js-sdk-jwt
```
or
```
# npm
npm install --save @ping-identity/p14c-js-sdk-jwt
```

Create `JwtVerifier` like:

```javascript
const JwtVerifier = require("@ping-identity/p14c-js-sdk-jwt");

const jwtVerifier = new JwtVerifier(jwksUri);

jwtVerifier.validateToken("idTokenContent", "expectedAudience", "expectedIssuer", "expectedNonce")
```

where configuration parameter is:
- `jwksUri`: **Required**. JSON Web Key Set of keys which contains the public keys used to verify any JWT issued by authorization server and signed by RS256 signing algorithm.

## Module API Reference
|    Method   |    Description   |
| ------------- |------------- |
| `validateToken (idToken, expectedAudience, expectedIssuer, expectedNonce)` | Verify ID token validity.  |
|`decodeToken (idToken)`| Decode ID Token string into the individual JWS parts: header, payload and signature |
| `jwkGetKey(jwkIn, kty, use, kid)` | Retrieve the JWK key that matches the input criteria |
| `getIdTokenPayload (idToken)` | Get the claim set of a JWT without performing validation of the signature or any of the registered claims |
