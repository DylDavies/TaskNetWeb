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
  return (
    <section className="chatList scrollable">
      <section className="search">
        <InputBar className="searchbar"></InputBar>
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
