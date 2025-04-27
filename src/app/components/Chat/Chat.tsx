import "./Chat.css";
import InputBar from "../inputbar/InputBar";
import Button from "../button/Button";
import EmojiPicker from "emoji-picker-react";
import { useContext, useEffect, useRef, useState } from "react";
import ActiveMessage from "@/app/interfaces/ActiveMessage.interface";
import { getAllMessages } from "@/app/server/services/MessageDatabaseServices";
import { AuthContext, AuthContextType } from "@/app/AuthContext";
import JobWithUser from "@/app/interfaces/JobWithOtherUser.interface";
import { getContracted } from "@/app/server/services/JobDatabaseService";
import { getUser } from "@/app/server/services/DatabaseService";

const Chat = () => {
  const { user } = useContext(AuthContext) as AuthContextType;

  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<ActiveMessage[]>([]);

  const [jobUsers, setJobUsers] = useState<JobWithUser[]>([]);

  // Testing getting jobs where people are contracted - may need to become a global state
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) return; // ⬅️ only run if user exists

      try {
        const jobs = await getContracted(user.authUser.uid);
        console.log("JOB DATA: ", jobs);

        const jobsWithUsers: JobWithUser[] = await Promise.all(
          jobs.map(async (job) => {
            console.log("HIRED UID: ", job.jobData.hiredUId);
            const userData = await getUser(job.jobData.hiredUId);
            console.log("USERDATA: ", userData);
            return { job, userData };
          })
        );

        setJobUsers(jobsWithUsers);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
      }
    };

    fetchJobs();
  }, [user]); // 👈 Depend on 'user' here

  // Test for fetching messages
  const testingJobID = "BFtUtw3vOMd2JpbhurLY";
  useEffect(() => {
    async function fetchMessages() {
      try {
        const messageData = await getAllMessages(jobUsers[0].job.jobId);
        console.log("fetched message data: ", messageData);
        setMessages(messageData);
      } catch (error) {
        console.error("Error occurred while trying to fetch messages: ", error);
      }
    }
    fetchMessages();
  }, [jobUsers]);

  const endRef = useRef<HTMLElement>(null);

  // scrolling auto to a particular message
  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, []);

  // Maybe get rid of these emojis, it is very delayed
  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji); // take prev value and write it again, but also add the emoji
    setOpen(false);
  };
  console.log(text);

  return (
    <section className="chat">
      <section className="top">
        <section className="user">
          <img src="avatar.png" alt="" />
          <section className="texts">
            {jobUsers.length > 0 ? (
              <em>{jobUsers[0].userData?.username}</em>
            ) : (
              <em>Loading...</em> // or some other placeholder
            )}

            {jobUsers.length > 0 ? (
              <p>{jobUsers[0].job.jobData.title}</p>
            ) : (
              <p>Loading...</p>
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
        {/*other user message*/}
        <section className="message">
          <img src="./avatar.png" alt="" />
          <section className="text">
            <img src="" alt="" /> {/* for when the user sends a message */}
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
              Accusantium, officia, ratione repellat saepe quae ducimus rem
              provident eveniet aperiam voluptates sint labore amet, nobis
              nesciunt quas corrupti eius adipisci. Iure.
            </p>
            <em>1 min ago</em>
          </section>
        </section>

        {/*my own message*/}
        {messages.map((message, index) => (
          <section className="message" key={index}>
            <img src="/avatar.png" alt="User Avatar" />{" "}
            {/* Can replace with dynamic user avatar later */}
            <section className="text">
              <p>{message.messageData.message}</p> {/* the message content */}
              <em>
                {message.messageData.DateTimeSent.toDate().toLocaleString()}
              </em>{" "}
              {/* nicely formatted time */}
            </section>
          </section>
        ))}

        <section className="message own">
          <section className="text">
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
              Accusantium, officia, ratione repellat saepe quae ducimus rem
              provident eveniet aperiam voluptates sint labore amet, nobis
              nesciunt quas corrupti eius adipisci. Iure.i
            </p>
            <em>1 min ago</em>
          </section>
        </section>

        <section className="message">
          <img src="./avatar.png" alt="" />
          <section className="text">
            <p>
              Lorem, ipsum dolor sit amet consectetur adipisicing elit.
              Accusantium, officia, ratione repellat saepe quae ducimus rem
              provident eveniet aperiam voluptates sint labore amet, nobis
              nesciunt quas corrupti eius adipisci. Iure.
            </p>
            <em>1 min ago</em>
          </section>
        </section>
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
