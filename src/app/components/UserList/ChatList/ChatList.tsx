import { useContext, useEffect } from "react";
import InputBar from "../../inputbar/InputBar";
import "./ChatList.css";
import Image from "next/image";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import { useChatStore } from "@/app/stores/chatStore";

const ChatList = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  console.log("ACTIVE USER UID: ", user?.authUser.uid); // sanity check

  const { jobsWithUsers, fetchJobsWithUsers, isLoadingJobs } = useChatStore();

  useEffect(() => {
    if (user) {
      fetchJobsWithUsers(user.authUser.uid); // Fetch jobs for logged in user
    }
  }, [user, fetchJobsWithUsers]);

  // Change this
  if (isLoadingJobs) {
    return <section>Loading Chats...</section>;
  }

  return (
    <section className="chatList scrollable">
      <section className="search">
        <InputBar className="searchbar" /> {/*add all the props*/}
      </section>

      {/* items from the user list */}
      {jobsWithUsers.map((item, index) => (
        <section className="item" key={index}>
          <Image
            src="/avatar.png" // you can later update this to dynamic user avatars
            alt="User avatar"
            width={50}
            height={50}
            className="avatar"
          />
          <section className="texts">
            <em>{item.userData?.username}</em>{" "}
            {/* replace with the correct field from job */}
            <p>{item.job.jobData.description || "No messages yet"}</p>{" "}
          </section>
        </section>
      ))}

      <section className="item">
        <Image
          src="/avatar.png"
          alt="User avatar"
          width={50}
          height={50}
          className="avatar"
        />
        <section className="texts">
          <em>Jane Doe</em> {/*username*/}
          <p>Hello</p> {/*latest message from that chat*/}
        </section>
      </section>
    </section>
  );
};

export default ChatList;
