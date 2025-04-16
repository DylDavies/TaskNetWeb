import React from "react";
import ReactModal from "react-modal";
import Modal from "react-modal";

Modal.setAppElement("#main");

const JobAppForm = () => {
    const [modalIsOpen, setIsOpen] = React.useState(false);
    function openModal(){
        setIsOpen(true);
    }

    function closeModal(){
        setIsOpen(false);
    }

    return(
        <section className="form">
            <button onClick={openModal}>Trigger</button>
        <Modal 
        isOpen = {modalIsOpen}
        onRequestClose={closeModal}>
            <form>
            <header>Job Application Form</header>
                <label htmlFor="pdf">Please attach your cover letter</label><br></br>
                <input type="file" accept=".pdf" id ="pdf" name="pdf"></input><br></br>
                <label htmlFor="timeLine">Please write down your estimated time line</label><br></br>
                <input type="date" id="timeLine" name="timeLine"></input><br></br>
                <label htmlFor="bid">Please write down your bid</label><br></br>
                <input type="text" id="bid" name ="bid"></input><br></br>
                <button type ="submit">Submit</button>
            </form>
        </Modal>
        </section>
    )
}

export default JobAppForm;