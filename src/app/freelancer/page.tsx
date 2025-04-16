"use client";

import Link from "next/link";
//import Link from "next/link";
//import "./freelancer.css";
import Header from "../components/Header/header";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import JobAppForm from "../components/JobApplicationForm/JobApplication";
import "../components/JobApplicationForm/JobApplicationForm.css"

import { useRef, useState } from "react";
import { Container } from "react-dom/client";

const links = [{ name: "Client", href:"/client" },{name: "Home",href:"/"}, {name: "Client",href:"/client"}, {name: "Admin",href:"/admin"}];

//this is a comment
export default function Page(){
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    return(
        <>
        <section className="min-h-screen flex flex-col dark:bg-[#27274b] text-white font-sans">
            
            <header className="w-full bg-orange-500 ">
                <Header name = "Alex" usertype="Freelancer" />
            </header>

            <main className="flex-1 flex dark:bg-[#cdd5f6]">
                <section className="w-64">
                    <SideBar items={links}/>

                </section>
                <section className="flex-1 p-4 flex items-start justify-center" id="main">
                    <WelcomeCard username="May" type="freelancer" />
                    <JobAppForm></JobAppForm>
                </section>
                

            </main>

            
            <footer className="dark:bg-slate-500 py-4 flex justify-end">
                <Button caption={"Log out"}/>
            </footer>
        </section>
        </>
    );
}
