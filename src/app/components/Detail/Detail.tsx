import Button from "../button/Button";
import "./Detail.css";
import { useRouter } from "next/navigation";
import AuthService from "@/app/services/AuthService";
// import { useContext} from "react";
// import { AuthContext, AuthContextType } from "@/app/AuthContext";
import { useChatStore } from "@/app/stores/chatStore";

const Detail = () => {
  //const { user } = useContext(AuthContext) as AuthContextType;

  const router = useRouter();

  const { activeConversation } = useChatStore();

  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

  return (
    <section className="detail">
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
      <section className="info">
        {/* Option 1 */}
        <section className="option">
          <section className="title">
            <em>Chat settings</em>
            <img src="./arrowUp.png" alt="" />
          </section>
        </section>

        {/* Option 2 */}
        <section className="option">
          <section className="title">
            <em>Privacy & help</em>
            <img src="./arrowUp.png" alt="" />
          </section>
        </section>

        {/* Option 3 */}
        <section className="option">
          <section className="title">
            <em>Shared photos and messages</em>
            <img src="./arrowDown.png" alt="" />
          </section>
          <section className="photos">
            {/*photo item 1*/}
            <section className="photoItem">
              <section className="photoDetail">
                <img src="" alt="" /> {/*image*/}
                <em>photo_2025_2.png</em> {/*photo name*/}
              </section>
              <img src="./download.png" alt="" className="icon" />
              {/*download icon*/}
            </section>

            {/*photo item 2*/}
            <section className="photoItem">
              <section className="photoDetail">
                <img src="" alt="" /> {/*image*/}
                <em>photo_2025_2.png</em> {/*photo name*/}
              </section>
              <img src="./download.png" alt="" className="icon" />
              {/*download icon*/}
            </section>

            {/*photo item 3*/}
            <section className="photoItem">
              <section className="photoDetail">
                <img src="" alt="" /> {/*image*/}
                <em>photo_2025_2.png</em> {/*photo name*/}
              </section>
              <img src="./download.png" alt="" className="icon" />
              {/*download icon*/}
            </section>
          </section>
        </section>

        {/* Option 4 */}
        <section className="option">
          <section className="title">
            <em>Shared Files</em>
            <img src="./arrowUp.png" alt="" />
          </section>
        </section>
        <Button caption="Block user" />
        <Button caption="Logout" onClick={() => signoutClick()} />
      </section>
    </section>
  );
};

export default Detail;
