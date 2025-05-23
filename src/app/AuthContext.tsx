'use client';

import { createContext, FC, ReactNode, useEffect, useState } from "react";
import ActiveUser from "./interfaces/ActiveUser.interface";
import { getAuth, onAuthStateChanged, Unsubscribe } from "firebase/auth";
import { app, db } from "./firebase";
import { getUser, setAvatar } from "./server/services/DatabaseService";
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import UserData from "./interfaces/UserData.interface";
import { usePathname, useRouter } from "next/navigation";
import UserType from "./enums/UserType.enum";
import { PropagateLoader } from "react-spinners";
import AuthService from "./services/AuthService";
import ApiService from "./services/ApiService";
import UserStatus from "./enums/UserStatus.enum";

export type AuthContextType = {
  user: ActiveUser | null;
};

const routes: { [key: string]: UserType[] } = {
  "/client": [UserType.Client],
  "/freelancer": [UserType.Freelancer],
  "/admin": [UserType.Admin],
  "/signup": [UserType.None],
  "/chat": [UserType.Client, UserType.Freelancer],
  "/FreelancerApplicationView": [UserType.Client],
  "/jobSearch": [UserType.Freelancer],
  "/Milestones": [UserType.Client, UserType.Freelancer]
};

export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ActiveUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isAllowed, setIsAllowed] = useState(false);
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

        let dbUser = await getUser(currentUser.uid);
        if (!dbUser) {
          
          const dc = await getDoc(doc(collection(db, "users"), currentUser.uid));

          if (!dc.exists()) {
            await setDoc(doc(collection(db, "users"), currentUser.uid), {
              type: UserType.None,
              status: UserStatus.Pending
            });
          }

          dbUser = {
            type: UserType.None,
            status: UserStatus.Pending
          } as unknown as UserData;
        }

        if ((!dbUser.avatar && currentUser.photoURL) || (dbUser.avatar !== currentUser.photoURL)) {
          setAvatar(currentUser.uid, currentUser.photoURL);
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
  }, [auth]);

  useEffect(() => {
    if (!user) AuthService.autoSignIn();
  }, [user]);

  useEffect(() => {
    (async () => {
        if (user?.userData.type == UserType.None) return router.push("/signup");
        else {
          switch (user?.userData.status) {
            case UserStatus.Pending:
              if (path !== "/pending") router.push("/pending");
              return;
            case UserStatus.Denied:
              if (path !== "/denied") router.push("/denied");
              return;
          }
        }

        if (["/pending", "/denied"].includes(path) && user?.userData.status == UserStatus.Approved) {
          switch (user.userData.type) {
            case UserType.Client:
              router.push("/client");
              break;
            case UserType.Freelancer:
              router.push("/freelancer");
              break;
            case UserType.Admin:
              router.push("/admin");
              break;
          }

          return;
        }

        if (routes[path] !== undefined) {
            if (!user) {
              if ((await ApiService.sessionExists()).presence == true) await AuthService.autoSignIn();
              else router.push("/");

              return;
            } else {
              if (user.userData.status == UserStatus.Approved) {
                const allowed = routes[path].some(val => val == user.userData.type) || user.userData.type === UserType.Admin;
                
                if (!allowed) {
                    switch (user.userData.type) {
                        case UserType.Client:
                            router.push("/client");
                            break;
                        case UserType.Freelancer:
                            router.push("/freelancer");
                            break;
                    }
                } else {
                    setIsAllowed(true);
                }

                return;
              }
            }
        } else setIsAllowed(true);
    })();
  }, [user, path, router]);

  if (!isHydrated) return null; // avoid hydration mismatch

  return (
    <AuthContext.Provider value={{ user }}>
        {(isAllowed) ? children :
            <>
                <p style={{position: "absolute", top: "50%", left: "50%", fontSize: "50px", transform: "translate(-50%, -50%)"}}><PropagateLoader color="#ffffff" /></p>
            </>
        }
    </AuthContext.Provider>
  );
};

export default AuthProvider;