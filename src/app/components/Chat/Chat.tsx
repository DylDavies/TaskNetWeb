import "./Chat.css";
import InputBar from "../inputbar/InputBar";
import Button from "../button/Button";
import EmojiPicker from "emoji-picker-react";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import { getContracted } from "@/app/server/services/JobDatabaseService";
import { getUser } from "@/app/server/services/DatabaseService";
import { useChatStore } from "@/app/stores/chatStore";
import { sendMessage } from "@/app/server/services/MessageDatabaseServices";
import MessageStatus from "@/app/enums/MessageStatus.enum";
import MessageType from "@/app/enums/MessageType.enum";
import { usePathname } from "next/navigation";

const Chat = () => {
  // 1. All hooks declared unconditionally at the top
  const { user } = useContext(AuthContext) as AuthContextType;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLElement>(null);

  const {
    activeConversation,
    messages,
    isLoadingMessages,
    setActiveConversation,
  } = useChatStore();

  // 2. All effects after state declarations
  // Auto-scroll effect
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Fetch active conversation
  useEffect(() => {
    const fetchActiveConversation = async () => {
      if (!user?.authUser?.uid) {
        setLoading(false);
        return;
      }

      try {
        const jobs = await getContracted(user.authUser.uid, user.userData.type);
        if (jobs?.[0]) {
          const userData = await getUser(jobs[0].jobData.hiredUId);
          setActiveConversation({ job: jobs[0], userData }, user.authUser.uid);
        }
      } catch (error) {
        console.error("Failed to fetch active conversation:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!activeConversation) {
      fetchActiveConversation();
    }
  }, [user, setActiveConversation, activeConversation]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (user?.authUser?.uid) {
        setActiveConversation(null, user.authUser.uid);
      }
    };
  }, [pathname, user, setActiveConversation]);

  // 3. Early return only after all hooks
  if (loading || !user) {
    return <section>Loading chat...</section>;
  }

  // Handler functions
  interface EmojiData {
    emoji: string;
  }

  const handleEmoji = (e: EmojiData) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  async function handleSendMessage() {
    if (!text.trim() || !activeConversation || !user?.authUser?.uid) return;

    try {
      await sendMessage(activeConversation.job.jobId, {
        senderUId: user.authUser.uid,
        type: MessageType.Standard,
        status: MessageStatus.Delivered,
        message: text.trim(),
      });
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

  // Component render
  return (
    <section className="chat">
      <section className="top">
        <section className="user">
          <section className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
            {user?.userData?.username?.charAt(0)}
          </section>
          <section className="texts">
            {activeConversation ? (
              <>
                <em>{activeConversation.userData?.username}</em>
                <p>{activeConversation.job.jobData.title}</p>
              </>
            ) : (
              <em>Loading...</em>
            )}
          </section>
        </section>
        <section className="icons"></section>
      </section>

      <section className="center">
        {isLoadingMessages ? (
          <p>Loading Messages...</p>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage =
              message.messageData.senderUId === user?.authUser?.uid;
            const dateTimeSent = message.messageData.DateTimeSent;
            const formattedDate = dateTimeSent
              ? dateTimeSent.toDate().toLocaleString()
              : "Unknown time";

            return (
              <section
                className={`message ${isOwnMessage ? "own" : ""}`}
                key={index}
              >
                <section className="text">
                  <p>{message.messageData.message}</p>
                  <em>{formattedDate}</em>
                </section>
              </section>
            );
          })
        )}
        <section ref={endRef}></section>
      </section>

      <section className="bottom">
        <section className="icons">
          <section className="message-type-pills">
            <h4>Message Type</h4>
            <section className="pills">
              <button
                className="pill feedback"
                onClick={() => console.log("Feedback selected")}
              >
                Feedback
              </button>
              <button
                className="pill concern"
                onClick={() => console.log("Concern selected")}
              >
                Concern
              </button>
              <button
                className="pill standard"
                onClick={() => console.log("Standard selected")}
              >
                Standard
              </button>
            </section>
          </section>
        </section>

        <InputBar
          type="text"
          placeholder="Type a message..."
          className="input-class"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

        <section className="emoji">
          <img
            src="./emoji.png"
            alt=""
            onClick={() => setOpen((prev) => !prev)}
          />
          <section className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </section>
        </section>
        <section className="sendButton">
          <Button caption="Send" onClick={handleSendMessage} />
        </section>
      </section>
    </section>
  );
};

export default Chat;
