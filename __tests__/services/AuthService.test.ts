import { getAuth, signInWithPopup, signInWithCustomToken } from "firebase/auth";
import AuthService from "@/app/services/AuthService";
import ApiService from "@/app/services/ApiService";
import { redirect } from "next/navigation";

jest.mock("firebase/auth");
jest.mock("../../src/app/services/ApiService");
jest.mock("next/navigation");

describe("AuthService", () => {
    const mockAuth = {
        currentUser: null
    };

    beforeEach(() => {
        (getAuth as jest.Mock).mockReturnValue(mockAuth);
        jest.clearAllMocks();
    });

    describe("signin", () => {
        it("should handle successful sign-in with existing session", async () => {
            (ApiService.sessionExists as jest.Mock).mockResolvedValue({
                presence: true,
                customToken: "mock-token"
            });

            const result = await AuthService.signin();
            expect(signInWithCustomToken).toHaveBeenCalled();
            expect(result).toBe(true);
        });

        it("should handle sign-in error with console logging", async () => {
            (signInWithPopup as jest.Mock).mockRejectedValue(new Error("Auth failed"));
            (ApiService.sessionExists as jest.Mock).mockResolvedValue({
                presence: false
            });
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();

            const result = await AuthService.signin();
            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe("autoSignIn", () => {
        it("should handle missing customToken in session", async () => {
            (ApiService.sessionExists as jest.Mock).mockResolvedValue({
                presence: true,
                customToken: null
            });

            const result = await AuthService.autoSignIn();
            expect(result).toBe(false);
            expect(signInWithCustomToken).not.toHaveBeenCalled();
        });

        it("should handle signInWithCustomToken failure", async () => {
            (ApiService.sessionExists as jest.Mock).mockResolvedValue({
                presence: true,
                customToken: "invalid-token"
            });

            (signInWithCustomToken as jest.Mock).mockRejectedValue(new Error("Invalid token"));
            const consoleSpy = jest.spyOn(console, "error").mockImplementation();

            const result = await AuthService.autoSignIn();
            expect(result).toBe(false);
            expect(consoleSpy).toHaveBeenCalled();
        });
    });
    
    describe("signout", () => {
        it("should call ApiService.logout", () => {
            AuthService.googleSignout();
            expect(ApiService.logout).toHaveBeenCalled();
        });
    });
});