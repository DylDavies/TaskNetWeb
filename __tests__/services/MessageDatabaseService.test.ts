import { sendMessage, createChat } from '@/app/server/services/MessageDatabaseServices';
import MessageData from '@/app/interfaces/MessageData.interface';
import MessageStatus from '@/app/enums/MessageStatus.enum';
import MessageType from '@/app/enums/MessageType.enum';

global.fetch = jest.fn();

describe('sendMessage', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should successfully send a message and return the response', async () => {
    const mockResponseData = { messageId: '123', success: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponseData),
    });

    const jobID = 'testJob';
    const message: Omit<MessageData, 'DateTimeSent'> = {
      senderUId: 'user1',
      type: MessageType.Standard,
      status: MessageStatus.Delivered,
      message: 'Hello!',
    };

    const result = await sendMessage(jobID, message);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobID, message }),
    });
    expect(result).toEqual(mockResponseData);
  });

  it('should log an error if the API request fails (not ok)', async () => {
    const mockStatus = 404;
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: mockStatus,
      json: jest.fn(), 
    });

    const jobID = 'testJob';
    const message: Omit<MessageData, 'DateTimeSent'> = {
      senderUId: 'user1',
      type: MessageType.Standard,
      status: MessageStatus.Delivered,
      message: 'Hello!',
    };

    await sendMessage(jobID, message);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`HTTP error! status: ${mockStatus}`);
    consoleErrorSpy.mockRestore();
  });

  it('should throw an error if the fetch request fails', async () => {
    const mockError = new Error('Fetch error!');
    (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const jobID = 'testJob';
    const message: Omit<MessageData, 'DateTimeSent'> = {
      senderUId: 'user1',
      type: MessageType.Standard,
      status: MessageStatus.Delivered,
      message: 'Hello!',
    };

    await expect(sendMessage(jobID, message)).rejects.toThrow(mockError);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error sending message:', mockError);
    consoleErrorSpy.mockRestore();
  });
});

describe('createChat', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  it('should successfully create a chat and return the response', async () => {
    const mockResponseData = { chatId: 'chat123', success: true };
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponseData),
    });

    const jobID = 'testJob';
    const jobName = 'Test Job';

    const result = await createChat(jobID, jobName);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('/api/messages/create-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobID, jobName }),
    });
    expect(result).toEqual(mockResponseData);
  });

  it('should throw an error if the API request fails (not ok)', async () => {
    const mockStatus = 500;
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: mockStatus,
      json: jest.fn(), 
    });

    const jobID = 'testJob';
    const jobName = 'Test Job';

    await expect(createChat(jobID, jobName)).rejects.toThrow(`HTTP error! status: ${mockStatus}`);
  });

  it('should log and throw an error if the fetch request fails', async () => {
    const mockError = new Error('Network error!');
    (global.fetch as jest.Mock).mockRejectedValueOnce(mockError);
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const jobID = 'testJob';
    const jobName = 'Test Job';

    await expect(createChat(jobID, jobName)).rejects.toThrow(mockError);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating chat:', mockError);
    consoleErrorSpy.mockRestore();
  });
});