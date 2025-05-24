import UserData from "../../interfaces/UserData.interface";
import PendingUser from "@/app/interfaces/PendingUser.interface";

//This function will return the user data for a given user id
async function getUser(uid: string): Promise<UserData | null> {
   if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    console.warn('Invalid UID provided to getUser:', uid);
    return null;
  }
  
   try {
    
    const response = await fetch(`/api/database/user?userID=${encodeURIComponent(uid)}`);

    if (!response.ok) {
      console.error(`API error: ${response.status} - ${await response.text()}`);
      return null;
    }

    const data: { result: UserData | null } = await response.json();

    return data.result; // This will be the UserData object or null

  } catch (error) {
    console.error('Failed to fetch user data from API:', error);
    return null;
  }
};


// Fetch pending users Endpoint:
async function getPendingUsers(): Promise<{uid:string; status:number, type:number, username:string, date:number}[]>{
     try {
    const response = await fetch('/api/database/pending'); 

    if (!response.ok) {
      console.error(`API error fetching pending users: ${response.status} - ${await response.text()}`);
      return []; 
    }

    const data: { result: PendingUser[] } = await response.json();

    return data.result || []; // Return the users, or an empty array if result is null/undefined

  } catch (error) {
    console.error('Failed to fetch pending users from API:', error);
    return []; // Return empty array on network error or other exceptions
  }
};

//Set the current users type to the given parameters:
// 0 = undefined 
// 1 = Client
// 2 = Freelancer
// 3 = Admin
async function setUserType(uid: string, type: number): Promise<boolean> {
    try {
        // Construct the URL with query parameters
        const params = new URLSearchParams();
        params.append("userID", uid);
        params.append("type", String(type)); // Convert number to string for URLSearchParams

        const response = await fetch(`/api/database/type?${params.toString()}`, {
            method: 'PATCH',
            headers: {},
        });

        if (!response.ok) {
            let errorDetails = '';
            try {
                const errorData = await response.json();
                errorDetails = errorData.message || JSON.stringify(errorData);
                if (errorData.error) {
                    errorDetails += ` - Details: ${JSON.stringify(errorData.error)}`;
                }
            } catch {
                try {
                    errorDetails = await response.text();
                } catch {
                    errorDetails = "Could not read error response body.";
                }
            }
            console.error(`API error setting user type for UID '${uid}' to type '${type}': ${response.status} - ${response.statusText}. Response: ${errorDetails}`);
            return false; 
        }

        return true; // Return true on success

    } catch (error) {
        
        console.error(`Failed to set user type for UID '${uid}' to type '${type}' due to client-side/network error:`, error);
        return false; 
    }
}

// Approve user Endpoint - Sets user status in database to 1 (permission granted)
async function approveUser(uid:string):Promise<void>{
    try {
    // Construct the URL with query parameters for the API call
    const params = new URLSearchParams();
    params.append("userID", uid);
    params.append("status", "1"); // Status 1 for approve

     await fetch(`/api/database/status?${params.toString()}`, {
      method: 'PATCH',
      headers: {},
    });
    
    } catch (error) {
    console.error(`Error in approveUser function for UID ${uid}:`, error);
    throw error;
  }

};

// Deny user Endpoint - Sets user status in database to 2 (permission denied)
async function denyUser(uid:string):Promise<void>{
    try {
    // Construct the URL with query parameters for the API call
    const params = new URLSearchParams();
    params.append("userID", uid);
    params.append("status", "2"); // Status 2 for deny

    await fetch(`/api/database/status?${params.toString()}`, {
      method: 'PATCH',
      headers: {},
    });
    
    } catch (error) {
    console.error(`Error in denyUser function for UID ${uid}:`, error);
    throw error;
  }
};

//  This function will take in a username as a string and set update it to the current user in the database
async function SetUserName(uid: string, username: string): Promise<boolean> {
  try {
    // Ensure the username is not null or undefined before encoding.
    if (username === null || typeof username === 'undefined') {
        console.error("Username cannot be null or undefined.");
        return false;
    }

    const params = new URLSearchParams();
    params.append("userID", uid);
    params.append("name", username);

    const response = await fetch(`/api/database/username?${params.toString()}`, {
      method: 'PATCH',
      headers: {},
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} - ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage; 
        if (errorData.error) {
            errorMessage += ` (Details: ${JSON.stringify(errorData.error)})`;
        }
      } catch (e) {
        console.warn("Could not parse error response as JSON for SetUserName.", e);
      }
      console.error(`Could not set username for UID ${uid}. ${errorMessage}`);
      return false; 
    }
    return true; 

  } catch (error) {
    console.error(`Client-side error in SetUserName for UID ${uid} with username "${username}":`, error);
    return false; // Indicate failure
  }
}

