'use client';

import { createContext, FC, ReactNode, useEffect, useState } from "react";
import ActiveUser from "./interfaces/ActiveUser.interface";
import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";
import { app, db } from "./firebase";
import { getUser } from "./server/services/DatabaseService";
import { doc, onSnapshot } from "firebase/firestore";
import UserData from "./interfaces/UserData.interface";
import { usePathname, useRouter } from "next/navigation";
import UserType from "./enums/UserType.enum";
import { PropagateLoader } from "react-spinners";

export type AuthContextType = {
  user: ActiveUser | null;
};

const routes: { [key: string]: UserType } = {
  "/client": UserType.Client,
  "/freelancer": UserType.Freelancer,
  "/admin": UserType.Admin,
};

export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false); // 👈 ensures client render
  const auth = getAuth(app);
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    setIsHydrated(true); // Wait until after first client render

    let unsubscribeSnapshot: Unsubscribe | null = null;

    const handleAuth = async () => {
      onAuthStateChanged(auth, async (currentUser) => {
        if (!currentUser) {
          setUser(null);
          return;
        }

        const dbUser = await getUser(currentUser.uid);
        if (!dbUser) {
          setUser(null);
          return;
        }

        setUser({ authUser: currentUser, userData: dbUser });

        // Start Firestore listener
        unsubscribeSnapshot = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (!docSnap.exists()) return setUser(null);
          setUser({
            authUser: currentUser,
            userData: docSnap.data() as UserData,
          });
        });
      });
    };

    handleAuth();

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  useEffect(() => {
    if (routes[path]) {
      const allowed = routes[path] === user?.userData.type || user?.userData.type === UserType.Admin;
      if (!allowed) router.push("/");
    }
  }, [user, path, router]);

  if (!isHydrated) return null; // avoid hydration mismatch

  return (
    <AuthContext.Provider value={{ user }}>
      {(user || !routes[path]) ? children : <p style={{position: "absolute", top: "50%", left: "50%", fontSize: "50px", transform: "translate(-50%, -50%)"}}><PropagateLoader color="#ffffff" /></p>}
    </AuthContext.Provider>
  );
};

export default AuthProvider;