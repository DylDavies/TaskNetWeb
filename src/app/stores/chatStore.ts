import { create } from 'zustand'
import ChatStore from '../interfaces/ChatStore.interface'
import JobWithUser from '../interfaces/JobWithOtherUser.interface';
// import { getAllMessages } from '../server/services/MessageDatabaseServices';
import { collection, collectionGroup, getDocs, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import MessageData from '../interfaces/MessageData.interface';
import UserType from '../enums/UserType.enum';
import UserStatus from '../enums/UserStatus.enum';

export const useChatStore = create<ChatStore>((set) =>({
    jobsWithUsers: [],
    activeConversation: null,
    messages: [],
    isLoadingJobs: false,
    isLoadingMessages: false,
    chatPreviews: {},


    fetchJobsWithUsers: async (uid: string, userType: UserType) => {
        set({ isLoadingJobs: true });
      
        try {
          const { getContracted } = await import("@/app/server/services/JobDatabaseService");
          const { getUser } = await import("@/app/server/services/DatabaseService");
      
          const jobs = await getContracted(uid, userType);
      
          const jobsWithUsers = await Promise.all(
            jobs.map(async (job) => {
              let userData;
              if (userType === UserType.Admin || userType === UserType.Client) {
                userData = await getUser(job.jobData.hiredUId);
              }
      
              if (userType === UserType.Admin || userType === UserType.Freelancer) {
                userData = await getUser(job.jobData.clientUId);
              }
      
              // 🧠 Fetch latest message for chat preview
              const messagesRef = collection(db, "Jobs", job.jobId, "messages");
              const q = query(messagesRef, orderBy("DateTimeSent", "desc"), limit(1));
              const snapshot = await getDocs(q);
      
              if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const latestMessage = doc.data() as MessageData;
      
                useChatStore.getState().setChatPreview(job.jobId, latestMessage);
              }
      
              return {
                job,
                userData: userData || {
                  type: UserType.None,
                  status: UserStatus.Denied,
                  username: "Error",
                  date: 20250202,
                },
              };
            })
          );
      
          set({ jobsWithUsers, isLoadingJobs: false });
        } catch (error) {
          console.error("Failed to fetch jobs: ", error);
          set({ isLoadingJobs: false });
        }
      }
      ,

    setActiveConversation: (jobWithUser: JobWithUser | null) => {
        if (!jobWithUser) {
            set({ activeConversation: null, messages: [] });
            return;
          }

        set({ activeConversation: jobWithUser, messages: [], isLoadingMessages: true });
    
        const messagesRef = collection(
          db,
          "Jobs",
          jobWithUser.job.jobId,
          "messages"
        );
        const q = query(messagesRef, orderBy("DateTimeSent"));
    
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            MessageID: doc.id,
            messageData: doc.data() as MessageData,
          }));
    
          set({ messages: msgs, isLoadingMessages: false });

          // set last message for preview
          const lastMsg = msgs[msgs.length - 1];
          if (lastMsg) {
            useChatStore.getState().setChatPreview(
              jobWithUser.job.jobId,
              lastMsg.messageData
            );
          }

          // clear unread stuff when you open chat
          useChatStore.getState().clearUnreadCount(jobWithUser.job.jobId);
        });
    
        // Optional: save unsubscribe if you want to stop listening later
      },

      clearMessages: () => set({ messages: [] }),

      setChatPreview: (jobId: string, message: MessageData) =>
        set((state) => {
            const existing = state.chatPreviews[jobId] || {
                unreadCount: 0,
                latestMessage: "",
                latestTime: null,
                senderUId: "",
            };

            return {
                chatPreviews: {
                    ...state.chatPreviews,
                    [jobId]: {
                        unreadCount: existing.unreadCount + 1,
                        latestMessage: message.message,
                        latestTime: message.DateTimeSent || null,
                        senderUId: message.senderUId,
                    },
                },
            };
        }),

    clearUnreadCount: (jobId) =>
        set((state) => ({
            chatPreviews: {
                ...state.chatPreviews,
                [jobId]: {
                    ...state.chatPreviews[jobId],
                    unreadCount: 0,
                },
            },
        })),

        setupGlobalMessageListener: (uid: string) => {
            const q = query(collectionGroup(db, "messages"), orderBy("DateTimeSent"));
          
            onSnapshot(q, (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                  const message = change.doc.data() as MessageData;
                  const jobId = change.doc.ref.parent.parent?.id;
          
                  if (!jobId) return;
          
                  const state = useChatStore.getState();
          
                  // Ignore messages from the current active chat
                  if (state.activeConversation?.job.jobId === jobId) return;
          
                  // Ignore messages sent by the current user (optional)
                  if (message.senderUId === uid) return;
          
                  // Update the preview
                  state.setChatPreview(jobId, message);
                }
              });
            });
          },

}));