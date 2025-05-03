import Button from "../button/Button";
import "./Detail.css";
import { useRouter } from "next/navigation";
import AuthService from "@/app/services/AuthService";
import { useChatStore } from "@/app/stores/chatStore";
import { formatDateAsString } from "@/app/server/formatters/FormatDates";
import MessageType from "@/app/enums/MessageType.enum";
import Image from "next/image";

const Detail = () => {
  const router = useRouter();

  const { activeConversation, messages } = useChatStore();

  function signoutClick() {
    AuthService.googleSignout();
    router.push("/");
  }

  // get all feedback messages
  const feedbackMessages = messages.filter(
    (m) => m.messageData.type === MessageType.Feedback
  );

  // scroll to a specific feedback message
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
        {/* Job Info */}
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
                  formatDateAsString(activeConversation.job.jobData.deadline)}
              </p>
            </section>
          </section>
        )}

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
        <Button
          onClick={() => signoutClick()}
          icon={
            <Image
              src="/images/logout_button.png"
              alt="Send"
              width={20}
              height={20}
            />
          }
          caption="Logout"
        />
      </section>
    </section>
  );
};

export default Detail;
