import { useContext, useEffect, useState } from "react";
import InputBar from "../../inputbar/InputBar";
import "./ChatList.css";
import Image from "next/image";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import { useChatStore } from "@/app/stores/chatStore";

const ChatList = () => {
  const [text, setText] = useState("");

  const { user } = useContext(AuthContext) as AuthContextType;
  //console.log("ACTIVE USER UID: ", user?.authUser.uid); // sanity check

  const {
    jobsWithUsers,
    fetchJobsWithUsers,
    isLoadingJobs,
    setActiveConversation,
    chatPreviews,
  } = useChatStore();

  useEffect(() => {
    if (user) {
      //console.log("USE EFFECT USERID: ", user.authUser.uid);
      fetchJobsWithUsers(user.authUser.uid, user.userData.type); // Fetch jobs for logged in user
    }
  }, [user, fetchJobsWithUsers]);

  // Change this
  if (isLoadingJobs) {
    return <section>Loading Chats...</section>;
  }

  console.log("chatPreviews:", chatPreviews);
  console.log(
    "jobsWithUsers:",
    jobsWithUsers.map((j) => j.job.jobId)
  );

  return (
    <section className="chatList scrollable">
      <section className="search">
        <InputBar
          type="text"
          placeholder="Search Chats..."
          className="input-class searchbar"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </section>

      {/* Iterate over the jobsWithUsers array */}
      {jobsWithUsers.map((item, index) => {
        // Get the chat preview for this jobId
        const preview = chatPreviews[item.job.jobId] || {
          latestMessage: "No messages yet",
          unreadCount: 0,
          latestTime: null,
        };

        return (
          <section
            className="item"
            key={index}
            onClick={() => setActiveConversation(item)}
          >
            <Image
              src="/avatar.png" // You can later update this to dynamic user avatars
              alt="User avatar"
              width={50}
              height={50}
              className="avatar"
            />
            <section className="texts">
              <em>{item.userData?.username}</em>
              {/* Display the latest message from the preview */}
              {preview.senderUId === user?.authUser.uid ? (
                <>
                  <p>{"You: " + preview.latestMessage}</p>
                </>
              ) : (
                <p>{preview.latestMessage}</p>
              )}

              {/* Optionally, display unread count */}
              {preview.unreadCount > 0 && (
                <em className="unreadCount">{preview.unreadCount}</em>
              )}
            </section>
          </section>
        );
      })}
    </section>
  );
};

export default ChatList;
