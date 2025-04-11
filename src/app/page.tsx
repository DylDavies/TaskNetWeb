"use client";

import AuthService from "./services/AuthService";
import React from "react";
import "./components/sidebar/sidebar.css";
import "./components/button/Button.css";
import PendingCard from "./components/PendingCard/PendingCard";
import Header from "./components/Header/header";

export default function Home() {
  AuthService.autoSignIn();

  function signinClick() {
    AuthService.signin();
  }

  function signoutClick() {
    AuthService.googleSignout();
  }

  async function currentUserClick() {
    const user = await AuthService.getCurrentUser();

    console.log("User", user);
  }

  return (
    <main>
      <Header name="Alex" usertype="Freelancer" />

      <button
        onClick={signinClick}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Sign in with Google
      </button>

      <button
        onClick={signoutClick}
        className="bg-red-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Sign out
      </button>

      <button
        onClick={currentUserClick}
        className="bg-orange-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
      >
        Get Current User
      </button>
     

      <PendingCard />
    </main>
  );
}
