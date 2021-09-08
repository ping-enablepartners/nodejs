const rs = require("jsrsasign");
const fetch = require("cross-fetch");

class JwtVerifier {
    constructor (jwksUri) {
        this.jwksUri = jwksUri;
    }

    /**
     * Verifies the JWS string using RSA JWK
     * @param {string} jws      - The signed JWT
     * @param {object} jwk      - The JWK Key that will be used to verify the signature
     * @returns {boolean}       - Validity of the JWS signature
     * @throws {Error}
     */
    rsaVerifyJWS (jws, jwk) {
        try {
            if (jws && typeof jwk === "object") {
                // All tokens in PingOne are JWTs signed using the RS256 signing algorithm.
                if (jwk.kty === "RSA") {
                    const verifier = rs.jws.JWS;
                    if (jwk.n && jwk.e) {
                        const pubkey = rs.KEYUTIL.getKey({kty: "RSA", n: jwk.n, e: jwk.e});
                        return verifier.verify(jws, pubkey, ["RS256"]);
                    }
                } else {
                    throw new Error("No RSA kty in JWK");
                }
            }
            return false;
        } catch (e) {
            throw new Error(
                `Unable to verify the JWS string: ${e.toString()}`);
        }
    }

    /**
     * Verify ID token validity.
     * Ensure the JWT contains the expected audience, issuer, expiration, etc.
     * @param {string} idToken - ID Token
     * @param {string} expectedAudience - expected audience to compare the id token claim with
     * @param {string} expectedIssuer      - expected issuer to compare the id token claim with
     * @param {string} expectedNonce      - nonce value that was sent in the Authentication Request
     * @returns {boolean}       - true if JTW is valid
     */
    async validateToken (idToken, expectedAudience, expectedIssuer, expectedNonce) {
        const idtParts = this.decodeToken(idToken);
        const header = this.getJsonObject(idtParts[0]);
        if (header.alg && header.alg.substr(0, 2) === "RS") {
            if (!this.jwks) {
                try {
                    const jwksResponce = await fetch(this.jwksUri);
                    this.jwks = await jwksResponce.json();
                } catch (e) {
                    throw new Error(`No JWK key set found: ${e.toString()}`);
                }
            }
            // PingOne uses RSA cryptographic algorithm
            const jwk = this.jwkGetKey(this.jwks, "RSA", "sig", header.kid);
            if (!jwk) {
                throw new Error("No matching JWK found.");
            } else {
                return this.rsaVerifyJWS(idToken, jwk[0]) &&
                    this.isValidIdTokenPayload(
                        this.getJsonObject(idtParts[1]), expectedAudience, expectedIssuer, expectedNonce);
            }
        } else {
            throw new Error(
                `Unsupported JWS signature algorithm ${header.alg}`);
        }
    }

    /**
     * Validates the ID Token payload.
     *
     * Ensure the JWT contains the expected audience, issuer and expiration time.
     * @param {string} payload               - The ID Token payload
     * @param {string} expectedAudience      - expected audience
     * @param {string} expectedIssuer      - expected issuer
     * @param {string} expectedNonce      - nonce value that was sent in the Authentication Request
     * @returns {boolean}                    - true if ID Token is valid
     * @throws {Error}                       - if ID Token is invalid
     * @see https://openid.net/specs/openid-connect-core-1_0.html#IDTokenValidation
     */
    isValidIdTokenPayload (payload, expectedAudience, expectedIssuer, expectedNonce) {
        const now = Date.now() / 1000;
        if (payload.iat > now) {
            throw new Error(
                "ID Token issued time is later than current time");
        }
        // The current time MUST be before the time represented by the exp Claim.
        if (payload.exp < now) {
            throw new Error("ID Token expired");
        }

        // Verify audience claim
        if (!expectedAudience) {
            throw new Error("Audience claim is required");
        }
        // Verify audience claim
        if (Array.isArray(expectedAudience) && !expectedAudience.includes(payload.aud)) {
            throw new Error(`Audience claim ${payload.aud} does not match one of the expected audiences: 
            ${expectedAudience.join(", ")}`);
        }
        // Verify issuer claim
        if (payload.iss !== expectedIssuer) {
            throw new Error(`Issuer claim ${payload.iss} does not match expected issuer: ${expectedIssuer}`);
        }
        // Verify nonce claim
        // Nonce Claim MUST be present and its value checked to verify that it is the same value as the one that was sent in the Authentication Request.
        if (expectedNonce && payload.nonce !== expectedNonce) {
            throw new Error(`Nonce claim ${payload.nonce} does not match expected nonce: ${expectedNonce}`);
        }
        return true;
    }

