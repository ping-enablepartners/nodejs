const fetch = require("cross-fetch");
const utils = require("./utils");

const PUT_METHOD = "put";
const POST_METHOD = "post";

class Http {
    async fetch (uri, request) {
    // eslint-disable-next-line no-param-reassign
        request = request || {};
        request.method = request.method || "get";
        request.withCredentials = Boolean(request.withCredentials);

        if (request.accessToken && utils.isString(request.accessToken)) {
            request.headers = Object.assign(
                {
                    Authorization: `Bearer ${request.accessToken}`
                },
                request.headers
            );
            Reflect.deleteProperty(request, "accessToken");
        }
        const response = await fetch(uri, request);
        if (response.ok) {
            if (response.url.indexOf("error=") > 0) {
                const responseParams = utils.urlParamsToObject(response.url.substring(response.url.indexOf("?")));
                throw new Error(JSON.stringify(responseParams));
            } else {
                return response;
            }
        } else {
            const error = await response.json();
            throw new Error(JSON.stringify(error));
        }
    }

    async delete (uri, request) {
        return this.fetch(uri, Object.assign(request || {}, { method: "delete" }));
    }

    async json (uri, request) {
    // eslint-disable-next-line no-param-reassign
        request = request || {};
        request.headers = Object.assign(
            {
                "Content-Type": "application/json"
            },
            request.headers
        );
        const resp = await this.fetch(uri, request);
        return await resp.json();
    }

    async getJson (uri, request) {
    // eslint-disable-next-line no-param-reassign
        request = request || {};
        request.method = "get";
        return this.json(uri, request);
    }

    async post (uri, request) {
    // eslint-disable-next-line no-param-reassign
        request = request || {};
        request.method = POST_METHOD;
        return this.fetch(uri, request);
    }

    async postJson (uri, request) {
    // eslint-disable-next-line no-param-reassign
        request = request || {};
        request.method = POST_METHOD;
        request.body = JSON.stringify(request.body);
        return this.json(uri, request);
    }

    async patchJson (uri, request) {
    // eslint-disable-next-line no-param-reassign
        request = request || {};
        request.method = "PATCH";
        request.body = JSON.stringify(request.body);
        return this.json(uri, request);
    }

    async putJson (uri, request) {
    // eslint-disable-next-line no-param-reassign
        request = request || {};
        request.method = PUT_METHOD;
        request.body = JSON.stringify(request.body);
        return this.json(uri, request);
    }

    async put (uri, request) {
    // eslint-disable-next-line no-param-reassign
        request = request || {};
        request.method = PUT_METHOD;
        return this.fetch(uri, request);
    }
}

module.exports = Http;
