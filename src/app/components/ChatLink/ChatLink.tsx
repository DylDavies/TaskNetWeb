"use client";

import { useRouter } from "next/navigation";
import { useChatStore } from "@/app/stores/chatStore";
import ChatLinkProps from "../../interfaces/ChatLinkProps.interface";

export default function ChatLink({
  job,
  userData,
  currentUserId,
  children,
}: ChatLinkProps) {
  const router = useRouter();
  const { setActiveConversation } = useChatStore();

  const handleClick = () => {
    setActiveConversation({ job, userData }, currentUserId);
    router.push("/chat");
  };

  return (
    <button onClick={handleClick} className="text-blue-500 underline">
      {children}
    </button>
  );
}

/*
should look like this:
            <ChatLink
              job={{
                jobId: "0nhhroN5MRY1qovpDBbm",
                jobData: {
                  budgetMax: 2000000,
                  budgetMin: 1000000,
                  clientUId: "a51lgtG2VAPTUubLGZZDrGeRRo23",
                  createdAt: 20250427,
                  deadline: 20251231,
                  description:
                    "Develop ML and AI systems to automate business processes",
                  hiredUId: "jw0YXMEApvXtUhdCqQCD59lPHdU2",
                  skills: {
                    "Data & Analytics": ["Data Analysis"],
                    "Digital & Tech": [
                      "Data Science",
                      "Machine Learning",
                      "Artificial Intelligence",
                      "Blockchain Development",
                    ],
                  },
                  status: 1,
                  title: "AI Architect",
                },
              }}
              userData={{
                status: 1,
                type: 1,
                username: "SudhirFreelancer",
                date: 20250501,
              }}
              currentUserId={user!.authUser.uid}
            >
              Open Chat
            </ChatLink>

*/
