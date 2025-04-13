import UserStatus from "../enums/UserStatus.enum";
import UserType from "../enums/UserType.enum";

interface UserData {
    type: UserType,
    status: UserStatus
    username: string
}

export default UserData;