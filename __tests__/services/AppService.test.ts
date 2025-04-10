import ApiService from "@/app/services/ApiService";

describe("API Service tests", () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("Session", () => {
        it("should return presence = false on error", async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error("API Error"));
            global.console.error = jest.fn();

            let result = await ApiService.sessionExists();

            expect(jest.mocked(global.console.error).mock.calls[0][0].message).toBe("API Error");
            expect(result).toMatchObject({presence: false});
        });

        it("should return presence and customToken", async () => {
            global.fetch = jest.fn().mockResolvedValue({
                json: jest.fn().mockResolvedValue({presence: true, customToken: "mockCustomToken"})
            });

            let result = await ApiService.sessionExists();
            
            expect(result).toMatchObject({presence: true, customToken: "mockCustomToken"});
        })
    });

    describe("Login", () => {
        it("should receive 200 OK on valid idToken", async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true
            })
    
            ApiService.login("mockToken");

            expect(global.fetch).toHaveBeenCalledWith(`${ApiService.BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer mockToken",
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                mode: "cors"
            })

            expect(await jest.mocked(global.fetch).mock.results[0].value).toEqual({ok: true});
        });

        it("should receive 401 Unauthorized if failed to verify idToken", async () => {
            global.fetch = jest.fn().mockResolvedValue({
                status: 401
            })
    
            ApiService.login("invalidMockToken");

            expect(global.fetch).toHaveBeenCalledWith(`${ApiService.BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Authorization": "Bearer invalidMockToken",
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                credentials: "include",
                mode: "cors"
            })

            expect(await jest.mocked(global.fetch).mock.results[0].value).toEqual({status: 401});
        })
    })
});