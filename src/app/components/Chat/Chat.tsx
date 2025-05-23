import "./Chat.css";
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
import MultilineInputBar from "../MultilineInput/MultilineInput";

const Chat = () => {
  const { user } = useContext(AuthContext) as AuthContextType;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(MessageType.Standard);
  const endRef = useRef<HTMLElement>(null);

  const {
    activeConversation,
    messages,
    isLoadingMessages,
    setActiveConversation,
  } = useChatStore();

  // Auto scroll to latest message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get Active conversation from chatlink or from navigation to chat page
  useEffect(() => {
    const fetchActiveConversation = async () => {
      const chatState = useChatStore.getState();

      if (
        !user?.authUser?.uid ||
        chatState.activeConversation ||
        chatState.conversationWasManuallySet
      ) {
        setLoading(false);
        return;
      }

      // Delay slightly in case ChatLink sets state late (can change the timer)
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updatedState = useChatStore.getState();
      if (
        updatedState.activeConversation ||
        updatedState.conversationWasManuallySet
      ) {
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

    fetchActiveConversation();
  }, [user, setActiveConversation]);

  // Cleanup only if leaving /chat route
  useEffect(() => {
    return () => {
      const stillOnChatPage = pathname.startsWith("/chat");
      if (!stillOnChatPage && user?.authUser?.uid) {
        setActiveConversation(null, user.authUser.uid);
        useChatStore.getState().setConversationWasManuallySet(false);
      }
    };
  }, [pathname, user, setActiveConversation]);

  // ----------------------

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

  if (loading || !user) {
    return <section>Loading chat...</section>;
  }

  return (
    <section className="chat">
      <section className="top">
        <section className="user">
          <section className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
            {activeConversation?.userData?.username?.charAt(0) || "?"}
          </section>
          <section className="texts">
            {loading ? (
              <em>Loading...</em>
            ) : activeConversation ? (
              <>
                <em>{activeConversation.userData?.username}</em>
                <p>{activeConversation.job.jobData.title}</p>
              </>
            ) : (
              <em>No conversation </em>
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

        <MultilineInputBar
          placeholder="Type a message..."
          value={text}
          onChange={(value) => setText(value)}
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
