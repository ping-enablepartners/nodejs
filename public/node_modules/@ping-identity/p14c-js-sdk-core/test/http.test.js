const Http = require("../src/http");

jest.mock("cross-fetch");
const fetch = require("cross-fetch");

describe("Http test", function () {
    const url = "http://someEndpoint";
    let http;

    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeEach(() => {
        http = new Http();
    });

    describe("basic get fetch request", () => {
        it("get successful response with json output", async () => {
            fetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                url: url,
                json: () => "4"
            }));
            const response = await http.fetch(url);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "get",
                withCredentials: false
            });
            expect(response.ok).toBe(true);
            expect(response.json()).toBe("4");
        });

        it("get successful response with text output", async () => {
            fetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                url: url,
                text: () => "4"
            }));
            const response = await http.fetch(url);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "get",
                withCredentials: false
            });
            expect(response.ok).toBe(true);
            expect(response.text()).toBe("4");
        });

        it("get successful response with access token", async () => {
            fetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                url: url,
                json: () => "4"
            }));
            const token = "someAccessToken";
            const response = await http.fetch(url, {
                withCredentials: true,
                body: {
                    someAttr: "someAttrValue"
                },
                headers: {},
                accessToken: token
            });

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "get",
                withCredentials: true,
                body: {
                    someAttr: "someAttrValue"
                },
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            expect(response.ok).toBe(true);
            expect(response.json()).toBe("4");
        });

        it("get failed response with error status", async () => {
            fetch.mockImplementationOnce(() => Promise.resolve({
                ok: false,
                url: `${url}`,
                json: () => "something bad happened"
            }
            ));
            await http.fetch(url)
                .catch(e => {
                    expect(e.message).toBe("\"something bad happened\"");
                    expect(fetch).toHaveBeenCalledTimes(1);
                    expect(fetch).toHaveBeenCalledWith(url, {
                        method: "get",
                        withCredentials: false
                    });
                });
        });

        it("get failed response with ok status", async () => {
            fetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                url: `${url}?error=something bad happened`,
                json: () => "4"
            }));
            await http.fetch(url)
                .catch(e => {
                    expect(e.message).toBe("{\"error\":\"something bad happened\"}");
                    expect(fetch).toHaveBeenCalledTimes(1);
                    expect(fetch).toHaveBeenCalledWith(url, {
                        method: "get",
                        withCredentials: false
                    });
                });
        });
    });

    describe("other http methods", () => {
        it("test delete method", async () => {
            fetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                url: url
            }));
            const response = await http.delete(url);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "delete",
                withCredentials: false
            });
            expect(response.ok).toBe(true);
        });

        it("test get json method", async () => {
            fetch.mockImplementationOnce(() => Promise.resolve({
                ok: true,
                url: url,
                json: () => "4"
            }));
            const response = await http.json(url);

            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith(url, {
                method: "get",
                withCredentials: false,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            expect(response).toBe("4");
        });
    });

    it("test post json method", async () => {
        const mockJson = jest.spyOn(http, "json").mockReturnValue("4");
        const body = {someAttr: "someAttrValue"};
        const response = await http.postJson(url, {body: body});

        expect(mockJson).toHaveBeenCalledTimes(1);
        expect(mockJson).toHaveBeenCalledWith(url, {
            method: "post",
            body: "{\"someAttr\":\"someAttrValue\"}"
        });
        expect(response).toBe("4");
    });


    it("test post method", async () => {
        const mockFetch = jest.spyOn(http, "fetch").mockReturnValue("4");
        const response = await http.post(url);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(url, {
            method: "post"
        });
        expect(response).toBe("4");
    });

    it("test patch json method", async () => {
        const mockJson = jest.spyOn(http, "json").mockReturnValue("4");
        const body = {someAttr: "someAttrValue"};
        const response = await http.patchJson(url, {body: body});

        expect(mockJson).toHaveBeenCalledTimes(1);
        expect(mockJson).toHaveBeenCalledWith(url, {
            method: "PATCH",
            body: "{\"someAttr\":\"someAttrValue\"}"
        });
        expect(response).toBe("4");
    });

    it("test put method", async () => {
        const mockFetch = jest.spyOn(http, "fetch").mockReturnValue("4");
        const response = await http.put(url);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(url, {
            method: "put"
        });
        expect(response).toBe("4");
    });

    it("test put json method", async () => {
        const mockJson = jest.spyOn(http, "json").mockReturnValue("4");
        const body = {someAttr: "someAttrValue"};
        const response = await http.putJson(url, {body: body});

        expect(mockJson).toHaveBeenCalledTimes(1);
        expect(mockJson).toHaveBeenCalledWith(url, {
            method: "put",
            body: "{\"someAttr\":\"someAttrValue\"}"
        });
        expect(response).toBe("4");
    });
});
