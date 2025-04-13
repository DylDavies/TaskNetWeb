'use client';

//import Link from "next/link";
import Header from "../components/Header/header";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import "../components/button/Button.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import UserType from "../enums/UserType.enum";
import AuthService from "../services/AuthService";

const links = [{ name: "Client", href:"/client" }, { name: "freelancer",href:"/freelancer" },{name: "Home",href:"/"}, {name: "Client",href:"/client"}, {name: "Admin",href:"/admin"}];


export default function Page(){
    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
    
        async function auth() {
          const user = await AuthService.getCurrentUser();
    
          if (user?.userData.type !== UserType.Client && user?.userData.type !== UserType.Admin) router.push("/");
    
          setLoading(false);
        } 
    
        auth();
      }, []);

    if (loading) {
        return (<p>Loading...</p>)
    }

    return(
        <>
        <section className="min-h-screen flex flex-col dark:bg-purple-100 text-white font-sans">
            
            <header className="w-full bg-orange-500 ">
                <Header usertype={"client"} name={"Alex"} />
            </header>

            <main className="flex-1 flex dark:bg-purple-100">
                <section className="w-64">
                    <SideBar items={links}/>

                </section>
                <section className="flex-1 p-4 flex items-start justify-center">
                    <WelcomeCard username="Alex" type="client" />
                </section>
                

            </main>

            
            <footer className="dark:bg-purple-300 py-4 flex justify-end">
                <Button caption={"Log out"}/>
            </footer>
        </section>
        </>
    );
}