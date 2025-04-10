import _1 from "firebase/app";
import auth, { Auth } from "firebase/auth";
import ApiService from "../../src/app/services/ApiService";
import { getCurrentUser, signin, googleSignout } from "@/app/auth/auth";

jest.mock("firebase/app");

jest.mock("firebase/auth", () => {
    return {
        getAuth: jest.fn(),
        GoogleAuthProvider: jest.fn(),
        signInWithPopup: jest.fn(),
        signOut: jest.fn()
    }
});

jest.mock("../../src/app/services/ApiService")

describe("Authentication tests", () => {
    beforeEach(() => {
        jest.mocked(ApiService).mockClear();
    })

    describe("Google Popup", () => {
        it("should call all relevant functions", async () => {
            const getIdTokenMock = jest.fn();

            // @ts-ignore
            jest.mocked(auth.signInWithPopup).mockResolvedValue({ user: { getIdToken: getIdTokenMock } });

            await signin();

            expect(auth.getAuth).toHaveBeenCalled();
            expect(auth.signInWithPopup).toHaveBeenCalled();
            expect(ApiService.login).toHaveBeenCalled();
            expect(getIdTokenMock).toHaveBeenCalled();
        });

        it("should handle error when signInWithPopup fails", async () => {
            global.console.error = jest.fn();

            // @ts-ignore
            jest.mocked(auth.signInWithPopup).mockRejectedValue(new Error("auth/email-already-exists"));

            await signin();

            expect(auth.getAuth).toHaveBeenCalled();
            expect(auth.signInWithPopup).toHaveBeenCalled();
            expect(jest.mocked(global.console.error).mock.calls[0][0].message).toBe("auth/email-already-exists");

        });
    })

    describe("Google signout", () => {
        it("should call all relevant functions", () => {
            googleSignout();

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

            let user = getCurrentUser();

            expect(auth.getAuth).toHaveBeenCalled();
            expect(user).toBe(testData.currentUser);
        });
    });
})