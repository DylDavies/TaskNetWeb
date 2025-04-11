"use client";

import { getCurrentUser, googlePopupAuth, googleSignout } from "./auth/auth";
import React, { useState } from "react";
/*import SideBar from "./components/sidebar/SideBar";*/
import "./components/sidebar/sidebar.css";
import Button from "./components/button/Button";
import "./components/button/Button.css";
import InputBar from "./components/inputbar/InputBar";
import "./components/inputbar/inputBar.css";
import SearchBar from "./components/searchbar/SearchBar";
import "./components/searchbar/SearchBar.css";
/*
import SideBar from "./components/sidebar/SideBar";
import PendingCard from "./components/PendingCard/PendingCard";*/
import Header from "./components/Header/header";

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

  //const items = [{ name: "Client" }, { name: "Logout" }];

  const Clickable = () => {
    console.log("Button clicked!");
    // This is a demo
  };

  const [inputValue, setInputValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <main>
      <Header name="Alex" usertype="Freelancer" />

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

      <Button caption="Click this button" onClick={Clickable} />
      <InputBar
        placeholder="Enter some stuff"
        value={inputValue}
        onChange={handleChange}
      />

      <SearchBar
        placeholder="Search for projects"
        value={inputValue}
        onChange={handleChange}
      />
    </main>
  );
}
