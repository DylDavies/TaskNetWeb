import _1 from "firebase/app";
import auth, { Auth } from "firebase/auth";
import ApiService from "../../src/app/services/ApiService";
import { googlePopupAuth } from "@/app/auth/auth";

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
        it("should call all relevant functions", () => {
            googlePopupAuth();

            // @ts-ignore
            jest.mocked(auth.signInWithPopup).mockResolvedValue({ user: { getIdToken: jest.fn() } });

            expect(auth.getAuth).toHaveBeenCalled();
            expect(auth.signInWithPopup).toHaveBeenCalled();
            expect(ApiService.login).toHaveBeenCalled();
        });
    })
})