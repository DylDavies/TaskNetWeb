import { useChatStore } from '@/app/stores/chatStore';
import type ChatStore from '@/app/interfaces/ChatStore.interface';
import type ChatPreview from '@/app/interfaces/ChatPreview.interface';
import UserType from '@/app/enums/UserType.enum';
import MessageStatus from '@/app/enums/MessageStatus.enum';
import {
    limit,
  // Import original names for type safety if needed, but mocks will take precedence
  Timestamp,
} from 'firebase/firestore'; // We'll primarily use the mocked Timestamp
import { db } from '@/app/firebase';

import type JobWithUser from '@/app/interfaces/JobWithOtherUser.interface';
import type JobData from '@/app/interfaces/JobData.interface';
import type MessageData from '@/app/interfaces/MessageData.interface';
import UserStatus from '@/app/enums/UserStatus.enum';
import MessageTypeEnum from '@/app/enums/MessageType.enum';
import JobStatus from '@/app/enums/JobStatus.enum';
import PaymentStatus from '@/app/enums/PaymentStatus.enum';
import UserData from '@/app/interfaces/UserData.interface';

// --- Mocks ---
jest.mock('../../../src/app/server/services/JobDatabaseService', () => ({
  getContracted: jest.fn(),
}));
jest.mock('../../../src/app/server/services/DatabaseService', () => ({
  getUser: jest.fn(),
}));

// Step 1: Define the IMPLEMENTATION LOGIC for complex mocks
const mockUnsubscribeActual = jest.fn();
const onSnapshotImplementation = (q: any, callback: any) => {
  if (!(onSnapshotImplementation as any).callbacks) {
    (onSnapshotImplementation as any).callbacks = [];
  }
  const callbackIndex = (onSnapshotImplementation as any).callbacks.length;
  (onSnapshotImplementation as any).callbacks.push(callback);
  return () => {
    mockUnsubscribeActual(); // Call the actual mock function for unsubscribe
  };
};
// Attach helper methods to the implementation function itself
(onSnapshotImplementation as any).triggerCallback = (snapshotData: any, index = 0) => {
  if ((onSnapshotImplementation as any).callbacks && (onSnapshotImplementation as any).callbacks[index]) {
    (onSnapshotImplementation as any).callbacks[index](snapshotData);
  }
};
(onSnapshotImplementation as any).clearAllCallbacks = () => {
  (onSnapshotImplementation as any).callbacks = [];
};

const mockBatchCommitActual = jest.fn().mockResolvedValue(undefined);
const mockBatchUpdateActual = jest.fn();
const writeBatchImplementation = () => ({
  update: mockBatchUpdateActual,
  commit: mockBatchCommitActual,
});

// Step 2: Mock 'firebase/firestore' and use the IMPLEMENTATION LOGIC
jest.mock('firebase/firestore', () => {
  const originalFirestoreModule = jest.requireActual('firebase/firestore');
  return {
    ...originalFirestoreModule,
    collection: jest.fn(),
    getDocs: jest.fn(),
    limit: jest.fn(),
    // Assign the implementation logic to new jest.fn() instances
    onSnapshot: () => onSnapshotImplementation,
    orderBy: jest.fn(),
    query: jest.fn(),
    writeBatch: () => writeBatchImplementation,
    doc: jest.fn(),
    Timestamp: {
      now: jest.fn(() => ({
        seconds: Math.floor(Date.now() / 1000),
        nanoseconds: 0,
        toDate: () => new Date(),
        isEqual: (other: any) => other && other.seconds === Math.floor(Date.now() / 1000),
        valueOf: () => `Timestamp(seconds=${Math.floor(Date.now() / 1000)}, nanoseconds=0)`
      })),
      fromDate: jest.fn((date: Date) => ({
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: 0,
        toDate: () => date,
        isEqual: (other: any) => other && other.seconds === Math.floor(date.getTime() / 1000),
        valueOf: () => `Timestamp(seconds=${Math.floor(date.getTime() / 1000)}, nanoseconds=0)`
      })),
    },
  };
});

jest.mock('../../../src/app/firebase.ts', () => ({
  db: {},
}));
// --- End Mocks ---

type ChatStoreDataProperties = Omit<ChatStore,
  'fetchJobsWithUsers' |
  'setActiveConversation' |
  'clearMessages' |
  'setChatPreview' |
  'clearUnreadCount' |
  'setupGlobalMessageListener' |
  'setConversationWasManuallySet'
