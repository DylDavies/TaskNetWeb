import { useState } from "react";
import InputBar from "../../inputbar/InputBar";
import "./ChatList.css";
import Image from "next/image";

/*<img src="./avatar.png" alt="" /> replaced these with:         <Imagesrc="/avatar.png"
          alt="User avatar"
          width={50}
          height={50}
          className="avatar"
        />*/
const ChatList = () => {
  const [inputValue, setInputValue] = useState("");

  return (
    <section className="chatList scrollable">
      <section className="search">
        <InputBar
          placeholder="Type something..."
          value={"SOMETHING"}
          onChange={(e) => setInputValue(e.target.value)}
          className="search"
        />
        <p>{inputValue}</p> {/*for linter*/}
      </section>

      {/* items from the user list */}
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
