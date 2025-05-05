"use client";

import { AuthContext, AuthContextType } from "@/app/AuthContext";
import { useChatStore } from "@/app/stores/chatStore";
import { useEffect, useContext } from "react";

export default function ChatListenerInitializer() {
  const { user } = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    if (!user) return;

    const setup = async () => {
      await useChatStore
        .getState()
        .fetchJobsWithUsers(user.authUser.uid, user.userData.type);

      useChatStore.getState().setupGlobalMessageListener(user.authUser.uid); // global listener for latest messages
    };
    setup();
  }, [user]);

  return null; // no UI returned, this is just to listen for messages sent on different pages
}
