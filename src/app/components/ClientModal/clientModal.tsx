import Modal from "react-modal";
import React, {useContext, useEffect, useState} from "react";
import { getPendingUsers } from "../../server/services/DatabaseService";
import FATable from "../FATable/FATable";

interface User  {
    uid: string;
    username: string;
    status: number;
    type: number; // Do we not need role like freelancer and client?
    date: number;
    
  }

interface Props {
    data: User[];
    onRowClick?: (user: User) => void;
  }

const ClientModal:  React.FunctionComponent = ()=> {

    const[modalIsOpen, setIsOpen] = React.useState(false);
    function openModal(){
        setIsOpen(true);
    }

    const[selectedUser, setSelectedUser] = useState<User | null>(null);

    function closeModal(){
        setIsOpen(false);
    }

    const [pendingUsers, setPendingUsers] = useState<User[]>([]);

    useEffect(() => {
        async function fetchPendingUsers() {
          const pendingUsers = await getPendingUsers();
          //console.log("Pending users: ", pendingUsers);
          setPendingUsers(pendingUsers);
        }
    
        fetchPendingUsers();
      }, []);

      const handleRowClick = (user: User) =>{
        setSelectedUser(user);
        openModal();
      };
    
    return(
          <section>
          <FATable data = {pendingUsers} onRowClick={handleRowClick}/>
          <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}>
            {selectedUser? (
            <section className="modal">
                <header>{selectedUser.username}</header>
            </section>
            ) : (
                <></>
            )}
          </Modal>
          </section>
    );
};

export default ClientModal;