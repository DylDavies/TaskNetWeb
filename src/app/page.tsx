"use client";

import { getCurrentUser, googlePopupAuth, googleSignout } from "./auth/auth";
import React, { useState } from "react";
/*import SideBar from "./components/sidebar/SideBar";*/
//import SideBar from "./components/sidebar/SideBar";
import "./components/sidebar/sidebar.css";
import Button from "./components/button/Button";
import "./components/button/Button.css";
import InputBar from "./components/inputbar/InputBar";
import "./components/inputbar/inputBar.css";
import SearchBar from "./components/searchbar/SearchBar";
import "./components/searchbar/SearchBar.css";
import WelcomeCard from "./components/WelcomeCard/WelcomeCard";
import "./components/WelcomeCard/WelcomeCard.css";
import SideBar from "./components/sidebar/SideBar";
import "./components/sidebar/sidebar.css";
import PendingCard from "./components/PendingCard/PendingCard";
import "./components/PendingCard/PendingCard.css";
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

  /* testing side bar */

  const items = [{ name: "Client" }, { name: "Logout" }];

  const Clickable = () => {
    console.log("Button clicked!");
    // This is a demo
  };

  const [inputValue, setInputValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  //const items = [{ name: "Client" }, { name: "Logout" }]
  

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
      <PendingCard/>

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

      <WelcomeCard username={""} type={""}/>

      <SideBar items={items}/>

      
    </main>
    
    
  );
}
