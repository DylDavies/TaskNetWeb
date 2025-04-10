"use client";

import { getCurrentUser, googlePopupAuth, googleSignout } from "./auth/auth";
import SideBar from "./components/sidebar/SideBar";
import "./components/sidebar/sidebar.css";

export default function Home() {
  async function signinClick() {
    const accessToken = await googlePopupAuth();

    console.log(accessToken);

    const user = getCurrentUser();

    console.log(user);
  }

  function signoutClick() {
    googleSignout();
  }

  function currentUserClick() {
    const user = getCurrentUser();

    console.log("User", user);
  }

  /* testing side bar */
  const items = [{ name: "Client" }, { name: "Logout" }];

  return (
    <main>
      <button
        onClick={signinClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Sign in with google
      </button>
      <button
        onClick={signoutClick}
        className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Sign in with google
      </button>
      <button
        onClick={currentUserClick}
        className="bg-orange-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Sign in with google
      </button>

      <SideBar items={items} />
    </main>
  );
}
