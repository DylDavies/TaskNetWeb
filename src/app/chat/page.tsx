"use client";
//import { useRouter } from "next/navigation";
import "./chat.css";
import Detail from "../components/Detail/Detail";
import Chat from "../components/Chat/Chat";
import UserList from "../components/UserList/UserList";
import { useChatStore } from "../stores/chatStore";
import Loader from "../components/Loader/Loader";

export default function Page() {
  //const router = useRouter();
  const { isLoadingJobs, isLoadingMessages } = useChatStore();
  const loading = isLoadingJobs || isLoadingMessages;

  return (
    <>
      <section className="min-h-screen flex flex-col dark:bg-[#27274b] text-white font-sans body outer-background">
        <Loader loading={loading} />
        <section className="container">
          <UserList />
          <Chat />
          <Detail />
        </section>
      </section>
    </>
  );
}
