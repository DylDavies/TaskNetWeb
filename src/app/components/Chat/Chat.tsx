import "./Chat.css";
import InputBar from "../inputbar/InputBar";
import Button from "../button/Button";
import EmojiPicker from "emoji-picker-react";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import { getContracted } from "@/app/server/services/JobDatabaseService";
import { getUser } from "@/app/server/services/DatabaseService";
import { useChatStore } from "@/app/stores/chatStore";

const Chat = () => {
  const { user } = useContext(AuthContext) as AuthContextType;

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const {
    activeConversation,
    messages,
    isLoadingMessages,
    setActiveConversation,
  } = useChatStore();

  // scrolling auto to a particular message
  const endRef = useRef<HTMLElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  // If the user is logged in and there is no active conversation then set it
  useEffect(() => {
    if (user && !activeConversation) {
      const fetchActiveConversation = async () => {
        const job = await getContracted(user.authUser.uid); // fetch the first job
        if (job && job[0]) {
          const userData = await getUser(job[0].jobData.hiredUId); // note this needs to change it is only getting the freelancer id (so this is only working for the client)
          setActiveConversation({ job: job[0], userData }); // set that active conversation to the first job
        }
      };

      fetchActiveConversation();
    }
  }, [user, setActiveConversation, activeConversation]);

  // Maybe get rid of these emojis, it is very delayed
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji); // take prev value and write it again, but also add the emoji
    setOpen(false);
  };
  //console.log(text);

  return (
    <section className="chat">
      <section className="top">
        <section className="user">
          <img src="avatar.png" alt="" />
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
        <section className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </section>
      </section>
      <section className="center">
        {/* Render messages conditionally */}
        {isLoadingMessages ? (
          <p>Loading Messages...</p>
        ) : (
          messages.map((message, index) => {
            // Check if the message is from the current user
            const isOwnMessage =
              message.messageData.senderUId === user!.authUser.uid;

            return (
              <section
                className={`message ${isOwnMessage ? "own" : ""}`}
                key={index}
              >
                {!isOwnMessage && <img src="./avatar.png" alt="" />}{" "}
                {/* Display avatar for other user's messages */}
                <section className="text">
                  <p>{message.messageData.message}</p>
                  <em>
                    {message.messageData.DateTimeSent.toDate().toLocaleString()}
                  </em>
                </section>
              </section>
            );
          })
        )}

        <section ref={endRef}></section>
      </section>

      <section className="bottom">
        <section className="icons">
          <img src="./image.png" alt="" />
          <img src="./camera.png" alt="" />
          <img src="./microphone.png" alt="" />
        </section>

        <InputBar
          type="text"
          placeholder="Type a message..."
          className="input-class"
          value={text}
          onChange={(e) => setText(e.target.value)}
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
          <Button caption="Send" />
        </section>
      </section>
    </section>
  );
};

export default Chat;
