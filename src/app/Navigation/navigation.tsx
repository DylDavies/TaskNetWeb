import UserType from "@/app/enums/UserType.enum";
import { getAuth } from "firebase/auth";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { app } from "../firebase";
import { getUser } from "../server/services/DatabaseService";


// This function will take in a router and redirect the user to the secondary login page if they haven't already picked a usertype
async function LoginRedirect(router: AppRouterInstance) {
  const auth = getAuth(app);

  if(auth.currentUser){
    const dbUser = await getUser(auth.currentUser.uid)

    switch (dbUser?.type || UserType.None) {
      case UserType.None:
        router.push("/signup");
        break;
      case UserType.Freelancer:
        router.push('/freelancer');
        break;
      case UserType.Client:
        router.push('/client');
        break;
      case UserType.Admin:
        router.push('/admin');
        break;
    }
  }
}

export { LoginRedirect }

