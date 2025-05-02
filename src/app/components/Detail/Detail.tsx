import Button from "../button/Button";
import "./Detail.css";
import { useRouter } from "next/navigation";
import AuthService from "@/app/services/AuthService";
import { useChatStore } from "@/app/stores/chatStore";
import { formatDateAsDate } from "@/app/server/formatters/FormatDates";
import MessageType from "@/app/enums/MessageType.enum";

const Detail = () => {
  const router = useRouter();

  const { activeConversation, messages } = useChatStore();

  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

  const feedbackMessages = messages.filter(
    (m) => m.messageData.type === MessageType.Feedback
  );

  const scrollToMessage = (messageId: string) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("highlighted");
      setTimeout(() => el.classList.remove("highlighted"), 2000);
    }
  };

  return (
    <section className="detail">
      <section className="user">
        {/*<img src="avatar.png" alt="" />*/}
        <section className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm sm:text-base">
          {activeConversation?.userData?.username.charAt(0)}
        </section>
        <section className="texts">
          {activeConversation ? (
            <>
              <em>{activeConversation.userData?.username}</em>
            </>
          ) : (
            <em>Loading...</em>
          )}
        </section>
      </section>
      <section className="info">
        {/* Option 1 */}
        {activeConversation && (
          <section className="option">
            <section className="title">
              <em>Job Information</em>
            </section>
            <section className="items">
              <p>{"Title: " + activeConversation.job.jobData.title}</p>
              <p>
                {"Description: " + activeConversation.job.jobData.description}
              </p>
              <p>
                {"Deadline: " +
                  formatDateAsDate(activeConversation.job.jobData.deadline)}
              </p>
            </section>
          </section>
        )}

        {/* Option 2 */}
        {/* Feedback List */}
        <section className="option">
          <section className="title">
            <em>Feedback</em>
          </section>
          <section className="feedback-list">
            {feedbackMessages.length === 0 ? (
              <p className="muted">No feedback messages yet.</p>
            ) : (
              feedbackMessages.map((m, idx) => (
                <li
                  key={idx}
                  onClick={() => scrollToMessage(m.MessageID)}
                  className="feedback-item"
                >
                  {m.messageData.message}
                </li>
              ))
            )}
          </section>
        </section>
        <Button caption="Logout" onClick={() => signoutClick()} />
      </section>
    </section>
  );
};

export default Detail;
