'use client';

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, signInWithCustomToken } from "firebase/auth";
import { redirect } from 'next/navigation'
import { app } from "../firebase";
import ApiService from "./ApiService";
import ActiveUser from "../interfaces/ActiveUser.interface";
import { getUser } from "../server/services/DatabaseService";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { LoginRedirect } from "../Navigation/navigation";

const provider = new GoogleAuthProvider();

export default class AuthService {
    static async autoSignIn(router: AppRouterInstance) {
        const auth = getAuth(app);

        if (auth.currentUser) return;

        const session = await ApiService.sessionExists();
    
        if (session.presence && session.customToken) {
            await signInWithCustomToken(auth, session.customToken);

            LoginRedirect(router);
        }
    }

    static async signin(redirectPage?: string): Promise<boolean> {
        const auth = getAuth(app);
    
        const session = await ApiService.sessionExists();
    
        if (session.presence && session.customToken) {
            await signInWithCustomToken(auth, session.customToken);
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

    static async getCurrentUser(): Promise<ActiveUser | null> {
        const auth = getAuth(app);
    
        if (!auth.currentUser) return null;

        const userData = await getUser(auth.currentUser.uid);

        if (!userData) return null;

        return {
            authUser: auth.currentUser,
            userData
        }
    }
}