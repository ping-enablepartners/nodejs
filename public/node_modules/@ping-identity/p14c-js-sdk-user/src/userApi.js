const {Http} = require("@ping-identity/p14c-js-sdk-core");
const {TokenManager} = require("@ping-identity/p14c-js-sdk-auth");

/**
 * Base client to work with self-managed User PingOne API.
 *
 * The requested user resource or user's sub-resources must be the same as the user identified by the sub claim (the userId) in the access token.
 * The requested resource must be in the same environment as the environment identified by the env claim in the access token.
 *
 * @class PingOneUserApiClient
 */
class PingOneUserApiClient {
    constructor (config) {
        this.issuer = `${
            config.AUTH_URI ? config.AUTH_URI : "https://auth.pingone.com"
        }/${config.environmentId}/as`;
        this.apiUrl = `${
            config.API_URI ? config.API_URI : "https://api.pingone.com"
        }/v1/environments/${config.environmentId}`;
        this.http = new Http();
        this.tokenManager = new TokenManager(config);
    }

    /**
     *  Logged in user can retrieve all its attributes by its own.
     *
     *  Access token must include the p1:read:user scope.
     *  @param {string} userId - user identifier
     *  @param {boolean} expandPopulation - whether to show information about the user's population assignment.
     * @returns {Promise<*>} user identity data
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-read-one-user
     */
    async getAllData (userId, expandPopulation = false) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}${expandPopulation ? "?expand=population" : ""}`;
        return this.http.getJson(url, {
            accessToken: accessToken.value
        });
    }

    /**
     * Logged in user can do a partial update: only specified existing property values.
     * Property values omitted from the request body are not updated.
     * Possible user attributes are: email, givenName, familyName, nickname, title, username
     *
     * Access token must include the p1:update:user scope.
     *  @param {string} userId - user identifier
     * @param {object} user json object
     * @param {boolean} completeUpdate - if true then do  apartial update: only specified existing property values. If false (default) - completely update its attributes (any existing property values omitted from the request body will be removed.)
     * @returns {Promise<*>} user identity
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#patch-step-9-update-user-information
     */
    async update (userId, user, completeUpdate = false) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}`;
        const request = {
            body: {
                "email": user.email,
                "mfaEnabled": user.mfaEnabled,
                "name": {
                    "given": user.givenName,
                    "family": user.familyName
                },
                "nickname": user.nickname,
                "title": user.title,
                "username": user.username
            },
            accessToken: accessToken.value
        };
        if (completeUpdate) {
            return this.http.putJson(url, request);
        } else {
            return this.http.patchJson(url, request);
        }
    }

    /**
     * Logged in user can enable and disable multi-factor authentication for its own user identity.
     *
     * Access token must include the p1:update:userMfaEnabled scope.
     *  @param {string} userId - user identifier
     * @param {boolean} enable  - true to enable and false to disable mfa
     * @returns {Promise<*>} result of enabling/disabling multi-factor authentication endpoint response
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#put-update-user-mfa-enabled
     */
    async enableMFA (userId, enable) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}/mfaEnabled`;
        return this.http.putJson(url, {
            body: {
                "mfaEnabled": enable
            },
            accessToken: accessToken.value
        });
    }

    /**
     * Logged in user can reset/update the password for its own user identity.
     * Note that the new password is validated against the current password policy
     *
     * Access token must include the p1:reset:userPassword scope.
     *  @param {string} userId - user identifier
     * @param {string} currentPassword - user current password
     * @param {string} newPassword - user new password
     * @returns {Promise} - promise of change password endpoint response. For a successful self-change update, the status attribute value is changed to OK.
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#put-update-password-self
     */
    async resetPassword (userId, currentPassword, newPassword) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}/password`;

        return this.http.putJson(url, {
            body: {
                currentPassword: currentPassword,
                newPassword: newPassword
            },
            headers: {
                "Content-type": "application/vnd.pingidentity.password.reset+json"
            },
            accessToken: accessToken.value
        });
    }

    /**
     * Logged in user can add an SMS device for its own user identity.
     * Access token must include the p1:create:device scope.
     *
     *  @param {string} userId - user identifier
     * @param {string} phone - valid phone number. Can be provided in international format (includes a leading + character), or in any format as long as the region (country code) where the number originates can be determined. The input string is checked to determine whether it is a viable phone number (for example, whether it has too few or too many digits, cannot start with a 1) or if no country code is supplied.
     * @returns {Promise} - promise of creating user SMS device endpoint response.
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-create-mfa-user-device-sms
     */
    async createSMSDevice (userId, phone) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}/devices`;

        return this.http.postJson(url, {
            body: {
                type: "SMS",
                phone: phone
            },
            accessToken: accessToken.value
        });
    }

    /**
     * Logged in user can add an SMS device for its own user identity.
     *
     * Access token must include the p1:create:device scope.
     *  @param {string} userId - user identifier
     * @param {string} email - user email
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-create-mfa-user-device-email
     */
    async createEmailDevice (userId, email) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}/devices`;

        return this.http.postJson(url, {
            body: {
                type: "EMAIL",
                email: email
            },
            accessToken: accessToken.value
        });
    }

    /**
     *  Users can retrieve multi-factor authentication devices for its own user identity.
     *
     *  Access token must include the p1:read:device scope.
     *  @param {string} userId - user identifier
     * @returns {Promise<*>} ulti-factor authentication devices
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-read-all-mfa-user-devices
     */
    async getAllMFADevices (userId) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}/devices`;
        return this.http.getJson(url, {
            accessToken: accessToken.value
        });
    }

    /**
     * Logged in user can delete multi-factor authentication devices for its own user identity.
     *
     * Access token must include the p1:delete:device scope.
     *  @param {string} userId - user identifier
     * @param {string} deviceId multi-factor authentication device id
     * @returns {Promise<*>} result of multi-factor authentication device deletion (204 Successfully deleted message).
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#delete-delete-mfa-user-device
     */
    async deleteMFADevice (userId, deviceId) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}/devices/${deviceId}`;
        return this.http.delete(url, {
            accessToken: accessToken.value
        });
    }

    /**
     *  Users can read linked accounts for its own user identity.
     *
     *  Access token must include the p1:read:userLinkedAccounts scope.
     *  @param {string} userId - user identifier
     *  @param {boolean} expand filter parameter on the identityProviders attribute so that you can see details about the external identity provider associated with each linked account.
     * @returns {Promise<*>} user linked accounts
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-read-linked-accounts
     */
    async getAllLinkedAccounts (userId, expand = false) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}/linkedAccounts?expand=${expand}`;
        return this.http.getJson(url, {
            accessToken: accessToken.value
        });
    }

    /**
     * Logged in user can delete multi-factor authentication devices for its own user identity.
     *
     * Access token must include the p1:delete:userLinkedAccounts scope.
     *  @param {string} userId - user identifier
     * @param {string} linkedAccountId linkedAccountId id
     * @returns {Promise<*>} result of linked account deletion (204 Successfully deleted message).
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#delete-delete-linked-account
     */
    async deleteLinkedAccounts (userId, linkedAccountId) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}/linkedAccounts/${linkedAccountId}`;
        return this.http.delete(url, {
            accessToken: accessToken.value
        });
    }

    /**
     * Logged in user can create a pairing key for its own user identity.
     *
     * Access token must include the p1:create:pairingKey scope.
     *  @param {string} userId - user identifier
     * @param {string} applicationId   - native application ID that can be used with this pairing key.
     * To allow all available native applications in the environment to be used don't specify any value.
     * @returns {Promise} - promise of setting user password response
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-create-mfa-pairing-key
     */
    async createMFAPairingKey (userId, applicationId) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}/pairingKeys`;
        const body = applicationId ? {id: applicationId} : {};

        return this.http.postJson(url, {
            body: {
                applications: body
            },
            accessToken: accessToken.value
        });
    }

    /**
     * Logged in user can remove the pairing key specified for its own user identity.
     *
     * Access token must include the p1:delete:pairingKey scope.
     * @param {string} userId - user identifier
     * @param {string} pairingKeyId - the pairing key id specified in the request URL.
     * @returns {Promise<*>} result of pairing key deletion (204 Successfully deleted message).
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#delete-delete-mfa-pairing-key
     */
    async deleteMFAPairingKey (userId, pairingKeyId) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}/pairingKeys/${pairingKeyId}`;
        return this.http.delete(url, {
            accessToken: accessToken.value
        });
    }

    /**
     *  Users can read a pairing key for its own user identity.
     *
     *  Access token must include the p1:read:pairingKey scope.
     *  @param {string} userId - user identifier
     *  @param {string} pairingKeyId filter parameter on the identityProviders attribute so that you can see details about the external identity provider associated with each linked account.
     * @returns {Promise<*>} user pairing keys
     * @see https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-read-one-mfa-pairing-key
     */
    async getMFAPairingKey (userId, pairingKeyId) {
        const accessToken = await this.tokenManager.get("accessToken");
        const url = `${this.apiUrl}/users/${userId}/pairingKeys/${pairingKeyId}`;
        return this.http.getJson(url, {
            accessToken: accessToken.value
        });
    }
}

module.exports = PingOneUserApiClient;
