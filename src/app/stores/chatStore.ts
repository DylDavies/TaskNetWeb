import { create } from 'zustand';
import ChatStore from '../interfaces/ChatStore.interface';
import JobWithUser from '../interfaces/JobWithOtherUser.interface';
import { collection, getDocs, limit, onSnapshot, orderBy, query, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import MessageData from '../interfaces/MessageData.interface';
import UserType from '../enums/UserType.enum';
import UserStatus from '../enums/UserStatus.enum';
import { createNotification } from '../server/services/NotificationService';
import JobData from '../interfaces/JobData.interface';
import MessageStatus from '../enums/MessageStatus.enum';

export const useChatStore = create<ChatStore>((set) => ({
  jobsWithUsers: [],
  activeConversation: null,
  messages: [],
  isLoadingJobs: false,
  isLoadingMessages: false,
  chatPreviews: {},
  unsubscribe: null,
  globalUnsubscribe: null,
  jobMap: {},
  listenerInitialized: false,

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
      set({ jobMap });

      const jobsWithUsers = await Promise.all(
        jobs.map(async (job) => {
          let userData;
          if (userType === UserType.Admin || userType === UserType.Client) {
            userData = await getUser(job.jobData.hiredUId);
          } else if (userType === UserType.Freelancer) {
            userData = await getUser(job.jobData.clientUId);
          }

          const messagesRef = collection(db, "Jobs", job.jobId, "messages");

          // Get latest message for preview
          const previewQuery = query(messagesRef, orderBy("DateTimeSent", "desc"), limit(1));
          const previewSnap = await getDocs(previewQuery);

          let latestMessage: MessageData | null = null;
          if (!previewSnap.empty) {
            latestMessage = previewSnap.docs[0].data() as MessageData;
          }

          // Count unread messages
          const fullSnap = await getDocs(query(messagesRef, orderBy("DateTimeSent")));
          const unreadCount = fullSnap.docs.filter(doc => {
            const msg = doc.data() as MessageData;
            return msg.senderUId !== uid && msg.status !== MessageStatus.Read;
          }).length;

          if (latestMessage) {
            useChatStore.getState().setChatPreview(job.jobId, latestMessage, uid, unreadCount);
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
    const currentUnsubscribe = useChatStore.getState().unsubscribe;
    if (currentUnsubscribe) currentUnsubscribe();

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

      const batch = writeBatch(db);
      let hasUpdates = false;

      snapshot.docs.forEach((doc) => {
        const msg = doc.data() as MessageData;
        if (msg.senderUId !== currentUserUId && msg.status !== MessageStatus.Read) {
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
          currentUserUId,
          0 // Clear unread count when viewing
        );
      }

      useChatStore.getState().clearUnreadCount(jobWithUser.job.jobId);
    });

    set({ unsubscribe });
  },

  clearMessages: () => set({ messages: [] }),

  setChatPreview: (jobId: string, message: MessageData, currentUserUId: string, unreadCountOverride?: number) =>
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
            latestMessage: message.message,
            latestTime: message.DateTimeSent || existing.latestTime,
            senderUId: message.senderUId,
            unreadCount:
              unreadCountOverride !== undefined
                ? unreadCountOverride
                : state.activeConversation?.job.jobId === jobId || message.senderUId === currentUserUId
                ? existing.unreadCount
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
    const state = useChatStore.getState();
    const { jobMap, globalUnsubscribe, listenerInitialized } = state;

    if (listenerInitialized) return;
    if (globalUnsubscribe) globalUnsubscribe();

    const unsubscribeFunctions: { [jobId: string]: () => void } = {};

    Object.keys(jobMap).forEach((jobId) => {
      const messagesRef = collection(db, "Jobs", jobId, "messages");
      const q = query(messagesRef, orderBy("DateTimeSent", "desc"), limit(1));

      unsubscribeFunctions[jobId] = onSnapshot(q, async (snapshot) => {
        if (!snapshot.empty) {
          const newDoc = snapshot.docs[0];
          const newMessage = newDoc.data() as MessageData;

          // Skip if the message was sent by current user
          if (newMessage.senderUId === uid) return;

          // Skip if the message is already marked as Read
          
          if (newMessage.status === MessageStatus.Read) return;
          
          // Count unread messages
          const allMessagesSnap = await getDocs(query(messagesRef, orderBy("DateTimeSent")));
          const unreadCount = allMessagesSnap.docs.filter(doc => {
            const msg = doc.data() as MessageData;
            return msg.senderUId !== uid && msg.status !== MessageStatus.Read;
          }).length;

          useChatStore.getState().setChatPreview(jobId, newMessage, uid, unreadCount);

          const isCurrentChat = useChatStore.getState().activeConversation?.job.jobId === jobId;
          if (!isCurrentChat) {
            const jobData = jobMap[jobId];
            const notificationRecipient =
              newMessage.senderUId === jobData.hiredUId ? jobData.clientUId : jobData.hiredUId;

            createNotification({
              message: `New message for job "${jobData.title}": ${newMessage.message}`,
              seen: false,
              uidFor: notificationRecipient,
            });
          }
        }
      });
    });

    set({
      globalUnsubscribe: () => {
        Object.values(unsubscribeFunctions).forEach((unsub) => unsub());
        set({ listenerInitialized: false });
      },
      listenerInitialized: true,
    });
  },
}));
