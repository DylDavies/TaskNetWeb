import UserStatus from "../enums/UserStatus.enum";
import UserType from "../enums/UserType.enum";

interface UserData {
    type: UserType;
    status: UserStatus;
    username: string;
    date: number;
    avatar?: string;
    ratingAverage?: number;
    ratingCount?: number;
    ratings?: [];
}

export default UserData;