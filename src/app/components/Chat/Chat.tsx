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
import Image from "next/image";

const Chat = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(MessageType.Standard); // standard should be default
  const endRef = useRef<HTMLElement>(null);

  const {
    activeConversation,
    messages,
    isLoadingMessages,
    setActiveConversation,
  } = useChatStore();

  // Auto scroll to latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // Fetch active conversation
  useEffect(() => {
    const fetchActiveConversation = async () => {
      if (!user?.authUser?.uid || activeConversation) {
        setLoading(false);
        return;
      }

      // Timer to let chat link redirect you to the chat (increase if needed)
      await new Promise((resolve) => setTimeout(resolve, 100)); // wait 100ms

      if (useChatStore.getState().activeConversation) {
        setLoading(false);
        return;
      }

      try {
        // fetch jobs active user is contracted to
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

    fetchActiveConversation();
  }, [user, activeConversation]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (user?.authUser?.uid) {
        setActiveConversation(null, user.authUser.uid);
      }
    };
  }, [pathname, user, setActiveConversation]);

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

    setSelectedType(MessageType.Standard); // Reset pill to Standard

    try {
      await sendMessage(activeConversation.job.jobId, {
        senderUId: user.authUser.uid,
        type: selectedType,
        status: MessageStatus.Delivered,
        message: text.trim(),
      });
      setText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }

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
                id={`message-${message.MessageID}`}
              >
                <section className="text">
                  <p>{message.messageData.message}</p>
                  <section className="meta">
                    <em>{formattedDate}</em>
                    {message.messageData.type === MessageType.Feedback && (
                      <em className="dot feedback-dot" title="Feedback"></em>
                    )}
                    {message.messageData.type === MessageType.Concern && (
                      <em className="dot concern-dot" title="Concern"></em>
                    )}
                  </section>
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
                className={`pill feedback ${
                  selectedType === MessageType.Feedback ? "active" : ""
                }`}
                onClick={() => setSelectedType(MessageType.Feedback)}
              >
                Feedback
              </button>
              <button
                className={`pill concern ${
                  selectedType === MessageType.Concern ? "active" : ""
                }`}
                onClick={() => setSelectedType(MessageType.Concern)}
              >
                Concern
              </button>
              <button
                className={`pill standard ${
                  selectedType === MessageType.Standard ? "active" : ""
                }`}
                onClick={() => setSelectedType(MessageType.Standard)}
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
          <Image
            src="/images/emoji.png"
            alt="emoji"
            onClick={() => setOpen((prev) => !prev)}
            width={20}
            height={20}
          />
          <section className="picker">
            <EmojiPicker open={open} onEmojiClick={handleEmoji} />
          </section>
        </section>
        <section className="sendButton">
          <Button
            onClick={handleSendMessage}
            icon={
              <Image
                src="/images/Send_button.png"
                alt="Send"
                width={20}
                height={20}
              />
            }
            style={{ padding: "10px 15px" }}
          />
        </section>
      </section>
    </section>
  );
};

export default Chat;