    /**
     * Decode token string into the individual JWS parts( header, payload and signature) without verifying the signature
     * @param  {string} token    -  token to decode
     * @returns {Array} An array of the JWS compact serialization components (header, payload, signature)
     */
    decodeToken (token) {
        try {
            const jws = new rs.jws.JWS();
            // Parse JWS string and set public property 'parsedJWS' dictionary
            jws.parseJWS(token);
            return [jws.parsedJWS.headS, jws.parsedJWS.payloadS, jws.parsedJWS.si];
        } catch (e) {
            throw new Error(`Unable to split the ID Token string: ${e.toString()}`);
        }
    }

    /**
     * Get the contents of the ID Token payload as an JSON object
     * @param {string} idToken     - ID Token
     * @returns {object}            - The ID Token payload JSON object
     */
    getIdTokenPayload (idToken) {
        try {
            const parts = this.decodeToken(idToken);
            if (parts) {
                return this.getJsonObject(parts[1]);
            }
        } catch (e) {
            throw new Error(`Unable to get the contents of the ID Token payload: ${e.toString()}`);
        }
    }

    /**
     * Get the JSON object from the JSON string
     * @param {string} jsonString    - JSON string
     * @returns {object|null}   JSON object
     */
    getJsonObject (jsonString) {
        try {
            const jws = rs.jws.JWS;
            if (jws.isSafeJSONString(jsonString)) {
                return jws.readSafeJSONString(jsonString);
            }
        } catch (e) {
            throw new Error(`Unable to get the JSON object from JSON string: ${e.toString()}`);
        }
    }

    /**
     * Retrieve the JWK key that matches the input criteria
     * @param {string|object} jwkIn     - JWK Keys set string or object
     * @param {string} kty              - The 'kty' to match (RSA|EC). Only RSA is supported.
     * @param {string}use               - The 'use' to match (sig|enc).
     * @param {string}kid               - The 'kid' to match
     * @returns {array}                 Array of JWK keys that match the specified criteria
     */
    jwkGetKey (jwkIn, kty, use, kid) {
        try {
            let jwk = null;
            let foundKeys = [];

            if (jwkIn) {
                if (typeof jwkIn === "string") {
                    jwk = this.getJsonObject(jwkIn);
                } else if (typeof jwkIn === "object") {
                    jwk = jwkIn;
                }

                if (jwk !== null && typeof jwk.keys === "object") {
                    if (jwk.keys.length === 0) {
                        return null;
                    }

                    for (let i = 0; i < jwk.keys.length; i += 1) {
                        if (jwk.keys[i].kty === kty) {
                            foundKeys.push(jwk.keys[i]);
                        }
                    }

                    if (foundKeys.length === 0) {
                        return null;
                    }

                    foundKeys = this.findByUse(use, foundKeys);
                    if (foundKeys.length === 0) {
                        return null;
                    }

                    foundKeys = this.findByKid(kid, foundKeys);
                    if (foundKeys.length === 0) {
                        return null;
                    } else {
                        return foundKeys;
                    }
                }
            }
        } catch (e) {
            throw new Error(`Unable to retrieve the JWK key: ${e.toString()}`);
        }
    }

    findByUse (use, foundKeys) {
        if (use) {
            const temp = [];
            for (let j = 0; j < foundKeys.length; j += 1) {
                if (!foundKeys[j].use) {
                    temp.push(foundKeys[j]);
                } else if (foundKeys[j].use === use) {
                    temp.push(foundKeys[j]);
                }
            }
            return temp;
        }
        return foundKeys;
    }

    findByKid (kid, foundKeys) {
        if (kid) {
            const temp = [];
            for (let k = 0; k < foundKeys.length; k += 1) {
                if (foundKeys[k].kid === kid) {
                    temp.push(foundKeys[k]);
                }
            }
            return temp;
        }
        return foundKeys;
    }
}

module.exports = JwtVerifier;
