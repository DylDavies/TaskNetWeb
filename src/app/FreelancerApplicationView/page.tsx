"use client";

import FATable from "../components/FATable/FATable";
import "../components/FATable/FATable.css";
//import SearchBar from "../components/searchbar/SearchBar";
import "../components/searchbar/SearchBar.css";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import "./global.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import { getPendingUsers } from "../server/services/DatabaseService";
import React, { useContext, useEffect, useState } from "react";
import AuthService from "../services/AuthService";
import { useRouter } from "next/navigation";
import { AuthContext, AuthContextType } from "../AuthContext";
import ClientModal from "../components/ClientModal/clientModal";


const links = [
  { name: "back", href: "/client" },
  
];

export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;

  const router = useRouter();

  //signs the user out of google
  function signoutClick() {
      AuthService.googleSignout();
     router.push("/");
  }

  //const [searchQuery, setSearchQuery] = useState("");

  /* Testing fetching pending users (START)*/
  interface User {
    uid: string;
    username: string;
    status: number;
    type: number; // Do we not need role like freelancer and client?
    date: number;
  }

  const [pendingUsers, setPendingUsers] = useState<User[]>([]);

  // To update the admin table after the Admin approves or denies user
  useEffect(() => {
    async function fetchPendingUsers() {
      const pendingUsers = await getPendingUsers();
      //console.log("Pending users: ", pendingUsers);
      setPendingUsers(pendingUsers);
    }

    fetchPendingUsers();
  }, []);

  /* Testing fetching pending users (END) */

  return (
    <>
      <section className="min-h-screen flex flex-col bg-[#27274b] text-white font-sans">
        <header className="w-full">
          <Header name={user?.userData.username || "Client"} usertype="Client" />
        </header>

        

        <main className="flex flex-1 bg-[#cdd5f6] bg-color">
          <aside className="w-64">
            <SideBar items={links} />
          </aside>

          <section className="flex-1 p-4">
            <section className="flex flex-col items-center space-y-4">

              <section className="px-6 py-4 bg-gray-800 text-black shadow rounded-xl m-4">
                <h1 className="text-2xl font-semibold text-gray-300">
                    Job Applicants for <span className="">{user?.userData.username}</span>
                </h1>
                </section>

              {/* FATable moved down */}
              <section className="w-full max-w-8xl mt-36">
                <ClientModal/>
              </section>
            </section>
          </section>
        </main>

        <footer className="bg-gray-900 box-footer px-6 py-4">

            <section className="flex justify-end">
              <Button caption={"Log out"} 
              onClick={() => signoutClick() } />
            </section>
          
        </footer>
      </section>
    </>
  );
}