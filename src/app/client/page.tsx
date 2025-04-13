"use client";
import Header from "../components/Header/header";
import "../components/Header/Header.css";
import WelcomeCard from "../components/WelcomeCard/WelcomeCard";
import SideBar from "../components/sidebar/SideBar";
import "../components/sidebar/sidebar.css";
import Button from "../components/button/Button";
import "../components/button/Button.css";
import AuthService from "../services/AuthService";


//constant for links to other pages
const links = [{name: "Home",href:"/"}];

//signs the user out of google
function signoutClick() {
    AuthService.googleSignout();
  }

//UI of the freelancer page
export default function Page() {
    return (
      <>
        <section className="min-h-screen flex flex-col dark:bg-[#27274b] text-white font-sans">
  
          <header>
            <Header name="Alex" usertype="Client" />
          </header>
  
          <main className="flex flex-1 dark:bg-[#cdd5f6] bg-color">

            {/*side bar to the left of the page*/}
            <section className="w-64">
              <SideBar items={links} />
            </section>

            {/*welcome card centred right underneath the header*/}
            <section className="flex-1 p-4 flex items-start justify-center">
              <WelcomeCard username="Alex" type="Client" />
            </section>
          </main>
  
          <footer className="bg-[#f75509] py-4 flex justify-end dark:bg-gray-900 box-footer">
            <Button caption={"Log out"} 
            onClick={() => signoutClick() } />
          </footer>
        </section>
      </>
    );
  }