import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { app } from "../Firebase";

const provider = new GoogleAuthProvider();

async function googlePopupAuth(): Promise<string | undefined> {
    const auth = getAuth(app);

    try {
        const result = await signInWithPopup(auth, provider);

        const creds = GoogleAuthProvider.credentialFromResult(result);

        return creds?.accessToken;
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