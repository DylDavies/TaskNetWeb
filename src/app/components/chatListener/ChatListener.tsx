"use client";

import { AuthContext, AuthContextType } from "@/app/AuthContext";
import { useChatStore } from "@/app/stores/chatStore";
import { useEffect, useContext } from "react";

export default function ChatListenerInitializer() {
  const { user } = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    console.log(user?.userData.username);
    if (user?.authUser.uid) {
      useChatStore.getState().setupGlobalMessageListener(user?.authUser.uid);
    }
  }, [user?.authUser.uid]);

  return null; // no UI returned, this is just to listen for messages sent on different pages
}
