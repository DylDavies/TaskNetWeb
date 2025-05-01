  import { create } from 'zustand'
  import ChatStore from '../interfaces/ChatStore.interface'
  import JobWithUser from '../interfaces/JobWithOtherUser.interface';
  // import { getAllMessages } from '../server/services/MessageDatabaseServices';
  import { collection, collectionGroup, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, where, writeBatch } from 'firebase/firestore';
  import { db } from '../firebase';
  import MessageData from '../interfaces/MessageData.interface';
  import UserType from '../enums/UserType.enum';
  import UserStatus from '../enums/UserStatus.enum';
  import { createNotification } from '../server/services/NotificationService';
  import JobData from '../interfaces/JobData.interface';
import MessageStatus from '../enums/MessageStatus.enum';

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
        console.log("📡 Fetching jobs for UID:", uid, "User Type:", userType); // Log here to verify it's being triggered
          set({ isLoadingJobs: true });
        
          try {
            const { getContracted } = await import("@/app/server/services/JobDatabaseService");
            const { getUser } = await import("@/app/server/services/DatabaseService");
        
            const jobs = await getContracted(uid, userType);

            const jobMap: { [jobId: string]: JobData } = {};
            jobs.forEach((job) => {
              jobMap[job.jobId] = job.jobData;
            });
            set({ jobMap });
        
            // Get userData from activeUsers perspective
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

        setActiveConversation: async (jobWithUser: JobWithUser | null, currentUserUId: string) => {
          // First, unsubscribe from any existing listener
          const currentUnsubscribe = useChatStore.getState().unsubscribe;
          if (currentUnsubscribe) {
            currentUnsubscribe();
          }
        
          if (!jobWithUser) {
            set({ activeConversation: null, messages: [], unsubscribe: null });
            return;
          }
        
          set({ activeConversation: jobWithUser, messages: [], isLoadingMessages: true });
        
          const messagesRef = collection(db, "Jobs", jobWithUser.job.jobId, "messages");
          const q = query(messagesRef, orderBy("DateTimeSent"));
        
          const unsubscribe = onSnapshot(q, async (snapshot) => {
            const msgs = snapshot.docs.map((doc) => ({
              MessageID: doc.id,
              messageData: doc.data() as MessageData,
            }));
        
            // Update all messages to "seen" status if they're from the other user
            const batch = writeBatch(db);
            let hasUpdates = false;
        
            snapshot.docs.forEach((doc) => {
              const message = doc.data() as MessageData;
              if (message.senderUId !== currentUserUId && message.status !== MessageStatus.Read) {
                batch.update(doc.ref, { status: MessageStatus.Read });
                hasUpdates = true;
              }
            });
        
            if (hasUpdates) {
              try {
                await batch.commit();
              } catch (error) {
                console.error("Error updating message statuses:", error);
              }
            }
        
            set({ messages: msgs, isLoadingMessages: false });
        
            const lastMsg = msgs[msgs.length - 1];
            if (lastMsg) {
              useChatStore.getState().setChatPreview(
                jobWithUser.job.jobId,
                lastMsg.messageData,
                currentUserUId
              );
            }
        
            useChatStore.getState().clearUnreadCount(jobWithUser.job.jobId);
          });
        
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
                  // Always update latest message and time
                  latestMessage: message.message,
                  latestTime: message.DateTimeSent || existing.latestTime,
                  senderUId: message.senderUId,
        
                  // Only update unreadCount if it's from another user and the chat is not open
                  unreadCount: isCurrentChat || isFromCurrentUser
                    ? existing.unreadCount // don't change
                    : existing.unreadCount + 1,
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
            const { jobMap, globalUnsubscribe } = useChatStore.getState();
            
            // Clean up previous listeners
            if (globalUnsubscribe) {
              globalUnsubscribe();
            }
        
          
            // Create an object to store all unsubscribe functions
            const unsubscribeFunctions: { [jobId: string]: () => void } = {};
          
            // Listen for the last updated message for a chat
            Object.keys(jobMap).forEach(jobId => {
              const messagesRef = collection(db, "Jobs", jobId, "messages");
              const q = query(messagesRef, orderBy("DateTimeSent", "desc"), limit(1));
          
              unsubscribeFunctions[jobId] = onSnapshot(q, (snapshot) => {
                if (!snapshot.empty) {
                  const newMessage = snapshot.docs[0].data() as MessageData;
                  console.log(`New message in job ${jobId}:`, newMessage);
                  
                  // Update chat preview
                  useChatStore.getState().setChatPreview(jobId, newMessage, uid);
                  
                  // Send notifications for messages received in other chats
                  const isCurrentChat = useChatStore.getState().activeConversation?.job.jobId === jobId;
                  if (!isCurrentChat) {
                    const jobData = jobMap[jobId];
                    const notificationRecipient = newMessage.senderUId === jobData.hiredUId ? jobData.clientUId : jobData.hiredUId;  

                    createNotification({
                      message: `New message for job "${jobData.title}": ${newMessage.message}`,
                      seen: false,
                      uidFor: notificationRecipient
                    });
                  }
                }
              });
            });
          
            // Store all unsubscribe functions in the store
            set({ 
              globalUnsubscribe: () => {
                Object.values(unsubscribeFunctions).forEach(unsub => unsub());
              }
            });
          },
              
  }));