import MessageData from "@/app/interfaces/MessageData.interface";

// Function to send (create) a new message
async function sendMessage(jobID: string, message: Omit<MessageData, 'DateTimeSent'>) {
  try {
    const response = await fetch(`/api/messages/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobID, message })
    });

    if (!response.ok) console.error(`HTTP error! status: ${response.status}`);

    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

// Create a chat between 2 users 
async function createChat(jobID: string, jobName: string) {
  try {
    const response = await fetch(`/api/messages/create-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobID, jobName })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
}

export { sendMessage, createChat }