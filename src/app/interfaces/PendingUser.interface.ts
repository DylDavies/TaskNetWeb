import UserStatus from "../enums/UserStatus.enum";
import UserType from "../enums/UserType.enum";

interface PendingUser {
    uid: string;
    username: string;
    status: UserStatus;
    type: UserType;
    date: number;
}

export default PendingUser;