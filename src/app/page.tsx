'use client';

import { getCurrentUser, googlePopupAuth, googleSignout } from "./auth/auth";
import {useRouter} from "next/navigation"

export default function Home() {
  const router = useRouter();

  async function signinClick() {
    const accessToken = await googlePopupAuth();

    console.log(accessToken);

    const user = getCurrentUser();

    console.log(user);
    router.push("/freelancer"); //will have to make dynamic to go to seperate pages
  }

  function signoutClick() {
    googleSignout();
  }

  function currentUserClick() {
    const user = getCurrentUser();

    console.log("User", user);
  }
  

  return (
    <body>
      <h1 className = "heading">TaskNet</h1>
        <button onClick={signinClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Sign in with google</button>
        <button onClick={signoutClick} className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Sign out</button>
        <button onClick={currentUserClick} className="bg-orange-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full">Sign in with google</button>
     </body>
  );
}
