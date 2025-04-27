"use client";
//import { useRouter } from "next/navigation";
import "./chat.css";
import Detail from "../components/Detail/Detail";
import Chat from "../components/Chat/Chat";
import UserList from "../components/UserList/UserList";

//constant for links to other pages
// const links = [
//   { name: "Home", href: "/" },
//   { name: "back", href: "/freelancer" },
// ];

export default function Page() {
  //const router = useRouter();

  /*
          <section className="w-64">
          <SideBar items={links} />
        </section>
  */
  return (
    <section className="min-h-screen flex flex-col dark:bg-[#27274b] text-white font-sans body">
      <section className="container">
        {/*for linter error */}
        <UserList />
        <Chat />
        <Detail />
      </section>
    </section>
  );
}
