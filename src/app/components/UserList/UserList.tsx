import ChatList from "./ChatList/ChatList";
import UserInfo from "./userInfo/UserInfo";
import "./UserList.css";

const UserList = () => {
  return (
    <section className="list">
      <UserInfo />
      <ChatList />
    </section>
  );
};

export default UserList;
