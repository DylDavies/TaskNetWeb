'use client';
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import ActiveUser from "../interfaces/ActiveUser.interface";
import "../components/button/Button.css";
import AuthService from "../services/AuthService";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import UserType from "../enums/UserType.enum";
import UserStatus from "../enums/UserStatus.enum";


//constant for links to other pages
//constant for links to other pages
const links = [
  { name: "Home", href: "/" },
  { name: "Create Job", href: "/" },
];

export default function Page(){
    
    const [activeUser, setActiveUser] = useState<ActiveUser>()
    useEffect(() =>{
        (async () => { 
            setActiveUser(
                await AuthService.getCurrentUser() as ActiveUser
            )
        })()
    },[] );


    const [loading, setLoading] = useState(true);

    const router = useRouter();

    useEffect(() => {
    
        async function auth() {
          const user = await AuthService.getCurrentUser();
    
          if (user?.userData.type !== UserType.Client && user?.userData.type !== UserType.Admin) router.push("/");

          if (user?.userData.type !== UserType.Admin && user?.userData.status == UserStatus.Pending) router.push("/pending");
          if (user?.userData.type !== UserType.Admin && user?.userData.status == UserStatus.Denied) router.push("/denied");
    
          setLoading(false);
        } 
    
        auth();
      }, []);

    if (loading) {
        return (<p>Loading...</p>)
    }
  
     //signs the user out of google
    function signoutClick() {
        AuthService.googleSignout();
        router.push("/");
    }

    return(
        <>
        <section className="min-h-screen flex flex-col bg-[#cdd5f6] text-white font-sans bg-color">
            
            <header className="w-full bg-orange-500 ">
                <Header usertype={"Client"} name={activeUser?.userData.username || "Username"} />
            </header>

            <main className="flex-1 flex bg-[#cdd5f6] bg-color">
                <section className="w-64">
                    <SideBar items={links}/>

                </section>
                <section className="flex-1 p-4 flex items-start justify-center">
                    <WelcomeCard username={activeUser?.userData.username || "Username"} type="client" />
                </section>
            </main>
          
          <footer className="bg-[#f75509] py-4 flex justify-end bg-gray-900 box-footer">
            <Button caption={"Log out"} 
            onClick={() => signoutClick() } />
          </footer>
        </section>
      </>
    );
  }