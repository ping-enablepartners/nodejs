# PingOne SDK for JavaScript Management API Module 

The [PingOne Management API](https://apidocs.pingidentity.com/pingone/platform/v1/api/#management-apis) module provides the interface to configure and manage PingOne resources through self-management scopes. 

PingOne [self-management scopes](https://apidocs.pingidentity.com/pingone/platform/v1/api/#access-services-through-scopes-and-roles) are applicable to users only. They are granted on `authorization_code` and `implicit` authorization flows. 

The self-management scopes specified in an authorization request identify the resources that end users can access to perform self-management actions(the ability to interact with their own profile data).

This module includes methods to work with:
- user identity and its attributes;
- user multi-factor authentication devices; 
- user identity password;
- user identity linked accounts;
- user identity pairing key.


## Content
 1. [Installation](#installation)
 1. [Module API Reference](#module-api-reference)
 
## Installation

To install [@ping-identity/p14c-js-sdk-user](https://www.npmjs.com/package/@ping-identity/p14c-js-sdk-user) you can run these commands in your project root folder:

```bash
# yarn
yarn install @ping-identity/p14c-js-sdk-user
```
or
```
# npm
npm install --save @ping-identity/p14c-js-sdk-user
```

Create `PingOneUserApiClient` like:

```javascript
const PingOneUserApiClient = require("@ping-identity/p14c-js-sdk-user");

const config = {
  clientId: "someClientId",
  environmentId: "someEnvironmentId",
  scopes: ["p1:read:user"],
};

const userApiClient = new PingOneUserApiClient(config);

userApiClient.getAllData(userId);
```

, where configuration parameters are:
- `environmentId`: **Required**. Your application's Environment ID. You can find this value at your Application's Settings under
  **Configuration** tab from the admin console( extract `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` string that specifies the environment 128-bit universally unique identifier ([UUID](https://tools.ietf.org/html/rfc4122)) right from `https://auth.pingone .com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx/as/authorize`
  _AUTHORIZATION URL_ ). Or from the _Settings_ main menu (_ENVIRONMENT ID_ variable)
- `clientId`: **Required**. Your application's client UUID. You can also find this value at Application's Settings right under the
  Application name.
- `scopes`: **Required**. PingOne [self-management scopes](https://apidocs.pingidentity.com/pingone/platform/v1/api/#access-services-through-scopes-and-roles)
- `API_URI` : **Optional**. PingOne API base endpoint. Default value: `https://api.pingone.com`
- `AUTH_URI` : **Optional**. PingOne Authentication base endpoint. Default value:`https://auth.pingone.com`

This module works together with `@ping-identity/p14c-js-sdk-auth` to get an access token after user successfully logged in. 

## Module API Reference
| Method Name                                          | Description                                                                                                                                                                                                                                 |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getAllData(userId)`               | [Get logged in user attributes](https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-step-8-get-user-information)                                                                                                                                           |
| `update (userId, user, completeUpdate = false)`                                    | [Modify logged in user attributes](https://apidocs.pingidentity.com/pingone/platform/v1/api/#patch-step-9-update-user-information)                                                                                                                                                                                                          |
| `resetPassword (userId, currentPassword, newPassword)`  | [Self-change reset of logged in user password](https://apidocs.pingidentity.com/pingone/customer/v1/api/man/p1_Users/p1_Password/#Update-a-users-password)                                                                                            |
| `enableMFA (userId, enable)`                                 | [Enable or disable multi-factor authentication for logged in user](https://apidocs.pingidentity.com/pingone/platform/v1/api/#put-update-user-mfa-enabled)|
| `createSMSDevice (userId, phone)`                                   | [Add an SMS device for logged in user](https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-create-mfa-user-device-sms)                                                                                             |
| `createEmailDevice (userId, email)`                             | [Add an email device for logged in user](https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-create-mfa-user-device-email)                                                                                   |
| `getAllMFADevices(userId)`   | [Retrieve all multi-factor authentication devices for logged in user](https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-read-all-mfa-user-devices)                                                                                                         |
| `deleteMFADevice (userId, deviceId)`   | [Delete multi-factor authentication device for logged in user](https://apidocs.pingidentity.com/pingone/platform/v1/api/#delete-delete-mfa-user-device)                                                                                  |
| `getAllLinkedAccounts (userId, expand = false)`| [Get all linked accounts for logged in user](https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-read-linked-accounts) |
| `deleteLinkedAccounts (userId, linkedAccountId)`| [Delete linked accounts for logged in user](https://apidocs.pingidentity.com/pingone/platform/v1/api/#delete-delete-linked-account) |
| `createMFAPairingKey (userId, applicationId)`| [Create a pairing key for logged in user](https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-create-mfa-pairing-key) |
| `deleteMFAPairingKey (userId, pairingKeyId)`| [Remove the pairing key for logged in user](https://apidocs.pingidentity.com/pingone/platform/v1/api/#delete-delete-mfa-pairing-key) |
| `getMFAPairingKey (userId, pairingKeyId)` | [Retrieve the pairing key for logged in user](https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-read-one-mfa-pairing-key) |
