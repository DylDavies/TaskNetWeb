import { useContext, useEffect, useMemo, useState } from "react";
import InputBar from "../../inputbar/InputBar";
import "./ChatList.css";

import { AuthContext, AuthContextType } from "@/app/AuthContext";
import { useChatStore } from "@/app/stores/chatStore";
import { truncateText } from "@/app/server/formatters/MessagePreview";

const ChatList = () => {
  const [text, setText] = useState("");
  const { user } = useContext(AuthContext) as AuthContextType;

  const {
    jobsWithUsers,
    fetchJobsWithUsers,
    isLoadingJobs,
    setActiveConversation,
    chatPreviews,
  } = useChatStore();

  useEffect(() => {
    if (!user) return;

    const setup = async () => {
      await fetchJobsWithUsers(user.authUser.uid, user.userData.type);
    };

    setup();
  }, [user, fetchJobsWithUsers]);

  // Search Chats
  const filteredJobs = useMemo(() => {
    if (!text.trim()) return jobsWithUsers;
    return jobsWithUsers.filter((item) =>
      item.userData?.username.toLowerCase().includes(text.toLowerCase())
    );
  }, [text, jobsWithUsers]);

  // Change this
  if (isLoadingJobs) {
    return <section>Loading Chats...</section>;
  }

  return (
    <section className="chatList scrollable">
      <section className="search">
        <InputBar
          type="text"
          placeholder="Search Users..."
          className="input-class searchbar"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </section>

      {/* iterate through filtered chats */}
      {filteredJobs.length === 0 ? (
        <section className="no-results">No chats found.</section>
      ) : (
        filteredJobs.map((item, index) => {
          const preview = chatPreviews[item.job.jobId] || {
            latestMessage: "No messages yet",
            unreadCount: 0,
            latestTime: null,
          };

          return (
            <section
              className="item"
              key={index}
              onClick={() => setActiveConversation(item, user!.authUser.uid)}
            >
              <section className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
                {item.userData?.username.charAt(0)}
              </section>
              <section className="texts">
                <section className="username-unread">
                  <em>{item.userData?.username}</em>
                  {preview.unreadCount > 0 && (
                    <em className="unread-pill">{preview.unreadCount}</em>
                  )}
                </section>
                <p title={preview.latestMessage}>
                  {preview.senderUId === user?.authUser.uid
                    ? `You: ${truncateText(preview.latestMessage)}`
                    : truncateText(preview.latestMessage)}
                </p>
              </section>
            </section>
          );
        })
      )}
    </section>
  );
};
export default ChatList;
