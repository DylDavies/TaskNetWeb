"use client";
//import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ActiveMessage from "../interfaces/ActiveMessage.interface";
import { getAllMessages } from "../server/services/MessageDatabaseServices";
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

  const [messages, setMessages] = useState<ActiveMessage[]>([]);

  const testingJobID = "BFtUtw3vOMd2JpbhurLY";
  useEffect(() => {
    async function fetchMessages() {
      try {
        const messageData = await getAllMessages(testingJobID);
        console.log("fetched message data: ", messageData);
        setMessages(messageData);
      } catch (error) {
        console.error("Error occurred while trying to fetch messages: ", error);
      }
    }
    fetchMessages();
  }, []);

  /*
          <section className="w-64">
          <SideBar items={links} />
        </section>
  */
  return (
    <section className="min-h-screen flex flex-col dark:bg-[#27274b] text-white font-sans body">
      <section className="container">
        <p>{messages[0]?.messageData?.status || "HADES"}</p>{" "}
        {/*for linter error */}
        <UserList />
        <Chat />
        <Detail />
      </section>
    </section>
  );
}