//This funciton will set hte avatar as the google profile picture
async function setAvatar(uid: string, avatar: string | null): Promise<boolean> {
  try {
    const avatarUrlToSend = avatar === null ? "" : avatar;

    if (!uid) {
        console.error("User ID (uid) cannot be empty or null when setting avatar.");
        return false;
    }

    const params = new URLSearchParams();
    params.append("userID", uid);
    params.append("avatar", avatarUrlToSend);

    const response = await fetch(`/api/database/avatar?${params.toString()}`, {
      method: 'PATCH',
      headers: {},
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} - ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage; 
        if (errorData.error) {
            errorMessage += ` (Details: ${JSON.stringify(errorData.error)})`;
        }
      } catch (e) {
        console.warn("Could not parse error response as JSON for setAvatar.", e);
      }
      console.error(`Could not set avatar for UID ${uid}. ${errorMessage}`);
      return false; 
    }

    return true; // Indicate success

  } catch (error) {
    console.error(`Client-side error in setAvatar for UID ${uid}:`, error);
    return false; // Indicate failure
  }
}



//this fucntion will take in a file, the path in which the file must be stored and file name, it will then store the file in the database in the given path and return the url at which the file can be accessed
const uploadFile = async (file: File, path: string, name: string): Promise<string> => {
  try {
    // Create FormData to send the file and its metadata
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);
    formData.append("name", name);

    // Make the POST request to the API endpoint
    const response = await fetch(`/api/database/file`, {
      method: 'POST',
      body: formData,
    });

    // Check if the request was successful
    if (!response.ok) {
      let errorMessage = `API error: ${response.status} - ${response.statusText}`;
      try {
        // Attempt to parse the error message from the API response body
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage; 
        if (errorData.error) {
          errorMessage += ` (Details: ${errorData.error})`;
        }
      } catch (e) {
        console.warn("Could not parse error response as JSON for uploadFile.", e);
      }
      console.error(`Failed to upload file "${name}" to path "${path}": ${errorMessage}`);
      throw new Error(`Failed to upload file. ${errorMessage}`);
    }

    // Parse the successful JSON response to get the downloadURL
    const successData = await response.json();
    if (successData && successData.downloadURL) {
      return successData.downloadURL;
    } else {
      console.error(`Failed to upload file "${name}": API response did not include a downloadURL.`);
      throw new Error("File upload succeeded but did not receive a download URL.");
    }

  } catch (error) {
    console.error(`Client-side error in uploadFile for file "${name}", path "${path}":`, error);
    throw error;
  }
};

//this function will take in a users uid and return their username
async function getUsername(uid: string): Promise<string>{
    const user = await getUser(uid)
    if (user !== null){
      return user.username;
    }
    return "No username";
} 


// Add Skills for a freelancer
async function addSkillsToFreelancer(uid: string, skillAreaSkillMap: { [skillArea: string]: string[] }): Promise<void> {
  
  //Validaytion
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    throw new Error("User ID is missing or not in correct format");
  }

  if (!skillAreaSkillMap || Object.keys(skillAreaSkillMap).length === 0) {
    throw new Error("Skills are missing");
  }

  try {
    const response = await fetch(`api/database/skills?userID=${encodeURIComponent(uid)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(skillAreaSkillMap),
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.warn("Could not parse error response as JSON", e);  
      }
      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error("Error calling addSkillsToFreelancer API:", error);
    if (error instanceof Error) {
        throw error; 
    }
    throw new Error("An unknown error occurred while adding skills.");
  }
}

// Get skills from freelancer
async function getSkillsForFreelancer(uid: string): Promise<{ [skillArea: string]: string[] }> {
  // Replace '/api/user-skills' with the actual path to your API route


  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    console.warn('Invalid UID provided to getSkillsForFreelancer client function:', uid);
    // Consistent with API returning {result: null} which we then convert to {}
    return {};
  }

  try {
    const response = await fetch(`/api/database/skills?userID=${encodeURIComponent(uid)}`, {
      method: 'GET',
      headers: {},
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        console.warn("Could not parse error response as JSON.", e); 
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

   
    return data.result || {};

  } catch (error) {
    console.error("Error calling getSkillsForFreelancer API:", error);
     if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred while fetching skills.");
  }
}

// Remove Skill for a freelancer
async function removeSkillFromFreelancer(uid: string, skillName: string): Promise<void> {
  //Validation
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    throw new Error("User ID (uid) is required and must be a non-empty string.");
  }

  if (!skillName || typeof skillName !== 'string' || skillName.trim() === '') {
    throw new Error("Skill name (skillName) is required and must be a non-empty string.");
  }


  //calling api route with errors messages if there is a problem
  try {
    const response = await fetch(`/api/database/removeSkill?userID=${encodeURIComponent(uid)}&skillName=${encodeURIComponent(skillName)}`, {
      method: 'PATCH', 
      headers: {},
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
         console.warn("Could not parse error response as JSON.", e); 
      }
      throw new Error(errorMessage);
    }

  } catch (error) {
    console.error(`Error calling removeSkillFromFreelancer API for UID ${uid}, Skill ${skillName}:`, error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred while removing the skill.");
  }
}

export { getUser, getPendingUsers, approveUser, denyUser, setUserType, SetUserName, getUsername, uploadFile, setAvatar, addSkillsToFreelancer, getSkillsForFreelancer, removeSkillFromFreelancer };

