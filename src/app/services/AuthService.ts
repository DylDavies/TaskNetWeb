import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithCustomToken } from "firebase/auth";
import { redirect } from 'next/navigation'
import { app } from "../firebase";
import ApiService from "./ApiService";

const provider = new GoogleAuthProvider();

export default class AuthService {
    static async signin(redirectPage?: string): Promise<boolean> {
        const auth = getAuth(app);
    
        let session = await ApiService.sessionExists();
    
        if (session.presence && session.customToken) {
            signInWithCustomToken(auth, session.customToken);
            if (redirectPage) redirect(redirectPage);
            return true;
        }
    
        try {
            const result = await signInWithPopup(auth, provider);
    
            ApiService.login(await result.user.getIdToken())
            if (redirectPage) redirect(redirectPage);

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static googleSignout() {
        const auth = getAuth(app);
    
        signOut(auth);
    }

    static getCurrentUser() {
        const auth = getAuth(app);
    
        return auth.currentUser;
    }
}