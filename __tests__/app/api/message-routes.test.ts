// __tests__/app/api/message-routes.test.ts
import { NextRequest } from 'next/server';
import * as firestore from 'firebase/firestore';
import MessageType from '../../../src/app/enums/MessageType.enum'; 
import MessageStatus from '../../../src/app/enums/MessageStatus.enum'; 
import MessageData from '../../../src/app/interfaces/MessageData.interface'; 

// Import route handlers
import { POST as postCreateChatMessage } from '../../../src/app/api/messages/create-chat/route'; 
import { POST as postSendMessage } from '../../../src/app/api/messages/send/route'; 

// --- Mocks ---
jest.mock('next/server', () => {
  const actualNextServer = jest.requireActual('next/server');
  return {
    ...actualNextServer,
    NextResponse: {
      ...actualNextServer.NextResponse,
      json: jest.fn((body, init) => ({
        json: async () => body,
        text: async () => JSON.stringify(body),
        status: init?.status || 200,
        ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
        headers: new Headers(init?.headers),
      })),
    },
  };
});

jest.mock('../../../src/app/firebase', () => ({ 
  db: { type: 'mocked-db-instance-message' },
}));

jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  doc: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'mocked_server_timestamp'), 
}));

describe('API Routes: Message', () => {
  let mockRequest: NextRequest;
  const { NextResponse: MockNextResponse } = jest.requireMock('next/server');
  let consoleErrorSpy: jest.SpyInstance;
  let abortControllerInstance: AbortController; 

  const createMockRequest = (method: string = 'POST') => { 
    abortControllerInstance = new AbortController(); 
    const newMockRequest = {
      json: jest.fn(),
      nextUrl: { searchParams: new URLSearchParams() } as URL,
      headers: new Headers(),
      url: 'http://localhost/api/test',
      method: method, 
      clone: jest.fn(() => newMockRequest), 
      signal: abortControllerInstance.signal, // Correctly use signal from controller instance
      cookies: { get: jest.fn() } as any,
      body: null,
    } as unknown as NextRequest;
    return newMockRequest;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (MockNextResponse.json as jest.Mock).mockClear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    // mockRequest is now created within each specific describe block or test if method varies,
    // or here if method is consistent for all tests in this file.
    // For message routes, all are POST, so we can set it here.
    mockRequest = createMockRequest('POST'); 
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    if (abortControllerInstance) { 
      abortControllerInstance.abort(); 
    }
  });

  describe('POST /api/messages/create-chat', () => {
    const mockJobId = 'jobChat123';
    const mockJobName = 'Awesome Project Chat';
    const mockMessagesCollectionRef = { _id: `Jobs/${mockJobId}/messages`};
    const mockAddedDocRef = { id: 'systemMsgId1' };
    beforeEach(() => {
        // mockRequest is already created with POST in the outer beforeEach
        (firestore.collection as jest.Mock).mockReturnValue(mockMessagesCollectionRef);
        (firestore.addDoc as jest.Mock).mockResolvedValue(mockAddedDocRef);
    });
    it('should create a system chat message and return 200', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ jobID: mockJobId, jobName: mockJobName });
      const response = await postCreateChatMessage(mockRequest);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ success: true });
    });
    it('should return 500 if request body parsing fails', async () => {
        const jsonError = new Error('Invalid JSON');
        (mockRequest.json as jest.Mock).mockRejectedValue(jsonError);
        const response = await postCreateChatMessage(mockRequest);
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.message).toBe('Error creating chat');
        expect(body.error).toEqual(jsonError);
    });
    it('should return 500 if Firestore addDoc fails', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ jobID: mockJobId, jobName: mockJobName });
      const firestoreError = new Error('Firestore addDoc failed for create-chat');
      (firestore.addDoc as jest.Mock).mockRejectedValueOnce(firestoreError);
      const response = await postCreateChatMessage(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error creating chat');
      expect(body.error).toEqual(firestoreError);
    });
  });

  describe('POST /api/messages/send', () => {
    const mockJobIdSend = 'jobSendMsg456';
    const mockClientMessagePayload: Omit<MessageData, 'DateTimeSent' | 'status'> & { status?: MessageStatus } = { 
      senderUId: 'userSender1', type: MessageType.Standard, 
      status: MessageStatus.Delivered, message: 'Hello there!',
    };
    const mockMessagesCollectionRefSend = { _id: `Jobs/${mockJobIdSend}/messages`};
    const mockAddedDocRefSend = { id: 'newMessageIdXYZ' };
    beforeEach(() => {
        // mockRequest is already created with POST
        (firestore.collection as jest.Mock).mockReturnValue(mockMessagesCollectionRefSend);
        (firestore.addDoc as jest.Mock).mockResolvedValue(mockAddedDocRefSend);
        (firestore.serverTimestamp as jest.Mock).mockReturnValue('mocked_server_timestamp_value');
    });
    it('should send a message and return 200 with new message ID', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ jobID: mockJobIdSend, message: mockClientMessagePayload });
      const response = await postSendMessage(mockRequest);
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual({ id: 'newMessageIdXYZ', success: true });
    });
     it('should return 500 if request body parsing fails', async () => {
        const jsonError = new Error('Invalid JSON for send');
        (mockRequest.json as jest.Mock).mockRejectedValue(jsonError);
        const response = await postSendMessage(mockRequest);
        expect(response.status).toBe(500);
        const body = await response.json();
        expect(body.message).toBe('Error sending message');
        expect(body.error).toEqual(jsonError);
    });
    it('should return 500 if Firestore addDoc fails', async () => {
      (mockRequest.json as jest.Mock).mockResolvedValue({ jobID: mockJobIdSend, message: mockClientMessagePayload });
      const firestoreError = new Error('Firestore addDoc failed for send message');
      (firestore.addDoc as jest.Mock).mockRejectedValueOnce(firestoreError);
      const response = await postSendMessage(mockRequest);
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.message).toBe('Error sending message');
      expect(body.error).toEqual(firestoreError);
    });
  });
});
