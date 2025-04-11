"use client";

import AuthService from "./services/AuthService";
//<<<<<<< feature/admin
//import Button from "./components/button/Button";
//>>>>>>> dev
import React from "react";
//=======
//import Button from "./components/button/Button";
//import React, { useState } from "react";
/*import SideBar from "./components/sidebar/SideBar";*/
//>>>>>>> dev
import "./components/sidebar/sidebar.css";
import "./components/button/Button.css";
//import InputBar from "./components/inputbar/InputBar";
//import "./components/inputbar/inputBar.css";
//import SearchBar from "./components/searchbar/SearchBar";
//import "./components/searchbar/SearchBar.css";
//import SideBar from "./components/sidebar/SideBar";
import PendingCard from "./components/PendingCard/PendingCard";
import Header from "./components/Header/header";

export default function Home() {
//<<<<<<< feature/admin
 //const [inputValue, setInputValue] = useState("");

  //async function signinClick() {
    //const accessToken = await googlePopupAuth();
    //console.log(accessToken);
    //const user = getCurrentUser();
    //console.log(user);
//=======
  AuthService.autoSignIn();

  function signinClick() {
    AuthService.signin();
//>>>>>>> dev
  }

  function signoutClick() {
    AuthService.googleSignout();
  }

/*<<<<<<< feature/admin
  function currentUserClick() {
    const user = getCurrentUser();
=======*/
  async function currentUserClick() {
    const user = await AuthService.getCurrentUser();

//>>>>>>> dev
    console.log("User", user);
  }

  function Clickable() {
    console.log("Button clicked!");
  }

  //const items = [{ name: "Client" }, { name: "Logout" }];

 // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   // setInputValue(e.target.value);
 // };

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