>;

const initialChatStoreDataValues: ChatStoreDataProperties = {
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
  conversationWasManuallySet: false,
};

const getFreshStore = () => {
  useChatStore.setState(initialChatStoreDataValues, false);
  return useChatStore;
}

describe('useChatStore', () => {
  let store: ReturnType<typeof getFreshStore>;
  const mockCurrentUserUId = 'testUser123';

  const mockedGetContracted = jest.requireMock('../../../src/app/server/services/JobDatabaseService').getContracted as jest.Mock;
  const mockedGetUser = jest.requireMock('../../../src/app/server/services/DatabaseService').getUser as jest.Mock;

  // Get a handle to the MOCKED Firestore module to access its mocked functions/objects
  const FirestoreMock = jest.requireMock('firebase/firestore');
  const MockedFirestoreTimestamp = FirestoreMock.Timestamp; // Access the mocked Timestamp object
  // These are the jest.fn() wrappers that use your implementations:
  const mockedFsOnSnapshot = FirestoreMock.onSnapshot as jest.Mock;
  // const mockedFsWriteBatch = FirestoreMock.writeBatch as jest.Mock; // Not directly called as a function in tests usually

  let consoleErrorMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Clear callbacks on the implementation function that holds them
    if ((onSnapshotImplementation as any).clearAllCallbacks) {
        (onSnapshotImplementation as any).clearAllCallbacks();
    }
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
    store = getFreshStore();

    mockedGetContracted.mockResolvedValue([]);
    mockedGetUser.mockResolvedValue(null);

    (FirestoreMock.collection as jest.Mock).mockReturnValue({ id: 'mockCollRef' });
    (FirestoreMock.query as jest.Mock).mockReturnValue({ id: 'mockQueryRef' });
    (FirestoreMock.orderBy as jest.Mock).mockReturnValue({ id: 'mockOrderByConstraint' });
    (FirestoreMock.limit as jest.Mock).mockReturnValue({ id: 'mockLimitConstraint' });
    (FirestoreMock.getDocs as jest.Mock).mockResolvedValue({ docs: [], empty: true, forEach: (cb: any) => [] });
    (FirestoreMock.doc as jest.Mock).mockImplementation((db, path, ...ids) => ({
      id: ids.join('_') || path.split('/').pop() || 'mockedDocId',
      path: `${path}/${ids.join('/')}`,
      parent: { path }
    }));
    mockBatchCommitActual.mockResolvedValue(undefined); // Reset the actual mock for commit
  });

  afterEach(() => {
    const currentUnsubscribe = store.getState().unsubscribe;
    if (currentUnsubscribe) currentUnsubscribe();
    const globalUnsub = store.getState().globalUnsubscribe;
    if (globalUnsub) globalUnsub();
    store.setState(initialChatStoreDataValues, false);
    consoleErrorMock.mockRestore();
  });

  it('should have correct initial data state', () => {
    const state = store.getState();
    Object.keys(initialChatStoreDataValues).forEach(keyStr => {
      const key = keyStr as keyof ChatStoreDataProperties;
      expect(state[key]).toEqual(initialChatStoreDataValues[key]);
    });
  });

  describe('Simple synchronous actions', () => {
    it('clearMessages should clear messages array', () => {
      store.setState({ messages: [{ MessageID: '1', messageData: {} as MessageData }] });
      store.getState().clearMessages();
      expect(store.getState().messages).toEqual([]);
    });

    it('setConversationWasManuallySet should update conversationWasManuallySet', () => {
      store.getState().setConversationWasManuallySet(true);
      expect(store.getState().conversationWasManuallySet).toBe(true);
      store.getState().setConversationWasManuallySet(false);
      expect(store.getState().conversationWasManuallySet).toBe(false);
    });

    it('clearUnreadCount should set unreadCount for a jobId to 0', () => {
      const jobId = 'job1';
      const mockInitialTime = MockedFirestoreTimestamp.now() as Timestamp;
      store.setState({
        chatPreviews: {
          [jobId]: { latestMessage: 'Hi', latestTime: mockInitialTime, senderUId: 'otherUser', unreadCount: 5 } as ChatPreview,
        },
      });
      store.getState().clearUnreadCount(jobId);
      expect(store.getState().chatPreviews[jobId]?.unreadCount).toBe(0);
      expect(store.getState().chatPreviews[jobId]?.latestTime).toBe(mockInitialTime);
    });
  });

  describe('setChatPreview', () => {
    const jobId = 'jobPreview1';
    const firstMessageTimestamp = MockedFirestoreTimestamp.fromDate(new Date(Date.now() - 20000)) as Timestamp;

    const message: MessageData = {
      senderUId: 'sender1',
      message: 'Hello there',
      DateTimeSent: firstMessageTimestamp,
      status: MessageStatus.Delivered,
      type: MessageTypeEnum.Standard,
    };

    it('should add a new chat preview with a valid timestamp', () => {
      store.getState().setChatPreview(jobId, message, mockCurrentUserUId);
      const preview = store.getState().chatPreviews[jobId];
      expect(preview).toBeDefined();
      expect(preview.latestMessage).toBe(message.message);
      expect(preview.latestTime).toEqual(firstMessageTimestamp);
      expect(preview.senderUId).toBe(message.senderUId);
      expect(preview.unreadCount).toBe(1);
    });

    it('should update an existing chat preview with a new valid timestamp', () => {
      const initialTimestamp = MockedFirestoreTimestamp.fromDate(new Date(Date.now() - 30000)) as Timestamp;
      store.setState({ chatPreviews: {
        [jobId]: { latestMessage: 'Old', latestTime: initialTimestamp, senderUId: 'prevSender', unreadCount: 1 } as ChatPreview
      }});

      const newerMessageTimestamp = MockedFirestoreTimestamp.now() as Timestamp;
      const newerMessage: MessageData = { ...message, message: 'Updated message', DateTimeSent: newerMessageTimestamp, senderUId: 'sender2' };
      store.getState().setChatPreview(jobId, newerMessage, mockCurrentUserUId);

      const preview = store.getState().chatPreviews[jobId];
      expect(preview.latestMessage).toBe(newerMessage.message);
      expect(preview.latestTime).toEqual(newerMessageTimestamp);
      expect(preview.unreadCount).toBe(2);
    });

    it('should use unreadCountOverride if provided', () => {
      store.getState().setChatPreview(jobId, message, mockCurrentUserUId, 5);
      expect(store.getState().chatPreviews[jobId]?.unreadCount).toBe(5);
       expect(store.getState().chatPreviews[jobId]?.latestTime).toEqual(firstMessageTimestamp);
    });

    it('should not increment unreadCount if message sender is current user', () => {
      const myMessageTimestamp = MockedFirestoreTimestamp.now() as Timestamp;
      const myMessage: MessageData = { ...message, senderUId: mockCurrentUserUId, DateTimeSent: myMessageTimestamp };
      const initialUnreadCount = 3;
      const existingTimestamp = MockedFirestoreTimestamp.fromDate(new Date(Date.now() - 60000)) as Timestamp;

      store.setState({ chatPreviews: { [jobId]: { latestMessage: 'Old', latestTime: existingTimestamp, senderUId: 'prevSender', unreadCount: initialUnreadCount } as ChatPreview } });
      store.getState().setChatPreview(jobId, myMessage, mockCurrentUserUId);

      const preview = store.getState().chatPreviews[jobId];
      expect(preview?.unreadCount).toBe(initialUnreadCount);
      expect(preview?.latestTime).toEqual(myMessageTimestamp);
    });

    it('should not increment unreadCount if the chat is the active conversation', () => {
      const activeTestJobId = 'activeJobId1';
      const existingTimestamp = MockedFirestoreTimestamp.fromDate(new Date(Date.now() - 70000)) as Timestamp;
      const messageTimestampForActive = MockedFirestoreTimestamp.now() as Timestamp;

      const activeJobData: JobData = {
        title: "Active Job", clientUId: "client1", description: "desc",
        skills: {}, budgetMin: 100, budgetMax: 200, deadline: 20250101, status: JobStatus.Employed,
        hiredUId: "", createdAt: 20250101
      };
      const activeJobWithUser: JobWithUser = {
        job: { jobId: activeTestJobId, jobData: activeJobData },
        userData: { username: 'someUsername', type: UserType.Client,status:UserStatus.Approved, date: 12345678, ratings: [], ratingAverage: 0, ratingCount: 0 }
      };
      store.setState({ activeConversation: activeJobWithUser });
      store.setState({ chatPreviews: {
        [activeTestJobId]: { latestMessage: 'Old', latestTime: existingTimestamp, senderUId: 'prevSender', unreadCount: 2 } as ChatPreview
      }});

      const messageForActiveChat: MessageData = { ...message, senderUId: 'otherUserForActiveChat', DateTimeSent: messageTimestampForActive };
      store.getState().setChatPreview(activeTestJobId, messageForActiveChat, mockCurrentUserUId);

      const preview = store.getState().chatPreviews[activeTestJobId];
      expect(preview?.unreadCount).toBe(2);
      expect(preview?.latestTime).toEqual(messageTimestampForActive);
    });
  });

  describe('fetchJobsWithUsers', () => {
    const testUid_fetchJobs = 'current-user-for-fetch';

    // Mock JobData based on your structure (skills: {}, no paymentStatus, no direct jobId)
    const mockJobDataTemplate_fetchJobs: JobData = {
      title: "Sample Job",
      clientUId: "someClientUID",
      hiredUId: "someFreelancerUID",
      status: JobStatus.Employed,
      description: "Sample job description",
      skills: {}, // Matches your current mock structure
      budgetMin: 100,
      budgetMax: 500,
      deadline: 20251231,
      createdAt: 20250101,
    };

    // Mock UserData based on your structure (no uid, email, etc. unless specified in your interface)
    const mockUserDataTemplate_fetchJobs: UserData = {
      username: 'DefaultTestUser',
      type: UserType.Client,
      status: UserStatus.Approved, // Use a valid UserStatus member
      date: 20240101,
      ratings: [],
      ratingAverage: 0,
      ratingCount: 0,
    };

    const latestMessageData_for_fetchJobs: MessageData = {
      senderUId: 'otherUserSender',
      message: 'This is the latest message content.',
      DateTimeSent: MockedFirestoreTimestamp.now() as Timestamp,
      status: MessageStatus.Delivered,
      type: MessageTypeEnum.Standard,
    };

    beforeEach(() => {
      mockedGetContracted.mockReset();
      mockedGetUser.mockReset();
      (FirestoreMock.getDocs as jest.Mock).mockReset();
      (FirestoreMock.getDocs as jest.Mock).mockResolvedValue({ docs: [], empty: true, forEach: (cb: any) => [] });
    });

    it('should set isLoadingJobs, fetch jobs, users, previews, and update state for a Client', async () => {
      const job1_id = 'clientJob1';
      const job2_id = 'clientJob2';
      // clientUId is testUid_fetchJobs, hiredUId is the 'other user'
      const job1_data_for_client: JobData = { ...mockJobDataTemplate_fetchJobs, clientUId: testUid_fetchJobs, hiredUId: 'freelancerA', title: "Client's Job A" };
      const job2_data_for_client: JobData = { ...mockJobDataTemplate_fetchJobs, clientUId: testUid_fetchJobs, hiredUId: 'freelancerB', title: "Client's Job B" };
      
      const clientContractedJobs = [
        { jobId: job1_id, jobData: job1_data_for_client },
        { jobId: job2_id, jobData: job2_data_for_client },
      ];
      const freelancerA_data: UserData = { ...mockUserDataTemplate_fetchJobs, username: 'FreelancerA', type: UserType.Freelancer };
      const freelancerB_data: UserData = { ...mockUserDataTemplate_fetchJobs, username: 'FreelancerB', type: UserType.Freelancer };

      mockedGetContracted.mockResolvedValue(clientContractedJobs);
      mockedGetUser
        .mockResolvedValueOnce(freelancerA_data)  // For job1_data_for_client.hiredUId
        .mockResolvedValueOnce(freelancerB_data); // For job2_data_for_client.hiredUId

      // Mock Firestore getDocs calls
      (FirestoreMock.getDocs as jest.Mock)
        .mockImplementationOnce(async () => ({ // job1_id - Latest Message
          docs: [{ id: 'msg1', data: () => latestMessageData_for_fetchJobs }], empty: false,
          forEach: (cb: any) => [{ id: 'msg1', data: () => latestMessageData_for_fetchJobs }].forEach(cb)
        }))
        .mockImplementationOnce(async () => ({ // job1_id - Full Messages for Unread Count
          docs: [
            { id: 'msg1Unread', data: () => ({ ...latestMessageData_for_fetchJobs, senderUId: 'freelancerA', status: MessageStatus.Delivered }) },
            { id: 'msg2Sent', data: () => ({ ...latestMessageData_for_fetchJobs, senderUId: testUid_fetchJobs, status: MessageStatus.Delivered }) },
          ], empty: false, forEach: (cb: any) => { /* mock if needed by filter */ }
        }))
        .mockImplementationOnce(async () => ({ docs: [], empty: true, forEach: (cb: any) => { } })) // job2_id - Latest
        .mockImplementationOnce(async () => ({ docs: [], empty: true, forEach: (cb: any) => { } })); // job2_id - Full

      await store.getState().fetchJobsWithUsers(testUid_fetchJobs, UserType.Client);
      const state = store.getState();

      expect(state.isLoadingJobs).toBe(false);
      expect(mockedGetContracted).toHaveBeenCalledWith(testUid_fetchJobs, UserType.Client);
      expect(state.jobsWithUsers).toHaveLength(2);
      expect(state.jobMap[job1_id]).toEqual(job1_data_for_client);

      expect(mockedGetUser).toHaveBeenCalledWith(job1_data_for_client.hiredUId);
      expect(state.jobsWithUsers.find(jwu => jwu.job.jobId === job1_id)?.userData).toEqual(freelancerA_data);

      expect(mockedGetUser).toHaveBeenCalledWith(job2_data_for_client.hiredUId);
      expect(state.jobsWithUsers.find(jwu => jwu.job.jobId === job2_id)?.userData).toEqual(freelancerB_data);

      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should fetch data correctly for a Freelancer user type', async () => {
      const job1_id_freelancer = 'freelancerJob1';
      // For this job, testUid_fetchJobs is the hiredUId
      const job1_data_freelancer: JobData = { ...mockJobDataTemplate_fetchJobs, hiredUId: testUid_fetchJobs, clientUId: 'actualClientX', title: "Freelancer's Job X" };
      const freelancerContractedJobs = [{ jobId: job1_id_freelancer, jobData: job1_data_freelancer }];
      const clientX_data: UserData = { ...mockUserDataTemplate_fetchJobs, username: 'ActualClientX', type: UserType.Client };

      mockedGetContracted.mockResolvedValue(freelancerContractedJobs);
      mockedGetUser.mockResolvedValueOnce(clientX_data); // Freelancer fetches clientUId

      (FirestoreMock.getDocs as jest.Mock) // No messages for this job
        .mockResolvedValue({ docs: [], empty: true, forEach: (cb: any) => { } });

      await store.getState().fetchJobsWithUsers(testUid_fetchJobs, UserType.Freelancer);
      const state = store.getState();

      expect(state.isLoadingJobs).toBe(false);
      expect(mockedGetContracted).toHaveBeenCalledWith(testUid_fetchJobs, UserType.Freelancer);
      expect(state.jobsWithUsers).toHaveLength(1);
      expect(state.jobMap[job1_id_freelancer]).toEqual(job1_data_freelancer);

      expect(mockedGetUser).toHaveBeenCalledWith(job1_data_freelancer.clientUId);
      expect(state.jobsWithUsers[0].userData).toEqual(clientX_data);
      expect(consoleErrorMock).not.toHaveBeenCalled();
    });

    it('should use default error user data if getUser fails', async () => {
      const jobWithErrorUserId = 'jobWithErrorUser';
      const jobDataWithError: JobData = { ...mockJobDataTemplate_fetchJobs, clientUId: testUid_fetchJobs, hiredUId: 'unknownFreelancer' };
      mockedGetContracted.mockResolvedValue([{ jobId: jobWithErrorUserId, jobData: jobDataWithError }]);
      mockedGetUser.mockRejectedValueOnce(new Error('Failed to fetch user'));

      (FirestoreMock.getDocs as jest.Mock).mockResolvedValue({ docs: [], empty: true, forEach: (cb: any) => { } });

      await store.getState().fetchJobsWithUsers(testUid_fetchJobs, UserType.Client);
      const state = store.getState();

      expect(state.isLoadingJobs).toBe(false);
      expect(consoleErrorMock).toHaveBeenCalledWith(expect.stringContaining("Failed to fetch jobs: "), expect.anything());
    });

    it('should set isLoadingJobs to false and log error if getContracted itself fails', async () => {
      const getContractedError = new Error('Service error: getContracted');
      mockedGetContracted.mockRejectedValue(getContractedError);

      await store.getState().fetchJobsWithUsers(testUid_fetchJobs, UserType.Client);
      const state = store.getState();

      expect(state.isLoadingJobs).toBe(false);
      expect(state.jobsWithUsers).toEqual([]);
      expect(state.jobMap).toEqual({});
      expect(state.chatPreviews).toEqual({});
      expect(consoleErrorMock).toHaveBeenCalledWith("Failed to fetch jobs: ", getContractedError);
    });

    it('should handle Firestore errors when fetching previews (outer catch if map item promise rejects)', async () => {
      const jobWithFirestoreErrorId = 'jobPreviewError';
      const jobDataForFsError: JobData = {...mockJobDataTemplate_fetchJobs, clientUId: testUid_fetchJobs, hiredUId: 'freelancerWithError'};
      const freelancerDataForFsError: UserData = {...mockUserDataTemplate_fetchJobs, username: 'FreelancerWithError'};

      mockedGetContracted.mockResolvedValue([{ jobId: jobWithFirestoreErrorId, jobData: jobDataForFsError }]);
      mockedGetUser.mockResolvedValue(freelancerDataForFsError);

      const firestoreQueryError = new Error("Firestore preview query failed");
      (FirestoreMock.getDocs as jest.Mock)
        .mockImplementationOnce(async () => { throw firestoreQueryError; }); // First getDocs (latest message) fails

      await store.getState().fetchJobsWithUsers(testUid_fetchJobs, UserType.Client);
      const state = store.getState();

      expect(state.isLoadingJobs).toBe(false);
      // Because an error in the map (getDocs for preview) will cause Promise.all to reject,
      // the outer catch in fetchJobsWithUsers is hit, and jobsWithUsers is not updated from its initial state.
      expect(state.jobsWithUsers).toEqual([]); 
      expect(consoleErrorMock).toHaveBeenCalledWith("Failed to fetch jobs: ", firestoreQueryError);
    });
  });
  
  describe('setActiveConversation', () => {
    const currentUserId_for_setActive = 'userSetActive123';
    const jobId_for_setActive1 = 'activeJob789';
    const jobId_for_setActive2 = 'activeJob456'; // For switching conversations

    // Use your existing JobData and UserData structures for mock data
    const mockJobData_for_conv1: JobData = {
      title: "Active Job One For Conversation", clientUId: "clientUserConv1", hiredUId: "freelancerUserConv1",
      status: JobStatus.Employed, description: "Job for active conversation test 1", skills: {},
      budgetMin: 300, budgetMax: 700, deadline: 20250808, createdAt: 20250707,
    };
    const mockUserData_for_conv1: UserData = {
      username: 'OtherUserConv1', type: UserType.Freelancer, status: UserStatus.Approved,
      date: 20240101, ratings: [], ratingAverage: 0, ratingCount: 0,
    };
    const jobWithUser_for_conv1: JobWithUser = {
      job: { jobId: jobId_for_setActive1, jobData: mockJobData_for_conv1 },
      userData: mockUserData_for_conv1,
    };
    const jobWithUser_for_conv2: JobWithUser = {
      job: { jobId: jobId_for_setActive2, jobData: { ...mockJobData_for_conv1, title: "Active Job Two" } },
      userData: { ...mockUserData_for_conv1, username: 'OtherUserConv2' },
    };

    beforeEach(() => {
      // Clear callbacks on the implementation function that holds them
      if ((onSnapshotImplementation as any).clearAllCallbacks) {
        (onSnapshotImplementation as any).clearAllCallbacks();
      }
      // Clear call history for the actual mock function that onSnapshotImplementation wraps around (if it were a jest.fn() itself)
      // and the helper mocks.
      // jest.clearAllMocks() in the main beforeEach should cover most jest.fn() instances.
      // We specifically want to ensure our helper mocks are reset if they carry state across tests in this describe block.
      mockUnsubscribeActual.mockClear();
      mockBatchCommitActual.mockClear();
      mockBatchUpdateActual.mockClear();
    });

    it('should clear activeConversation, messages, and call previous unsubscribe if jobWithUser is null', async () => {
      const initialUnsubscribeSpy = jest.fn();
      store.setState({
        activeConversation: jobWithUser_for_conv1,
        messages: [{ MessageID: 'tempMsg', messageData: {} as MessageData }],
        unsubscribe: initialUnsubscribeSpy
      });

      await store.getState().setActiveConversation(null, currentUserId_for_setActive);

      const state = store.getState();
      expect(initialUnsubscribeSpy).toHaveBeenCalledTimes(1);
      expect(state.activeConversation).toBeNull();
      expect(state.messages).toEqual([]);
      expect(state.unsubscribe).toBeNull();
    });

    it('should set activeConversation, isLoadingMessages, setup listener, and store new unsubscribe function', async () => {
      await store.getState().setActiveConversation(jobWithUser_for_conv1, currentUserId_for_setActive);

      const state = store.getState();
      expect(state.activeConversation).toEqual(jobWithUser_for_conv1);
      expect(state.messages).toEqual([]);
      expect(state.isLoadingMessages).toBe(true);

      expect(FirestoreMock.collection).toHaveBeenCalledWith(db, "Jobs", jobWithUser_for_conv1.job.jobId, "messages");
      expect(FirestoreMock.orderBy).toHaveBeenCalledWith("DateTimeSent");
      expect(FirestoreMock.query).toHaveBeenCalledWith(expect.anything(), expect.anything());
      
      expect(state.unsubscribe).toBeInstanceOf(Function);
    });

    it('should call previous unsubscribe when switching active conversations', async () => {
      const firstUnsubscribeSpy = jest.fn();
      store.setState({ unsubscribe: firstUnsubscribeSpy });

      await store.getState().setActiveConversation(jobWithUser_for_conv1, currentUserId_for_setActive);
      
      expect(firstUnsubscribeSpy).toHaveBeenCalledTimes(1);
      const newUnsubscribe = store.getState().unsubscribe;
      expect(newUnsubscribe).not.toBe(firstUnsubscribeSpy);
      expect(newUnsubscribe).toBeInstanceOf(Function);
    });
  });

  describe('setupGlobalMessageListener', () => {
    const currentListenerUserId = 'globalListenerUser1';
    const jobA_id = 'jobA_global';
    const jobB_id = 'jobB_global';

    const jobA_data: JobData = { /* ... (as in your file) ... */
      title: "Job A for Global Listener", clientUId: "clientA", hiredUId: "freelancerA",
      status: JobStatus.Employed, description: "Desc A", skills: {},
      budgetMin: 100, budgetMax: 200, deadline: 20250101, createdAt: 20240101,
    };
    const jobB_data: JobData = { /* ... (as in your file) ... */
      title: "Job B for Global Listener", clientUId: "clientB", hiredUId: "freelancerB",
      status: JobStatus.Completed, description: "Desc B", skills: {},
      budgetMin: 100, budgetMax: 200, deadline: 20250202, createdAt: 20240202,
    };

    const initialJobMap_for_global = { // Renamed to avoid conflict if initialJobMap is elsewhere
      [jobA_id]: jobA_data,
      [jobB_id]: jobB_data,
    };

    beforeEach(() => {
      if ((onSnapshotImplementation as any).clearAllCallbacks) {
        (onSnapshotImplementation as any).clearAllCallbacks();
      }
      mockUnsubscribeActual.mockClear();
      (FirestoreMock.getDocs as jest.Mock).mockReset();
      (FirestoreMock.getDocs as jest.Mock).mockResolvedValue({ docs: [], empty: true, forEach: (cb: any) => [] });
      
      store.setState({ 
        jobMap: { ...initialJobMap_for_global }, // Ensure a fresh copy with 2 jobs
        listenerInitialized: false, 
        globalUnsubscribe: null,
        chatPreviews: {} 
      }, false);
    });

    it('should not initialize if listenerInitialized is already true', () => {
      store.setState({ listenerInitialized: true, jobMap: initialJobMap_for_global }); // Ensure jobMap is there too
      store.getState().setupGlobalMessageListener(currentListenerUserId);
      // The arrow function wrapper for onSnapshot is called, but the implementation might not be if it returns early
      // So, we check if callbacks were added to our implementation
      expect((onSnapshotImplementation as any).callbacks).toHaveLength(0);
    });

    it('should call previous globalUnsubscribe if it exists', () => {
      const previousGlobalUnsubscribeSpy = jest.fn();
      store.setState({ globalUnsubscribe: previousGlobalUnsubscribeSpy, listenerInitialized: false, jobMap: initialJobMap_for_global });
      
      store.getState().setupGlobalMessageListener(currentListenerUserId);
      
      expect(previousGlobalUnsubscribeSpy).toHaveBeenCalledTimes(1);
    });

    it('should set up onSnapshot listeners for each job in jobMap', () => {
      store.getState().setupGlobalMessageListener(currentListenerUserId);

      expect(FirestoreMock.collection).toHaveBeenCalledTimes(Object.keys(initialJobMap_for_global).length);
      expect(FirestoreMock.collection).toHaveBeenCalledWith(db, "Jobs", jobA_id, "messages");
      expect(FirestoreMock.collection).toHaveBeenCalledWith(db, "Jobs", jobB_id, "messages");
      expect(FirestoreMock.orderBy).toHaveBeenCalledWith("DateTimeSent", "desc");
      expect(FirestoreMock.limit).toHaveBeenCalledWith(1);
      expect(FirestoreMock.query).toHaveBeenCalledTimes(Object.keys(initialJobMap_for_global).length);

      expect(store.getState().listenerInitialized).toBe(true);
      expect(store.getState().globalUnsubscribe).toBeInstanceOf(Function);
    });

    it('should NOT trigger preview update logic if new message is from current user', async () => {
      store.getState().setupGlobalMessageListener(currentListenerUserId);

      const messageFromCurrentUser: MessageData = {
        senderUId: currentListenerUserId, message: 'I sent this',
        DateTimeSent: MockedFirestoreTimestamp.now(), status: MessageStatus.Delivered, type: MessageTypeEnum.Standard
      };
      const snapshotForJobB_CurrentUser = {
        empty: false,
        docs: [{ id: 'myMsgJobB', data: () => messageFromCurrentUser }]
      };
      
      const setChatPreviewSpy = jest.spyOn(store.getState(), 'setChatPreview');
      // Assuming jobB_id listener is at index 1
      await (onSnapshotImplementation as any).triggerCallback(snapshotForJobB_CurrentUser, 1); 
      
      // The store logic is: if (newMessage.senderUId === uid) return;
      // This means getDocs for unread count and setChatPreview should not be called after this point.
      expect(FirestoreMock.getDocs).not.toHaveBeenCalled(); // After the initial setup calls for listeners
      expect(setChatPreviewSpy).not.toHaveBeenCalled();
      setChatPreviewSpy.mockRestore();
    });

    it('should NOT trigger preview update logic if new message status is already Read', async () => {
        store.getState().setupGlobalMessageListener(currentListenerUserId);

        const alreadyReadMessage: MessageData = {
            senderUId: 'anotherUserJobA', message: 'This was read',
            DateTimeSent: MockedFirestoreTimestamp.now(), status: MessageStatus.Read, type: MessageTypeEnum.Standard,
        };
        const snapshotForJobA_Read = {
            empty: false,
            docs: [{ id: 'readMsgJobA', data: () => alreadyReadMessage }]
        };

        const setChatPreviewSpy = jest.spyOn(store.getState(), 'setChatPreview');
        (FirestoreMock.getDocs as jest.Mock).mockClear(); // Clear previous getDocs calls from listener setup

        // Assuming jobA_id listener is index 0
        await (onSnapshotImplementation as any).triggerCallback(snapshotForJobA_Read, 0); 
        
        // Store logic: if (newMessage.status === MessageStatus.Read) return;
        expect(FirestoreMock.getDocs).not.toHaveBeenCalled(); // Should not call getDocs for unread count
        expect(setChatPreviewSpy).not.toHaveBeenCalled();
        setChatPreviewSpy.mockRestore();
    });

    it('should handle an empty jobMap gracefully when setting up listeners', () => {
      store.setState({ jobMap: {} }); // Override jobMap to be empty
      store.getState().setupGlobalMessageListener(currentListenerUserId);

      // Check that onSnapshotImplementation was NOT called to register callbacks
      expect((onSnapshotImplementation as any).callbacks).toHaveLength(0);
      // Check that FirestoreMock.onSnapshot (the arrow function wrapper) was not invoked by the store
      // This requires FirestoreMock.onSnapshot to be a jest.fn() if we want to check its calls.
      // Since it's an arrow fn `(...args) => onSnapshotImplementation(...args)`, we check the effect on onSnapshotImplementation.
      
      expect(store.getState().listenerInitialized).toBe(true); // It still gets set to true
      expect(store.getState().globalUnsubscribe).toBeInstanceOf(Function); // An unsubscribe for "nothing" is set
      
      // If globalUnsubscribe is called, mockUnsubscribeActual shouldn't be called as no listeners were made
      mockUnsubscribeActual.mockClear();
      if(store.getState().globalUnsubscribe) {
        store.getState().globalUnsubscribe!();
      }
      expect(mockUnsubscribeActual).not.toHaveBeenCalled();
    });
  });
});