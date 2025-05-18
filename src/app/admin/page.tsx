"use client";

import "../components/AdminTable/AdminTable.css";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import "./global.css";
import "../components/button/Button.css";
import React, { useContext, useState } from "react";
import { AuthContext, AuthContextType } from "../AuthContext";
import AnalyticsPage from "../components/AdminStatsDashboard/StatsDashboard";
import DashboardContent from "../components/AdminDashboard/AdminDashboard";
import PaymentAnalyticsPage from "../components/AdminPaymentStatsDashboard/PaymentDashboard";
import SkillsAnalyticsPage from "../components/AdminSkillsDashboard.tsx/AdminSkillsDashboard";

export default function Page() {
  const { user } = useContext(AuthContext) as AuthContextType;

  //functions to change between views
  function handleViewPendingUsers(){
    setCurrentView('Pending')
  }

  function handleViewCompletionStats(){
    setCurrentView('Completion')
  }
  function handleViewPaymentStats(){
    setCurrentView('Payment')
  }
  function handleViewSkillStats(){
    setCurrentView('Skills')
  }

  //heighlights active page button
  const buttonClasses = (isActive: boolean) => 
  `w-full text-left px-4 py-2 rounded-md transition-colors ${
    isActive
      ? 'bg-gray-700 text-white cursor-not-allowed' 
      : 'text-gray-300 hover:text-white hover:bg-gray-700'
  }`;

  //current view of user  
  const [currentView, setCurrentView] = useState<'Pending' | 'Completion' | 'Payment' | 'Skills'>('Pending');

  return (
    <>
      <section className="min-h-screen flex flex-col bg-[#27274b] text-white font-sans">
        <header className="w-full bg-orange-500">
          <Header name={user?.userData.username || "Admin"} usertype="Admin" />
        </header>

        <main className="flex flex-1 bg-[#cdd5f6] bg-color">

          <aside className="w-64">
            <SideBar
              buttons={[
                <button key="1" onClick={() => handleViewPendingUsers()} disabled={currentView === 'Pending'}  className={buttonClasses(currentView === 'Pending')}> Pending Users</button>,
                <button key="2" onClick={() => handleViewCompletionStats()} disabled={currentView === 'Completion'}  className={buttonClasses(currentView === 'Completion')}> Completion Stats</button>,
                <button key="3" onClick={() => handleViewPaymentStats()} disabled={currentView === 'Payment'}  className={buttonClasses(currentView === 'Payment')}> Payment Stats</button>,
                <button key="4" onClick={() => handleViewSkillStats()} disabled={currentView === 'Skills'}  className={buttonClasses(currentView === 'Skills')}> Skill Stats</button>
              ]} />
          </aside>
          <section className="flex-1 p-4">
            {currentView === 'Pending' && <DashboardContent />}
            {currentView === 'Completion' && <AnalyticsPage />}
            {currentView === 'Payment' && <PaymentAnalyticsPage />}
            {currentView === 'Skills' && <SkillsAnalyticsPage />}
          </section>
          
        </main>

        <footer className="bg-[#f75509] py-4 flex justify-center bg-gray-900 box-footer">
          <p>© {new Date().getFullYear()} tasknet.tech</p>
        </footer>
      </section>
    </>
  );
}
