import { create } from 'zustand'
import ChatStore from '../interfaces/ChatStore.interface'
import JobWithUser from '../interfaces/JobWithOtherUser.interface';
// import { getAllMessages } from '../server/services/MessageDatabaseServices';
import { collection, collectionGroup, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import MessageData from '../interfaces/MessageData.interface';
import UserType from '../enums/UserType.enum';
import UserStatus from '../enums/UserStatus.enum';
import { createNotification } from '../server/services/NotificationService';
import JobData from '../interfaces/JobData.interface';

export const useChatStore = create<ChatStore>((set) =>({
    jobsWithUsers: [],
    activeConversation: null,
    messages: [],
    isLoadingJobs: false,
    isLoadingMessages: false,
    chatPreviews: {},
    unsubscribe: null, 
    globalUnsubscribe: null, 
    jobMap: {}, // { [jobId: string]: JobData }


    fetchJobsWithUsers: async (uid: string, userType: UserType) => {
        set({ isLoadingJobs: true });
      
        try {
          const { getContracted } = await import("@/app/server/services/JobDatabaseService");
          const { getUser } = await import("@/app/server/services/DatabaseService");
      
          const jobs = await getContracted(uid, userType);

          const jobMap: { [jobId: string]: JobData } = {};
          jobs.forEach((job) => {
            jobMap[job.jobId] = job.jobData;
          });
      
          const jobsWithUsers = await Promise.all(
            jobs.map(async (job) => {
              let userData;
              if (userType === UserType.Admin || userType === UserType.Client) {
                userData = await getUser(job.jobData.hiredUId);
              }
      
              if (userType === UserType.Admin || userType === UserType.Freelancer) {
                userData = await getUser(job.jobData.clientUId);
              }
      
              //  Fetch latest message for chat preview
              const messagesRef = collection(db, "Jobs", job.jobId, "messages");
              const q = query(messagesRef, orderBy("DateTimeSent", "desc"), limit(1));
              const snapshot = await getDocs(q);
      
              if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const latestMessage = doc.data() as MessageData;
      
                useChatStore.getState().setChatPreview(job.jobId, latestMessage, uid);
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
      },

      setActiveConversation: (jobWithUser: JobWithUser | null, currentUserUId: string) => {
        // First, unsubscribe from any existing listener - prevent listening to other conversations when you navigate to a new one
        const currentUnsubscribe = useChatStore.getState().unsubscribe;
        if (currentUnsubscribe) {
            currentUnsubscribe();
        }
    
        if (!jobWithUser) {
            set({ activeConversation: null, messages: [], unsubscribe: null });
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
          
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg) {
              useChatStore.getState().setChatPreview(
                jobWithUser.job.jobId,
                lastMsg.messageData,
                currentUserUId,

              );
            }
          
            useChatStore.getState().clearUnreadCount(jobWithUser.job.jobId);
          });
    
        // Store the unsubscribe function in the store
        set({ unsubscribe });
    },

      clearMessages: () => set({ messages: [] }),

      setChatPreview: (jobId: string, message: MessageData, currentUserUId: string) =>

        set((state) => {
            const isCurrentChat = state.activeConversation?.job.jobId === jobId;
            const isFromCurrentUser = message.senderUId === currentUserUId;
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
                        unreadCount: isCurrentChat || isFromCurrentUser ? 0 : existing.unreadCount + 1,
                        latestMessage: message.message,
                        latestTime: message.DateTimeSent || existing.latestTime,
                        senderUId: message.senderUId,
                    },
                },
            };
        }),

    clearUnreadCount: (jobId: string) =>
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
        // Clean up previous listener
        const { globalUnsubscribe } = useChatStore.getState();
        if (globalUnsubscribe) {
            globalUnsubscribe();
        }

            const q = query(collectionGroup(db, "messages"), orderBy("DateTimeSent", "desc"));
          
            const unsubscribe = onSnapshot(q, async (snapshot) => {
              const state = useChatStore.getState();
          
              snapshot.docChanges().forEach(async (change) => {
                if (change.type !== "added") return;
          
                const message = change.doc.data() as MessageData;
                const JobId = change.doc.ref.parent.parent?.id;
                if (!JobId) return;
          
                const jobData = state.jobMap?.[JobId];
                if (!jobData) return; // Job data not available (probably not contracted to this user)
          
                const isCurrentChat = state.activeConversation?.job.jobId === JobId;
                const isFromCurrentUser = message.senderUId === uid;
          
                if (isCurrentChat || isFromCurrentUser) return;
          
                // Update chat preview
                state.setChatPreview(JobId, message, uid);
          
                //  Trigger notification
                const otherUserUId = uid === jobData.clientUId ? jobData.hiredUId : jobData.clientUId;
          
                await createNotification({
                  message: `New message in chat for job: ${jobData.title}`,
                  seen: false,
                  uidFor: uid, 
                });
              });
            });
          
            set({ globalUnsubscribe: unsubscribe });
          }
          ,
          
}));