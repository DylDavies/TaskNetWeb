import { User } from "firebase/auth";
import UserData from "./UserData.interface";

interface ActiveUser {
    authUser: User,
    userData: UserData
}

export default ActiveUser;