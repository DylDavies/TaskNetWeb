'use server';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithCustomToken } from "firebase/auth";
import { redirect } from 'next/navigation'
import { app } from "../firebase";
import ApiService from "../services/ApiService";

const provider = new GoogleAuthProvider();

async function signin(redirectPage?: string): Promise<void> {
    const auth = getAuth(app);

    let session = await ApiService.sessionExists();

    if (session.presence && session.customToken) {
        signInWithCustomToken(auth, session.customToken);
        if (redirectPage) redirect(redirectPage);
        return;
    }

    try {
        const result = await signInWithPopup(auth, provider);

        ApiService.login(await result.user.getIdToken())
        if (redirectPage) redirect(redirectPage);
    } catch (error) {
        console.error(error);
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

export { signin, googleSignout, getCurrentUser };