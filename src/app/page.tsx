'use client';

import AuthService from "./services/AuthService";
import Button from "./components/Button/Button";

export default function Home() {
  function signinClick() {
    AuthService.signin();
  }

  function signoutClick() {
    AuthService.googleSignout();
  }

  function currentUserClick() {
    const user = AuthService.getCurrentUser();

    console.log("User", user);
  }

  return (
    <main>
      <Button func={signinClick} text="Sign in with google" color="bg-blue-500"></Button>
      <Button func={signoutClick} text="Sign out" color="bg-red-500"></Button>
      <Button func={currentUserClick} text="Get current user out" color="bg-orange-500"></Button>
    </main>
  );
}
