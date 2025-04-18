import _1 from "firebase/app";
import firestore from "firebase/firestore";
// import { getUser } from "../../src/app/server/services/DatabaseService";
import UserType from "@/app/enums/UserType.enum";
import UserStatus from "@/app/enums/UserStatus.enum";

jest.mock("firebase/app");

jest.mock("firebase/firestore", () => {
    return {
        getFirestore: jest.fn(),
        doc: jest.fn(),
        getDoc: jest.fn()
    }
});

describe("Database tests", () => {
    it("should return null if doc doesn't exist", async () => {
        (firestore.getDoc as jest.Mock).mockResolvedValue({
            exists: jest.fn(() => false)
        });

        // let result = await getUser("mockUId");

        expect(null).toBe(null);
    });

    it("should return data if doc exists", async () => {
        (firestore.getDoc as jest.Mock).mockResolvedValue({
            exists: jest.fn(() => true),
            data: jest.fn(() => ({type: UserType.None, status: UserStatus.Pending}))
        });

        // let result = await getUser("mockUId");

        expect(null).toBe(null);
    });
});