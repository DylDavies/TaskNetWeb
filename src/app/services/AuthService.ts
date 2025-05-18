'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithCustomToken } from "firebase/auth";
import { app } from "../firebase";
import ApiService from "./ApiService";

const provider = new GoogleAuthProvider();

export default class AuthService {
    //This funciton will allow the user to sign in automatically if they already have an account
    static async autoSignIn() {
        const auth = getAuth(app);

        if (auth.currentUser) return true;

        const session = await ApiService.sessionExists();
    
        if (session.presence && session.customToken) {
            try {
                await signInWithCustomToken(auth, session.customToken);
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        }

        return false;
    }

    //This function will sign the user in with google
    static async signin(): Promise<boolean> {
        const auth = getAuth(app);
    
        const session = await ApiService.sessionExists();
    
        if (session.presence && session.customToken) {
            try {
                await signInWithCustomToken(auth, session.customToken);
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        }
    
        try {
            const result = await signInWithPopup(auth, provider);
    
            ApiService.login(await result.user.getIdToken())

            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    //This function sighn the user out from the google auth pespective
    static googleSignout() {
        const auth = getAuth(app);
    
        signOut(auth);

        ApiService.logout();
    }
}