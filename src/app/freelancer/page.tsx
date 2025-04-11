import Link from "next/link";
//import "./freelancer.css";
import Heading from "../components/Heading/heading";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import "../components/WelcomeCard/WelcomeCard.css";


export default function Page(){
    return(
        <>
        <body className="min-h-screen flex flex-col bg-[#27274b] text-white font-sans">
            
            <header className="w-full bg-orange-500 ">
                <Heading />
            </header>

            <main className="flex-1 flex items-center justify-center bg-blue-300">
                <WelcomeCard username="May" type="freelancer" />
            </main>

            
            <footer className="bg-orange-500 py-4 flex justify-center">
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