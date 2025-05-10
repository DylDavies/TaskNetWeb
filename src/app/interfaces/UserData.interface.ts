import UserStatus from "../enums/UserStatus.enum";
import UserType from "../enums/UserType.enum";

interface UserData {
    type: UserType;
    status: UserStatus;
    username: string;
    date: number;
    avatar?: string;
    skills?: { 
        [skillArea: string]: string[]
    };
}

export default UserData;