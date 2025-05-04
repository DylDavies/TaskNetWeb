"use client";

import Button from "../button/Button";
import Modal from "react-modal";

interface Props {
    onClose: () => void;
    onConfirm: () => void;
    onDeny: () => void;
    modalIsOpen: boolean;
    message: string;
}

const ConfirmationModal = ({ onClose, onConfirm, onDeny, modalIsOpen, message }: Props) => {
    return(
        <Modal
        isOpen = {modalIsOpen}
        onRequestClose={onClose}
        className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto z-60"
        overlayClassName="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center"
        ariaHideApp={false}>
            <section className="fixed inset-0 flex items-center justify-center z-50">
                <article className="bg-neutral-800 rounded-2xl p-6 w-full max-w-lg shadow-lg text-white max-h-[90vh] overflow-y-auto">
                <section className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Are you sure?</h2>
                    <button
                        onClick={onClose}
                        className="text-white text-xl hover:text-red-400">
                        ×
                    </button>
                </section>
                <section className="flex flex-col gap-4">
                    <section>
                        <p className="text-sm text-gray-300">{message}</p>
                    </section>

                    <Button caption="Yes" onClick={onConfirm}></Button>
                    <Button caption="No" onClick={onDeny}></Button>
                </section>
                </article>
            </section>
        </Modal>
    );
}

export default ConfirmationModal;