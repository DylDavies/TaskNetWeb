import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { app } from "../Firebase";
import ApiService from "../services/ApiService";

const provider = new GoogleAuthProvider();

async function googlePopupAuth(): Promise<void> {
    // TODO: Add checks for already being logged in

    const auth = getAuth(app);

    try {
        const result = await signInWithPopup(auth, provider);

        ApiService.login(await result.user.getIdToken())
    } catch (error) {
        throw error;
    }
}

function googleSignout() {
    const auth = getAuth(app);

    signOut(auth);
}

function getCurrentUser() {
    const auth = getAuth(app);

    return auth.currentUser;
}

export { googlePopupAuth, googleSignout, getCurrentUser };