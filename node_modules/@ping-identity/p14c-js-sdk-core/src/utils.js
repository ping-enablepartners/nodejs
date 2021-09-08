const utils = module.exports;

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validate application configuration clientId and issuer
 * @param {object} args application configuration
 */
utils.assertValidConfig = function (args) {
    if (!args.clientId || !uuidRegex.test(args.clientId)) {
        throw new Error(`Invalid client ID, it should be a valid UUID. Current value: ${args.clientId}.`);
    }
    if (!args.environmentId || !uuidRegex.test(args.environmentId)) {
        throw new Error(`Invalid environment ID, it should be a valid UUID. Current value: ${args.environmentId}.`);
    }
    if (!args.issuer || !/http(s)?:\/\//.test(args.issuer)) {
        throw new Error(`Your Issuer URL must start with https or http. Current value: ${args.issuer}.`);
    }
};
/**
 * Convert object parameters to encoded URI query string
 * @param {object} obj object parameters to convert
 * @returns {string} encoded URI query string
 */
utils.objectToURIQuery = function (obj) {
    const str = [];
    if (obj !== null) {
        for (const key in obj) {
            if (key in obj &&
                obj[key] !== undefined &&
                obj[key] !== null) {
                str.push(`${key}=${encodeURIComponent(obj[key])}`);
            }
        }
    }
    if (str.length) {
        return `?${str.join("&")}`;
    } else {
        return "";
    }
};

/**
 * Convert a string to base64 url safe variant of string
 * @param {string} str string to convert
 * @returns {*} base64 url safe variant of string
 */
utils.stringToBase64Url = function (str) {
    const b64 = btoa(str);
    return utils.base64StringToBase64Url(b64);
};

/**
 * Convert a standard base64-encoded string to url safe variant of string
 * @param {string} b64 standard base64-encoded string
 * @returns {string} url safe variant of string
 */
utils.base64StringToBase64Url = function (b64) {
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/**
 * Convert url parameters to object
 * @param {string} hashOrSearch url with hash or search parameters
 * @returns {obj} obj with url parameters
 */
utils.urlParamsToObject = function (hashOrSearch) {
    const plusSign = /\+/g;
    const paramSplit = /([^&=]+)=?([^&]*)/g;
    let fragment = hashOrSearch;

    // Some hash based routers will automatically add a / character after the hash
    if (fragment.charAt(0) === "#" && fragment.charAt(1) === "/") {
        fragment = fragment.substring(2);
    }

    // Remove the leading ? or #
    if (fragment.charAt(0) === "?" || fragment.charAt(0) === "#") {
        fragment = fragment.substring(1);
    }

    const obj = {};
    // Loop until we have no more params
    let param;
    while (true) {
        // eslint-disable-line no-constant-condition
        param = paramSplit.exec(fragment);
        if (!param) {
            break;
        }

        const key = param[1];
        const value = param[2];

        // id_token, access_token and code should remain base64url encoded
        if (key === "id_token" || key === "access_token" || key === "code") {
            obj[key] = value;
        } else {
            obj[key] = decodeURIComponent(value.replace(plusSign, " "));
        }
    }
    return obj;
};

utils.isInIframe = function () {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
};

utils.isString = function (obj) {
    return (typeof obj === "string" || obj instanceof String);
};

utils.isObject = function (obj) {
    return obj && typeof obj === "object" && obj.constructor === Object;
};

utils.isHTTPS = function () {
    return window.location.protocol === "https:";
};

utils.isLocalhost = function () {
    return window.location.hostname === "localhost";
};

utils.removeNils = function (obj) {
    const cleaned = {};
    for (const prop in obj) {
        if (prop in obj) {
            const value = obj[prop];
            if (value !== null && value !== undefined) {
                cleaned[prop] = value;
            }
        }
    }
    return cleaned;
};

