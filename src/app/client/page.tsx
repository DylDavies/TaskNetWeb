"use client";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import AuthService from "../services/AuthService";
import { useRouter } from "next/navigation";
import CreateJobModal from "../components/CreateJobModal/CreateJobModal";

import { useContext } from "react";
import { AuthContextType, AuthContext } from "../AuthContext";
//import { sanitizeJobData } from "../server/formatters/JobDataSanitization";



//constant for links to other pages

const links = [{ name: "Home", href: "/" }];

export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;

  const router = useRouter();

  //signs the user out of google
  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

  return (
    <>
      <section className="min-h-screen flex flex-col bg-[#cdd5f6] text-white font-sans bg-color">
        <header className="w-full bg-orange-500 ">
          <Header
            usertype={"Client"}
            name={user?.userData.username || "Username"}
          />
        </header>

        <main className="flex-1 flex bg-[#cdd5f6] bg-color">
          <section className="w-64">
            <SideBar items={links} myfunction={CreateJobModal}/>
          </section>

          <section className="flex-1 p-4 flex items-start justify-center">
            <WelcomeCard
              username={user?.userData.username || "Username"}
              type="client"
            />
          </section>
        </main>

        <footer className="bg-[#f75509] py-4 flex justify-end bg-gray-900 box-footer">
          <Button caption={"Log out"} onClick={() => signoutClick()} />
        </footer>
      </section>
    </>
  );
}
