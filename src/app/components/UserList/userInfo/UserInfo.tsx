import Button from "../../button/Button";
import "./userInfo.css";
import Image from "next/image";
type Props = {
  name: string; // name displayed in message
};

/*
replaced images:
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />

        with:
                <Image src="/more.png" alt="More" width={24} height={24} />
        <Image src="/video.png" alt="Video" width={24} height={24} />
        <Image src="/edit.png" alt="Edit" width={24} height={24} />
 */

const UserInfo: React.FC<Props> = ({ name }) => {
  // test:
  name = "Sudhir";
  const initial = name.charAt(0).toUpperCase();

  return (
    <section className="userInfo">
      <section className="user">
        {/*<Button caption="Back" />*/}
        {/* Profile Photo might eventually allow the user to put their own one, for now, use the blue with initial */}
        <section className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
          {initial}
        </section>
        {/* <img src="./avatar.png" alt=""/> */}
        <h2>John Doe</h2>
      </section>
      <section className="icons">
        {/*20 min in vid*/}
        <Image src="/more.png" alt="More" width={24} height={24} />{" "}
        {/*actually add these things*/}
        <Image src="/video.png" alt="Video" width={24} height={24} />
        <Image src="/edit.png" alt="Edit" width={24} height={24} />
      </section>
    </section>
  );
};

export default UserInfo;
