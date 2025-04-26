import "./Chat.css";
import InputBar from "../inputbar/InputBar";
import Button from "../button/Button";
import EmojiPicker from "emoji-picker-react";
import { useState } from "react";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

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
            <em>Jane Doe</em>
            <p>Lorem ipsum dolor sit amet.</p>
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
        <section className="message own">
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
