import Link from "next/link";
import Header from "../components/Header/header";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import "../components/WelcomeCard/WelcomeCard.css";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";

const links = [{ name: "Client", href:"/client" }, { name: "Logout",href:"/" },{name: "Home",href:"/"}, {name: "Client",href:"/client"}, {name: "Admin",href:"/admin"}];


export default function Page(){
    return(
        <>
        <body className="min-h-screen flex flex-col dark:bg-[#27274b] text-white font-sans">
            
            <header className="w-full bg-orange-500 ">
                <Header usertype={"client"} name={"Alex"} />
            </header>

            <main className="flex-1 flex dark:bg-[#cdd5f6]">
                <section className="w-64">
                    <SideBar items={links}/>

                </section>
                <section className="flex-1 p-4 flex items-start justify-center">
                    <WelcomeCard username="Alex" type="client" />
                </section>
                

            </main>

            
            <footer className="bg-[#f75509] py-4 flex justify-center">
                <nav className="space-x-8 text-center">
                    <Link href="/freelancer" className="hover:text-[#1dbf73]">Freelancer</Link>
                    <Link href="/" className="hover:text-[#1dbf73]">Home</Link>
                    <Link href="/client" className="hover:text-[#1dbf73]">Client</Link>
                    <Link href="/admin" className="hover:text-[#1dbf73]">Admin</Link>
                </nav>
            </footer>
        </body>
        </>
    );
}