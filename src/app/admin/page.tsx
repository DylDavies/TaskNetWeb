"use client";

import "../components/AdminTable/AdminTable.css";
import "../components/searchbar/SearchBar.css";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import "./global.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import React, { useContext, useState } from "react";
import AuthService from "../services/AuthService";
import { useRouter } from "next/navigation";
import { AuthContext, AuthContextType } from "../AuthContext";
import AnalyticsPage from "../components/AdminStatsDashboard/StatsDashboard";
import DashboardContent from "../components/AdminDashboard/AdminDashboard";


const links = [
  { name: "Home", href: "/" },
  { name: "Client", href: "/client" },
  { name: "Freelancer", href: "/freelancer" }];

export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;

  const router = useRouter();

  //signs the user out of google
  function signoutClick() {
      AuthService.googleSignout();
     router.push("/");
  }

  function handleViewChange(){
    if (buttonName == "View Analytics"){
      setbuttonName("View Pending Users");
      setCurrentView('analytics');
    }
    else{
      setbuttonName("View Analytics");
      setCurrentView('dashboard');
    }


  }
   
  const [buttonName, setbuttonName] = useState<"View Analytics" | "View Pending Users">("View Analytics");
  const [currentView, setCurrentView] = useState<'dashboard' | 'analytics'>('dashboard');

  //This will allow the admin to change between pending users and analytics
  const ChangeViewButton = () => {
    return(
      <section>
      <button  onClick={() => handleViewChange()} > {buttonName}</button>
      </section>
    );
  };


  return (
    <>
      <section className="min-h-screen flex flex-col bg-[#27274b] text-white font-sans">
        <header className="w-full bg-orange-500">
          <Header name={user?.userData.username || "Admin"} usertype="Admin" />
        </header>

        <main className="flex flex-1 bg-[#cdd5f6] bg-color">

          <aside className="w-64">
            <SideBar items={links}
              myfunction={ChangeViewButton()} />
          </aside>
          <section className="flex-1 p-4">
          {currentView === 'dashboard' ? (
            <DashboardContent
          />
          ):(
            <AnalyticsPage />
          )}
          
            
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
