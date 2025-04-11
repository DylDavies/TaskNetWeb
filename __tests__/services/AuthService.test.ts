import _1 from "firebase/app";
import auth, { Auth } from "firebase/auth";
import navigation from "next/navigation";
import ApiService from "../../src/app/services/ApiService";
import AuthService from "@/app/services/AuthService";

jest.mock("firebase/app");

jest.mock("firebase/auth", () => {
    return {
        getAuth: jest.fn(),
        GoogleAuthProvider: jest.fn(),
        signInWithPopup: jest.fn(),
        signOut: jest.fn(),
        signInWithCustomToken: jest.fn()
    }
});

jest.mock("next/navigation", () => {
    return {
        redirect: jest.fn()
    }
})

jest.mock("../../src/app/services/ApiService")

describe("Authentication tests", () => {
    beforeEach(() => {
        jest.mocked(ApiService).mockClear();
    })

    describe("Google Signin", () => {
        it("should call all relevant functions (no __session)", async () => {
            const getIdTokenMock = jest.fn();

            (auth.signInWithPopup as jest.Mock).mockResolvedValue({ user: { getIdToken: getIdTokenMock } });
            (ApiService.sessionExists as jest.Mock).mockReturnValue({presence: false});

            await AuthService.signin();

            expect(auth.getAuth).toHaveBeenCalled();
            expect(auth.signInWithPopup).toHaveBeenCalled();
            expect(ApiService.login).toHaveBeenCalled();
            expect(getIdTokenMock).toHaveBeenCalled();
        });

        it("should call all relevant functions (with __session)", async () => {
            (ApiService.sessionExists as jest.Mock).mockReturnValue({presence: true, customToken: "mockCustomToken"});
            (auth.getAuth as jest.Mock).mockReturnValue("mockAuth");

            await AuthService.signin();

            expect(auth.getAuth).toHaveBeenCalled();

            expect(auth.signInWithCustomToken).toHaveBeenCalledWith("mockAuth", "mockCustomToken");
        });

        it("should handle error when signInWithPopup fails", async () => {
            global.console.error = jest.fn();

            (auth.signInWithPopup as jest.Mock).mockRejectedValue(new Error("auth/email-already-exists"));
            (ApiService.sessionExists as jest.Mock).mockReturnValue({presence: false});

            await AuthService.signin();

            expect(auth.getAuth).toHaveBeenCalled();
            expect(auth.signInWithPopup).toHaveBeenCalled();
            expect(jest.mocked(global.console.error).mock.calls[0][0].message).toBe("auth/email-already-exists");

        });

        describe("Redirection tests", () => {
            it("should redirect with redirectPage and __session", async () => {
                (ApiService.sessionExists as jest.Mock).mockReturnValue({presence: true, customToken: "mockCustomToken"});

                await AuthService.signin("mockRedirectPage");

                expect(navigation.redirect).toHaveBeenCalledWith("mockRedirectPage");
            });

            it("should redirect with redirectPage and no __session", async () => {
                (auth.signInWithPopup as jest.Mock).mockResolvedValue({ user: { getIdToken: jest.fn() } });
                (ApiService.sessionExists as jest.Mock).mockReturnValue({presence: false});

                await AuthService.signin("mockRedirectPage");

                expect(navigation.redirect).toHaveBeenCalledWith("mockRedirectPage");
            });
        });
    })

    describe("Google signout", () => {
        it("should call all relevant functions", () => {
            AuthService.googleSignout();

            expect(auth.getAuth).toHaveBeenCalled();
            expect(auth.signOut).toHaveBeenCalled();
        });
    });

    describe("Current user", () => {
        it("should return current user", () => {
            const testData = {
                currentUser: {
                    uid: "mockUId"
                }
            }
            jest.mocked(auth.getAuth).mockReturnValue(testData as unknown as Auth);

            let user = AuthService.getCurrentUser();

            expect(auth.getAuth).toHaveBeenCalled();
            expect(user).toBe(testData.currentUser);
        });
    });
})