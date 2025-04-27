import { create } from 'zustand'
import ChatStore from '../interfaces/ChatStore.interface'
import JobWithUser from '../interfaces/JobWithOtherUser.interface';
// import { getAllMessages } from '../server/services/MessageDatabaseServices';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

export const useChatStore = create<ChatStore>((set) =>({
    jobsWithUsers: [],
    activeConversation: null,
    messages: [],
    isLoadingJobs: false,
    isLoadingMessages: false,


    fetchJobsWithUsers: async(uid:string) =>{
        set({ isLoadingJobs:true });

        try{
            const { getContracted } = await import("@/app/server/services/JobDatabaseService")
            const { getUser } = await import("@/app/server/services/DatabaseService");

            const jobs = await getContracted(uid); // get array of all jobs contracted to the active user
            const jobsWithUsers = await Promise.all(
                jobs.map(async (job) =>{
                    const userData = await getUser(job.jobData.hiredUId); // note this only works if the active user is a client
                    return { job, userData }
                })
            );

            set({ jobsWithUsers, isLoadingJobs:false });
        }
        catch(error){
            console.error("Failed to fetch jobs: ",error);
            set({ isLoadingJobs:false });
        }
    },

    setActiveConversation: (jobWithUser: JobWithUser) => {
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
            messageData: doc.data() as any,
          }));
    
          set({ messages: msgs, isLoadingMessages: false });
        });
    
        // Optional: save unsubscribe if you want to stop listening later
      },

      clearMessages: () => set({ messages: [] }),
}));