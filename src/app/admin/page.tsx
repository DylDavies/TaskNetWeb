"use client";

import AdminTable from "../components/AdminTable/AdminTable";
import "../components/AdminTable/AdminTable.css";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import "./global.css";
import "../components/button/Button.css";
import { getPendingUsers } from "../server/services/DatabaseService";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext, AuthContextType } from "../AuthContext";


const links = [
  { name: "Home", href: "/admin", selected: false }];

export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;

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
        <header className="w-full bg-orange-500">
          <Header name={user?.userData.username || "Admin"} usertype="Admin" />
        </header>

        <main className="flex flex-1 bg-[#cdd5f6] bg-color">
          <aside className="w-64">
            <SideBar items={links} />
          </aside>

          <section className="flex-1 p-4">
            <section className="flex flex-col items-center space-y-4">
              {/* AdminTable moved down */}
              <section className="w-full max-w-8xl mt-36">
                <AdminTable data={pendingUsers} />
              </section>
            </section>
          </section>
        </main>

        <footer className="bg-gray-900 box-footer px-6 py-4">
          <p>© {new Date().getFullYear()} tasknet.tech</p>  
        </footer>
      </section>
    </>
  );
}
