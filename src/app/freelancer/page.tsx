import Link from "next/link";
//import Link from "next/link";
//import "./freelancer.css";
import Header from "../components/Header/header";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";

const links = [{ name: "Client", href:"/client" },{name: "Home",href:"/"}, {name: "Client",href:"/client"}, {name: "Admin",href:"/admin"}];

//this is a comment
export default function Page(){
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
                <section className="flex-1 p-4 flex items-start justify-center">
                    <WelcomeCard username="May" type="freelancer" />
                </section>
                

            </main>

            
            <footer className="dark:bg-slate-500 py-4 flex justify-end">
                <Button caption={"Log out"}/>
            </footer>
        </section>
        </>
    );
}
