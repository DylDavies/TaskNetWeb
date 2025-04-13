"use client"; // use state will crash without this
import AdminTable from "../components/AdminTable/AdminTable";
import "../components/AdminTable/AdminTable.css";
import SearchBar from "../components/searchbar/SearchBar";
import "../components/searchbar/SearchBar.css";
import Link from "next/link";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import "./global.css";
import { getPendingUsers } from "../server/services/DatabaseService";
import React, { useEffect, useState } from "react";
import ActiveUser from "../interfaces/ActiveUser.interface";
import AuthService from "../services/AuthService";
import UserType from "../enums/UserType.enum";
import { useRouter } from "next/navigation";


const links = [
  { name: "Logout", href: "/" },
  { name: "Home", href: "/" },
  { name: "Client", href: "/client" },
];

/*
const userData = [
  {
    name: "Hans Burger",
    role: "freelancer",
    date: "6/10/2020",
  },
  {
    name: "Jolina Angelie",
    role: "client",
    date: "6/10/2020",
  },
  {
    name: "Sarah Curry",
    role: "freelancer",
    date: "6/10/2020",
  },
  {
    name: "Rulia Joberts",
    role: "client",
    date: "6/10/2020",
  },
  {
    name: "Wenzel Dashington",
    role: "freelancer",
    date: "6/10/2020",
  },
  {
    name: "Dave Li",
    role: "client",
    date: "6/10/2020",
  },
  {
    name: "Maria Ramovic",
    role: "client",
    date: "6/10/2020",
  },
];*/

export default function Page() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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

    async function auth() {
      const user = await AuthService.getCurrentUser();

      if (user?.userData.type !== UserType.Admin) router.push("/");

      setLoading(false);

      fetchPendingUsers();
    } 

    auth();
  }, []);

  const [activeUser, setActiveUser] = useState<ActiveUser>()
    useEffect(() =>{
        (async () => { 
            setActiveUser(
                await AuthService.getCurrentUser() as ActiveUser
            )
        })()
    },[] );
  /* Testing fetching pending users (END) */

  if (loading) {
    return (<p>Loading...</p>)
  }

  return (
    <>
      <section className="min-h-screen flex flex-col dark:bg-[#27274b] text-white font-sans">
        <header className="w-full bg-orange-500">
          <Header name={activeUser?.userData.username || "Admin"} usertype="Admin" />
        </header>

        <main className="flex flex-1 dark:bg-[#cdd5f6] bg-color">
          <aside className="w-64">
            <SideBar items={links} />
          </aside>

          <section className="flex-1 p-4">
            <section className="flex flex-col items-center space-y-4">
              {/* SearchBar wider and taller */}
              <section className="w-full max-w-4xl mt-10 mb-6">
                {" "}
                <section className="w-full h-14">
                  <SearchBar
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users..."
                    className="w-full h-14 searchbar"
                  />
                </section>
              </section>

              {/* AdminTable moved down */}
              <section className="w-full max-w-8xl mt-36">
                <AdminTable data={pendingUsers} />
              </section>
            </section>
          </section>
        </main>

        <footer className="bg-[#f75509] py-4 flex justify-center dark:bg-gray-900 box-footer">
          <section className="space-x-8 text-center">
            <Link href="/freelancer" className="hover:text-[#1dbf73]">
              Freelancer
            </Link>
            <Link href="/" className="hover:text-[#1dbf73]">
              Home
            </Link>
            <Link href="/client" className="hover:text-[#1dbf73]">
              Client
            </Link>
            <Link href="/admin" className="hover:text-[#1dbf73]">
              Admin
            </Link>
          </section>
        </footer>
      </section>
    </>
  );
}
