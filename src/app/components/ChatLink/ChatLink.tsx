"use client";

import { useRouter } from "next/navigation";
import { useChatStore } from "@/app/stores/chatStore";
import ChatLinkProps from "../../interfaces/ChatLinkProps.interface";

// Create a link component to redirect user to a chat on the chat page with information(job with user object) passed in
export default function ChatLink({
  job,
  userData,
  currentUserId,
  children,
}: ChatLinkProps) {
  const router = useRouter();
  const { setActiveConversation } = useChatStore();

  const handleClick = () => {
    useChatStore.getState().setConversationWasManuallySet(true); // Active conversation set manually by the link
    setActiveConversation({ job, userData }, currentUserId);
    router.push("/chat");
  };

  return (
    <button
      onClick={handleClick}
      className="text-blue-500 underline  cursor-pointer"
    >
      {children}
    </button>
  );
}
